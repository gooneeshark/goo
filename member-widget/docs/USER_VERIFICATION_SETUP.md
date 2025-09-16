# เอกสารการตั้งค่าระบบยืนยันตัวตน - IP และ User Agent Tracking

## ภาพรวม

เอกสารนี้อธิบายการตั้งค่าและการใช้งานระบบยืนยันตัวตนขั้นสูง ที่รวมถึงการติดตาม IP Address, User Agent, และข้อมูลอุปกรณ์เพื่อเพิ่มความปลอดภัยและการตรวจสอบ

## Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Client Side   │    │   Middleware    │    │   Database      │
│                 │    │                 │    │                 │
│ - Browser       │───►│ - IP Detection  │───►│ - user_sessions │
│ - User Agent    │    │ - UA Parsing    │    │ - audit_logs    │
│ - Device Info   │    │ - Geolocation   │    │ - risk_scores   │
│ - Fingerprint   │    │ - Risk Analysis │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## การติดตั้งและตั้งค่า

### 1. Dependencies

```bash
# Backend dependencies
npm install express-rate-limit
npm install express-slow-down
npm install helmet
npm install cors
npm install ua-parser-js
npm install geoip-lite
npm install device-detector-js
npm install crypto-js

# Frontend dependencies (for widget)
npm install fingerprintjs2
npm install platform
```

### 2. Environment Variables

```bash
# .env file
# Security settings
ENABLE_IP_TRACKING=true
ENABLE_USER_AGENT_TRACKING=true
ENABLE_DEVICE_FINGERPRINTING=true
ENABLE_GEOLOCATION=true

# Rate limiting
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_LOGIN_MAX=5

# Risk analysis
RISK_ANALYSIS_ENABLED=true
SUSPICIOUS_IP_THRESHOLD=3
MAX_SESSIONS_PER_USER=5

# GeoIP database
GEOIP_DATABASE_PATH=./data/GeoLite2-City.mmdb

# Encryption
SESSION_ENCRYPTION_KEY=your-32-character-secret-key
IP_HASH_SALT=your-random-salt-string
```

## Backend Implementation

### 1. Middleware Setup

