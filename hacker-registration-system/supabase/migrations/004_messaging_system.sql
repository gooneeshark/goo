-- Migration: Add messaging system for member inbox
-- Created: 2024-01-16
-- Description: Add tables for admin-to-member messaging system

-- Create messages table
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Message content
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    message_type VARCHAR(50) DEFAULT 'info', -- 'info', 'warning', 'success', 'error', 'announcement'
    
    -- Sender information (admin)
    sender_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    sender_name VARCHAR(100),
    
    -- Recipient information
    recipient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Message status
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,
    
    -- Priority and categorization
    priority VARCHAR(20) DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
    category VARCHAR(50) DEFAULT 'general', -- 'general', 'system', 'promotion', 'security', 'update'
    
    -- Scheduling
    scheduled_for TIMESTAMP WITH TIME ZONE,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_message_type CHECK (message_type IN ('info', 'warning', 'success', 'error', 'announcement')),
    CONSTRAINT valid_priority CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    CONSTRAINT valid_category CHECK (category IN ('general', 'system', 'promotion', 'security', 'update')),
    CONSTRAINT non_empty_title CHECK (LENGTH(TRIM(title)) > 0),
    CONSTRAINT non_empty_content CHECK (LENGTH(TRIM(content)) > 0)
);

-- Create message templates table for reusable messages
CREATE TABLE message_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Template information
    name VARCHAR(100) NOT NULL,
    description TEXT,
    
    -- Template content
    title_template VARCHAR(255) NOT NULL,
    content_template TEXT NOT NULL,
    
    -- Template settings
    message_type VARCHAR(50) DEFAULT 'info',
    priority VARCHAR(20) DEFAULT 'normal',
    category VARCHAR(50) DEFAULT 'general',
    
    -- Template variables (for personalization)
    variables JSONB DEFAULT '[]', -- Array of variable names like ["user_name", "user_email"]
    
    -- Usage tracking
    usage_count INTEGER DEFAULT 0,
    last_used_at TIMESTAMP WITH TIME ZONE,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_template_message_type CHECK (message_type IN ('info', 'warning', 'success', 'error', 'announcement')),
    CONSTRAINT valid_template_priority CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    CONSTRAINT valid_template_category CHECK (category IN ('general', 'system', 'promotion', 'security', 'update')),
    CONSTRAINT non_empty_template_name CHECK (LENGTH(TRIM(name)) > 0)
);

-- Create broadcast messages table for sending to multiple users
CREATE TABLE broadcast_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Broadcast information
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    message_type VARCHAR(50) DEFAULT 'announcement',
    priority VARCHAR(20) DEFAULT 'normal',
    category VARCHAR(50) DEFAULT 'general',
    
    -- Sender information
    sender_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    sender_name VARCHAR(100),
    
    -- Target criteria
    target_criteria JSONB DEFAULT '{}', -- Criteria for selecting recipients
    
    -- Scheduling
    scheduled_for TIMESTAMP WITH TIME ZONE,
    sent_at TIMESTAMP WITH TIME ZONE,
    
    -- Status
    status VARCHAR(20) DEFAULT 'draft', -- 'draft', 'scheduled', 'sending', 'sent', 'cancelled'
    
    -- Statistics
    total_recipients INTEGER DEFAULT 0,
    sent_count INTEGER DEFAULT 0,
    read_count INTEGER DEFAULT 0,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_broadcast_message_type CHECK (message_type IN ('info', 'warning', 'success', 'error', 'announcement')),
    CONSTRAINT valid_broadcast_priority CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    CONSTRAINT valid_broadcast_status CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'cancelled'))
);

-- Create message attachments table
CREATE TABLE message_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
    
    -- File information
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    file_size INTEGER NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    file_url TEXT NOT NULL,
    
    -- Security
    file_hash VARCHAR(64), -- SHA-256 hash
    is_scanned BOOLEAN DEFAULT false,
    scan_result VARCHAR(20) DEFAULT 'pending', -- 'pending', 'clean', 'infected'
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT positive_file_size CHECK (file_size > 0),
    CONSTRAINT valid_scan_result CHECK (scan_result IN ('pending', 'clean', 'infected'))
);

-- Create user notification preferences table
CREATE TABLE user_notification_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Notification preferences
    email_notifications BOOLEAN DEFAULT true,
    push_notifications BOOLEAN DEFAULT true,
    sms_notifications BOOLEAN DEFAULT false,
    
    -- Category preferences
    general_messages BOOLEAN DEFAULT true,
    system_messages BOOLEAN DEFAULT true,
    promotion_messages BOOLEAN DEFAULT true,
    security_messages BOOLEAN DEFAULT true,
    update_messages BOOLEAN DEFAULT true,
    
    -- Frequency preferences
    digest_frequency VARCHAR(20) DEFAULT 'daily', -- 'immediate', 'hourly', 'daily', 'weekly', 'never'
    quiet_hours_start TIME DEFAULT '22:00:00',
    quiet_hours_end TIME DEFAULT '08:00:00',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_digest_frequency CHECK (digest_frequency IN ('immediate', 'hourly', 'daily', 'weekly', 'never')),
    UNIQUE(user_id)
);

