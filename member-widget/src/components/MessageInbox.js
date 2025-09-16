/**
 * Message Inbox Component
 * Displays user messages and notifications in the widget
 */

class MessageInbox {
    constructor(widget) {
        this.widget = widget;
        this.messages = [];
        this.unreadCount = 0;
        this.loading = false;
        this.currentPage = 1;
        this.pageSize = 10;
        this.hasMore = true;
    }

    /**
     * Render message inbox HTML
     */
    render() {
        return `
            <div class="message-inbox">
                <div class="inbox-header">
                    <div class="header-left">
                        <span class="terminal-prompt">[MESSAGE INBOX]</span>
                        ${this.unreadCount > 0 ? `<span class="unread-badge">${this.unreadCount}</span>` : ''}
                    </div>
                    <div class="header-actions">
                        <button class="refresh-btn" onclick="window.memberWidgetInstance?.refreshMessages()" title="Refresh">
                            🔄
                        </button>
                        <button class="mark-all-read-btn" onclick="window.memberWidgetInstance?.markAllAsRead()" title="Mark all as read">
                            ✓
                        </button>
                    </div>
                </div>
                
                <div class="inbox-content">
                    ${this.loading ? this.renderLoading() : this.renderMessages()}
                </div>
                
                ${this.hasMore && !this.loading ? this.renderLoadMore() : ''}
            </div>
        `;
    }

    /**
     * Render loading state
     */
    renderLoading() {
        return `
            <div class="loading-container">
                <div class="loading-spinner"></div>
                <div class="loading-text">LOADING MESSAGES...</div>
            </div>
        `;
    }

    /**
     * Render messages list
     */
    renderMessages() {
        if (this.messages.length === 0) {
            return this.renderEmptyState();
        }

        return `
            <div class="messages-list">
                ${this.messages.map(message => this.renderMessage(message)).join('')}
            </div>
        `;
    }

    /**
     * Render empty state
     */
    renderEmptyState() {
        return `
            <div class="empty-state">
                <div class="empty-icon">📭</div>
                <div class="empty-title">NO MESSAGES</div>
                <div class="empty-subtitle">Your inbox is empty</div>
            </div>
        `;
    }

    /**
     * Render individual message
     */
    renderMessage(message) {
        const isUnread = !message.is_read;
        const messageTypeIcon = this.getMessageTypeIcon(message.message_type);
        const priorityClass = this.getPriorityClass(message.priority);
        const timeAgo = this.getTimeAgo(message.created_at);
        
        return `
            <div class="message-item ${isUnread ? 'unread' : 'read'} ${priorityClass}" 
                 onclick="window.memberWidgetInstance?.openMessage('${message.id}')">
                <div class="message-header">
                    <div class="message-meta">
                        <span class="message-type-icon">${messageTypeIcon}</span>
                        <span class="message-sender">${message.sender_name || 'System'}</span>
                        <span class="message-time">${timeAgo}</span>
                    </div>
                    <div class="message-indicators">
                        ${message.priority === 'urgent' ? '<span class="urgent-indicator">!</span>' : ''}
                        ${isUnread ? '<span class="unread-indicator">●</span>' : ''}
                    </div>
                </div>
                <div class="message-content">
                    <div class="message-title">${this.escapeHtml(message.title)}</div>
                    <div class="message-preview">${this.getMessagePreview(message.content)}</div>
                </div>
                ${message.category ? `<div class="message-category">[${message.category.toUpperCase()}]</div>` : ''}
            </div>
        `;
    }

    /**
     * Render load more button
     */
    renderLoadMore() {
        return `
            <div class="load-more-container">
                <button class="load-more-btn" onclick="window.memberWidgetInstance?.loadMoreMessages()">
                    LOAD MORE MESSAGES
                </button>
            </div>
        `;
    }

    /**
     * Get message type icon
     */
    getMessageTypeIcon(type) {
        const icons = {
            'info': 'ℹ️',
            'warning': '⚠️',
            'error': '❌',
            'success': '✅',
            'announcement': '📢'
        };
        return icons[type] || 'ℹ️';
    }

    /**
     * Get priority CSS class
     */
    getPriorityClass(priority) {
        return `priority-${priority}`;
    }

    /**
     * Get time ago string
     */
    getTimeAgo(timestamp) {
        const now = new Date();
        const messageTime = new Date(timestamp);
        const diffMs = now - messageTime;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'NOW';
        if (diffMins < 60) return `${diffMins}M`;
        if (diffHours < 24) return `${diffHours}H`;
        if (diffDays < 7) return `${diffDays}D`;
        return messageTime.toLocaleDateString();
    }

