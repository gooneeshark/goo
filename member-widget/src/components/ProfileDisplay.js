/**
 * Profile Display Component
 * Shows user profile information when logged in
 */

class ProfileDisplay {
    constructor(widget) {
        this.widget = widget;
        this.profile = null;
        this.loading = false;
    }

    /**
     * Render profile display HTML
     */
    render() {
        const user = this.widget.user;
        if (!user) return '';

        return `
            <div class="profile-display">
                <div class="widget-header">
                    <div class="widget-title">Welcome Back</div>
                    <button class="widget-close" onclick="this.closest('.member-widget').style.display='none'">×</button>
                </div>
                
                <div class="widget-content">
                    ${this.renderUserInfo()}
                    ${this.renderStats()}
                    ${this.renderActions()}
                </div>
            </div>
        `;
    }

    /**
     * Render user information
     */
    renderUserInfo() {
        const user = this.widget.user;
        const email = user?.email || 'Unknown';
        const displayName = user?.user_metadata?.display_name || email.split('@')[0];
        const createdAt = user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown';
        
        return `
            <div class="profile-avatar">
                ${displayName.charAt(0).toUpperCase()}
            </div>
            
            <div class="profile-name">${displayName}</div>
            <div class="profile-email">${email}</div>
            
            <div class="profile-stats">
                <div class="stat-item">
                    <span class="stat-value">⭐</span>
                    <span class="stat-label">Member</span>
                </div>
                <div class="stat-item">
                    <span class="stat-value">${createdAt}</span>
                    <span class="stat-label">Joined</span>
                </div>
            </div>
                            <span class="info-label">EMAIL:</span>
                            <span class="info-value">${email}</span>
                        </div>
                        <div class="info-line">
                            <span class="info-label">ID:</span>
                            <span class="info-value">${userId.substring(0, 8)}...</span>
                        </div>
                        <div class="info-line">
                            <span class="info-label">JOINED:</span>
                            <span class="info-value">${createdAt}</span>
                        </div>
                        <div class="info-line">
                            <span class="info-label">STATUS:</span>
                            <span class="info-value status-active">ACTIVE</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Render user statistics
     */
    renderStats() {
        // This would typically fetch from the profile table
        // For now, showing placeholder data
        return `
            <div class="user-stats">
                <div class="info-section">
                    <div class="section-title">STATISTICS</div>
                    <div class="stats-grid">
                        <div class="stat-item">
                            <div class="stat-label">LEVEL</div>
                            <div class="stat-value">${this.profile?.hacker_level || 1}</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-label">SCORE</div>
                            <div class="stat-value">${this.profile?.total_score || 0}</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-label">SESSIONS</div>
                            <div class="stat-value">1</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Render action buttons
     */
    renderActions() {
        return `
            <div class="profile-actions">
                <div class="action-grid">
                    <button class="action-btn primary" onclick="window.memberWidgetInstance?.openMainApp()">
                        <span class="btn-icon">🚀</span>
                        <span class="btn-text">OPEN APP</span>
                    </button>
                    <button class="action-btn secondary" onclick="window.memberWidgetInstance?.showProfile()">
                        <span class="btn-icon">👤</span>
                        <span class="btn-text">PROFILE</span>
                    </button>
                    <button class="action-btn secondary" onclick="window.memberWidgetInstance?.showSettings()">
                        <span class="btn-icon">⚙️</span>
                        <span class="btn-text">SETTINGS</span>
                    </button>
                    <button class="action-btn danger" onclick="window.memberWidgetInstance?.handleLogout()">
                        <span class="btn-icon">🚪</span>
                        <span class="btn-text">LOGOUT</span>
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Load user profile data
     */
    async loadProfile() {
        if (!this.widget.supabaseClient || !this.widget.user) return;

        this.loading = true;
        
        try {
            const { data, error } = await this.widget.supabaseClient
                .from('profiles')
                .select('*')
                .eq('id', this.widget.user.id)
                .single();

            if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
                throw error;
            }

            this.profile = data;
            this.widget.render(); // Re-render with profile data
            
        } catch (error) {
            console.error('Error loading profile:', error);
            // Continue without profile data
        } finally {
            this.loading = false;
        }
    }

    /**
     * Handle profile actions
     */
    openMainApp() {
        window.open(this.widget.apiUrl, '_blank');
    }

    showProfile() {
        // Could open a modal or redirect to profile page
        this.openMainApp();
    }

    showSettings() {
        // Could open settings modal
        this.openMainApp();
    }

    /**
     * Get additional CSS for profile display
     */
    static getCSS() {
        return `
            .profile-display {
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
            
            .status-indicator {
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background: #ff4444;
            }
            
            .status-indicator.active {
                background: #00ff00;
                box-shadow: 0 0 6px rgba(0, 255, 0, 0.6);
                animation: pulse 2s infinite;
            }
            
            @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.5; }
            }
            
            .profile-content {
                padding: 16px;
                display: flex;
                flex-direction: column;
                gap: 16px;
            }
            
            .info-section {
                border: 1px solid rgba(0, 255, 0, 0.3);
                background: rgba(0, 255, 0, 0.02);
            }
            
            .section-title {
                background: rgba(0, 255, 0, 0.1);
                color: #00ff00;
                padding: 6px 10px;
                font-size: 10px;
                font-weight: bold;
                letter-spacing: 1px;
                text-transform: uppercase;
                border-bottom: 1px solid rgba(0, 255, 0, 0.3);
            }
            
            .info-grid {
                padding: 12px;
                display: flex;
                flex-direction: column;
                gap: 8px;
            }
            
            .info-line {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 4px 0;
                border-bottom: 1px dotted rgba(0, 255, 0, 0.2);
            }
            
            .info-line:last-child {
                border-bottom: none;
            }
            
            .info-label {
                color: rgba(255, 255, 255, 0.7);
                font-size: 11px;
                font-weight: bold;
                text-transform: uppercase;
                letter-spacing: 1px;
            }
            
            .info-value {
                color: #ffffff;
                font-size: 12px;
                font-weight: bold;
                text-align: right;
            }
            
            .status-active {
                color: #00ff00 !important;
                text-shadow: 0 0 4px rgba(0, 255, 0, 0.5);
            }
            
            .stats-grid {
                padding: 12px;
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 12px;
            }
            
            .stat-item {
                text-align: center;
                padding: 8px 4px;
                border: 1px solid rgba(0, 255, 0, 0.2);
                background: rgba(0, 255, 0, 0.05);
            }
            
            .stat-label {
                color: rgba(255, 255, 255, 0.6);
                font-size: 9px;
                font-weight: bold;
                text-transform: uppercase;
                letter-spacing: 1px;
                margin-bottom: 4px;
            }
            
            .stat-value {
                color: #00ff00;
                font-size: 16px;
                font-weight: bold;
                text-shadow: 0 0 4px rgba(0, 255, 0, 0.3);
            }
            
            .profile-actions {
                margin-top: 8px;
            }
            
            .action-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 8px;
            }
            
