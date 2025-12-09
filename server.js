require('dotenv').config();
const express = require('express');
const path = require('path');
const axios = require('axios');
const app = express();

// 中间件
app.use(express.static('public'));
app.use(express.json({ limit: '50mb' }));

// CORS 配置
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// ==================== 模型配置管理 ====================

// 默认模型配置（如果无法从 API 获取）
const DEFAULT_MODELS = {
  image: [
    {
      id: 'black-forest-labs/FLUX.1-schnell',
      name: 'FLUX.1 Schnell',
      description: '⚡ 超快速生成，4步完成',
      provider: 'together',
      maxWidth: 2048,
      maxHeight: 2048,
      free: true,
      speed: 'fast'
    },
    {
      id: 'black-forest-labs/FLUX.1-dev',
      name: 'FLUX.1 Dev',
      description: '🔧 开发版本，平衡质量和速度',
      provider: 'together',
      maxWidth: 2048,
      maxHeight: 2048,
      free: true,
      speed: 'medium'
    },
    {
      id: 'black-forest-labs/FLUX.1.1-pro',
      name: 'FLUX.1.1 Pro',
      description: '🏆 专业级最高品质',
      provider: 'together',
      maxWidth: 2048,
      maxHeight: 2048,
      free: false,
      speed: 'slow'
    }
  ],
  chat: [
    {
      id: 'meta-llama/Meta-Llama-3.1-405B-Instruct-Turbo',
      name: 'Llama 3.1 405B',
      description: '🦙 Meta 最强开源模型',
      provider: 'together',
      contextWindow: 32768,
      free: true
    },
    {
      id: 'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo',
      name: 'Llama 3.1 70B',
      description: '⚡ 快速响应，高质量',
      provider: 'together',
      contextWindow: 32768,
      free: true
    },
    {
      id: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
      name: 'Mixtral 8x7B',
      description: '🔮 Mistral MoE 模型',
      provider: 'together',
      contextWindow: 32768,
      free: true
    },
    {
      id: 'Qwen/Qwen2.5-72B-Instruct-Turbo',
      name: 'Qwen 2.5 72B',
      description: '🇨🇳 阿里最新模型',
      provider: 'together',
      contextWindow: 32768,
      free: true
    }
  ]
};

// 模型缓存
let modelCache = {
  image: DEFAULT_MODELS.image,
  chat: DEFAULT_MODELS.chat,
  lastUpdate: null
};

// 从 Together.ai 获取最新模型列表
async function fetchTogetherModels() {
  try {
    console.log('🔄 正在从 Together.ai 获取最新模型列表...');
    
    const response = await axios.get('https://api.together.xyz/v1/models', {
      headers: {
        'Authorization': `Bearer ${process.env.IMAGE_API_KEY || process.env.CHAT_API_KEY}`
      },
      timeout: 10000
    });

    const models = response.data;
    console.log(`✅ 获取到 ${models.length} 个模型`);

    // 分类模型
    const imageModels = models
      .filter(m => m.type === 'image' && m.display_name.includes('FLUX'))
      .map(m => ({
        id: m.id,
        name: m.display_name,
        description: m.description || getModelDescription(m.display_name),
        provider: 'together',
        maxWidth: m.config?.max_width || 2048,
        maxHeight: m.config?.max_height || 2048,
        free: !m.pricing || m.pricing.input === 0,
        speed: getModelSpeed(m.display_name)
      }))
      .slice(0, 10);

    const chatModels = models
      .filter(m => m.type === 'chat' && !m.id.includes('moderation'))
      .sort((a, b) => (b.context_length || 0) - (a.context_length || 0))
      .map(m => ({
        id: m.id,
        name: m.display_name,
        description: m.description || getModelDescription(m.display_name),
        provider: 'together',
        contextWindow: m.context_length || 4096,
        free: !m.pricing || m.pricing.input === 0
      }))
      .slice(0, 15);

    if (imageModels.length > 0) modelCache.image = imageModels;
    if (chatModels.length > 0) modelCache.chat = chatModels;
    modelCache.lastUpdate = new Date().toISOString();

    console.log(`✅ 模型列表已更新: ${imageModels.length} 个图像模型, ${chatModels.length} 个聊天模型`);
    
    return { imageModels, chatModels };
  } catch (error) {
    console.error('❌ 获取 Together.ai 模型列表失败:', error.message);
    console.log('⚠️ 使用默认模型配置');
    return {
      imageModels: DEFAULT_MODELS.image,
      chatModels: DEFAULT_MODELS.chat
    };
  }
}