-- Create indexes for better performance
CREATE INDEX idx_messages_recipient_id ON messages(recipient_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_is_read ON messages(is_read);
CREATE INDEX idx_messages_message_type ON messages(message_type);
CREATE INDEX idx_messages_priority ON messages(priority);
CREATE INDEX idx_messages_category ON messages(category);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX idx_messages_scheduled_for ON messages(scheduled_for);
CREATE INDEX idx_messages_expires_at ON messages(expires_at);

CREATE INDEX idx_message_templates_is_active ON message_templates(is_active);
CREATE INDEX idx_message_templates_category ON message_templates(category);
CREATE INDEX idx_message_templates_usage_count ON message_templates(usage_count DESC);

CREATE INDEX idx_broadcast_messages_status ON broadcast_messages(status);
CREATE INDEX idx_broadcast_messages_scheduled_for ON broadcast_messages(scheduled_for);
CREATE INDEX idx_broadcast_messages_sender_id ON broadcast_messages(sender_id);

CREATE INDEX idx_message_attachments_message_id ON message_attachments(message_id);
CREATE INDEX idx_message_attachments_scan_result ON message_attachments(scan_result);

CREATE INDEX idx_user_notification_preferences_user_id ON user_notification_preferences(user_id);

-- Enable Row Level Security
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE broadcast_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_notification_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies for messages
CREATE POLICY "Users can view their own messages" ON messages
    FOR SELECT USING (auth.uid() = recipient_id);

CREATE POLICY "Users can update read status of their messages" ON messages
    FOR UPDATE USING (auth.uid() = recipient_id)
    WITH CHECK (auth.uid() = recipient_id);

-- RLS Policies for message_templates (admin only for now)
CREATE POLICY "Admins can manage message templates" ON message_templates
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.hacker_level >= 10 -- Admin level
        )
    );

-- RLS Policies for broadcast_messages (admin only)
CREATE POLICY "Admins can manage broadcast messages" ON broadcast_messages
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.hacker_level >= 10 -- Admin level
        )
    );

-- RLS Policies for message_attachments
CREATE POLICY "Users can view attachments of their messages" ON message_attachments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM messages 
            WHERE messages.id = message_attachments.message_id 
            AND messages.recipient_id = auth.uid()
        )
    );

-- RLS Policies for user_notification_preferences
CREATE POLICY "Users can manage their own notification preferences" ON user_notification_preferences
    FOR ALL USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Create functions for message management

