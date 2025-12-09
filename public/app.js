// ==================== 配置和工具函数 ====================
const DEBUG_MODE = true;

function debugLog(message, data = null) {
    if (DEBUG_MODE) {
        if (data) {
            console.log(`[DEBUG] ${message}`, data);
        } else {
            console.log(`[DEBUG] ${message}`);
        }
    }
}

// 通知提示
function showNotification(message, type = 'success') {
    const colors = {
        success: '#10b981',
        error: '#ef4444',
        info: '#3b82f6',
        warning: '#f59e0b'
    };
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        background: ${colors[type] || colors.info};
        color: white;
        border-radius: 12px;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        z-index: 9999;
        animation: slideInRight 0.3s ease;
        font-weight: 600;
        max-width: 400px;
    `;
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ==================== API 调用函数 ====================

// 检查 API 配置
async function checkApiConfig() {
    try {
        const response = await fetch('/api/config');
        const config = await response.json();
        console.log('📋 API 配置状态:', config);
        return config;
    } catch (error) {
        console.error('❌ 无法获取 API 配置:', error);
        return { hasImageApi: false, hasChatApi: false };
    }
}

// 图像生成 API
async function callImageApi(prompt, model, width, height) {
    try {
        console.log('🎨 调用图像生成 API...');
        
        const response = await fetch('/api/generate-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt, model, width, height, steps: 4 })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || '图像生成失败');
        }

        const data = await response.json();
        console.log('✅ 图像生成成功');
        
        if (data.success && data.data && data.data[0]) {
            const imageData = data.data[0];
            // Together.ai 返回 b64_json 或 url
            if (imageData.b64_json) {
                return `data:image/png;base64,${imageData.b64_json}`;
            } else if (imageData.url) {
                return imageData.url;
            }
        }
        
        throw new Error('无效的响应格式');
    } catch (error) {
        console.error('❌ 图像生成失败:', error);
        throw error;
    }
}

// AI 聊天 API
async function callChatApi(message, model) {
    try {
        console.log('💬 调用聊天 API...');
        
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message, model })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || '聊天失败');
        }

        const data = await response.json();
        console.log('✅ 聊天响应成功');
        
        if (data.success && data.data.choices && data.data.choices[0]) {
            return data.data.choices[0].message.content;
        }
        
        throw new Error('无效的响应格式');
    } catch (error) {
        console.error('❌ 聊天失败:', error);
        throw error;
    }
}

// ==================== 模型管理 ====================

let availableModels = {
    image: [],
    chat: [],
    lastUpdate: null
};

// 加载模型列表
async function loadModels(forceRefresh = false) {
    try {
        console.log('🔄 正在加载模型列表...');
        if (!forceRefresh) {
            showNotification('🔄 正在加载模型列表...', 'info');
        }
        
        const url = forceRefresh ? '/api/models?refresh=true' : '/api/models';
        const response = await fetch(url);
        const result = await response.json();
        
        if (!result.success) {
            throw new Error(result.error || '加载模型失败');
        }

        availableModels = result.data;
        
        console.log(`✅ 模型列表加载成功:`, {
            imageModels: availableModels.image.length,
            chatModels: availableModels.chat.length,
            cached: result.cached
        });

        updateModelSelects();
        
        const updateTime = availableModels.lastUpdate 
            ? new Date(availableModels.lastUpdate).toLocaleString('zh-TW')
            : '刚刚';
        
        showNotification(
            `✅ 模型已更新 (${availableModels.image.length}个图像, ${availableModels.chat.length}个聊天)`,
            'success'
        );

        return availableModels;
    } catch (error) {
        console.error('❌ 加载模型失败:', error);
        showNotification(`❌ 加载模型失败: ${error.message}`, 'error');
        return { image: [], chat: [], lastUpdate: null };
    }
}

// 更新模型选择器
function updateModelSelects() {
    // 更新图像模型选择器
    if (imageModelSelect && availableModels.image.length > 0) {
        const currentValue = imageModelSelect.value;
        imageModelSelect.innerHTML = '';
        
        const speedGroups = {
            fast: availableModels.image.filter(m => m.speed === 'fast'),
            medium: availableModels.image.filter(m => m.speed === 'medium'),
            slow: availableModels.image.filter(m => m.speed === 'slow')
        };

        const groupLabels = {
            fast: '⚡ 快速模型',
            medium: '🔧 平衡模型',
            slow: '🏆 高质量模型'
        };

        ['fast', 'medium', 'slow'].forEach(speed => {
            if (speedGroups[speed].length > 0) {
                const group = document.createElement('optgroup');
                group.label = groupLabels[speed];
                speedGroups[speed].forEach(model => {
                    const option = document.createElement('option');
                    option.value = model.id;
                    option.textContent = `${model.name} - ${model.description}${model.free ? ' (免费)' : ''}`;
                    group.appendChild(option);
                });
                imageModelSelect.appendChild(group);
            }
        });

        if (currentValue && Array.from(imageModelSelect.options).some(opt => opt.value === currentValue)) {
            imageModelSelect.value = currentValue;
        }
    }

    // 更新聊天模型选择器
    if (modelSelect && availableModels.chat.length > 0) {
        const currentValue = modelSelect.value;
        modelSelect.innerHTML = '';
        
        const providerGroups = {};
        availableModels.chat.forEach(m => {
            let provider = 'Other';
            if (m.name.includes('Llama')) provider = 'Meta';
            else if (m.name.includes('Mixtral')) provider = 'Mistral';
            else if (m.name.includes('Qwen')) provider = 'Alibaba';
            else if (m.name.includes('DeepSeek')) provider = 'DeepSeek';
            
            if (!providerGroups[provider]) providerGroups[provider] = [];
            providerGroups[provider].push(m);
        });

        const providerIcons = {
            'Meta': '🦙',
            'Mistral': '🔮',
            'Alibaba': '🇨🇳',
            'DeepSeek': '🤖',
            'Other': '🔧'
        };

        Object.keys(providerGroups).forEach(provider => {
            const group = document.createElement('optgroup');
            group.label = `${providerIcons[provider] || '🤖'} ${provider}`;
            
            providerGroups[provider].forEach(model => {
                const option = document.createElement('option');
                option.value = model.id;
                option.textContent = `${model.name} - ${model.description}${model.free ? ' (免费)' : ''}`;
                group.appendChild(option);
            });
            
            modelSelect.appendChild(group);
        });

        if (currentValue && Array.from(modelSelect.options).some(opt => opt.value === currentValue)) {
            modelSelect.value = currentValue;
        }
    }

    console.log('✅ 模型选择器已更新');
}

// ==================== localStorage 包装器 ====================
const HISTORY_KEY = 'ai_image_history';
const MAX_HISTORY = 50;

function isLocalStorageAvailable() {
    try {
        const test = '__test__';
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        return true;
    } catch (e) {
        console.warn('⚠️ localStorage 不可用');
        return false;
    }
}

const USE_LOCAL_STORAGE = isLocalStorageAvailable();

class ImageHistory {
    constructor() {
        this.memoryHistory = [];
        this.history = this.loadHistory();
    }

    loadHistory() {
        if (!USE_LOCAL_STORAGE) return this.memoryHistory;
        try {
            const data = localStorage.getItem(HISTORY_KEY);
            const loaded = data ? JSON.parse(data) : [];
            this.memoryHistory = loaded;
            console.log(`💾 载入 ${loaded.length} 笔记录`);
            return loaded;
        } catch (error) {
            console.warn('⚠️ 载入记录失败:', error);
            return this.memoryHistory;
        }
    }

    saveHistory() {
        if (!USE_LOCAL_STORAGE) return;
        try {
            localStorage.setItem(HISTORY_KEY, JSON.stringify(this.history));
            console.log('✅ 记录已保存');
        } catch (error) {
            console.error('❌ 保存失败:', error);
        }
    }

    addImage(imageData, prompt, model, aspectRatio = '1024x1024') {
        const record = {
            id: Date.now() + Math.random(),
            timestamp: new Date().toISOString(),
            imageData,
            prompt,
            model,
            modelName: model.split('/').pop() || model,
            aspectRatio
        };
        
        this.history.unshift(record);
        this.memoryHistory.unshift(record);
        
        if (this.history.length > MAX_HISTORY) {
            this.history = this.history.slice(0, MAX_HISTORY);
            this.memoryHistory = this.memoryHistory.slice(0, MAX_HISTORY);
        }
        
        this.saveHistory();
        return record;
    }

    deleteImage(id) {
        this.history = this.history.filter(item => item.id !== id);
        this.memoryHistory = this.memoryHistory.filter(item => item.id !== id);
        this.saveHistory();
    }

    clearAll() {
        this.history = [];
        this.memoryHistory = [];
        this.saveHistory();
    }

    getStorageSize() {
        if (!USE_LOCAL_STORAGE) {
            return (JSON.stringify(this.memoryHistory).length / 1024).toFixed(2);
        }
        try {
            const data = localStorage.getItem(HISTORY_KEY);
            return data ? (new Blob([data]).size / 1024).toFixed(2) : '0';
        } catch (error) {
            return '0';
        }
    }
}

const imageHistory = new ImageHistory();

// ==================== DOM 元素 ====================
const chatMessages = document.getElementById('messages');
const chatInput = document.getElementById('chat-input');
const sendBtn = document.getElementById('send-btn');
const modelSelect = document.getElementById('model-select');

const imageModelSelect = document.getElementById('image-model-select');
const aspectRatioSelect = document.getElementById('aspect-ratio-select');
const imagePrompt = document.getElementById('image-prompt');
const generateImgBtn = document.getElementById('generate-img-btn');
const imageResult = document.getElementById('image-result');

const historyGrid = document.getElementById('history-grid');
const clearHistoryBtn = document.getElementById('clear-history-btn');
const totalCountEl = document.getElementById('total-count');
const storageSizeEl = document.getElementById('storage-size');

const refreshModelsBtn = document.getElementById('refresh-models-btn');

// ==================== Tab 切换 ====================
const tabBtns = document.querySelectorAll('.tab-btn');
const sections = document.querySelectorAll('.section');

tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const targetTab = btn.dataset.tab;
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        sections.forEach(section => {
            section.classList.remove('active');
            if (section.id === `${targetTab}-section`) {
                section.classList.add('active');
            }
        });
        if (targetTab === 'history') {
            renderHistory();
        }
    });
});

// ==================== 聊天功能 ====================
async function sendMessage() {
    const message = chatInput.value.trim();
    const model = modelSelect.value;
    if (!message) return;
    
    addMessage(message, 'user');
    chatInput.value = '';
    sendBtn.disabled = true;
    const loadingDiv = addMessage('思考中...', 'ai', true);
    
    try {
        const response = await callChatApi(message, model);
        loadingDiv.remove();
        addMessage(response, 'ai');
    } catch (error) {
        console.error('聊天错误:', error);
        loadingDiv.remove();
        addMessage(`错误: ${error.message}`, 'ai');
        showNotification(`❌ ${error.message}`, 'error');
    } finally {
        sendBtn.disabled = false;
        chatInput.focus();
    }
}

function addMessage(text, sender, isLoading = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message ${isLoading ? 'loading' : ''}`;
    messageDiv.textContent = text;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return messageDiv;
}

