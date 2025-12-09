# 🔧 问题排查指南

## 常见错误及解决方法

### 1. 聊天功能错误

#### 错误："Invalid messages format" / "无效的响应格式"

**原因**：API 返回的格式与预期不符

**解决方法**：

1. **检查 API 端点配置**
   ```bash
   # 测试你的 Typli API
   curl https://fluxes.zeabur.app/v1/chat/completions \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer 1" \
     -d '{
       "model": "xai/grok-4-fast",
       "messages": [{"role": "user", "content": "你好"}]
     }'
   ```

2. **验证响应格式**
   - 正常响应应该包含 `choices[0].message.content`
   - 如果你的 API 返回不同的格式，请联系我修改 `app.js`

3. **检查环境变量**
   ```env
   CHAT_API_KEY=1
   CHAT_API_ENDPOINT=https://fluxes.zeabur.app/v1/chat/completions
   ```

---

### 2. 图像生成错误

#### 错误："Failed to load resource: 400" / "图像生成失败"

**原因**：
- API 端点不支持图像生成
- 请求参数错误
- API Key 未配置

**解决方法**：

1. **确认 API 支持图像生成**
   - Typli API Server 可能不支持图像生成
   - 如果不支持，可以使用 Together.ai

2. **添加 Together.ai 图像 API**
   ```env
   # 保持 Typli 聊天
   CHAT_API_KEY=1
   CHAT_API_ENDPOINT=https://fluxes.zeabur.app/v1/chat/completions
   
   # 添加 Together.ai 图像生成
   IMAGE_API_KEY=your_together_api_key
   IMAGE_API_ENDPOINT=https://api.together.xyz/v1/images/generations
   ```

3. **测试图像 API**
   ```bash
   curl https://api.together.xyz/v1/images/generations \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_KEY" \
     -d '{
       "model": "black-forest-labs/FLUX.1-schnell",
       "prompt": "a cat",
       "width": 1024,
       "height": 1024,
       "steps": 4
     }'
   ```

---

### 3. localStorage 错误

#### 错误："Access to storage is not allowed"

**原因**：浏览器禁止了 localStorage 访问

**解决方法**：

1. **允许 Cookie 和本地数据**
   - Chrome：设置 > 隐私设置和安全性 > Cookie 和其他网站数据
   - 确保未处于“隐身模式”

2. **使用 HTTPS**
   - 某些浏览器在 HTTP 下限制 localStorage
   - 部署到 Zeabur 后会自动使用 HTTPS

3. **应用已支持内存模式**
   - 如果 localStorage 不可用，会自动使用内存存储
   - 但是刷新页面后历史会消失

---

### 4. 模型列表为空

#### 错误：模型下拉框为空

**原因**：
- API 返回格式错误
- MODELS_API_ENDPOINT 未配置
- API Key 错误

**解决方法**：

1. **检查模型 API**
   ```bash
   curl https://fluxes.zeabur.app/v1/models \
     -H "Authorization: Bearer 1"
   ```

2. **手动刷新模型**
   - 点击右上角“刷新模型”按钮
   - 或访问 `/api/models?refresh=true`

3. **检查控制台**
   - 打开浏览器开发者工具 (F12)
   - 查看 Console 选项卡
   - 查看是否有加载模型的错误

---

## 调试步骤

### 1. 检查后端日志

```bash
# 本地运行时查看终端输出
npm start
```

查找以下信息：
- `✅ 模型列表已更新` - 模型加载成功
- `❌ 聊天失败` - 聊天 API 错误
- `❌ 图像生成失败` - 图像 API 错误

### 2. 检查浏览器控制台

1. 打开开发者工具：`F12` 或 `Ctrl+Shift+I`
2. 查看 **Console** 选项卡
3. 查找红色错误信息

关键日志：
- `[DEBUG]` - 详细调试信息
- `🚀 应用初始化完成` - 应用启动成功
- `✅ 模型列表加载成功` - 模型已加载

### 3. 检查 Network 请求

1. 开发者工具 > **Network** 选项卡
2. 执行操作（发送消息/生成图片）
3. 查看 API 请求：
   - `/api/chat` - 聊天请求
   - `/api/generate-image` - 图像生成
   - `/api/models` - 模型列表

4. 点击请求查看：
   - **Headers** - 请求头
   - **Payload** - 请求体
   - **Response** - 响应内容

---

## 测试清单

### 基本功能测试

- [ ] 页面能正常加载
- [ ] 模型列表能显示
- [ ] 聊天功能正常
- [ ] 图像生成正常（如果支持）
- [ ] 历史记录能保存

### 配置检查

```bash
# 检查 .env 文件
cat .env

# 应该看到：
CHAT_API_KEY=1
CHAT_API_ENDPOINT=https://fluxes.zeabur.app/v1/chat/completions
MODELS_API_ENDPOINT=https://fluxes.zeabur.app/v1/models
```

### API 连接测试

```bash
# 测试聊天 API
curl https://fluxes.zeabur.app/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer 1" \
  -d '{"model":"xai/grok-4-fast","messages":[{"role":"user","content":"hi"}]}'

# 测试模型 API
curl https://fluxes.zeabur.app/v1/models \
  -H "Authorization: Bearer 1"
```

---

## 联系支持

如果以上方法都无法解决问题，请：

1. **查看完整错误日志**
   - 浏览器控制台截图
   - 后端终端输出

2. **提供配置信息**
   - `.env` 文件内容（隐藏 API Key）
   - 使用的 API 提供商

3. **提交 Issue**
   - GitHub: https://github.com/kinai9661/ai-image-generator/issues
   - 包含以上信息

---

## 快速修复

### 重置应用

```bash
# 1. 删除 node_modules
rm -rf node_modules

# 2. 重新安装
npm install

# 3. 检查 .env
cat .env

# 4. 重启应用
npm start
```

### 清除缓存

1. 浏览器：`Ctrl+Shift+Delete` 清除缓存
2. localStorage：在控制台输入：
   ```javascript
   localStorage.clear();
   location.reload();
   ```

---

## 最佳实践

1. **使用 HTTPS**
   - 部署到 Zeabur/Vercel
   - 避免 localStorage 问题

2. **定期更新模型**
   - 点击“刷新模型”按钮
   - 获取最新可用模型

3. **监控 API 使用**
   - 访问 https://fluxes.zeabur.app
   - 查看请求数和流量

4. **备份配置**
   - 保存 `.env` 文件副本
   - 记录配置参数

---

更新日期：2025-12-09