```javascript
// middleware/sessionTracking.js
const UAParser = require('ua-parser-js');
const geoip = require('geoip-lite');
const DeviceDetector = require('device-detector-js');
const crypto = require('crypto');

class SessionTracker {
    constructor(options = {}) {
        this.enableIPTracking = options.enableIPTracking || true;
        this.enableUATracking = options.enableUATracking || true;
        this.enableGeolocation = options.enableGeolocation || true;
        this.deviceDetector = new DeviceDetector();
    }

    // Extract client IP address
    extractClientIP(req) {
        const forwarded = req.headers['x-forwarded-for'];
        const realIP = req.headers['x-real-ip'];
        const cfConnectingIP = req.headers['cf-connecting-ip'];
        
        let clientIP = req.connection.remoteAddress || 
                      req.socket.remoteAddress ||
                      (req.connection.socket ? req.connection.socket.remoteAddress : null);

        // Priority order for IP detection
        if (cfConnectingIP) {
            clientIP = cfConnectingIP;
        } else if (realIP) {
            clientIP = realIP;
        } else if (forwarded) {
            clientIP = forwarded.split(',')[0].trim();
        }

        // Clean IPv6 mapped IPv4 addresses
        if (clientIP && clientIP.startsWith('::ffff:')) {
            clientIP = clientIP.substring(7);
        }

        return clientIP;
    }

    // Parse User Agent
    parseUserAgent(userAgent) {
        const parser = new UAParser(userAgent);
        const result = parser.getResult();
        
        // Additional device detection
        const deviceInfo = this.deviceDetector.parse(userAgent);
        
        return {
            browser: result.browser.name || 'Unknown',
            browserVersion: result.browser.version || 'Unknown',
            os: result.os.name || 'Unknown',
            osVersion: result.os.version || 'Unknown',
            device: result.device.type || 'desktop',
            deviceBrand: deviceInfo.device?.brand || result.device.vendor || 'Unknown',
            deviceModel: deviceInfo.device?.model || result.device.model || 'Unknown',
            cpu: result.cpu.architecture || 'Unknown',
            engine: result.engine.name || 'Unknown'
        };
    }

    // Get geolocation from IP
    getGeolocation(ip) {
        if (!this.enableGeolocation || !ip) return null;
        
        try {
            const geo = geoip.lookup(ip);
            if (geo) {
                return {
                    country: geo.country,
                    region: geo.region,
                    city: geo.city,
                    timezone: geo.timezone,
                    coordinates: geo.ll,
                    metro: geo.metro,
                    area: geo.area
                };
            }
        } catch (error) {
            console.error('Geolocation error:', error);
        }
        
        return null;
    }

    // Calculate risk score
    calculateRiskScore(sessionData, userHistory = []) {
        let riskScore = 0;
        
        // New IP address
        const knownIPs = userHistory.map(s => s.ip_address);
        if (!knownIPs.includes(sessionData.ip_address)) {
            riskScore += 20;
        }
        
        // New device/browser
        const knownDevices = userHistory.map(s => `${s.browser}-${s.os}`);
        const currentDevice = `${sessionData.browser}-${sessionData.os}`;
        if (!knownDevices.includes(currentDevice)) {
            riskScore += 15;
        }
        
        // Geographic distance
        if (sessionData.geolocation && userHistory.length > 0) {
            const lastSession = userHistory[0];
            if (lastSession.country !== sessionData.geolocation.country) {
                riskScore += 25;
            }
        }
        
        // Time-based analysis
        const now = new Date();
        const recentSessions = userHistory.filter(s => {
            const sessionTime = new Date(s.login_at);
            return (now - sessionTime) < (24 * 60 * 60 * 1000); // Last 24 hours
        });
        
        if (recentSessions.length > 10) {
            riskScore += 30; // Too many sessions
        }
        
        // Suspicious user agents
        const suspiciousPatterns = [
            /bot/i, /crawler/i, /spider/i, /scraper/i,
            /curl/i, /wget/i, /python/i, /java/i
        ];
        
        if (suspiciousPatterns.some(pattern => pattern.test(sessionData.user_agent))) {
            riskScore += 40;
        }
        
        return Math.min(riskScore, 100);
    }

    // Hash sensitive data
    hashSensitiveData(data, salt) {
        return crypto.createHash('sha256')
                    .update(data + salt)
                    .digest('hex');
    }

    // Main tracking middleware
    trackSession() {
        return async (req, res, next) => {
            try {
                const ip = this.extractClientIP(req);
                const userAgent = req.headers['user-agent'] || '';
                const deviceInfo = this.parseUserAgent(userAgent);
                const geolocation = this.getGeolocation(ip);
                
                // Store in request object for later use
                req.sessionData = {
                    ip_address: ip,
                    user_agent: userAgent,
                    geolocation: geolocation,
                    ...deviceInfo,
                    timestamp: new Date()
                };
                
                // Add to response headers for debugging (in development)
                if (process.env.NODE_ENV === 'development') {
                    res.set('X-Client-IP', ip);
                    res.set('X-Device-Type', deviceInfo.device);
                }
                
                next();
            } catch (error) {
                console.error('Session tracking error:', error);
                next(); // Continue even if tracking fails
            }
        };
    }
}

module.exports = SessionTracker;
```

### 2. Database Service