    /**
     * Get message preview (first 100 characters)
     */
    getMessagePreview(content) {
        const preview = content.replace(/\n/g, ' ').substring(0, 100);
        return this.escapeHtml(preview) + (content.length > 100 ? '...' : '');
    }

    /**
     * Escape HTML to prevent XSS
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Load messages from server
     */
    async loadMessages(page = 1) {
        if (!this.widget.supabaseClient || !this.widget.user) return;

        this.loading = true;
        this.widget.render();

        try {
            // Use secure function instead of direct table access
            const { data, error } = await this.widget.supabaseClient
                .rpc('get_user_messages', {
                    p_limit: this.pageSize,
                    p_offset: (page - 1) * this.pageSize
                });

            if (error) throw error;

            if (page === 1) {
                this.messages = data || [];
            } else {
                this.messages = [...this.messages, ...(data || [])];
            }

            this.hasMore = data && data.length === this.pageSize;
            this.currentPage = page;

            // Update unread count
            await this.updateUnreadCount();

        } catch (error) {
            console.error('Error loading messages:', error);
            this.widget.onError(error);
        } finally {
            this.loading = false;
            this.widget.render();
        }
    }

    /**
     * Update unread message count
     */
    async updateUnreadCount() {
        if (!this.widget.supabaseClient || !this.widget.user) return;

        try {
            const { data, error } = await this.widget.supabaseClient
                .rpc('get_unread_message_count', { user_id: this.widget.user.id });

            if (error) throw error;

            this.unreadCount = data || 0;
            
            // Dispatch event for external listeners
            this.widget.dispatchEvent('unreadCountChanged', { count: this.unreadCount });

        } catch (error) {
            console.error('Error updating unread count:', error);
        }
    }

    /**
     * Mark message as read
     */
    async markAsRead(messageId) {
        if (!this.widget.supabaseClient) return;

        try {
            const { data, error } = await this.widget.supabaseClient
                .rpc('mark_message_as_read', { message_id: messageId });

            if (error) throw error;

            // Update local message state
            const message = this.messages.find(m => m.id === messageId);
            if (message && !message.is_read) {
                message.is_read = true;
                message.read_at = new Date().toISOString();
                this.unreadCount = Math.max(0, this.unreadCount - 1);
                this.widget.render();
            }

        } catch (error) {
            console.error('Error marking message as read:', error);
        }
    }

    /**
     * Mark all messages as read
     */
    async markAllAsRead() {
        if (!this.widget.supabaseClient || !this.widget.user) return;

        try {
            const unreadMessages = this.messages.filter(m => !m.is_read);
            
            for (const message of unreadMessages) {
                await this.markAsRead(message.id);
            }

            this.unreadCount = 0;
            this.widget.render();

        } catch (error) {
            console.error('Error marking all messages as read:', error);
        }
    }

    /**
     * Load more messages
     */
    async loadMoreMessages() {
        if (this.hasMore && !this.loading) {
            await this.loadMessages(this.currentPage + 1);
        }
    }

    /**
     * Refresh messages
     */
    async refreshMessages() {
        this.currentPage = 1;
        this.hasMore = true;
        await this.loadMessages(1);
    }

    /**
     * Open message in modal or new view
     */
    openMessage(messageId) {
        const message = this.messages.find(m => m.id === messageId);
        if (!message) return;

        // Mark as read if unread
        if (!message.is_read) {
            this.markAsRead(messageId);
        }

        // Create and show message modal
        this.showMessageModal(message);
    }

