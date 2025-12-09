# 🎨 AI Image Generator

> 完全免费的 AI 聊天应用，基于你自己的 Typli API Server

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org)
[![Zeabur](https://img.shields.io/badge/Deploy-Zeabur-green.svg)](https://zeabur.com)

## ✨ 功能特性

- 🎉 **完全免费** - 使用你自己的 Typli API Server (Zeabur Free Tier)
- 🤖 **AI 聊天** - 支持 Grok-4, Llama, Mixtral 等多种模型
- 🔄 **自动更新** - 启动时自动获取最新模型列表
- 🖼️ **聊天历史** - 本地存储聊天记录
- 🔐 **安全配置** - 后端代理，保护凭证
- 🚀 **一键部署** - Zeabur / Vercel 快速部署

## 🚀 快速开始

### 1. 克隆仓库

```bash
git clone https://github.com/kinai9661/ai-image-generator.git
cd ai-image-generator
npm install
```

### 2. 配置环境变量

```bash
cp .env.example .env
```

**`.env` 文件默认配置（已预设好）：**

```env
# 你的 Typli API Server
CHAT_API_KEY=1
CHAT_API_ENDPOINT=https://fluxes.zeabur.app/v1/chat/completions
MODELS_API_ENDPOINT=https://fluxes.zeabur.app/v1/models

# 可选：图像生成（如果你的 Typli 支持）
IMAGE_API_KEY=1
IMAGE_API_ENDPOINT=https://fluxes.zeabur.app/v1/images/generations

API_PROVIDER=typli
PORT=3000
```

✅ **无需修改，开箱即用！**

### 3. 启动应用

```bash
# 开发模式
npm run dev

# 生产模式
npm start
```

访问 `http://localhost:3000`

## 🌐 部署到 Zeabur

### 方法 1：Zeabur 控制台部署

1. Fork 此仓库
2. 访问 [Zeabur](https://zeabur.com)
3. 点击 "New Project" > "Import from GitHub"
4. 选择 `ai-image-generator` 仓库
5. 添加环境变量：
   ```
   CHAT_API_KEY=1
   CHAT_API_ENDPOINT=https://fluxes.zeabur.app/v1/chat/completions
   MODELS_API_ENDPOINT=https://fluxes.zeabur.app/v1/models
   API_PROVIDER=typli
   ```
6. 点击 Deploy！

### 方法 2：Vercel 部署

```bash
npm install -g vercel
vercel
```

## 📊 你的 Typli API Server

### 🔗 API 控制台
访问 **https://fluxes.zeabur.app** 查看：

- 📊 总请求数
- 📶 流量使用
- ⏱️ 运行时间  
- 💰 预估费用 (Zeabur Free Tier)

### 🧪 测试 API

```bash
# 测试聊天
curl https://fluxes.zeabur.app/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer 1" \
  -d '{
    "model": "xai/grok-4-fast",
    "messages": [{"role": "user", "content": "你好！"}],
    "stream": false
  }'

# 查看可用模型
curl https://fluxes.zeabur.app/v1/models \
  -H "Authorization: Bearer 1"
```

### 🐍 Python 示例

```python
from openai import OpenAI

client = OpenAI(
    api_key="1",
    base_url="https://fluxes.zeabur.app/v1"
)

response = client.chat.completions.create(
    model="xai/grok-4-fast",
    messages=[{"role": "user", "content": "你好！"}]
)

print(response.choices[0].message.content)
```

## 📚 可用模型

你的 Typli API Server 支持多种模型：

- **xai/grok-4-fast** - 最新 Grok 模型，速度快
- **meta-llama/...** - Meta Llama 系列
- **mistralai/...** - Mistral 系列
- **更多...** - 查看 `/v1/models` 端点

应用会自动从 API 获取最新模型列表！

## 🔧 高级配置

### 切换到其他提供商

如果需要使用其他 API，修改 `.env`：

**Together.ai (免费 $25/月)**：
```env
CHAT_API_KEY=your_together_key
CHAT_API_ENDPOINT=https://api.together.xyz/v1/chat/completions
IMAGE_API_KEY=your_together_key
IMAGE_API_ENDPOINT=https://api.together.xyz/v1/images/generations
MODELS_API_ENDPOINT=https://api.together.xyz/v1/models
API_PROVIDER=together
```

**OpenAI**：
```env
CHAT_API_KEY=sk-...
CHAT_API_ENDPOINT=https://api.openai.com/v1/chat/completions
IMAGE_API_KEY=sk-...
IMAGE_API_ENDPOINT=https://api.openai.com/v1/images/generations
MODELS_API_ENDPOINT=https://api.openai.com/v1/models
API_PROVIDER=openai
```

**Groq (免费)**：
```env
CHAT_API_KEY=your_groq_key
CHAT_API_ENDPOINT=https://api.groq.com/openai/v1/chat/completions
MODELS_API_ENDPOINT=https://api.groq.com/openai/v1/models
API_PROVIDER=groq
```

## 🐛 常见问题

### Q: 为什么聊天失败？

A: 请检查：
1. API 端点 `https://fluxes.zeabur.app` 是否可访问
2. 查看浏览器控制台错误信息
3. 确认 `CHAT_API_KEY=1` 配置正确
4. 访问 https://fluxes.zeabur.app 检查 API 状态

### Q: 如何查看可用模型？

A: 
1. 启动应用后，模型会自动加载
2. 或者访问：`curl https://fluxes.zeabur.app/v1/models -H "Authorization: Bearer 1"`
3. 点击右上角“刷新模型”按钮

### Q: 支持图像生成吗？

A: 
- 如果你的 Typli API Server 支持 `/v1/images/generations`，则可以使用
- 否则只支持聊天功能
- 可以添加 Together.ai 来支持图像生成

### Q: 如何更改 API 端点？

A: 修改 `.env` 文件中的：
```env
CHAT_API_ENDPOINT=https://your-api.zeabur.app/v1/chat/completions
MODELS_API_ENDPOINT=https://your-api.zeabur.app/v1/models
```

## 📸 功能截图

- 🤖 AI 聊天助手 (Grok-4, Llama, Mixtral)
- 🔄 自动模型更新
- 💬 聊天历史管理
- 🎉 完全免费部署

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
- [🚀 Typli API Server](https://fluxes.zeabur.app)
- [📚 OpenAI API 文档](https://platform.openai.com/docs/api-reference)
- [🚀 Zeabur](https://zeabur.com/docs)

## ✨ 特性亮点

- ✅ **零成本** - Zeabur Free Tier + 自己的 API
- ✅ **简单配置** - 只需 3 个环境变量
- ✅ **自动更新** - 模型列表自动同步
- ✅ **多模型支持** - Grok, Llama, Mixtral 等
- ✅ **开箱即用** - 克隆即用，无需修改

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