/**
 * Goonee Member Widget - Floating Widget for Any Website
 * Can be embedded in any HTML page without requiring user registration
 */

(function() {
    'use strict';

    // Widget configuration
    const WIDGET_CONFIG = {
        apiUrl: 'http://localhost:5173', // Your hacker-registration-system URL
        position: 'bottom-right',
        theme: 'hacker',
        autoInit: true
    };

    // Modern Widget CSS
    const WIDGET_CSS = `
        .goonee-widget {
            position: fixed;
            z-index: 999999;
            font-family: 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
            font-size: 14px;
            line-height: 1.4;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            border: 2px solid #00ff88;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
            color: #ffffff;
            border-radius: 16px;
            box-shadow: 
                0 20px 40px rgba(0, 0, 0, 0.4),
                0 0 30px rgba(0, 255, 136, 0.2),
                inset 0 1px 0 rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            max-width: 380px;
            min-width: 320px;
            overflow: hidden;
        }

        .goonee-widget.bottom-right {
            bottom: 20px;
            right: 20px;
        }

        .goonee-widget.bottom-left {
            bottom: 20px;
            left: 20px;
        }

        .goonee-widget.collapsed {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            animation: pulse 2s infinite;
        }

        .goonee-widget.collapsed .widget-content {
            display: none;
        }

        .goonee-widget.collapsed .widget-toggle {
            font-size: 24px;
            color: #00ff00;
        }

        @keyframes pulse {
            0%, 100% { box-shadow: 0 4px 20px rgba(0, 255, 0, 0.3); }
            50% { box-shadow: 0 4px 20px rgba(0, 255, 0, 0.8); }
        }

        .widget-header {
            padding: 12px 16px;
            border-bottom: 1px solid #00ff00;
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: linear-gradient(45deg, #000000, #001100);
        }

        .widget-title {
            font-weight: bold;
            color: #00ff00;
            text-transform: uppercase;
            letter-spacing: 1px;
            font-size: 12px;
        }

        .widget-close {
            background: none;
            border: none;
            color: #00ff00;
            cursor: pointer;
            font-size: 18px;
            padding: 4px;
            transition: color 0.2s ease;
        }

        .widget-close:hover {
            color: #ffffff;
        }

        .widget-content {
            padding: 16px;
            max-height: 400px;
            overflow-y: auto;
        }

        .widget-section {
            margin-bottom: 16px;
            padding: 12px;
            border: 1px solid rgba(0, 255, 0, 0.3);
            background: rgba(0, 255, 0, 0.05);
        }

        .section-title {
            color: #00ff00;
            font-weight: bold;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 8px;
        }

        .section-content {
            color: #ffffff;
            font-size: 11px;
            line-height: 1.4;
        }

        .widget-link {
            color: #00ff00;
            text-decoration: none;
            transition: color 0.2s ease;
        }

        .widget-link:hover {
            color: #ffffff;
            text-shadow: 0 0 4px #00ff00;
        }

        .widget-button {
            background: #00ff00;
            color: #000000;
            border: none;
            padding: 8px 12px;
            font-family: inherit;
            font-weight: bold;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 1px;
            cursor: pointer;
            transition: all 0.2s ease;
            width: 100%;
            margin-top: 8px;
        }

        .widget-button:hover {
            background: #00cc00;
            box-shadow: 0 0 8px rgba(0, 255, 0, 0.5);
        }

        .widget-stats {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px;
            margin-top: 12px;
        }

        .stat-item {
            text-align: center;
            padding: 6px;
            border: 1px solid rgba(0, 255, 0, 0.2);
            background: rgba(0, 255, 0, 0.05);
        }

        .stat-value {
            color: #00ff00;
            font-weight: bold;
            font-size: 14px;
        }

        .stat-label {
            color: rgba(255, 255, 255, 0.7);
            font-size: 9px;
            text-transform: uppercase;
        }

        @media (max-width: 768px) {
            .goonee-widget {
                max-width: calc(100vw - 40px);
                font-size: 13px;
            }
            
            .goonee-widget.collapsed {
                width: 50px;
                height: 50px;
            }
        }
    `;

    // Widget HTML Template
    const WIDGET_HTML = `
        <div class="widget-header">
            <div class="widget-title">[GOONEE SECURITY]</div>
            <button class="widget-close" onclick="GooneeWidget.collapse()">×</button>
        </div>
        <div class="widget-content">
            <div class="widget-section">
                <div class="section-title">🛡️ ETHICAL HACKING</div>
                <div class="section-content">
                    เราสอนการป้องกัน ไม่ใช่การโจมตี<br/>
                    เรียนรู้เพื่อสร้างระบบที่ปลอดภัย
                </div>
            </div>
            
            <div class="widget-section">
                <div class="section-title">💻 PROGRAMMING FIRST</div>
                <div class="section-content">
                    การเขียนโปรแกรมคือพื้นฐาน<br/>
                    ที่จะทำให้คุณเป็นแฮกเกอร์ได้จริง
                </div>
            </div>
            
            <div class="widget-section">
                <div class="section-title">🎯 REAL WORLD TESTING</div>
                <div class="section-content">
                    ไม่พึ่งเครื่องมือสำเร็จรูป<br/>
                    เน้นการเข้าใจหลักการและระบบ
                </div>
            </div>

            <div class="widget-stats">
                <div class="stat-item">
                    <div class="stat-value">500+</div>
                    <div class="stat-label">Students</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">50+</div>
                    <div class="stat-label">Vulnerabilities</div>
                </div>
            </div>

            <button class="widget-button" onclick="GooneeWidget.openWebsite()">
                เข้าสู่ระบบการเรียน
            </button>
            
            <button class="widget-button" onclick="GooneeWidget.openAbout()" style="background: transparent; border: 1px solid #00ff00; color: #00ff00; margin-top: 4px;">
                เกี่ยวกับเรา
            </button>
        </div>
    `;

    // Main Widget Class
    class GooneeWidget {
        constructor() {
            this.container = null;
            this.collapsed = true;
            this.init();
        }

        init() {
            this.injectCSS();
            this.createWidget();
            this.bindEvents();
            
            // Auto-show after 3 seconds
            setTimeout(() => {
                this.show();
            }, 3000);
        }

        injectCSS() {
            if (document.getElementById('goonee-widget-styles')) return;
            
            const style = document.createElement('style');
            style.id = 'goonee-widget-styles';
            style.textContent = WIDGET_CSS;
            document.head.appendChild(style);
        }

        createWidget() {
            this.container = document.createElement('div');
            this.container.id = 'goonee-widget';
            this.container.className = `goonee-widget ${WIDGET_CONFIG.position} collapsed`;
            this.container.innerHTML = '<div class="widget-toggle">🛡️</div>';
            
            document.body.appendChild(this.container);
        }

        bindEvents() {
            // Click to expand when collapsed
            this.container.addEventListener('click', (e) => {
                if (this.collapsed && e.target === this.container) {
                    this.expand();
                }
            });

            // Escape key to collapse
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && !this.collapsed) {
                    this.collapse();
                }
            });
        }

        show() {
            this.container.style.display = 'block';
        }

        hide() {
            this.container.style.display = 'none';
        }

        expand() {
            this.collapsed = false;
            this.container.classList.remove('collapsed');
            this.container.innerHTML = WIDGET_HTML;
        }

        collapse() {
            this.collapsed = true;
            this.container.classList.add('collapsed');
            this.container.innerHTML = '<div class="widget-toggle">🛡️</div>';
        }

        openWebsite() {
            window.open(WIDGET_CONFIG.apiUrl, '_blank');
        }

        openAbout() {
            window.open(WIDGET_CONFIG.apiUrl + '/about', '_blank');
        }

        destroy() {
            if (this.container) {
                this.container.remove();
            }
            
            const styles = document.getElementById('goonee-widget-styles');
            if (styles) {
                styles.remove();
            }
        }
    }

    // Global widget instance
    let widgetInstance = null;

    // Global widget API
    window.GooneeWidget = {
        init: function(config = {}) {
            if (widgetInstance) {
                widgetInstance.destroy();
            }
            
            Object.assign(WIDGET_CONFIG, config);
            widgetInstance = new GooneeWidget();
            return widgetInstance;
        },
        
        collapse: function() {
            if (widgetInstance) {
                widgetInstance.collapse();
            }
        },
        
        expand: function() {
            if (widgetInstance) {
                widgetInstance.expand();
            }
        },
        
        show: function() {
            if (widgetInstance) {
                widgetInstance.show();
            }
        },
        
        hide: function() {
            if (widgetInstance) {
                widgetInstance.hide();
            }
        },
        
        openWebsite: function() {
            if (widgetInstance) {
                widgetInstance.openWebsite();
            }
        },
        
        openAbout: function() {
            if (widgetInstance) {
                widgetInstance.openAbout();
            }
        },
        
        destroy: function() {
            if (widgetInstance) {
                widgetInstance.destroy();
                widgetInstance = null;
            }
        }
    };

    // Auto-initialize if enabled
    if (WIDGET_CONFIG.autoInit) {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                window.GooneeWidget.init();
            });
        } else {
            window.GooneeWidget.init();
        }
    }

})();