    /**
     * Show message in modal
     */
    showMessageModal(message) {
        const modal = document.createElement('div');
        modal.className = 'message-modal-overlay';
        modal.innerHTML = `
            <div class="message-modal">
                <div class="modal-header">
                    <div class="modal-title">
                        <span class="message-type-icon">${this.getMessageTypeIcon(message.message_type)}</span>
                        ${this.escapeHtml(message.title)}
                    </div>
                    <button class="modal-close" onclick="this.closest('.message-modal-overlay').remove()">×</button>
                </div>
                <div class="modal-meta">
                    <div class="meta-item">
                        <span class="meta-label">FROM:</span>
                        <span class="meta-value">${message.sender_name || 'System'}</span>
                    </div>
                    <div class="meta-item">
                        <span class="meta-label">DATE:</span>
                        <span class="meta-value">${new Date(message.created_at).toLocaleString()}</span>
                    </div>
                    <div class="meta-item">
                        <span class="meta-label">CATEGORY:</span>
                        <span class="meta-value">${message.category?.toUpperCase() || 'GENERAL'}</span>
                    </div>
                    ${message.priority !== 'normal' ? `
                    <div class="meta-item">
                        <span class="meta-label">PRIORITY:</span>
                        <span class="meta-value priority-${message.priority}">${message.priority.toUpperCase()}</span>
                    </div>
                    ` : ''}
                </div>
                <div class="modal-content">
                    <pre class="message-text">${this.escapeHtml(message.content)}</pre>
                </div>
                <div class="modal-actions">
                    <button class="modal-btn" onclick="this.closest('.message-modal-overlay').remove()">
                        CLOSE
                    </button>
                </div>
            </div>
        `;

        // Add modal styles
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            z-index: 1000000;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            box-sizing: border-box;
        `;

        document.body.appendChild(modal);

        // Close on overlay click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });

        // Close on escape key
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                modal.remove();
                document.removeEventListener('keydown', handleEscape);
            }
        };
        document.addEventListener('keydown', handleEscape);
    }

    /**
     * Get additional CSS for message inbox
     */
    static getCSS() {
        return `
            .message-inbox {
                padding: 0;
                max-height: 400px;
                display: flex;
                flex-direction: column;
            }
            
            .inbox-header {
                background: linear-gradient(45deg, #001100, #002200);
                padding: 8px 12px;
                border-bottom: 1px solid #00ff00;
                font-size: 11px;
                letter-spacing: 1px;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .header-left {
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .terminal-prompt {
                color: #00ff00;
                font-weight: bold;
            }
            
            .unread-badge {
                background: #ff4444;
                color: #ffffff;
                padding: 2px 6px;
                border-radius: 10px;
                font-size: 9px;
                font-weight: bold;
                min-width: 16px;
                text-align: center;
            }
            
            .header-actions {
                display: flex;
                gap: 4px;
            }
            
            .refresh-btn, .mark-all-read-btn {
                background: none;
                border: 1px solid rgba(0, 255, 0, 0.3);
                color: #00ff00;
                padding: 4px 6px;
                font-size: 10px;
                cursor: pointer;
                border-radius: 2px;
                transition: all 0.2s ease;
            }
            
            .refresh-btn:hover, .mark-all-read-btn:hover {
                background: rgba(0, 255, 0, 0.1);
                border-color: #00ff00;
            }
            
            .inbox-content {
                flex: 1;
                overflow-y: auto;
                min-height: 200px;
            }
            
            .loading-container {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 40px 20px;
                gap: 12px;
            }
            
            .loading-spinner {
                width: 20px;
                height: 20px;
                border: 2px solid rgba(0, 255, 0, 0.3);
                border-top: 2px solid #00ff00;
                border-radius: 50%;
                animation: spin 1s linear infinite;
            }
            
            .loading-text {
                color: #00ff00;
                font-size: 11px;
                letter-spacing: 1px;
            }
            
            .empty-state {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 40px 20px;
                text-align: center;
            }
            
            .empty-icon {
                font-size: 32px;
                margin-bottom: 12px;
                opacity: 0.5;
            }
            
            .empty-title {
                color: #00ff00;
                font-size: 12px;
                font-weight: bold;
                letter-spacing: 1px;
                margin-bottom: 4px;
            }
            
            .empty-subtitle {
                color: rgba(255, 255, 255, 0.6);
                font-size: 10px;
            }
            
            .messages-list {
                padding: 8px;
            }
            
            .message-item {
                border: 1px solid rgba(0, 255, 0, 0.2);
                background: rgba(0, 255, 0, 0.02);
                margin-bottom: 8px;
                padding: 10px;
                cursor: pointer;
                transition: all 0.2s ease;
                position: relative;
            }
            
            .message-item:hover {
                border-color: rgba(0, 255, 0, 0.5);
                background: rgba(0, 255, 0, 0.05);
            }
            
            .message-item.unread {
                border-color: #00ff00;
                background: rgba(0, 255, 0, 0.08);
            }
            
            .message-item.priority-urgent {
                border-color: #ff4444;
                background: rgba(255, 68, 68, 0.05);
            }
            
            .message-item.priority-high {
                border-color: #ffaa00;
                background: rgba(255, 170, 0, 0.05);
            }
            
            .message-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 6px;
            }
            
            .message-meta {
                display: flex;
                align-items: center;
                gap: 8px;
                font-size: 10px;
            }
            
            .message-type-icon {
                font-size: 12px;
            }
            
            .message-sender {
                color: #00ff00;
                font-weight: bold;
                text-transform: uppercase;
            }
            
            .message-time {
                color: rgba(255, 255, 255, 0.5);
                font-size: 9px;
            }
            
            .message-indicators {
                display: flex;
                align-items: center;
                gap: 4px;
            }
            
            .urgent-indicator {
                color: #ff4444;
                font-weight: bold;
                font-size: 12px;
            }
            
            .unread-indicator {
                color: #00ff00;
                font-size: 8px;
            }
            
            .message-content {
                margin-bottom: 6px;
            }
            
            .message-title {
                color: #ffffff;
                font-size: 12px;
                font-weight: bold;
                margin-bottom: 4px;
                line-height: 1.3;
            }
            
            .message-preview {
                color: rgba(255, 255, 255, 0.7);
                font-size: 11px;
                line-height: 1.4;
            }
            
            .message-category {
                position: absolute;
                top: 4px;
                right: 4px;
                background: rgba(0, 255, 0, 0.2);
                color: #00ff00;
                padding: 2px 6px;
                font-size: 8px;
                font-weight: bold;
                letter-spacing: 1px;
                border-radius: 2px;
            }
            
            .load-more-container {
                padding: 12px;
                text-align: center;
                border-top: 1px solid rgba(0, 255, 0, 0.2);
            }
            
            .load-more-btn {
                background: transparent;
                border: 1px solid #00ff00;
                color: #00ff00;
                padding: 8px 16px;
                font-family: 'Courier New', monospace;
                font-size: 10px;
                font-weight: bold;
                text-transform: uppercase;
                letter-spacing: 1px;
                cursor: pointer;
                transition: all 0.2s ease;
                width: 100%;
            }
            
            .load-more-btn:hover {
                background: #00ff00;
                color: #000000;
            }
            
            /* Message Modal Styles */
            .message-modal {
                background: #000000;
                border: 2px solid #00ff00;
                border-radius: 8px;
                max-width: 600px;
                width: 100%;
                max-height: 80vh;
                display: flex;
                flex-direction: column;
                font-family: 'Courier New', monospace;
                color: #ffffff;
                box-shadow: 0 0 20px rgba(0, 255, 0, 0.5);
            }
            
            .modal-header {
                background: linear-gradient(45deg, #001100, #002200);
                padding: 12px 16px;
                border-bottom: 1px solid #00ff00;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .modal-title {
                color: #00ff00;
                font-weight: bold;
                font-size: 14px;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .modal-close {
                background: none;
                border: none;
                color: #00ff00;
                font-size: 20px;
                cursor: pointer;
                padding: 4px;
                line-height: 1;
            }
            
            .modal-close:hover {
                color: #ffffff;
            }
            
            .modal-meta {
                padding: 12px 16px;
                border-bottom: 1px solid rgba(0, 255, 0, 0.3);
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                gap: 8px;
                font-size: 11px;
            }
            
            .meta-item {
                display: flex;
                gap: 8px;
            }
            
            .meta-label {
                color: rgba(255, 255, 255, 0.6);
                font-weight: bold;
                min-width: 60px;
            }
            
            .meta-value {
                color: #ffffff;
            }
            
            .meta-value.priority-urgent {
                color: #ff4444;
            }
            
            .meta-value.priority-high {
                color: #ffaa00;
            }
            
            .modal-content {
                flex: 1;
                padding: 16px;
                overflow-y: auto;
            }
            
            .message-text {
                color: #ffffff;
                font-family: 'Courier New', monospace;
                font-size: 13px;
                line-height: 1.6;
                white-space: pre-wrap;
                word-wrap: break-word;
                margin: 0;
            }
            
            .modal-actions {
                padding: 12px 16px;
                border-top: 1px solid rgba(0, 255, 0, 0.3);
                text-align: right;
            }
            
            .modal-btn {
                background: #00ff00;
                color: #000000;
                border: none;
                padding: 8px 16px;
                font-family: 'Courier New', monospace;
                font-weight: bold;
                font-size: 11px;
                text-transform: uppercase;
                letter-spacing: 1px;
                cursor: pointer;
                transition: all 0.2s ease;
            }
            
            .modal-btn:hover {
                background: #00cc00;
                box-shadow: 0 0 8px rgba(0, 255, 0, 0.5);
            }
            
            /* Mobile adjustments */
            @media (max-width: 768px) {
                .message-modal {
                    margin: 10px;
                    max-height: 90vh;
                }
                
                .modal-meta {
                    grid-template-columns: 1fr;
                }
                
                .message-item {
                    padding: 8px;
                }
                
                .message-header {
                    flex-direction: column;
                    align-items: flex-start;
                    gap: 4px;
                }
                
                .message-indicators {
                    align-self: flex-end;
                }
            }
        `;
    }
}

// Export for use in MemberWidget
window.MessageInbox = MessageInbox;