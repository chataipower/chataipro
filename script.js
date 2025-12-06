// ============================================================
// AI CHAT PRO - PROFESSIONAL AI CHAT APPLICATION
// ============================================================

class AIChatApp {
    constructor() {
        this.settings = this.loadSettings();
        this.currentChat = null;
        this. chats = this.loadChats();
        this.messageHistory = [];
        this.isLoading = false;
        
        this.initElements();
        this.setupEventListeners();
        this. updateUI();
    }

    initElements() {
        this.elements = {
            messageInput: document.getElementById('messageInput'),
            sendBtn: document.getElementById('sendBtn'),
            attachBtn: document.getElementById('attachBtn'),
            fileInput: document.getElementById('fileInput'),
            chatMessages: document.getElementById('chatMessages'),
            chatTitle: document.getElementById('chatTitle'),
            chatDate: document.getElementById('chatDate'),
            historyList: document.getElementById('historyList'),
            modelDisplay: document.getElementById('modelDisplay'),
            loadingIndicator: document.getElementById('loadingIndicator'),
            notification: document.getElementById('notification'),
            themeToggle: document.getElementById('themeToggle'),
            newChatBtn: document.getElementById('newChatBtn'),
            settingsBtn: document.getElementById('settingsBtn'),
            exportBtn: document.getElementById('exportBtn'),
            clearBtn: document.getElementById('clearBtn'),
            settingsModal: document.getElementById('settingsModal'),
            closeSettingsBtn: document.getElementById('closeSettingsBtn'),
            saveSettingsBtn: document.getElementById('saveSettingsBtn'),
            resetSettingsBtn: document.getElementById('resetSettingsBtn'),
            apiKeyInput: document.getElementById('apiKeyInput'),
            modelSelect: document.getElementById('modelSelect'),
            temperatureSlider: document.getElementById('temperatureSlider'),
            tempValue: document.getElementById('tempValue'),
            maxTokensInput: document.getElementById('maxTokensInput'),
            systemPromptInput: document.getElementById('systemPromptInput'),
            autoSaveCheckbox: document.getElementById('autoSaveCheckbox'),
            compactModeCheckbox: document.getElementById('compactModeCheckbox'),
        };
    }

    setupEventListeners() {
        // Main actions
        this.elements.sendBtn.addEventListener('click', () => this.sendMessage());
        this.elements.messageInput.addEventListener('keydown', (e) => this.handleInputKeydown(e));
        this.elements.attachBtn.addEventListener('click', () => this.elements.fileInput.click());
        this.elements.fileInput.addEventListener('change', (e) => this.handleFileUpload(e));

        // Navigation
        this.elements.newChatBtn.addEventListener('click', () => this.newChat());
        this.elements. settingsBtn.addEventListener('click', () => this.openSettings());
        this.elements.exportBtn.addEventListener('click', () => this.exportChat());
        this.elements.clearBtn.addEventListener('click', () => this.clearAllChats());
        this.elements.themeToggle.addEventListener('click', () => this.toggleTheme());

        // Settings
        this.elements.closeSettingsBtn.addEventListener('click', () => this.closeSettings());
        this.elements.saveSettingsBtn.addEventListener('click', () => this.saveSettings());
        this.elements.resetSettingsBtn. addEventListener('click', () => this. resetSettings());
        this.elements.temperatureSlider.addEventListener('input', (e) => {
            this.elements.tempValue.textContent = parseFloat(e.target.value). toFixed(1);
        });

        // Close modal on outside click
        document.addEventListener('click', (e) => {
            if (e.target === this.elements.settingsModal) {
                this.closeSettings();
            }
        });

        // Auto-expand textarea
        this.elements.messageInput. addEventListener('input', () => this.autoExpandTextarea());
    }

    loadSettings() {
        const defaults = {
            apiKey: '',
            model: 'gpt-4o-mini',
            temperature: 0.7,
            maxTokens: 2000,
            systemPrompt: 'You are a helpful, harmless, and honest AI assistant.  Provide clear and concise answers.',
            autoSave: true,
            compactMode: false,
            theme: 'dark',
        };

        const saved = localStorage.getItem('aiChatSettings');
        return saved ?  { ...defaults, ...JSON.parse(saved) } : defaults;
    }

    saveSettings() {
        this.settings = {
            apiKey: this.elements.apiKeyInput.value,
            model: this.elements.modelSelect.value,
            temperature: parseFloat(this.elements.temperatureSlider.value),
            maxTokens: parseInt(this.elements.maxTokensInput.value),
            systemPrompt: this. elements.systemPromptInput.value,
            autoSave: this.elements.autoSaveCheckbox.checked,
            compactMode: this.elements.compactModeCheckbox.checked,
            theme: this.settings.theme,
        };

        localStorage.setItem('aiChatSettings', JSON.stringify(this.settings));
        this.closeSettings();
        this.showNotification('Settings saved successfully!', 'success');
    }

    resetSettings() {
        if (confirm('Reset all settings to default? ')) {
            localStorage.removeItem('aiChatSettings');
            this.settings = this.loadSettings();
            this. updateSettingsUI();
            this.showNotification('Settings reset to default', 'success');
        }
    }

