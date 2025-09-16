/**
 * Login Panel Component
 * Handles user authentication within the widget
 */

class LoginPanel {
    constructor(widget) {
        this.widget = widget;
        this.loading = false;
        this.error = null;
    }

    /**
     * Render login panel HTML
     */
    render() {
        return `
            <div class="login-panel">
                <div class="widget-header">
                    <div class="widget-title">Member Access</div>
                </div>
                
                <div class="widget-content">
                    ${this.error ? `<div class="error-message">${this.error}</div>` : ''}
                    
                    <form class="login-form" id="widget-login-form">
                        <div class="modern-input-group">
                            <label class="modern-input-label">Email Address</label>
                            <input 
                                type="email" 
                                name="email" 
                                class="modern-input"
                                placeholder="Enter your email" 
                                required 
                                autocomplete="email"
                                ${this.loading ? 'disabled' : ''}
                            />
                        </div>
                        
                        <div class="modern-input-group">
                            <label class="modern-input-label">Password</label>
                            <input 
                                type="password" 
                                name="password" 
                                class="modern-input"
                                placeholder="Enter your password" 
                                required 
                                autocomplete="current-password"
                                ${this.loading ? 'disabled' : ''}
                            />
                        </div>
                    
                        <div class="login-actions">
                            <button 
                                type="submit" 
                                class="modern-btn ${this.loading ? 'loading' : ''}"
                                ${this.loading ? 'disabled' : ''}
                            >
                                ${this.loading ? '<span class="loading-spinner"></span> Signing In...' : '🔐 Sign In'}
                            </button>
                            
                            <button 
                                type="button" 
                                class="modern-btn secondary"
                                onclick="window.open('${this.widget.apiUrl}', '_blank')"
                            >
                                📝 Create Account
                            </button>
                        </div>
                    </form>
                    
                    <div class="login-footer">
                        <p style="font-size: 12px; color: rgba(255,255,255,0.6); text-align: center; margin-top: 16px;">
                            Secure authentication powered by Goonee Security
                        </p>
                    </div>
                    <div class="forgot-password">
                        <a href="#" class="terminal-link" onclick="window.memberWidgetInstance?.showForgotPassword()">
                            > FORGOT PASSWORD
                        </a>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Render error message
     */
    renderError() {
        return `
            <div class="error-terminal">
                <div class="error-header">[ERROR]</div>
                <div class="error-message">${this.error}</div>
                <div class="error-code">CODE: AUTH_FAILED</div>
            </div>
        `;
    }

    /**
     * Handle login form submission
     */
    async handleLogin(formData) {
        const email = formData.get('email');
        const password = formData.get('password');
        
        this.setLoading(true);
        this.clearError();
        
        try {
            if (!this.widget.supabaseClient) {
                throw new Error('Authentication service not available');
            }
            
            const { data, error } = await this.widget.supabaseClient.auth.signInWithPassword({
                email: email.trim(),
                password: password
            });
            
            if (error) {
                throw error;
            }
            
            // Log successful login
            this.logActivity('login_success', { email });
            
            // Clear form
            this.clearForm();
            
            return data;
            
        } catch (error) {
            this.setError(this.formatError(error));
            this.logActivity('login_failed', { email, error: error.message });
            throw error;
        } finally {
            this.setLoading(false);
        }
    }

    /**
     * Format error message for display
     */
    formatError(error) {
        const errorMessages = {
            'Invalid login credentials': 'Invalid email or password',
            'Email not confirmed': 'Please check your email and confirm your account',
            'Too many requests': 'Too many login attempts. Please try again later',
            'Network error': 'Connection failed. Please check your internet connection'
        };
        
        return errorMessages[error.message] || error.message || 'Login failed. Please try again.';
    }

    /**
     * Set loading state
     */
    setLoading(loading) {
        this.loading = loading;
        this.widget.render();
    }

    /**
     * Set error message
     */
    setError(error) {
        this.error = error;
        this.widget.render();
    }

    /**
     * Clear error message
     */
    clearError() {
        this.error = null;
    }

    /**
     * Clear login form
     */
    clearForm() {
        const form = document.getElementById('widget-login-form');
        if (form) {
            form.reset();
        }
    }

    /**
     * Log activity
     */
    logActivity(action, details) {
        if (this.widget.debug) {
            console.log(`[Widget] ${action}:`, details);
        }
        
        // You can extend this to send to analytics or logging service
        this.widget.dispatchEvent('activity', { action, details, timestamp: new Date() });
    }

    /**
     * Get additional CSS for login panel
     */
    static getCSS() {
        return `
            .login-panel {
                padding: 0;
            }
            
            .terminal-header {
                background: linear-gradient(45deg, #001100, #002200);
                padding: 8px 12px;
                border-bottom: 1px solid #00ff00;
                font-size: 11px;
                letter-spacing: 1px;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .terminal-prompt {
                color: #00ff00;
                font-weight: bold;
            }
            
            .terminal-cursor {
                width: 8px;
                height: 12px;
                background: #00ff00;
                animation: blink 1s infinite;
            }
            
            @keyframes blink {
                0%, 50% { opacity: 1; }
                51%, 100% { opacity: 0; }
            }
            
            .login-form {
                padding: 16px;
                display: flex;
                flex-direction: column;
                gap: 16px;
            }
            
            .input-group {
                display: flex;
                flex-direction: column;
                gap: 4px;
            }
            
            .input-label {
                color: #00ff00;
                font-size: 11px;
                font-weight: bold;
                letter-spacing: 1px;
                text-transform: uppercase;
            }
            
            .terminal-input {
                background: rgba(0, 255, 0, 0.05);
                border: 1px solid #00ff00;
                color: #ffffff;
                padding: 10px 12px;
                border-radius: 0;
                font-family: 'Courier New', monospace;
                font-size: 14px;
                transition: all 0.2s ease;
                outline: none;
            }
            
            .terminal-input:focus {
                background: rgba(0, 255, 0, 0.1);
                box-shadow: 0 0 8px rgba(0, 255, 0, 0.3);
                border-color: #00ff00;
            }
            
            .terminal-input:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }
            
            .terminal-input::placeholder {
                color: rgba(255, 255, 255, 0.3);
            }
            
            .login-actions {
                margin-top: 8px;
            }
            
            .login-btn {
                width: 100%;
                background: #00ff00;
                color: #000000;
                border: none;
                padding: 12px 16px;
                font-family: 'Courier New', monospace;
                font-weight: bold;
                font-size: 14px;
                text-transform: uppercase;
                letter-spacing: 1px;
                cursor: pointer;
                transition: all 0.2s ease;
                position: relative;
                overflow: hidden;
            }
            
            .login-btn:hover:not(:disabled) {
                background: #00cc00;
                box-shadow: 0 0 12px rgba(0, 255, 0, 0.5);
            }
            
            .login-btn:disabled {
                opacity: 0.7;
                cursor: not-allowed;
            }
            
            .login-btn.loading::after {
                content: '';
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
                animation: loading-sweep 1.5s infinite;
            }
            
            @keyframes loading-sweep {
                0% { left: -100%; }
                100% { left: 100%; }
            }
            
            .error-terminal {
                margin: 16px;
                padding: 12px;
                border: 1px solid #ff4444;
                background: rgba(255, 68, 68, 0.1);
                color: #ff4444;
                font-size: 12px;
            }
            
            .error-header {
                font-weight: bold;
                margin-bottom: 4px;
                text-transform: uppercase;
                letter-spacing: 1px;
            }
            
            .error-message {
                margin-bottom: 4px;
                line-height: 1.4;
            }
            
            .error-code {
                font-size: 10px;
                opacity: 0.7;
                text-transform: uppercase;
            }
            
            .login-footer {
                padding: 12px 16px;
                border-top: 1px solid rgba(0, 255, 0, 0.3);
                display: flex;
                flex-direction: column;
                gap: 8px;
                font-size: 11px;
            }
            
            .terminal-link {
                color: #00ff00;
                text-decoration: none;
                text-transform: uppercase;
                letter-spacing: 1px;
                transition: color 0.2s ease;
            }
            
            .terminal-link:hover {
                color: #ffffff;
                text-shadow: 0 0 4px #00ff00;
            }
            
            .register-link, .forgot-password {
                display: flex;
                align-items: center;
            }
            
            /* Mobile adjustments */
            @media (max-width: 768px) {
                .login-form {
                    padding: 12px;
                    gap: 12px;
                }
                
                .terminal-input {
                    padding: 8px 10px;
                    font-size: 13px;
                }
                
                .login-btn {
                    padding: 10px 14px;
                    font-size: 13px;
                }
            }
        `;
    }
}

// Export for use in MemberWidget
window.LoginPanel = LoginPanel;