```javascript
// services/sessionService.js
const { supabase } = require('../lib/supabase');

class SessionService {
    // Create new session record
    async createSession(userId, sessionData, riskScore = 0) {
        try {
            const { data, error } = await supabase
                .from('user_sessions')
                .insert({
                    user_id: userId,
                    ip_address: sessionData.ip_address,
                    user_agent: sessionData.user_agent,
                    country: sessionData.geolocation?.country,
                    region: sessionData.geolocation?.region,
                    city: sessionData.geolocation?.city,
                    timezone: sessionData.geolocation?.timezone,
                    device_type: sessionData.device,
                    device_brand: sessionData.deviceBrand,
                    device_model: sessionData.deviceModel,
                    browser: sessionData.browser,
                    browser_version: sessionData.browserVersion,
                    os: sessionData.os,
                    os_version: sessionData.osVersion,
                    risk_score: riskScore,
                    is_suspicious: riskScore > 50,
                    metadata: {
                        cpu: sessionData.cpu,
                        engine: sessionData.engine,
                        coordinates: sessionData.geolocation?.coordinates
                    }
                })
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Create session error:', error);
            throw error;
        }
    }

    // Get user session history
    async getUserSessions(userId, limit = 50) {
        try {
            const { data, error } = await supabase
                .from('user_sessions')
                .select('*')
                .eq('user_id', userId)
                .order('login_at', { ascending: false })
                .limit(limit);

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Get user sessions error:', error);
            return [];
        }
    }

    // Update session on logout
    async endSession(sessionId) {
        try {
            const { data, error } = await supabase
                .from('user_sessions')
                .update({
                    logout_at: new Date().toISOString(),
                    is_active: false
                })
                .eq('id', sessionId)
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('End session error:', error);
            throw error;
        }
    }

    // Get suspicious sessions
    async getSuspiciousSessions(limit = 100) {
        try {
            const { data, error } = await supabase
                .from('user_sessions')
                .select(`
                    *,
                    user_profiles_extended!inner(first_name, last_name, email)
                `)
                .eq('is_suspicious', true)
                .order('login_at', { ascending: false })
                .limit(limit);

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Get suspicious sessions error:', error);
            return [];
        }
    }

    // Analyze session patterns
    async analyzeSessionPatterns(userId) {
        try {
            const sessions = await this.getUserSessions(userId, 100);
            
            const analysis = {
                totalSessions: sessions.length,
                uniqueIPs: [...new Set(sessions.map(s => s.ip_address))].length,
                uniqueDevices: [...new Set(sessions.map(s => `${s.device_type}-${s.browser}`))].length,
                countries: [...new Set(sessions.map(s => s.country).filter(Boolean))],
                averageRiskScore: sessions.reduce((sum, s) => sum + (s.risk_score || 0), 0) / sessions.length,
                suspiciousSessionsCount: sessions.filter(s => s.is_suspicious).length,
                lastLogin: sessions[0]?.login_at,
                mostUsedDevice: this.getMostFrequent(sessions.map(s => s.device_type)),
                mostUsedBrowser: this.getMostFrequent(sessions.map(s => s.browser)),
                mostUsedCountry: this.getMostFrequent(sessions.map(s => s.country).filter(Boolean))
            };

            return analysis;
        } catch (error) {
            console.error('Analyze session patterns error:', error);
            return null;
        }
    }

    // Helper function to find most frequent value
    getMostFrequent(arr) {
        const frequency = {};
        let maxCount = 0;
        let mostFrequent = null;

        arr.forEach(item => {
            frequency[item] = (frequency[item] || 0) + 1;
            if (frequency[item] > maxCount) {
                maxCount = frequency[item];
                mostFrequent = item;
            }
        });

        return mostFrequent;
    }
}

module.exports = SessionService;
```

### 3. Authentication Integration

