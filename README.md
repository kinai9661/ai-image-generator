# 🎨 AI Image Generator

> 基于环境变量配置的 AI 图像生成和聊天应用，支持自动更新模型列表，无需前端登入

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org)
[![Together.ai](https://img.shields.io/badge/API-Together.ai-purple.svg)](https://api.together.xyz)

## ✨ 功能特性

- ✅ **FLUX AI 图像生成**
  - 支持多种 FLUX 模型（Schnell / Dev / Pro）
  - 多种尺寸比例（1:1, 3:2, 2:3, 16:9, 9:16）
  - 高质量图像生成（20-40秒）

- 🤖 **AI 聊天对话**
  - 支持多种聊天模型（Llama / Mixtral / Qwen 等）
  - 实时对话交互
  - 智能上下文理解

- 🔄 **自动更新模型**
  - 启动时自动获取最新模型列表
  - 每小时自动刷新
  - 手动刷新按钮
  - 智能模型分类（按速度/提供商）

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

编辑 `.env` 文件：

```env
# Together.ai API 配置
# 注册: https://api.together.xyz/settings/api-keys
IMAGE_API_KEY=your_together_api_key_here
CHAT_API_KEY=your_together_api_key_here

PORT=3000
```

> 🎁 **免费额度**：Together.ai 每月提供 $25 免费额度！

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
3. 添加环境变量：
   - `IMAGE_API_KEY`
   - `CHAT_API_KEY`
4. 部署完成！

### Vercel 部署

```bash
# 安装 Vercel CLI
npm install -g vercel

# 部署
vercel
```

或直接在 Vercel 控制台导入 GitHub 仓库。

## 📦 技术栈

- **后端**: Node.js + Express
- **前端**: 原生 JavaScript（无框架）
- **API**: Together.ai
- **存储**: localStorage
- **配置**: dotenv 环境变量

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
  "model": "black-forest-labs/FLUX.1-schnell",
  "width": 1024,
  "height": 1024,
  "steps": 4
}
```

### POST `/api/chat`

聊天对话

**请求体**:
```json
{
  "message": "Hello!",
  "model": "meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo",
  "history": []
}
```

## 🔧 高级配置

### 使用其他 API 提供商

在 `.env` 中修改：

```env
# OpenAI
IMAGE_API_ENDPOINT=https://api.openai.com/v1/images/generations
IMAGE_API_KEY=sk-...

# 自定义 API
IMAGE_API_ENDPOINT=https://your-api.com/generate
IMAGE_API_KEY=your_key
```

### 修改模型缓存时间

在 `server.js` 中修改：

```javascript
const maxAge = 1000 * 60 * 60; // 1小时
```

## 🐛 常见问题

### Q: 为什么图像生成失败？

A: 请检查：
1. 环境变量 `IMAGE_API_KEY` 是否配置正确
2. API 余额是否充足
3. 网络连接是否正常
4. 查看控制台错误信息

### Q: 如何获取 Together.ai API Key？

A: 
1. 注册 [Together.ai](https://api.together.xyz)
2. 进入 [API Keys](https://api.together.xyz/settings/api-keys)
3. 创建新的 API Key
4. 复制并粘贴到 `.env` 文件

### Q: 模型列表不更新怎么办？

A: 
1. 点击右上角“刷新模型”按钮
2. 或访问 `/api/models?refresh=true`
3. 重启服务器

## 📸 截图预览

### 主界面
- 🎨 FLUX 图像生成
- 🤖 AI 聊天助手
- 🖼️ 图片历史管理

### 功能特点
- ✅ 自动获取最新模型
- ✅ 多种尺寸支持
- ✅ 本地历史记录
- ✅ 无需登入

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
- [📚 Together.ai 文档](https://docs.together.ai)
- [⚡ FLUX 模型介绍](https://blackforestlabs.ai/flux-1-tools/)
- [🚀 Zeabur 文档](https://zeabur.com/docs)

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