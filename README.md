# 🎨 Universal AI Image Generator

> 通用 AI 图像生成和聊天应用，支持多种 OpenAI 兼容 API，无需前端登入

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org)
[![OpenAI Compatible](https://img.shields.io/badge/API-OpenAI%20Compatible-green.svg)](https://platform.openai.com/docs/api-reference)

## ✨ 功能特性

- ✅ **多提供商支持**
  - OpenAI (GPT-4, DALL-E 3)
  - Together.ai (FLUX, Llama - 免费 $25/月)
  - Groq (快速且免费)
  - DeepSeek (低成本)
  - 任何 OpenAI 兼容 API

- 🎨 **AI 图像生成**
  - 支持多种图像模型（DALL-E, FLUX, Stable Diffusion）
  - 多种尺寸比例（1:1, 3:2, 2:3, 16:9, 9:16）
  - 高质量图像生成

- 🤖 **AI 聊天对话**
  - 支持多种聊天模型（GPT-4, Llama, Mixtral, Qwen 等）
  - 实时对话交互
  - 智能上下文理解

- 🔄 **自动更新模型**
  - 启动时自动获取最新模型列表
  - 每小时自动刷新
  - 手动刷新按钮
  - 智能模型分类

- 🖼️ **图片历史管理**
  - localStorage 本地存储
  - 图片预览和下载
  - 批量管理功能

- 🔐 **安全配置**
  - 环境变量管理 API Key
  - 后端代理，保护凭证
  - 无需前端登入

## 🚀 快速开始

### 1. 安装依赖

```bash
git clone https://github.com/kinai9661/ai-image-generator.git
cd ai-image-generator
npm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env`：

```bash
cp .env.example .env
```

编辑 `.env` 文件，选择一个 API 提供商：

#### 选项 A: Together.ai（推荐 - 每月 $25 免费）

```env
IMAGE_API_KEY=your_together_api_key
IMAGE_API_ENDPOINT=https://api.together.xyz/v1/images/generations
CHAT_API_KEY=your_together_api_key
CHAT_API_ENDPOINT=https://api.together.xyz/v1/chat/completions
MODELS_API_ENDPOINT=https://api.together.xyz/v1/models
API_PROVIDER=together
```

🎁 注册: https://api.together.xyz/settings/api-keys

#### 选项 B: OpenAI

```env
IMAGE_API_KEY=sk-...
IMAGE_API_ENDPOINT=https://api.openai.com/v1/images/generations
CHAT_API_KEY=sk-...
CHAT_API_ENDPOINT=https://api.openai.com/v1/chat/completions
MODELS_API_ENDPOINT=https://api.openai.com/v1/models
API_PROVIDER=openai
```

#### 选项 C: Groq（仅聊天 - 免费）

```env
CHAT_API_KEY=your_groq_key
CHAT_API_ENDPOINT=https://api.groq.com/openai/v1/chat/completions
MODELS_API_ENDPOINT=https://api.groq.com/openai/v1/models
API_PROVIDER=groq
```

💡 提示：可以混合使用（如 Together.ai 生成图片 + Groq 聊天）

### 3. 启动应用

```bash
# 开发模式（自动重启）
npm run dev

# 生产模式
npm start
```

访问 `http://localhost:3000`

## 🌐 一键部署

### Zeabur 部署

1. Fork 此仓库
2. 在 [Zeabur](https://zeabur.com) 导入项目
3. 添加环境变量（根据你选择的提供商）
4. 部署完成！

### Vercel 部署

```bash
npm install -g vercel
vercel
```

## 📦 支持的 API 提供商

| 提供商 | 图像生成 | 聊天 | 免费额度 | 特点 |
|---------|--------|------|----------|------|
| **Together.ai** | ✅ FLUX | ✅ Llama/Mixtral | $25/月 | 推荐，性价比高 |
| **OpenAI** | ✅ DALL-E | ✅ GPT-4 | 无 | 最高质量 |
| **Groq** | ❌ | ✅ Llama | 有 | 超快速度 |
| **DeepSeek** | ❌ | ✅ DeepSeek | 有 | 低成本 |
| **自定义** | ✅ | ✅ | - | OpenAI 兼容即可 |

## 📚 API 文档

### GET `/api/models`

获取模型列表

**Query 参数**:
- `refresh=true` - 强制刷新缓存

**响应**:
```json
{
  "success": true,
  "data": {
    "image": [...],
    "chat": [...],
    "lastUpdate": "2025-12-09T..."
  },
  "cached": false
}
```

### POST `/api/generate-image`

生成图像

**请求体**:
```json
{
  "prompt": "A beautiful sunset",
  "model": "dall-e-3",
  "width": 1024,
  "height": 1024
}
```

### POST `/api/chat`

聊天对话

**请求体**:
```json
{
  "message": "Hello!",
  "model": "gpt-4",
  "history": []
}
```

## 🔧 高级配置

### 混合使用多个提供商

```env
# Together.ai 生成图片（免费）
IMAGE_API_KEY=together_key
IMAGE_API_ENDPOINT=https://api.together.xyz/v1/images/generations

# Groq 聊天（免费且快）
CHAT_API_KEY=groq_key
CHAT_API_ENDPOINT=https://api.groq.com/openai/v1/chat/completions
```

### 自定义 API 端点

只要 API 遵循 OpenAI 格式，即可使用：

```env
IMAGE_API_ENDPOINT=https://your-custom-api.com/v1/images/generations
CHAT_API_ENDPOINT=https://your-custom-api.com/v1/chat/completions
MODELS_API_ENDPOINT=https://your-custom-api.com/v1/models
```

## 🐛 常见问题

### Q: 为什么图像生成失败？

A: 请检查：
1. 环境变量 `IMAGE_API_KEY` 是否配置正确
2. `IMAGE_API_ENDPOINT` 是否正确
3. API 余额是否充足
4. 网络连接是否正常
5. 查看控制台错误信息

### Q: 如何获取免费 API Key？

A: 
- **Together.ai**: https://api.together.xyz (每月 $25 免费)
- **Groq**: https://console.groq.com (免费层)
- **DeepSeek**: https://platform.deepseek.com (低成本)

### Q: 模型列表不更新怎么办？

A: 
1. 点击右上角“刷新模型”按钮
2. 或访问 `/api/models?refresh=true`
3. 检查 `MODELS_API_ENDPOINT` 配置
4. 重启服务器

### Q: 可以同时使用多个 API 吗？

A: 可以！你可以：
- 使用 Together.ai 生成图片（免费）
- 使用 Groq 进行聊天（快且免费）
- 混合任意提供商

## 📸 功能截图

- 🎨 多模型图像生成
- 🤖 AI 聊天助手
- 🖼️ 图片历史管理
- 🔄 自动模型更新

## 📝 项目结构

```
ai-image-generator/
├── public/
│   ├── index.html       # 前端页面
│   ├── style.css        # 样式文件
│   └── app.js           # 前端逻辑
├── server.js            # 后端服务器
├── package.json         # 项目配置
├── .env.example         # 环境变量模板
├── zbpack.json          # Zeabur 配置
└── README.md            # 项目文档
```

## 🔗 相关链接

- [💻 GitHub 仓库](https://github.com/kinai9661/ai-image-generator)
- [📚 OpenAI API 文档](https://platform.openai.com/docs/api-reference)
- [⚡ Together.ai](https://api.together.xyz)
- [🚀 Groq](https://console.groq.com)
- [🚀 Zeabur](https://zeabur.com/docs)

## 📝 License

MIT License

## 👥 贡献

欢迎提交 Issue 和 Pull Request！

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/kinai9661">kinai9661</a>
</p>

<p align="center">
  <a href="https://github.com/kinai9661/ai-image-generator">
    <img src="https://img.shields.io/github/stars/kinai9661/ai-image-generator?style=social" alt="GitHub stars">
  </a>
  <a href="https://github.com/kinai9661/ai-image-generator/network/members">
    <img src="https://img.shields.io/github/forks/kinai9661/ai-image-generator?style=social" alt="GitHub forks">
  </a>
</p>