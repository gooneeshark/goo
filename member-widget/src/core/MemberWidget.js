/**
 * Member Widget Core Class
 * A standalone widget that can be embedded in any HTML page
 * Connects to the existing hacker-registration-system backend
 */

class MemberWidget {
    constructor(options = {}) {
        // Required options
        this.containerId = options.containerId || 'member-widget';
        this.apiUrl = options.apiUrl || 'http://localhost:5173'; // Default to hacker-registration-system
        
        // Widget configuration
        this.theme = options.theme || 'hacker';
        this.position = options.position || 'bottom-right';
        this.size = options.size || 'medium';
        this.collapsed = options.collapsed !== false; // Default to collapsed
        
        // Features
        this.features = {
            walletDisplay: options.features?.walletDisplay !== false,
            pointsDisplay: options.features?.pointsDisplay !== false,
            profileEdit: options.features?.profileEdit !== false,
            ...options.features
        };
        
        // Colors (for custom theme)
        this.colors = {
            primary: '#00ff00',
            secondary: '#008800',
            background: '#000000',
            text: '#ffffff',
            border: '#00ff00',
            ...options.colors
        };
        
        // Callbacks
        this.onLogin = options.onLogin || (() => {});
        this.onLogout = options.onLogout || (() => {});
        this.onError = options.onError || ((error) => console.error('Widget error:', error));
        
        // Internal state
        this.user = null;
        this.session = null;
        this.loading = false;
        this.container = null;
        this.supabaseClient = null;
        this.currentView = 'main'; // 'main', 'messages'
        
        // Components
        this.messageInbox = null;
        
        // Initialize
        this.init();
    }

    /**
     * Initialize the widget
     */
    async init() {
        try {
            this.createContainer();
            this.loadStyles();
            this.bindEvents();
            await this.initSupabase();
            await this.checkAuthStatus();
            this.render();
        } catch (error) {
            this.onError(error);
        }
    }

    /**
     * Initialize Supabase client
     */
    async initSupabase() {
        try {
            // Import Supabase dynamically
            const { createClient } = await import('https://cdn.skypack.dev/@supabase/supabase-js');
            
            // Get Supabase config from the main app (if available)
            // Otherwise use environment variables or defaults
            const supabaseUrl = window.SUPABASE_URL || this.getSupabaseUrl();
            const supabaseKey = window.SUPABASE_ANON_KEY || this.getSupabaseKey();
            
            if (!supabaseUrl || !supabaseKey) {
                throw new Error('Supabase configuration not found');
            }
            
            this.supabaseClient = createClient(supabaseUrl, supabaseKey, {
                auth: {
                    autoRefreshToken: true,
                    persistSession: true,
                    detectSessionInUrl: false
                }
            });
            
            // Listen for auth changes
            this.supabaseClient.auth.onAuthStateChange((event, session) => {
                this.session = session;
                this.user = session?.user || null;
                
                // Initialize components when user logs in
                if (event === 'SIGNED_IN' && this.user) {
                    this.initializeComponents();
                    this.onLogin(this.user);
                } else if (event === 'SIGNED_OUT') {
                    this.currentView = 'main';
                    this.messageInbox = null;
                    this.onLogout();
                }
                
                this.render();
            });
            
        } catch (error) {
            console.error('Failed to initialize Supabase:', error);
            this.onError(error);
        }
    }

    /**
     * Get Supabase URL from various sources
     */
    getSupabaseUrl() {
        // Try to get from global variables, meta tags, or localStorage
        return window.VITE_DOG || 
               document.querySelector('meta[name="supabase-url"]')?.content ||
               localStorage.getItem('supabase-url') ||
               null;
    }

    /**
     * Get Supabase anonymous key from various sources
     */
    getSupabaseKey() {
        return window.VITE_CAT || 
               document.querySelector('meta[name="supabase-key"]')?.content ||
               localStorage.getItem('supabase-key') ||
               null;
    }