-- Function to mark message as read
CREATE OR REPLACE FUNCTION mark_message_as_read(message_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE messages 
    SET is_read = true, 
        read_at = NOW(),
        updated_at = NOW()
    WHERE id = message_id 
    AND recipient_id = auth.uid()
    AND is_read = false;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get unread message count
CREATE OR REPLACE FUNCTION get_unread_message_count(user_id UUID DEFAULT auth.uid())
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)
        FROM messages 
        WHERE recipient_id = user_id 
        AND is_read = false
        AND (expires_at IS NULL OR expires_at > NOW())
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to send message to user
CREATE OR REPLACE FUNCTION send_message_to_user(
    p_recipient_id UUID,
    p_title VARCHAR(255),
    p_content TEXT,
    p_message_type VARCHAR(50) DEFAULT 'info',
    p_priority VARCHAR(20) DEFAULT 'normal',
    p_category VARCHAR(50) DEFAULT 'general',
    p_sender_name VARCHAR(100) DEFAULT NULL,
    p_scheduled_for TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    p_expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    message_id UUID;
BEGIN
    INSERT INTO messages (
        recipient_id,
        title,
        content,
        message_type,
        priority,
        category,
        sender_id,
        sender_name,
        scheduled_for,
        expires_at
    ) VALUES (
        p_recipient_id,
        p_title,
        p_content,
        p_message_type,
        p_priority,
        p_category,
        auth.uid(),
        COALESCE(p_sender_name, 'System'),
        p_scheduled_for,
        p_expires_at
    ) RETURNING id INTO message_id;
    
    RETURN message_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create default notification preferences for new users
CREATE OR REPLACE FUNCTION create_default_notification_preferences()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_notification_preferences (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create default notification preferences for new users
CREATE TRIGGER trigger_create_default_notification_preferences
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION create_default_notification_preferences();

-- Create view for message statistics (with proper security)
CREATE VIEW message_statistics AS
SELECT 
    recipient_id,
    COUNT(*) as total_messages,
    COUNT(*) FILTER (WHERE is_read = false) as unread_messages,
    COUNT(*) FILTER (WHERE message_type = 'info') as info_messages,
    COUNT(*) FILTER (WHERE message_type = 'warning') as warning_messages,
    COUNT(*) FILTER (WHERE message_type = 'error') as error_messages,
    COUNT(*) FILTER (WHERE message_type = 'success') as success_messages,
    COUNT(*) FILTER (WHERE message_type = 'announcement') as announcement_messages,
    COUNT(*) FILTER (WHERE priority = 'urgent') as urgent_messages,
    COUNT(*) FILTER (WHERE priority = 'high') as high_priority_messages,
    MAX(created_at) as last_message_at
FROM messages
WHERE (expires_at IS NULL OR expires_at > NOW())
  AND recipient_id = auth.uid() -- Only show stats for current user
GROUP BY recipient_id;

-- Insert some default message templates
INSERT INTO message_templates (name, description, title_template, content_template, message_type, category, variables) VALUES
('Welcome Message', 'Welcome message for new users', 'Welcome to the System, {{user_name}}!', 'Hello {{user_name}},\n\nWelcome to our hacker registration system! Your account has been successfully created.\n\nYour user ID: {{user_id}}\nRegistration date: {{registration_date}}\n\nGet started by exploring the system and discovering hidden features.\n\nHappy hacking!\n\nThe System', 'success', 'system', '["user_name", "user_id", "registration_date"]'),

('Security Alert', 'Security alert template', 'Security Alert: {{alert_type}}', 'SECURITY ALERT\n\nAlert Type: {{alert_type}}\nDetected at: {{detection_time}}\nUser: {{user_name}}\nIP Address: {{ip_address}}\n\nDetails:\n{{alert_details}}\n\nIf this was not you, please change your password immediately and contact support.\n\nStay secure!\nSecurity Team', 'warning', 'security', '["alert_type", "detection_time", "user_name", "ip_address", "alert_details"]'),

('System Maintenance', 'System maintenance notification', 'Scheduled Maintenance: {{maintenance_date}}', 'SYSTEM MAINTENANCE NOTICE\n\nScheduled maintenance will occur on {{maintenance_date}} from {{start_time}} to {{end_time}}.\n\nDuring this time:\n- The system will be temporarily unavailable\n- All sessions will be terminated\n- Data will be safely preserved\n\nMaintenance details:\n{{maintenance_details}}\n\nWe apologize for any inconvenience.\n\nSystem Administration', 'info', 'system', '["maintenance_date", "start_time", "end_time", "maintenance_details"]'),

('Achievement Unlocked', 'Achievement notification template', 'Achievement Unlocked: {{achievement_name}}!', 'CONGRATULATIONS!\n\nYou have unlocked a new achievement: {{achievement_name}}\n\nDescription: {{achievement_description}}\nPoints earned: {{points_earned}}\nNew level: {{new_level}}\n\nKeep exploring to unlock more achievements and climb the hacker leaderboard!\n\nWell done, {{user_name}}!\n\nThe System', 'success', 'general', '["achievement_name", "achievement_description", "points_earned", "new_level", "user_name"]'),

('Password Reset', 'Password reset confirmation', 'Password Reset Successful', 'Your password has been successfully reset.\n\nReset time: {{reset_time}}\nIP Address: {{ip_address}}\nDevice: {{device_info}}\n\nIf you did not request this password reset, please contact support immediately.\n\nFor security reasons, all active sessions have been terminated. Please log in again with your new password.\n\nSecurity Team', 'info', 'security', '["reset_time", "ip_address", "device_info"]');

-- Create function to clean up expired messages
CREATE OR REPLACE FUNCTION cleanup_expired_messages()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM messages 
    WHERE expires_at IS NOT NULL 
    AND expires_at < NOW() - INTERVAL '30 days'; -- Keep expired messages for 30 days
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Enable RLS on view
ALTER VIEW message_statistics SET (security_barrier = true);

-- Create RLS policy for message_statistics view
CREATE POLICY "Users can only see their own message statistics" ON message_statistics
    FOR SELECT USING (recipient_id = auth.uid());

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON messages TO authenticated;
GRANT ALL ON message_templates TO authenticated;
GRANT ALL ON broadcast_messages TO authenticated;
GRANT ALL ON message_attachments TO authenticated;
GRANT ALL ON user_notification_preferences TO authenticated;
GRANT SELECT ON message_statistics TO authenticated;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION mark_message_as_read(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_unread_message_count(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION send_message_to_user(UUID, VARCHAR(255), TEXT, VARCHAR(50), VARCHAR(20), VARCHAR(50), VARCHAR(100), TIMESTAMP WITH TIME ZONE, TIMESTAMP WITH TIME ZONE) TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_expired_messages() TO authenticated;