```javascript
// routes/auth.js
const express = require('express');
const SessionTracker = require('../middleware/sessionTracking');
const SessionService = require('../services/sessionService');

const router = express.Router();
const sessionTracker = new SessionTracker();
const sessionService = new SessionService();

// Apply session tracking middleware
router.use(sessionTracker.trackSession());

// Login endpoint with session tracking
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Authenticate user (your existing logic)
        const user = await authenticateUser(email, password);
        if (!user) {
            return res.status(401).json({
                success: false,
                error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' }
            });
        }

        // Get user's session history for risk analysis
        const userHistory = await sessionService.getUserSessions(user.id, 10);
        
        // Calculate risk score
        const riskScore = sessionTracker.calculateRiskScore(req.sessionData, userHistory);
        
        // Create session record
        const session = await sessionService.createSession(user.id, req.sessionData, riskScore);
        
        // Check if session is suspicious
        if (riskScore > 70) {
            // Log suspicious activity
            console.warn(`Suspicious login attempt for user ${user.id}:`, {
                ip: req.sessionData.ip_address,
                riskScore,
                userAgent: req.sessionData.user_agent
            });
            
            // You might want to require additional verification
            return res.status(200).json({
                success: true,
                requiresVerification: true,
                verificationMethods: ['email', 'sms'],
                sessionId: session.id
            });
        }

        // Generate JWT token (your existing logic)
        const token = generateJWT(user);
        
        res.json({
            success: true,
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    profile: user.profile
                },
                token,
                session: {
                    id: session.id,
                    riskScore,
                    location: req.sessionData.geolocation?.city,
                    device: req.sessionData.device
                }
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            error: { code: 'INTERNAL_ERROR', message: 'Login failed' }
        });
    }
});

// Logout endpoint
router.post('/logout', authenticateToken, async (req, res) => {
    try {
        const sessionId = req.user.sessionId; // Assuming you store this in JWT
        
        if (sessionId) {
            await sessionService.endSession(sessionId);
        }
        
        res.json({
            success: true,
            message: 'Logged out successfully'
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            error: { code: 'INTERNAL_ERROR', message: 'Logout failed' }
        });
    }
});

module.exports = router;
```

## Frontend Implementation

### 1. Client-side Data Collection

```javascript
// widget/src/utils/deviceFingerprint.js
class DeviceFingerprint {
    constructor() {
        this.fingerprint = null;
    }

    // Collect device information
    async collectDeviceInfo() {
        const info = {
            userAgent: navigator.userAgent,
            language: navigator.language,
            languages: navigator.languages,
            platform: navigator.platform,
            cookieEnabled: navigator.cookieEnabled,
            doNotTrack: navigator.doNotTrack,
            
            // Screen information
            screen: {
                width: screen.width,
                height: screen.height,
                colorDepth: screen.colorDepth,
                pixelDepth: screen.pixelDepth,
                availWidth: screen.availWidth,
                availHeight: screen.availHeight
            },
            
            // Timezone
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            timezoneOffset: new Date().getTimezoneOffset(),
            
            // Browser features
            features: {
                localStorage: !!window.localStorage,
                sessionStorage: !!window.sessionStorage,
                indexedDB: !!window.indexedDB,
                webGL: !!window.WebGLRenderingContext,
                webRTC: !!(navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia),
                touchSupport: 'ontouchstart' in window,
                geolocation: !!navigator.geolocation
            }
        };

        // Canvas fingerprinting (optional, privacy-sensitive)
        if (this.shouldCollectCanvasFingerprint()) {
            info.canvasFingerprint = this.getCanvasFingerprint();
        }

        return info;
    }

    // Generate canvas fingerprint
    getCanvasFingerprint() {
        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            canvas.width = 200;
            canvas.height = 50;
            
            ctx.textBaseline = 'top';
            ctx.font = '14px Arial';
            ctx.fillText('Device fingerprint test 🔒', 2, 2);
            
            ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
            ctx.fillRect(100, 5, 80, 20);
            
            return canvas.toDataURL();
        } catch (error) {
            return null;
        }
    }

    // Check if canvas fingerprinting should be collected
    shouldCollectCanvasFingerprint() {
        // Respect user privacy settings
        return !navigator.doNotTrack || navigator.doNotTrack === '0';
    }

    // Generate unique device ID
    async generateDeviceId() {
        const deviceInfo = await this.collectDeviceInfo();
        const fingerprint = JSON.stringify(deviceInfo);
        
        // Create hash of device information
        const encoder = new TextEncoder();
        const data = encoder.encode(fingerprint);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        
        return hashHex;
    }
}

// widget/src/services/authService.js
class AuthService {
    constructor(apiUrl) {
        this.apiUrl = apiUrl;
        this.deviceFingerprint = new DeviceFingerprint();
    }

    async login(email, password) {
        try {
            // Collect device information
            const deviceInfo = await this.deviceFingerprint.collectDeviceInfo();
            const deviceId = await this.deviceFingerprint.generateDeviceId();
            
            const response = await fetch(`${this.apiUrl}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Device-ID': deviceId,
                    'X-Widget-Version': '1.0.0'
                },
                body: JSON.stringify({
                    email,
                    password,
                    deviceInfo // Send device info for server-side analysis
                })
            });

            const result = await response.json();
            
            if (result.success) {
                // Store session information
                localStorage.setItem('memberWidget_token', result.data.token);
                localStorage.setItem('memberWidget_session', JSON.stringify(result.data.session));
                
                // Check if additional verification is required
                if (result.requiresVerification) {
                    return {
                        success: true,
                        requiresVerification: true,
                        verificationMethods: result.verificationMethods,
                        sessionId: result.sessionId
                    };
                }
                
                return result;
            } else {
                throw new Error(result.error.message);
            }
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }

    async logout() {
        try {
            const token = localStorage.getItem('memberWidget_token');
            
            if (token) {
                await fetch(`${this.apiUrl}/auth/logout`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
            }
            
            // Clear local storage
            localStorage.removeItem('memberWidget_token');
            localStorage.removeItem('memberWidget_session');
            
        } catch (error) {
            console.error('Logout error:', error);
        }
    }
}
```

## Admin Dashboard Integration

### 1. Session Monitoring Component

```javascript
// dashboard/src/components/SessionMonitoring.jsx
import React, { useState, useEffect } from 'react';