    /**
     * Create widget container
     */
    createContainer() {
        this.container = document.getElementById(this.containerId);
        
        if (!this.container) {
            // Create container if it doesn't exist
            this.container = document.createElement('div');
            this.container.id = this.containerId;
            document.body.appendChild(this.container);
        }
        
        // Add widget classes
        this.container.className = `member-widget member-widget-${this.theme} member-widget-${this.position} member-widget-${this.size}`;
        
        if (this.collapsed) {
            this.container.classList.add('collapsed');
        }
    }

    /**
     * Load widget styles
     */
    loadStyles() {
        // Check if styles are already loaded
        if (document.getElementById('member-widget-styles')) {
            return;
        }
        
        const style = document.createElement('style');
        style.id = 'member-widget-styles';
        style.textContent = this.getWidgetCSS();
        document.head.appendChild(style);
    }

    /**
     * Get widget CSS
     */
    getWidgetCSS() {
        return `
            .member-widget {
                position: fixed;
                z-index: 999999;
                font-family: 'Courier New', monospace;
                font-size: 14px;
                line-height: 1.4;
                box-sizing: border-box;
                transition: all 0.3s ease;
                border: 2px solid ${this.colors.border};
                background: ${this.colors.background};
                color: ${this.colors.text};
                border-radius: 8px;
                box-shadow: 0 4px 20px rgba(0, 255, 0, 0.3);
                max-width: 350px;
                min-width: 280px;
            }
            
            .member-widget * {
                box-sizing: border-box;
            }
            
            /* Position variants */
            .member-widget-bottom-right {
                bottom: 20px;
                right: 20px;
            }
            
            .member-widget-bottom-left {
                bottom: 20px;
                left: 20px;
            }
            
            .member-widget-top-right {
                top: 20px;
                right: 20px;
            }
            
            .member-widget-top-left {
                top: 20px;
                left: 20px;
            }
            
            .member-widget-inline {
                position: relative;
                top: auto;
                right: auto;
                bottom: auto;
                left: auto;
                display: block;
                margin: 20px auto;
            }
            
            /* Size variants */
            .member-widget-small {
                max-width: 280px;
                font-size: 12px;
            }
            
            .member-widget-large {
                max-width: 420px;
                font-size: 16px;
            }
            
            /* Collapsed state */
            .member-widget.collapsed .widget-content {
                display: none;
            }
            
            .member-widget.collapsed {
                width: 60px;
                height: 60px;
                border-radius: 50%;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .member-widget.collapsed .widget-toggle {
                font-size: 24px;
                color: ${this.colors.primary};
            }
            
            /* Widget header */
            .widget-header {
                padding: 12px 16px;
                border-bottom: 1px solid ${this.colors.border};
                display: flex;
                justify-content: space-between;
                align-items: center;
                background: linear-gradient(45deg, ${this.colors.background}, #001100);
            }
            
            .widget-title {
                font-weight: bold;
                color: ${this.colors.primary};
                text-transform: uppercase;
                letter-spacing: 1px;
            }
            
            .widget-toggle {
                background: none;
                border: none;
                color: ${this.colors.primary};
                cursor: pointer;
                font-size: 18px;
                padding: 4px;
                transition: color 0.2s ease;
            }
            
            .widget-toggle:hover {
                color: ${this.colors.text};
            }
            
            /* Widget content */
            .widget-content {
                padding: 16px;
                max-height: 400px;
                overflow-y: auto;
            }
            
            /* Login form */
            .login-form {
                display: flex;
                flex-direction: column;
                gap: 12px;
            }
            
            .login-form input {
                background: rgba(0, 255, 0, 0.1);
                border: 1px solid ${this.colors.border};
                color: ${this.colors.text};
                padding: 10px 12px;
                border-radius: 4px;
                font-family: inherit;
                font-size: inherit;
                transition: all 0.2s ease;
            }
            
            .login-form input:focus {
                outline: none;
                border-color: ${this.colors.primary};
                box-shadow: 0 0 8px rgba(0, 255, 0, 0.3);
            }
            
            .login-form input::placeholder {
                color: rgba(255, 255, 255, 0.5);
                text-transform: uppercase;
                font-size: 12px;
                letter-spacing: 1px;
            }
            
            .login-btn {
                background: ${this.colors.primary};
                color: ${this.colors.background};
                border: none;
                padding: 12px 16px;
                border-radius: 4px;
                font-family: inherit;
                font-weight: bold;
                text-transform: uppercase;
                letter-spacing: 1px;
                cursor: pointer;
                transition: all 0.2s ease;
            }
            
            .login-btn:hover {
                background: ${this.colors.secondary};
                box-shadow: 0 0 12px rgba(0, 255, 0, 0.5);
            }
            
            .login-btn:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }
            
            /* Profile display */
            .profile-info {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }
            
            .info-line {
                display: flex;
                justify-content: space-between;
                padding: 4px 0;
                border-bottom: 1px dotted rgba(0, 255, 0, 0.3);
            }
            
            .info-label {
                color: ${this.colors.primary};
                text-transform: uppercase;
                font-size: 11px;
                letter-spacing: 1px;
            }
            
            .info-value {
                color: ${this.colors.text};
                font-weight: bold;
            }
            
            /* Action buttons */
            .action-buttons {
                display: flex;
                gap: 8px;
                margin-top: 16px;
            }
            
            .action-btn {
                flex: 1;
                background: transparent;
                border: 1px solid ${this.colors.border};
                color: ${this.colors.primary};
                padding: 8px 12px;
                border-radius: 4px;
                font-family: inherit;
                font-size: 11px;
                text-transform: uppercase;
                letter-spacing: 1px;
                cursor: pointer;
                transition: all 0.2s ease;
            }
            
            .action-btn:hover {
                background: ${this.colors.primary};
                color: ${this.colors.background};
            }
            
            /* Error messages */
            .error-message {
                color: #ff4444;
                font-size: 12px;
                margin-top: 8px;
                padding: 8px;
                border: 1px solid #ff4444;
                border-radius: 4px;
                background: rgba(255, 68, 68, 0.1);
            }

            /* Messages view */
            .messages-view {
                display: flex;
                flex-direction: column;
                height: 100%;
            }

            .view-header {
                padding: 8px 12px;
                border-bottom: 1px solid rgba(0, 255, 0, 0.3);
                background: rgba(0, 255, 0, 0.05);
            }

            .back-btn {
                background: none;
                border: 1px solid #00ff00;
                color: #00ff00;
                padding: 4px 8px;
                font-family: inherit;
                font-size: 11px;
                cursor: pointer;
                border-radius: 2px;
                transition: all 0.2s ease;
            }

            .back-btn:hover {
                background: #00ff00;
                color: #000000;
            }

            /* Unread messages indicator */
            .unread-messages {
                color: #ff4444 !important;
                font-weight: bold;
                animation: pulse 2s infinite;
            }

            /* Action button with notification */
            .action-btn.has-notification {
                background: rgba(255, 68, 68, 0.1);
                border-color: #ff4444;
                color: #ff4444;
                animation: glow 2s infinite;
            }

            .action-btn.has-notification:hover {
                background: #ff4444;
                color: #ffffff;
            }

            @keyframes glow {
                0%, 100% { box-shadow: 0 0 5px rgba(255, 68, 68, 0.3); }
                50% { box-shadow: 0 0 15px rgba(255, 68, 68, 0.6); }
            }
            
            /* Loading state */
            .loading {
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
            }
            
            .loading::after {
                content: '';
                width: 20px;
                height: 20px;
                border: 2px solid ${this.colors.border};
                border-top: 2px solid ${this.colors.primary};
                border-radius: 50%;
                animation: spin 1s linear infinite;
            }
            
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            
            /* Hacker theme specific */
            .member-widget-hacker {
                animation: scanlines 2s linear infinite;
            }
            
            @keyframes scanlines {
                0% { box-shadow: 0 4px 20px rgba(0, 255, 0, 0.3); }
                50% { box-shadow: 0 4px 20px rgba(0, 255, 0, 0.6); }
                100% { box-shadow: 0 4px 20px rgba(0, 255, 0, 0.3); }
            }
            
            /* Mobile responsive */
            @media (max-width: 768px) {
                .member-widget {
                    max-width: calc(100vw - 40px);
                    font-size: 13px;
                }
                
                .member-widget.collapsed {
                    width: 50px;
                    height: 50px;
                }
                
                .widget-content {
                    padding: 12px;
                }
            }
        `;
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Toggle widget on click when collapsed
        this.container.addEventListener('click', (e) => {
            if (this.collapsed && e.target === this.container) {
                this.expand();
            }
        });
        
        // Handle escape key to collapse
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !this.collapsed) {
                this.collapse();
            }
        });
    }

    /**
     * Check current authentication status
     */
    async checkAuthStatus() {
        if (!this.supabaseClient) return;
        
        try {
            const { data: { session } } = await this.supabaseClient.auth.getSession();
            this.session = session;
            this.user = session?.user || null;
            
            // Initialize components if user is logged in
            if (this.user) {
                this.initializeComponents();
            }
        } catch (error) {
            console.error('Error checking auth status:', error);
        }
    }

    /**
     * Initialize components after user login
     */
    initializeComponents() {
        if (!window.MessageInbox) {
            console.warn('MessageInbox component not loaded');
            return;
        }
        
        // Initialize message inbox
        this.messageInbox = new window.MessageInbox(this);
        
        // Load initial data
        if (this.messageInbox) {
            this.messageInbox.loadMessages();
        }
    }

    /**
     * Render the widget
     */
    render() {
        if (!this.container) return;
        
        if (this.collapsed) {
            this.container.innerHTML = `
                <div class="widget-toggle">👤</div>
            `;
        } else {
            this.container.innerHTML = `
                <div class="widget-header">
                    <div class="widget-title">Member Access</div>
                    <button class="widget-toggle" onclick="window.memberWidgetInstance?.collapse()">×</button>
                </div>
                <div class="widget-content">
                    ${this.renderContent()}
                </div>
            `;
        }
        
        // Store instance globally for button callbacks
        window.memberWidgetInstance = this;
    }

    /**
     * Render widget content based on auth state
     */
    renderContent() {
        if (this.loading) {
            return '<div class="loading"></div>';
        }
        
        if (this.user) {
            if (this.currentView === 'messages') {
                return this.renderMessagesView();
            } else {
                return this.renderProfileView();
            }
        } else {
            return this.renderLoginView();
        }
    }

    /**
     * Render login form
     */
    renderLoginView() {
        return `
            <form class="login-form" onsubmit="window.memberWidgetInstance?.handleLogin(event)">
                <input 
                    type="email" 
                    name="email" 
                    placeholder="Email Address" 
                    required 
                    autocomplete="email"
                />
                <input 
                    type="password" 
                    name="password" 
                    placeholder="Password" 
                    required 
                    autocomplete="current-password"
                />
                <button type="submit" class="login-btn">
                    Access System
                </button>
            </form>
            <div id="error-container"></div>
        `;
    }

    /**
     * Render profile view
     */
    renderProfileView() {
        const email = this.user?.email || 'Unknown';
        const userId = this.user?.id || 'N/A';
        const unreadCount = this.messageInbox?.unreadCount || 0;
        
        return `
            <div class="profile-info">
                <div class="info-line">
                    <span class="info-label">User:</span>
                    <span class="info-value">${email}</span>
                </div>
                <div class="info-line">
                    <span class="info-label">ID:</span>
                    <span class="info-value">${userId.substring(0, 8)}...</span>
                </div>
                <div class="info-line">
                    <span class="info-label">Status:</span>
                    <span class="info-value">Active</span>
                </div>
                ${unreadCount > 0 ? `
                <div class="info-line">
                    <span class="info-label">Messages:</span>
                    <span class="info-value unread-messages">${unreadCount} unread</span>
                </div>
                ` : ''}
            </div>
            <div class="action-buttons">
                <button class="action-btn ${unreadCount > 0 ? 'has-notification' : ''}" onclick="window.memberWidgetInstance?.showMessages()">
                    📧 Messages ${unreadCount > 0 ? `(${unreadCount})` : ''}
                </button>
                <button class="action-btn" onclick="window.memberWidgetInstance?.openProfile()">
                    Profile
                </button>
                <button class="action-btn" onclick="window.memberWidgetInstance?.handleLogout()">
                    Logout
                </button>
            </div>
        `;
    }

    /**
     * Render messages view
     */
    renderMessagesView() {
        if (!this.messageInbox) {
            return `
                <div class="error-message">
                    Messages not available
                    <button class="back-btn" onclick="window.memberWidgetInstance?.showMain()">Back</button>
                </div>
            `;
        }

        return `
            <div class="messages-view">
                <div class="view-header">
                    <button class="back-btn" onclick="window.memberWidgetInstance?.showMain()">← Back</button>
                </div>
                ${this.messageInbox.render()}
            </div>
        `;
    }

    /**
     * Handle login form submission
     */
    async handleLogin(event) {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        const email = formData.get('email');
        const password = formData.get('password');
        
        this.loading = true;
        this.render();
        
        try {
            const { data, error } = await this.supabaseClient.auth.signInWithPassword({
                email,
                password
            });
            
            if (error) {
                throw error;
            }
            
            // Success - the auth state change will trigger re-render
            
        } catch (error) {
            this.showError(error.message);
        } finally {
            this.loading = false;
            this.render();
        }
    }

    /**
     * Handle logout
     */
    async handleLogout() {
        try {
            await this.supabaseClient.auth.signOut();
            // Auth state change will trigger re-render
        } catch (error) {
            this.onError(error);
        }
    }

    /**
     * Open profile (redirect to main app)
     */
    openProfile() {
        // Open the main hacker-registration-system app
        window.open(this.apiUrl, '_blank');
    }

    /**
     * Show messages view
     */
    showMessages() {
        this.currentView = 'messages';
        this.render();
    }

    /**
     * Show main view
     */
    showMain() {
        this.currentView = 'main';
        this.render();
    }

    /**
     * Refresh messages
     */
    async refreshMessages() {
        if (this.messageInbox) {
            await this.messageInbox.refreshMessages();
        }
    }

    /**
     * Mark all messages as read
     */
    async markAllAsRead() {
        if (this.messageInbox) {
            await this.messageInbox.markAllAsRead();
        }
    }

    /**
     * Load more messages
     */
    async loadMoreMessages() {
        if (this.messageInbox) {
            await this.messageInbox.loadMoreMessages();
        }
    }

    /**
     * Open specific message
     */
    openMessage(messageId) {
        if (this.messageInbox) {
            this.messageInbox.openMessage(messageId);
        }
    }

    /**
     * Show error message
     */
    showError(message) {
        const errorContainer = document.getElementById('error-container');
        if (errorContainer) {
            errorContainer.innerHTML = `
                <div class="error-message">
                    ${message}
                </div>
            `;
            
            // Clear error after 5 seconds
            setTimeout(() => {
                errorContainer.innerHTML = '';
            }, 5000);
        }
    }

    /**
     * Expand widget
     */
    expand() {
        this.collapsed = false;
        this.container.classList.remove('collapsed');
        this.render();
    }

    /**
     * Collapse widget
     */
    collapse() {
        this.collapsed = true;
        this.container.classList.add('collapsed');
        this.render();
    }

    /**
     * Toggle widget state
     */
    toggle() {
        if (this.collapsed) {
            this.expand();
        } else {
            this.collapse();
        }
    }

    /**
     * Refresh widget data
     */
    async refresh() {
        await this.checkAuthStatus();
        this.render();
    }

    /**
     * Destroy widget
     */
    destroy() {
        if (this.container) {
            this.container.remove();
        }
        
        // Remove global reference
        if (window.memberWidgetInstance === this) {
            delete window.memberWidgetInstance;
        }
    }

    /**
     * Get current user data
     */
    getCurrentUser() {
        return this.user;
    }

    /**
     * Get session data
     */
    getSession() {
        return this.session;
    }
}

// Auto-initialization from data attributes
document.addEventListener('DOMContentLoaded', () => {
    // Look for elements with data-member-widget attribute
    const autoInitElements = document.querySelectorAll('[data-member-widget]');
    
    autoInitElements.forEach(element => {
        const options = {
            containerId: element.id,
            apiUrl: element.dataset.apiUrl,
            theme: element.dataset.theme,
            position: element.dataset.position,
            size: element.dataset.size,
            collapsed: element.dataset.collapsed !== 'false'
        };
        
        new MemberWidget(options);
    });
});

// Global MemberWidget class
window.MemberWidget = MemberWidget;

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MemberWidget;
}