            .action-btn {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 6px;
                padding: 10px 8px;
                border: 1px solid;
                background: transparent;
                font-family: 'Courier New', monospace;
                font-size: 10px;
                font-weight: bold;
                text-transform: uppercase;
                letter-spacing: 1px;
                cursor: pointer;
                transition: all 0.2s ease;
                text-decoration: none;
            }
            
            .action-btn.primary {
                grid-column: 1 / -1;
                border-color: #00ff00;
                color: #00ff00;
            }
            
            .action-btn.primary:hover {
                background: #00ff00;
                color: #000000;
                box-shadow: 0 0 12px rgba(0, 255, 0, 0.5);
            }
            
            .action-btn.secondary {
                border-color: rgba(0, 255, 0, 0.5);
                color: rgba(255, 255, 255, 0.8);
            }
            
            .action-btn.secondary:hover {
                border-color: #00ff00;
                color: #00ff00;
                background: rgba(0, 255, 0, 0.1);
            }
            
            .action-btn.danger {
                border-color: #ff4444;
                color: #ff4444;
            }
            
            .action-btn.danger:hover {
                background: #ff4444;
                color: #ffffff;
                box-shadow: 0 0 12px rgba(255, 68, 68, 0.5);
            }
            
            .btn-icon {
                font-size: 12px;
            }
            
            .btn-text {
                font-size: 9px;
            }
            
            /* Mobile adjustments */
            @media (max-width: 768px) {
                .profile-content {
                    padding: 12px;
                    gap: 12px;
                }
                
                .stats-grid {
                    padding: 8px;
                    gap: 8px;
                }
                
                .stat-item {
                    padding: 6px 4px;
                }
                
                .stat-value {
                    font-size: 14px;
                }
                
                .action-grid {
                    gap: 6px;
                }
                
                .action-btn {
                    padding: 8px 6px;
                    font-size: 9px;
                }
                
                .btn-icon {
                    font-size: 10px;
                }
                
                .btn-text {
                    font-size: 8px;
                }
            }
        `;
    }
}

// Export for use in MemberWidget
window.ProfileDisplay = ProfileDisplay;