    loadChats() {
        const saved = localStorage.getItem('aiChats');
        return saved ? JSON.parse(saved) : [];
    }

    saveChats() {
        localStorage.setItem('aiChats', JSON.stringify(this.chats));
    }

    newChat() {
        this.currentChat = {
            id: Date.now(),
            title: 'New Chat',
            messages: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        this.chats.unshift(this.currentChat);
        this.messageHistory = [];
        this.updateUI();
        this.showWelcome();
        this.saveChats();
    }

    selectChat(id) {
        this.currentChat = this.chats.find(chat => chat.id === id);
        if (this.currentChat) {
            this.messageHistory = this.currentChat.messages.map(msg => ({
                role: msg.role,
                content: msg.content,
            }));
            this.updateUI();
            this.renderMessages();
        }
    }

    updateUI() {
        // Update chat title and date
        if (this.currentChat) {
            this.elements.chatTitle. textContent = this.currentChat. title;
            const date = new Date(this.currentChat.updatedAt);
            this.elements.chatDate.textContent = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }

        // Update model display
        this.elements. modelDisplay.textContent = this. getModelName(this.settings.model);

        // Update history list
        this.renderHistoryList();

        // Update settings UI
        this.updateSettingsUI();
    }

    updateSettingsUI() {
        this.elements.apiKeyInput.value = this.settings.apiKey ?  '***SAVED***' : '';
        this. elements.modelSelect.value = this.settings.model;
        this.elements.temperatureSlider. value = this.settings.temperature;
        this.elements.tempValue.textContent = this.settings.temperature.toFixed(1);
        this.elements.maxTokensInput.value = this.settings.maxTokens;
        this.elements.systemPromptInput.value = this.settings.systemPrompt;
        this.elements.autoSaveCheckbox.checked = this.settings.autoSave;
        this.elements.compactModeCheckbox. checked = this.settings.compactMode;
    }

    renderHistoryList() {
        this.elements.historyList.innerHTML = '';

        if (this.chats.length === 0) {
            this.elements.historyList.innerHTML = '<p style="color: var(--text-tertiary); font-size: 12px; text-align: center; padding: 20px;">No chats yet</p>';
            return;
        }

        this.chats. forEach(chat => {
            const item = document.createElement('button');
            item.className = `history-item ${chat.id === this.currentChat?. id ? 'active' : ''}`;
            item.textContent = chat.title;
            item.onclick = () => this.selectChat(chat.id);
            
            item.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                this.deleteChat(chat.id);
            });

            this.elements.historyList.appendChild(item);
        });
    }

    deleteChat(id) {
        if (confirm('Delete this chat?')) {
            this.chats = this.chats.filter(chat => chat.id !== id);
            if (this.currentChat?.id === id) {
                this.newChat();
            }
            this.saveChats();
            this.updateUI();
        }
    }

    showWelcome() {
        this.elements.chatMessages.innerHTML = `
            <div class="welcome-section">
                <div class="welcome-content">
                    <h1>Welcome to AI Chat Pro</h1>
                    <p>Start a conversation to begin</p>
                    <div class="example-prompts">
                        <h3>Try asking me:</h3>
                        <button class="example-btn" onclick="app.setInput('Explain quantum computing simply')">
                            Explain quantum computing simply
                        </button>
                        <button class="example-btn" onclick="app.setInput('Write a Python function to sort a list')">
                            Write a Python function to sort a list
                        </button>
                        <button class="example-btn" onclick="app.setInput('What are the latest AI breakthroughs?')">
                            What are the latest AI breakthroughs?
                        </button>
                        <button class="example-btn" onclick="app.setInput('Help me understand machine learning')">
                            Help me understand machine learning
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    setInput(text) {
        this.elements. messageInput.value = text;
        this.autoExpandTextarea();
        this.elements.messageInput.focus();
    }

    autoExpandTextarea() {
        this.elements.messageInput.style. height = 'auto';
        this.elements.messageInput.style.height = Math.min(this.elements.messageInput.scrollHeight, 150) + 'px';
    }

    handleInputKeydown(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            this.sendMessage();
        }
    }

    async handleFileUpload(e) {
        const file = e.target.files[0];
        if (! file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target.result;
            const prompt = `Analyze this document:\n\n${content}`;
            this.setInput(prompt);
        };
        reader.readAsText(file);
    }

    async sendMessage() {
        const message = this.elements.messageInput. value.trim();

        if (!message) {
            this.showNotification('Please enter a message', 'error');
            return;
        }

        if (! this.currentChat) {
            this.newChat();
        }

        if (! this.settings.apiKey) {
            this.showNotification('Please set your API key in settings', 'error');
            this.openSettings();
            return;
        }

        // Add user message
        this.messageHistory.push({
            role: 'user',
            content: message,
        });

        this.currentChat.messages.push({
            role: 'user',
            content: message,
        });

        // Clear input
        this.elements.messageInput.value = '';
        this.autoExpandTextarea();

        // Render message
        this.renderMessages();

        // Show loading
        this.setLoading(true);

        try {
            // Get AI response
            const response = await this.callOpenAI();

            if (response) {
                // Add assistant message
                this.messageHistory.push({
                    role: 'assistant',
                    content: response,
                });

                this.currentChat.messages.push({
                    role: 'assistant',
                    content: response,
                });

                // Update chat title if first message
                if (this.currentChat.messages.length === 2) {
                    this.currentChat.title = message. substring(0, 50) + (message.length > 50 ?  '...' : '');
                }

                this.currentChat.updatedAt = new Date().toISOString();
                this.renderMessages();
                this.updateUI();

                if (this.settings.autoSave) {
                    this.saveChats();
                }
            }
        } catch (error) {
            console.error('Error:', error);
            this.showNotification('Failed to get response', 'error');
        } finally {
            this.setLoading(false);
        }
    }

    async callOpenAI() {
        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this. settings.apiKey}`,
                },
                body: JSON.stringify({
                    model: this.settings.model,
                    messages: [
                        {
                            role: 'system',
                            content: this.settings.systemPrompt,
                        },
                        ... this.messageHistory,
                    ],
                    temperature: this. settings.temperature,
                    max_tokens: this.settings.maxTokens,
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error?. message || 'API Error');
            }

            const data = await response.json();
            return data.choices[0]?.message?.content || null;
        } catch (error) {
            console.error('API Error:', error);
            this.showNotification(error.message, 'error');
            return null;
        }
    }

    renderMessages() {
        if (this.currentChat. messages.length === 0) {
            this.showWelcome();
            return;
        }

        this.elements.chatMessages.innerHTML = '';

        this.currentChat.messages.forEach(msg => {
            const messageDiv = document.createElement('div');
            messageDiv.className = `message ${msg.role}`;

            const contentDiv = document.createElement('div');
            contentDiv.className = 'message-content';
            contentDiv.innerHTML = this.formatMessage(msg.content);

            messageDiv.appendChild(contentDiv);

            // Add copy button
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'message-actions';
            const copyBtn = document.createElement('button');
            copyBtn.className = 'message-btn';
            copyBtn.innerHTML = '<i class="fas fa-copy"></i> Copy';
            copyBtn.onclick = () => this.copyToClipboard(msg.content);
            actionsDiv.appendChild(copyBtn);

            messageDiv. appendChild(actionsDiv);
            this.elements.chatMessages. appendChild(messageDiv);
        });

        // Scroll to bottom
        this.elements.chatMessages.scrollTop = this.elements.chatMessages.scrollHeight;
    }

    formatMessage(content) {
        let html = content
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            . replace(/>/g, '&gt;');

        // Code blocks
        html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
            return `<pre><code>${code}</code></pre>`;
        });

        // Inline code
        html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

        // Bold
        html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

        // Italic
        html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

        // Line breaks
        html = html.replace(/\n/g, '<br>');

        return html;
    }

    copyToClipboard(text) {
        navigator.clipboard.writeText(text). then(() => {
            this. showNotification('Copied to clipboard!', 'success');
        });
    }

    exportChat() {
        if (!this.currentChat || this.currentChat.messages.length === 0) {
            this. showNotification('No chat to export', 'error');
            return;
        }

        const data = {
            title: this.currentChat.title,
            createdAt: this.currentChat. createdAt,
            messages: this.currentChat.messages,
        };

        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL. createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `chat-${Date.now()}.json`;
        a.click();
        URL. revokeObjectURL(url);

        this.showNotification('Chat exported successfully!', 'success');
    }

    clearAllChats() {
        if (confirm('Delete ALL chats?  This cannot be undone.')) {
            this.chats = [];
            this.currentChat = null;
            this. messageHistory = [];
            this.saveChats();
            this.newChat();
            this.showNotification('All chats deleted', 'success');
        }
    }

    toggleTheme() {
        const isDark = document.body.classList.toggle('light-theme');
        this.settings.theme = isDark ? 'light' : 'dark';
        localStorage.setItem('aiChatSettings', JSON.stringify(this.settings));
    }

    openSettings() {
        this.elements.settingsModal.classList.add('active');
        this.updateSettingsUI();
    }

    closeSettings() {
        this.elements.settingsModal.classList.remove('active');
    }

    setLoading(isLoading) {
        this.isLoading = isLoading;
        if (isLoading) {
            this.elements.loadingIndicator.classList.add('active');
        } else {
            this.elements.loadingIndicator.classList.remove('active');
        }
    }

    showNotification(message, type = 'info') {
        this.elements.notification.textContent = message;
        this.elements. notification.className = `notification show ${type}`;

        setTimeout(() => {
            this.elements.notification.classList.remove('show');
        }, 3000);
    }

    getModelName(model) {
        const names = {
            'gpt-4o': 'GPT-4o',
            'gpt-4o-mini': 'GPT-4o Mini',
            'gpt-3.5-turbo': 'GPT-3.5 Turbo',
        };
        return names[model] || model;
    }
}

// Initialize app
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new AIChatApp();
    app.newChat();
});