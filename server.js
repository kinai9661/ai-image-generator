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

// 默认模型配置（通用）
const DEFAULT_MODELS = {
  image: [
    {
      id: 'dall-e-3',
      name: 'DALL-E 3',
      description: '🎨 OpenAI 最新图像模型',
      provider: 'openai',
      maxWidth: 1024,
      maxHeight: 1024,
      free: false,
      speed: 'medium'
    },
    {
      id: 'dall-e-2',
      name: 'DALL-E 2',
      description: '⚡ 快速图像生成',
      provider: 'openai',
      maxWidth: 1024,
      maxHeight: 1024,
      free: false,
      speed: 'fast'
    }
  ],
  chat: [
    {
      id: 'gpt-4',
      name: 'GPT-4',
      description: '🤖 OpenAI 最强模型',
      provider: 'openai',
      contextWindow: 8192,
      free: false
    },
    {
      id: 'gpt-3.5-turbo',
      name: 'GPT-3.5 Turbo',
      description: '⚡ 快速响应',
      provider: 'openai',
      contextWindow: 4096,
      free: false
    }
  ]
};

// 模型缓存
let modelCache = {
  image: DEFAULT_MODELS.image,
  chat: DEFAULT_MODELS.chat,
  lastUpdate: null
};

// 从 API 端点获取模型列表（支持 OpenAI 兼容的 /v1/models 端点）
async function fetchModelsFromApi() {
  try {
    // 检查是否配置了模型 API 端点
    const modelsEndpoint = process.env.MODELS_API_ENDPOINT;
    
    if (!modelsEndpoint) {
      console.log('⚠️ 未配置 MODELS_API_ENDPOINT，使用默认模型列表');
      return {
        imageModels: DEFAULT_MODELS.image,
        chatModels: DEFAULT_MODELS.chat
      };
    }

    console.log(`🔄 正在从 ${modelsEndpoint} 获取模型列表...`);
    
    const apiKey = process.env.IMAGE_API_KEY || process.env.CHAT_API_KEY;
    if (!apiKey) {
      console.log('⚠️ 未配置 API KEY，使用默认模型列表');
      return {
        imageModels: DEFAULT_MODELS.image,
        chatModels: DEFAULT_MODELS.chat
      };
    }

    const response = await axios.get(modelsEndpoint, {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      },
      timeout: 10000
    });

    const models = response.data.data || response.data;
    console.log(`✅ 获取到 ${models.length} 个模型`);

    // 分类模型（根据 id 或 type 字段）
    const imageModels = models
      .filter(m => 
        (m.id && (m.id.includes('dall-e') || m.id.includes('flux') || m.id.includes('stable-diffusion'))) ||
        (m.type === 'image')
      )
      .map(m => ({
        id: m.id,
        name: m.name || m.display_name || m.id,
        description: m.description || getModelDescription(m.id),
        provider: detectProvider(m.id),
        maxWidth: 2048,
        maxHeight: 2048,
        free: false,
        speed: getModelSpeed(m.id)
      }))
      .slice(0, 10);

    const chatModels = models
      .filter(m => 
        (m.id && (m.id.includes('gpt') || m.id.includes('llama') || m.id.includes('claude') || m.id.includes('qwen'))) ||
        (m.type === 'chat' || m.type === 'text')
      )
      .map(m => ({
        id: m.id,
        name: m.name || m.display_name || m.id,
        description: m.description || getModelDescription(m.id),
        provider: detectProvider(m.id),
        contextWindow: m.context_length || 4096,
        free: false
      }))
      .slice(0, 15);

    if (imageModels.length > 0) modelCache.image = imageModels;
    if (chatModels.length > 0) modelCache.chat = chatModels;
    modelCache.lastUpdate = new Date().toISOString();

    console.log(`✅ 模型列表已更新: ${imageModels.length} 个图像模型, ${chatModels.length} 个聊天模型`);
    
    return { imageModels, chatModels };
  } catch (error) {
    console.error('❌ 获取模型列表失败:', error.message);
    console.log('⚠️ 使用默认模型配置');
    return {
      imageModels: DEFAULT_MODELS.image,
      chatModels: DEFAULT_MODELS.chat
    };
  }
}

function detectProvider(modelId) {
  if (!modelId) return 'unknown';
  const id = modelId.toLowerCase();
  if (id.includes('gpt') || id.includes('dall-e')) return 'openai';
  if (id.includes('claude')) return 'anthropic';
  if (id.includes('llama')) return 'meta';
  if (id.includes('mixtral') || id.includes('mistral')) return 'mistral';
  if (id.includes('qwen')) return 'alibaba';
  if (id.includes('flux')) return 'black-forest-labs';
  if (id.includes('stable-diffusion')) return 'stability';
  return 'custom';
}

function getModelDescription(name) {
  if (!name) return '🤖 AI 模型';
  const n = name.toLowerCase();
  if (n.includes('gpt-4')) return '🤖 OpenAI 最强模型';
  if (n.includes('gpt-3.5')) return '⚡ 快速响应';
  if (n.includes('dall-e-3')) return '🎨 高质量图像生成';
  if (n.includes('dall-e-2')) return '⚡ 快速图像生成';
  if (n.includes('flux')) {
    if (n.includes('schnell')) return '⚡ 超快速生成';
    if (n.includes('dev')) return '🔧 开发版本';
    if (n.includes('pro')) return '🏆 专业级品质';
    return '🎨 FLUX 图像模型';
  }
  if (n.includes('llama')) return '🦙 Meta 开源模型';
  if (n.includes('claude')) return '🤖 Anthropic Claude';
  if (n.includes('qwen')) return '🇨🇳 阿里巴巴 Qwen';
  if (n.includes('mixtral')) return '🔮 Mistral MoE';
  return '🤖 AI 模型';
}