// ==================== 图像生成功能 ====================
async function generateImage() {
    console.log('🎨 ===== 开始图像生成 =====');
    
    const prompt = imagePrompt.value.trim();
    const model = imageModelSelect.value;
    const aspectRatio = aspectRatioSelect.value;
    
    if (!prompt) {
        imageResult.innerHTML = '<p class="error">⚠️ 请输入图像描述</p>';
        return;
    }
    
    const [width, height] = aspectRatio.split('x').map(Number);
    const modelName = model.split('/').pop() || model;
    
    generateImgBtn.disabled = true;
    imageResult.innerHTML = `
        <div class="loading-container">
            <div class="loading-spinner"></div>
            <p class="loading">⚡ 正在使用 ${modelName} 生成图像...</p>
            <p style="color: #6b7280; font-size: 0.85rem; margin-top: 0.5rem;">
                ${width}x${height} • 预计 20-40 秒
            </p>
        </div>
    `;
    
    try {
        const imageUrl = await callImageApi(prompt, model, width, height);
        
        imageHistory.addImage(imageUrl, prompt, model, aspectRatio);
        
        imageResult.innerHTML = `
            <div class="success-header">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
                <div>
                    <p class="success">✅ 图像生成成功!</p>
                    <p style="color: #6b7280; font-size: 0.85rem;">
                        模型: ${model} • 尺寸: ${aspectRatio}
                    </p>
                </div>
            </div>
            <div style="margin-top: 1rem; position: relative; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);">
                <img src="${imageUrl}" alt="${prompt}" style="width: 100%; height: auto; display: block; cursor: pointer;" id="generated-image" />
                <a href="${imageUrl}" download="flux-${modelName}-${aspectRatio.replace('x', '-')}-${Date.now()}.png" 
                   style="position: absolute; bottom: 10px; right: 10px; background: rgba(102, 126, 234, 0.9); color: white; padding: 0.5rem 1rem; border-radius: 8px; text-decoration: none; font-weight: 600;">
                    下载图片
                </a>
            </div>
        `;
        
        document.getElementById('generated-image').addEventListener('click', () => {
            openImageModal(imageUrl, prompt, modelName, aspectRatio);
        });
        
        showNotification('✅ 图像生成成功!');
        renderHistory();
        
    } catch (error) {
        console.error('❌ 图像生成失败:', error);
        imageResult.innerHTML = `
            <div class="error-container">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="15" y1="9" x2="9" y2="15"/>
                    <line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
                <p class="error">❌ 生成失败: ${error.message}</p>
                <div class="error-suggestions">
                    <p><strong>💡 解决建议:</strong></p>
                    <ul>
                        <li>检查环境变量 IMAGE_API_KEY 是否配置</li>
                        <li>确认 API 余额充足</li>
                        <li>尝试简化提示词</li>
                        <li>检查网络连接</li>
                    </ul>
                </div>
            </div>
        `;
        showNotification(`❌ ${error.message}`, 'error');
    } finally {
        generateImgBtn.disabled = false;
    }
}