function getModelDescription(name) {
  if (name.includes('FLUX')) {
    if (name.includes('schnell')) return '⚡ 超快速生成，4步完成';
    if (name.includes('dev')) return '🔧 开发版本，平衡质量和速度';
    if (name.includes('pro')) return '🏆 专业级最高品质';
  }
  if (name.includes('Llama')) return '🦙 Meta 开源大语言模型';
  if (name.includes('Mixtral')) return '🔮 Mistral MoE 模型';
  if (name.includes('Qwen')) return '🇨🇳 阿里巴巴 Qwen 模型';
  if (name.includes('DeepSeek')) return '🤖 DeepSeek 深度学习模型';
  return '🤖 高性能 AI 模型';
}

function getModelSpeed(name) {
  if (name.includes('schnell') || name.includes('turbo')) return 'fast';
  if (name.includes('dev')) return 'medium';
  if (name.includes('pro')) return 'slow';
  return 'medium';
}

// ==================== API 端点 ====================

app.get('/api/models', async (req, res) => {
  try {
    const forceRefresh = req.query.refresh === 'true';
    const maxAge = 1000 * 60 * 60;
    
    if (forceRefresh || !modelCache.lastUpdate || 
        (Date.now() - new Date(modelCache.lastUpdate).getTime() > maxAge)) {
      await fetchTogetherModels();
    }

    res.json({
      success: true,
      data: {
        image: modelCache.image,
        chat: modelCache.chat,
        lastUpdate: modelCache.lastUpdate
      },
      cached: !forceRefresh && modelCache.lastUpdate !== null
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      data: {
        image: DEFAULT_MODELS.image,
        chat: DEFAULT_MODELS.chat
      }
    });
  }
});

app.get('/api/config', (req, res) => {
  res.json({
    hasImageApi: !!process.env.IMAGE_API_KEY,
    hasChatApi: !!process.env.CHAT_API_KEY,
    provider: 'together',
    features: {
      autoUpdateModels: true,
      batchGeneration: true,
      historyStorage: true
    }
  });
});

app.post('/api/generate-image', async (req, res) => {
  try {
    const { prompt, model, width, height, steps } = req.body;
    
    if (!process.env.IMAGE_API_KEY) {
      return res.status(500).json({ error: '未配置 IMAGE_API_KEY' });
    }

    const response = await axios.post(
      process.env.IMAGE_API_ENDPOINT || 'https://api.together.xyz/v1/images/generations',
      {
        model: model || 'black-forest-labs/FLUX.1-schnell',
        prompt,
        width: width || 1024,
        height: height || 1024,
        steps: steps || 4,
        n: 1,
        response_format: 'b64_json'
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.IMAGE_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 120000
      }
    );

    res.json({ success: true, data: response.data.data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/chat', async (req, res) => {
  try {
    const { message, model, history } = req.body;

    if (!process.env.CHAT_API_KEY) {
      return res.status(500).json({ error: '未配置 CHAT_API_KEY' });
    }

    const messages = [
      { role: 'system', content: '你是一个有帮助的 AI 助手。' },
      ...(history || []),
      { role: 'user', content: message }
    ];

    const response = await axios.post(
      process.env.CHAT_API_ENDPOINT || 'https://api.together.xyz/v1/chat/completions',
      {
        model: model || 'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo',
        messages,
        temperature: 0.7,
        max_tokens: 2048
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.CHAT_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 60000
      }
    );

    res.json({ success: true, data: response.data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    models: {
      imageCount: modelCache.image.length,
      chatCount: modelCache.chat.length,
      lastUpdate: modelCache.lastUpdate
    }
  });
});

const PORT = process.env.PORT || 3000;

fetchTogetherModels().then(() => {
  app.listen(PORT, () => {
    console.log('🚀 ========================================');
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🎨 Image Models: ${modelCache.image.length}`);
    console.log(`💬 Chat Models: ${modelCache.chat.length}`);
    console.log('🚀 ========================================');
  });
});

setInterval(() => {
  fetchTogetherModels();
}, 1000 * 60 * 60);