const SessionMonitoring = () => {
    const [sessions, setSessions] = useState([]);
    const [suspiciousSessions, setSuspiciousSessions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSessions();
        fetchSuspiciousSessions();
    }, []);

    const fetchSessions = async () => {
        try {
            const response = await fetch('/api/admin/sessions');
            const data = await response.json();
            setSessions(data.sessions || []);
        } catch (error) {
            console.error('Error fetching sessions:', error);
        }
    };

    const fetchSuspiciousSessions = async () => {
        try {
            const response = await fetch('/api/admin/sessions/suspicious');
            const data = await response.json();
            setSuspiciousSessions(data.sessions || []);
        } catch (error) {
            console.error('Error fetching suspicious sessions:', error);
        } finally {
            setLoading(false);
        }
    };

    const getRiskColor = (riskScore) => {
        if (riskScore < 30) return 'text-green-600';
        if (riskScore < 70) return 'text-yellow-600';
        return 'text-red-600';
    };

    if (loading) {
        return <div className="p-4">Loading sessions...</div>;
    }

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-6">Session Monitoring</h2>
            
            {/* Suspicious Sessions Alert */}
            {suspiciousSessions.length > 0 && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                    <strong>Alert:</strong> {suspiciousSessions.length} suspicious sessions detected
                </div>
            )}

            {/* Recent Sessions */}
            <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b">
                    <h3 className="text-lg font-medium">Recent Sessions</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">IP Address</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Device</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Risk Score</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Login Time</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {sessions.map((session) => (
                                <tr key={session.id} className={session.is_suspicious ? 'bg-red-50' : ''}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">
                                            {session.user_profiles_extended?.email}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {session.ip_address}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {session.city}, {session.country}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {session.device_type} - {session.browser}
                                    </td>
                                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${getRiskColor(session.risk_score)}`}>
                                        {session.risk_score}%
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {new Date(session.login_at).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 text-xs rounded-full ${
                                            session.is_active 
                                                ? 'bg-green-100 text-green-800' 
                                                : 'bg-gray-100 text-gray-800'
                                        }`}>
                                            {session.is_active ? 'Active' : 'Ended'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default SessionMonitoring;
```

## Security Best Practices

### 1. Data Privacy

```javascript
// Privacy-compliant data collection
const PRIVACY_SETTINGS = {
    // Collect only necessary data
    collectIP: true,
    collectUserAgent: true,
    collectGeolocation: true,
    
    // Sensitive data collection (requires explicit consent)
    collectCanvasFingerprint: false,
    collectWebRTCFingerprint: false,
    collectFontFingerprint: false,
    
    // Data retention
    sessionRetentionDays: 90,
    auditLogRetentionDays: 365,
    
    // Anonymization
    anonymizeIPAfterDays: 30,
    hashSensitiveData: true
};
```

### 2. Rate Limiting

```javascript
// Rate limiting configuration
const rateLimitConfig = {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    
    // Different limits for different endpoints
    endpoints: {
        '/auth/login': { max: 5, windowMs: 15 * 60 * 1000 },
        '/auth/register': { max: 3, windowMs: 60 * 60 * 1000 },
        '/api/': { max: 100, windowMs: 15 * 60 * 1000 }
    },
    
    // Skip rate limiting for trusted IPs
    skip: (req) => {
        const trustedIPs = process.env.TRUSTED_IPS?.split(',') || [];
        return trustedIPs.includes(req.ip);
    }
};
```

### 3. Anomaly Detection

```javascript
// Anomaly detection rules
const anomalyRules = {
    // Multiple logins from different countries within short time
    rapidGeoChange: {
        enabled: true,
        timeWindow: 60 * 60 * 1000, // 1 hour
        threshold: 2 // different countries
    },
    
    // Too many failed login attempts
    bruteForce: {
        enabled: true,
        timeWindow: 15 * 60 * 1000, // 15 minutes
        threshold: 5 // failed attempts
    },
    
    // Unusual device/browser combination
    deviceAnomaly: {
        enabled: true,
        checkNewDevice: true,
        checkUserAgentChanges: true
    },
    
    // Suspicious IP patterns
    ipAnomaly: {
        enabled: true,
        checkVPN: true,
        checkTor: true,
        checkDataCenter: true
    }
};
```

## Monitoring and Alerts

### 1. Real-time Alerts

```javascript
// Alert system
class SecurityAlertSystem {
    constructor() {
        this.alertChannels = {
            email: process.env.SECURITY_EMAIL,
            slack: process.env.SLACK_WEBHOOK,
            sms: process.env.SMS_API_KEY
        };
    }

    async sendAlert(type, data) {
        const alert = {
            type,
            timestamp: new Date().toISOString(),
            data,
            severity: this.getSeverity(type)
        };

        // Send to appropriate channels based on severity
        if (alert.severity === 'high') {
            await this.sendToAllChannels(alert);
        } else if (alert.severity === 'medium') {
            await this.sendEmail(alert);
            await this.sendSlack(alert);
        } else {
            await this.logAlert(alert);
        }
    }

    getSeverity(type) {
        const severityMap = {
            'suspicious_login': 'medium',
            'brute_force_attack': 'high',
            'geo_anomaly': 'medium',
            'device_anomaly': 'low',
            'multiple_sessions': 'low'
        };
        
        return severityMap[type] || 'low';
    }
}
```

### 2. Dashboard Metrics

```javascript
// Security metrics for dashboard
const securityMetrics = {
    // Real-time metrics
    activeSessions: () => getActiveSessionsCount(),
    suspiciousActivities: () => getSuspiciousActivitiesCount(),
    blockedIPs: () => getBlockedIPsCount(),
    
    // Historical metrics
    loginAttempts: (timeRange) => getLoginAttempts(timeRange),
    successfulLogins: (timeRange) => getSuccessfulLogins(timeRange),
    failedLogins: (timeRange) => getFailedLogins(timeRange),
    
    // Geographic distribution
    loginsByCountry: (timeRange) => getLoginsByCountry(timeRange),
    topDevices: (timeRange) => getTopDevices(timeRange),
    topBrowsers: (timeRange) => getTopBrowsers(timeRange)
};
```

## Compliance and Legal Considerations

### 1. GDPR Compliance

```javascript
// GDPR compliance features
const gdprCompliance = {
    // Data subject rights
    dataExport: async (userId) => {
        // Export all user data including session history
        return await exportUserData(userId);
    },
    
    dataDelete: async (userId) => {
        // Delete or anonymize user data
        return await deleteUserData(userId);
    },
    
    consentManagement: {
        trackingConsent: false, // Requires explicit consent
        analyticsConsent: false,
        marketingConsent: false
    },
    
    // Data minimization
    dataRetention: {
        sessions: 90, // days
        auditLogs: 365, // days
        anonymizeAfter: 30 // days
    }
};
```

### 2. Data Anonymization

```javascript
// Anonymization functions
const anonymizeData = {
    ip: (ip) => {
        // Anonymize last octet of IPv4 or last 80 bits of IPv6
        if (ip.includes(':')) {
            // IPv6
            return ip.split(':').slice(0, -5).join(':') + '::0';
        } else {
            // IPv4
            return ip.split('.').slice(0, -1).join('.') + '.0';
        }
    },
    
    userAgent: (ua) => {
        // Remove version numbers and specific identifiers
        return ua.replace(/\d+\.\d+\.\d+/g, 'x.x.x')
                 .replace(/\([^)]*\)/g, '(anonymized)');
    }
};
```

## การทดสอบและ Debugging

### 1. Testing Tools

```javascript
// Testing utilities
const testingUtils = {
    // Simulate different devices
    simulateDevice: (deviceType) => {
        const userAgents = {
            mobile: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X)',
            desktop: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            tablet: 'Mozilla/5.0 (iPad; CPU OS 14_7_1 like Mac OS X)'
        };
        return userAgents[deviceType];
    },
    
    // Test risk scoring
    testRiskScore: (sessionData, userHistory) => {
        const tracker = new SessionTracker();
        return tracker.calculateRiskScore(sessionData, userHistory);
    },
    
    // Generate test data
    generateTestSession: () => ({
        ip_address: '192.168.1.' + Math.floor(Math.random() * 255),
        user_agent: testingUtils.simulateDevice('desktop'),
        geolocation: { country: 'TH', city: 'Bangkok' }
    })
};
```

### 2. Debug Mode

```javascript
// Debug configuration
const debugConfig = {
    enabled: process.env.NODE_ENV === 'development',
    logLevel: 'debug',
    
    features: {
        logAllSessions: true,
        logRiskCalculations: true,
        logGeolocation: true,
        logDeviceDetection: true
    },
    
    // Debug endpoints (development only)
    endpoints: {
        '/debug/session': (req, res) => {
            res.json(req.sessionData);
        },
        '/debug/risk': (req, res) => {
            const riskScore = calculateRiskScore(req.sessionData, []);
            res.json({ riskScore, factors: getRiskFactors(req.sessionData) });
        }
    }
};
```

## การบำรุงรักษาและ Optimization

### 1. Database Maintenance

```sql
-- Clean up old sessions
DELETE FROM user_sessions 
WHERE logout_at IS NOT NULL 
AND logout_at < NOW() - INTERVAL '90 days';

-- Archive old audit logs
INSERT INTO audit_logs_archive 
SELECT * FROM audit_logs 
WHERE created_at < NOW() - INTERVAL '1 year';

-- Update statistics
ANALYZE user_sessions;
ANALYZE audit_logs;
```

### 2. Performance Optimization

```javascript
// Performance optimizations
const performanceOptimizations = {
    // Cache frequently accessed data
    caching: {
        geoipCache: new Map(), // Cache geolocation lookups
        deviceCache: new Map(), // Cache device parsing results
        riskCache: new Map()    // Cache risk calculations
    },
    
    // Batch processing
    batchSize: 100,
    batchInterval: 5000, // 5 seconds
    
    // Connection pooling
    dbPool: {
        min: 2,
        max: 10,
        acquireTimeoutMillis: 30000,
        idleTimeoutMillis: 30000
    }
};
```

การตั้งค่าระบบยืนยันตัวตนนี้จะช่วยเพิ่มความปลอดภัยให้กับ Member Widget และให้ข้อมูลที่มีค่าสำหรับการวิเคราะห์และตรวจสอบความปลอดภัย