// ==================== 图像模态框 ====================
function openImageModal(imageData, prompt, modelName, aspectRatio) {
    const modal = document.createElement('div');
    modal.className = 'image-modal';
    const safePrompt = prompt.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    modal.innerHTML = `
        <div class="modal-backdrop"></div>
        <div class="modal-content">
            <button class="modal-close" aria-label="关闭">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
            </button>
            <img src="${imageData}" alt="Generated image" />
            <div class="modal-info">
                <div class="modal-prompt">
                    <strong>📝 提示词:</strong>
                    <p>${safePrompt}</p>
                </div>
                <div class="modal-meta">
                    <span class="modal-model">🎨 ${modelName}</span>
                    <span class="modal-size">📐 ${aspectRatio}</span>
                    <div class="modal-actions">
                        <a href="${imageData}" download="flux-${modelName}-${aspectRatio.replace('x', '-')}-${Date.now()}.png" class="btn-modal-action">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                <polyline points="7 10 12 15 17 10"/>
                                <line x1="12" y1="15" x2="12" y2="3"/>
                            </svg>
                            下载图片
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    modal.querySelector('.modal-close').addEventListener('click', () => modal.remove());
    modal.querySelector('.modal-backdrop').addEventListener('click', () => modal.remove());
    document.addEventListener('keydown', function handleEsc(e) {
        if (e.key === 'Escape') {
            modal.remove();
            document.removeEventListener('keydown', handleEsc);
        }
    });
}

// ==================== 历史记录渲染 ====================
function renderHistory() {
    const history = imageHistory.history;
    totalCountEl.textContent = history.length;
    storageSizeEl.textContent = `${imageHistory.getStorageSize()} KB`;

    if (history.length === 0) {
        historyGrid.innerHTML = `
            <div class="empty-state">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <rect x="3" y="3" width="18" height="18" rx="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <path d="M21 15l-5-5L5 21"/>
                </svg>
                <p>尚无生成记录</p>
                <small>开始生成图片后,记录会自动保存在这里</small>
            </div>
        `;
        return;
    }

    historyGrid.innerHTML = '';
    history.forEach((item) => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        const truncatedPrompt = item.prompt.substring(0, 80) + (item.prompt.length > 80 ? '...' : '');
        historyItem.innerHTML = `
            <img src="${item.imageData}" alt="${truncatedPrompt}" loading="lazy">
            <div class="history-overlay">
                <div class="history-info">
                    <span class="history-model">${item.modelName}</span>
                    <span class="history-size">📐 ${item.aspectRatio}</span>
                </div>
                <p class="history-prompt">${truncatedPrompt}</p>
                <div class="history-actions">
                    <button class="btn-icon btn-zoom" title="放大查看">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
                        </svg>
                    </button>
                    <a href="${item.imageData}" download="flux-${item.modelName}-${item.aspectRatio.replace('x', '-')}-${item.id}.png" class="btn-icon" title="下载">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                            <polyline points="7 10 12 15 17 10"/>
                            <line x1="12" y1="15" x2="12" y2="3"/>
                        </svg>
                    </a>
                    <button class="btn-icon btn-delete" title="删除">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                    </button>
                </div>
            </div>
        `;
        
        historyItem.querySelector('img').addEventListener('click', () => {
            openImageModal(item.imageData, item.prompt, item.modelName, item.aspectRatio);
        });
        historyItem.querySelector('.btn-zoom').addEventListener('click', (e) => {
            e.stopPropagation();
            openImageModal(item.imageData, item.prompt, item.modelName, item.aspectRatio);
        });
        historyItem.querySelector('.btn-delete').addEventListener('click', (e) => {
            e.stopPropagation();
            if (confirm('确定要删除这张图片吗?')) {
                imageHistory.deleteImage(item.id);
                renderHistory();
            }
        });
        
        historyGrid.appendChild(historyItem);
    });
}

// ==================== 事件监听器 ====================
sendBtn.addEventListener('click', sendMessage);
chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});

generateImgBtn.addEventListener('click', generateImage);
imagePrompt.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        generateImage();
    }
});

clearHistoryBtn.addEventListener('click', () => {
    if (confirm('确定要清空所有图片记录吗?此操作无法撤销!')) {
        imageHistory.clearAll();
        renderHistory();
    }
});

if (refreshModelsBtn) {
    refreshModelsBtn.addEventListener('click', async () => {
        refreshModelsBtn.classList.add('loading');
        refreshModelsBtn.disabled = true;
        
        await loadModels(true);
        
        refreshModelsBtn.classList.remove('loading');
        refreshModelsBtn.disabled = false;
    });
}

// ==================== 初始化 ====================
async function initialize() {
    console.log('🚀 ===== 应用初始化开始 =====');
    
    const config = await checkApiConfig();
    
    if (!config.hasImageApi) {
        console.warn('⚠️ 图像生成 API 未配置');
        showNotification('⚠️ 请配置环境变量 IMAGE_API_KEY', 'warning');
    }
    
    if (!config.hasChatApi) {
        console.warn('⚠️ 聊天 API 未配置');
    }
    
    await loadModels();
    renderHistory();
    
    console.log('✅ ===== 应用初始化完成 =====');
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
} else {
    initialize();
}