function getModelSpeed(name) {
  if (!name) return 'medium';
  const n = name.toLowerCase();
  if (n.includes('schnell') || n.includes('turbo') || n.includes('fast')) return 'fast';
  if (n.includes('dall-e-2') || n.includes('gpt-3.5')) return 'fast';
  if (n.includes('dev') || n.includes('base')) return 'medium';
  if (n.includes('pro') || n.includes('gpt-4') || n.includes('claude')) return 'slow';
  return 'medium';
}

// ==================== API 端点 ====================

app.get('/api/models', async (req, res) => {
  try {
    const forceRefresh = req.query.refresh === 'true';
    const maxAge = 1000 * 60 * 60; // 1小时缓存
    
    if (forceRefresh || !modelCache.lastUpdate || 
        (Date.now() - new Date(modelCache.lastUpdate).getTime() > maxAge)) {
      await fetchModelsFromApi();
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
    provider: process.env.API_PROVIDER || 'generic',
    features: {
      autoUpdateModels: !!process.env.MODELS_API_ENDPOINT,
      batchGeneration: false,
      historyStorage: true
    }
  });
});

// 图像生成 API 代理（支持 OpenAI 兼容格式）
app.post('/api/generate-image', async (req, res) => {
  try {
    const { prompt, model, width, height } = req.body;
    
    if (!process.env.IMAGE_API_KEY) {
      return res.status(500).json({ 
        success: false,
        error: '未配置 IMAGE_API_KEY' 
      });
    }

    console.log(`🎨 图像生成请求: ${prompt.substring(0, 50)}...`);

    // 默认使用 OpenAI 格式
    const endpoint = process.env.IMAGE_API_ENDPOINT || 'https://api.openai.com/v1/images/generations';
    
    // 构建请求体（OpenAI 兼容格式）
    const requestBody = {
      prompt,
      model: model || 'dall-e-3',
      n: 1,
      size: `${width || 1024}x${height || 1024}`,
      response_format: 'b64_json'
    };

    const response = await axios.post(endpoint, requestBody, {
      headers: {
        'Authorization': `Bearer ${process.env.IMAGE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 120000
    });

    console.log('✅ 图像生成成功');
    res.json({ 
      success: true, 
      data: response.data.data 
    });

  } catch (error) {
    console.error('❌ 图像生成失败:', error.message);
    
    let errorMessage = '图像生成失败';
    if (error.response?.data?.error) {
      errorMessage = error.response.data.error.message || error.response.data.error;
    } else if (error.code === 'ECONNABORTED') {
      errorMessage = '请求超时，请重试';
    } else if (error.message) {
      errorMessage = error.message;
    }

    res.status(error.response?.status || 500).json({ 
      success: false,
      error: errorMessage
    });
  }
});

// AI 聊天 API 代理（支持 OpenAI 兼容格式）
app.post('/api/chat', async (req, res) => {
  try {
    const { message, model, history } = req.body;

    if (!process.env.CHAT_API_KEY) {
      return res.status(500).json({ 
        success: false,
        error: '未配置 CHAT_API_KEY' 
      });
    }

    console.log(`💬 聊天请求: ${message.substring(0, 50)}...`);

    // 默认使用 OpenAI 格式
    const endpoint = process.env.CHAT_API_ENDPOINT || 'https://api.openai.com/v1/chat/completions';
    
    // 构建消息历史
    const messages = [
      { role: 'system', content: '你是一个有帮助的 AI 助手。' },
      ...(history || []),
      { role: 'user', content: message }
    ];

    const response = await axios.post(endpoint, {
      model: model || 'gpt-3.5-turbo',
      messages,
      temperature: 0.7,
      max_tokens: 2048
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.CHAT_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 60000
    });

    console.log('✅ 聊天响应成功');
    res.json({
      success: true,
      data: response.data
    });

  } catch (error) {
    console.error('❌ 聊天失败:', error.message);
    
    let errorMessage = '聊天失败';
    if (error.response?.data?.error) {
      errorMessage = error.response.data.error.message || error.response.data.error;
    } else if (error.message) {
      errorMessage = error.message;
    }

    res.status(error.response?.status || 500).json({ 
      success: false,
      error: errorMessage
    });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    config: {
      hasImageApi: !!process.env.IMAGE_API_KEY,
      hasChatApi: !!process.env.CHAT_API_KEY,
      provider: process.env.API_PROVIDER || 'generic'
    },
    models: {
      imageCount: modelCache.image.length,
      chatCount: modelCache.chat.length,
      lastUpdate: modelCache.lastUpdate
    }
  });
});

// ==================== 启动服务器 ====================
const PORT = process.env.PORT || 3000;

// 启动时尝试加载模型列表（如果配置了）
fetchModelsFromApi().then(() => {
  app.listen(PORT, () => {
    console.log('🚀 ========================================');
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🎨 Image API: ${process.env.IMAGE_API_KEY ? '✅ Configured' : '❌ Not configured'}`);
    console.log(`💬 Chat API: ${process.env.CHAT_API_KEY ? '✅ Configured' : '❌ Not configured'}`);
    console.log(`🤖 Image Models: ${modelCache.image.length}`);
    console.log(`💬 Chat Models: ${modelCache.chat.length}`);
    console.log('🚀 ========================================');
  });
});

// 定期更新模型列表（每小时）
if (process.env.MODELS_API_ENDPOINT) {
  setInterval(() => {
    console.log('🔄 定期更新模型列表...');
    fetchModelsFromApi();
  }, 1000 * 60 * 60);
}