-- Security fixes for messaging system
-- Created: 2024-01-16
-- Description: Fix security issues with SECURITY DEFINER functions and views

-- Drop and recreate message_statistics view without security definer
DROP VIEW IF EXISTS message_statistics;

-- Create secure message statistics view
CREATE VIEW message_statistics 
WITH (security_barrier = true) AS
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
  AND recipient_id = auth.uid() -- Security: Only current user's data
GROUP BY recipient_id;

-- Enable RLS on the view
ALTER VIEW message_statistics ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for the view
CREATE POLICY "Users can only see their own message statistics" ON message_statistics
    FOR SELECT USING (recipient_id = auth.uid());

-- Update functions to be more secure
-- Drop and recreate get_unread_message_count function with better security
DROP FUNCTION IF EXISTS get_unread_message_count(UUID);

CREATE OR REPLACE FUNCTION get_unread_message_count(user_id UUID DEFAULT auth.uid())
RETURNS INTEGER 
LANGUAGE plpgsql
SECURITY INVOKER -- Changed from SECURITY DEFINER to SECURITY INVOKER
AS $$
BEGIN
    -- Security check: users can only check their own unread count
    IF user_id != auth.uid() THEN
        RAISE EXCEPTION 'Access denied: can only check own message count';
    END IF;
    
    RETURN (
        SELECT COUNT(*)::INTEGER
        FROM messages 
        WHERE recipient_id = user_id 
        AND is_read = false
        AND (expires_at IS NULL OR expires_at > NOW())
    );
END;
$$;

-- Update mark_message_as_read function for better security
DROP FUNCTION IF EXISTS mark_message_as_read(UUID);

CREATE OR REPLACE FUNCTION mark_message_as_read(message_id UUID)
RETURNS BOOLEAN 
LANGUAGE plpgsql
SECURITY INVOKER -- Changed from SECURITY DEFINER to SECURITY INVOKER
AS $$
DECLARE
    message_recipient UUID;
BEGIN
    -- Get the recipient of the message
    SELECT recipient_id INTO message_recipient
    FROM messages 
    WHERE id = message_id;
    
    -- Security check: users can only mark their own messages as read
    IF message_recipient IS NULL THEN
        RAISE EXCEPTION 'Message not found';
    END IF;
    
    IF message_recipient != auth.uid() THEN
        RAISE EXCEPTION 'Access denied: can only mark own messages as read';
    END IF;
    
    -- Update the message
    UPDATE messages 
    SET is_read = true, 
        read_at = NOW(),
        updated_at = NOW()
    WHERE id = message_id 
    AND recipient_id = auth.uid()
    AND is_read = false;
    
    RETURN FOUND;
END;
$$;

-- Update send_message_to_user function with admin check
DROP FUNCTION IF EXISTS send_message_to_user(UUID, VARCHAR(255), TEXT, VARCHAR(50), VARCHAR(20), VARCHAR(50), VARCHAR(100), TIMESTAMP WITH TIME ZONE, TIMESTAMP WITH TIME ZONE);

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
RETURNS UUID 
LANGUAGE plpgsql
SECURITY INVOKER -- Changed from SECURITY DEFINER to SECURITY INVOKER
AS $$
DECLARE
    message_id UUID;
    sender_level INTEGER;
BEGIN
    -- Security check: only admins (hacker_level >= 10) can send messages
    SELECT hacker_level INTO sender_level
    FROM profiles 
    WHERE id = auth.uid();
    
    IF sender_level IS NULL OR sender_level < 10 THEN
        RAISE EXCEPTION 'Access denied: insufficient privileges to send messages';
    END IF;
    
    -- Validate input parameters
    IF p_title IS NULL OR LENGTH(TRIM(p_title)) = 0 THEN
        RAISE EXCEPTION 'Title cannot be empty';
    END IF;
    
    IF p_content IS NULL OR LENGTH(TRIM(p_content)) = 0 THEN
        RAISE EXCEPTION 'Content cannot be empty';
    END IF;
    
    IF p_message_type NOT IN ('info', 'warning', 'error', 'success', 'announcement') THEN
        RAISE EXCEPTION 'Invalid message type';
    END IF;
    
    IF p_priority NOT IN ('low', 'normal', 'high', 'urgent') THEN
        RAISE EXCEPTION 'Invalid priority';
    END IF;
    
    -- Insert the message
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
$$;

-- Create a secure function to get user's own messages
CREATE OR REPLACE FUNCTION get_user_messages(
    p_limit INTEGER DEFAULT 20,
    p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    title VARCHAR(255),
    content TEXT,
    message_type VARCHAR(50),
    priority VARCHAR(20),
    category VARCHAR(50),
    sender_name VARCHAR(100),
    is_read BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE,
    read_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        m.id,
        m.title,
        m.content,
        m.message_type,
        m.priority,
        m.category,
        m.sender_name,
        m.is_read,
        m.created_at,
        m.read_at
    FROM messages m
    WHERE m.recipient_id = auth.uid()
    AND (m.expires_at IS NULL OR m.expires_at > NOW())
    ORDER BY m.created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$;

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
    user_level INTEGER;
BEGIN
    SELECT hacker_level INTO user_level
    FROM profiles 
    WHERE id = auth.uid();
    
    RETURN COALESCE(user_level, 0) >= 10;
END;
$$;

-- Update cleanup function to be admin-only
DROP FUNCTION IF EXISTS cleanup_expired_messages();

CREATE OR REPLACE FUNCTION cleanup_expired_messages()
RETURNS INTEGER 
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Security check: only admins can cleanup messages
    IF NOT is_admin() THEN
        RAISE EXCEPTION 'Access denied: admin privileges required';
    END IF;
    
    DELETE FROM messages 
    WHERE expires_at IS NOT NULL 
    AND expires_at < NOW() - INTERVAL '30 days'; -- Keep expired messages for 30 days
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$;

-- Grant execute permissions on new functions
GRANT EXECUTE ON FUNCTION get_unread_message_count(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION mark_message_as_read(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION send_message_to_user(UUID, VARCHAR(255), TEXT, VARCHAR(50), VARCHAR(20), VARCHAR(50), VARCHAR(100), TIMESTAMP WITH TIME ZONE, TIMESTAMP WITH TIME ZONE) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_messages(INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_expired_messages() TO authenticated;

-- Add additional security constraints
-- Prevent users from inserting messages directly (must use function)
REVOKE INSERT ON messages FROM authenticated;
GRANT INSERT ON messages TO service_role; -- Only service role can insert directly

-- Create trigger to validate message data
CREATE OR REPLACE FUNCTION validate_message_data()
RETURNS TRIGGER AS $$
BEGIN
    -- Validate title length
    IF LENGTH(NEW.title) > 255 THEN
        RAISE EXCEPTION 'Title too long (max 255 characters)';
    END IF;
    
    -- Validate content length
    IF LENGTH(NEW.content) > 10000 THEN
        RAISE EXCEPTION 'Content too long (max 10000 characters)';
    END IF;
    
    -- Ensure sender_name is not empty
    IF NEW.sender_name IS NULL OR LENGTH(TRIM(NEW.sender_name)) = 0 THEN
        NEW.sender_name := 'System';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_validate_message_data ON messages;
CREATE TRIGGER trigger_validate_message_data
    BEFORE INSERT OR UPDATE ON messages
    FOR EACH ROW
    EXECUTE FUNCTION validate_message_data();

-- Add rate limiting for message sending
CREATE TABLE IF NOT EXISTS message_rate_limits (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    messages_sent_today INTEGER DEFAULT 0,
    last_reset_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on rate limits table
ALTER TABLE message_rate_limits ENABLE ROW LEVEL SECURITY;

-- RLS policy for rate limits
CREATE POLICY "Users can view their own rate limits" ON message_rate_limits
    FOR SELECT USING (user_id = auth.uid());

-- Function to check and update rate limits
CREATE OR REPLACE FUNCTION check_message_rate_limit()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
    current_count INTEGER;
    max_daily_messages INTEGER := 100; -- Limit to 100 messages per day per admin
BEGIN
    -- Only check for admins (who can send messages)
    IF NOT is_admin() THEN
        RETURN false;
    END IF;
    
    -- Get or create rate limit record
    INSERT INTO message_rate_limits (user_id, messages_sent_today, last_reset_date)
    VALUES (auth.uid(), 0, CURRENT_DATE)
    ON CONFLICT (user_id) DO UPDATE SET
        messages_sent_today = CASE 
            WHEN message_rate_limits.last_reset_date < CURRENT_DATE THEN 0
            ELSE message_rate_limits.messages_sent_today
        END,
        last_reset_date = CURRENT_DATE,
        updated_at = NOW();
    
    -- Get current count
    SELECT messages_sent_today INTO current_count
    FROM message_rate_limits
    WHERE user_id = auth.uid();
    
    -- Check if under limit
    IF current_count >= max_daily_messages THEN
        RAISE EXCEPTION 'Daily message limit exceeded (% messages per day)', max_daily_messages;
    END IF;
    
    -- Increment counter
    UPDATE message_rate_limits
    SET messages_sent_today = messages_sent_today + 1,
        updated_at = NOW()
    WHERE user_id = auth.uid();
    
    RETURN true;
END;
$$;

-- Grant permissions
GRANT ALL ON message_rate_limits TO authenticated;
GRANT EXECUTE ON FUNCTION check_message_rate_limit() TO authenticated;

-- Add comment for documentation
COMMENT ON VIEW message_statistics IS 'Secure view showing message statistics for the current user only';
COMMENT ON FUNCTION get_unread_message_count(UUID) IS 'Get unread message count for current user only';
COMMENT ON FUNCTION mark_message_as_read(UUID) IS 'Mark message as read (user can only mark their own messages)';
COMMENT ON FUNCTION send_message_to_user IS 'Send message to user (admin only, with rate limiting)';
COMMENT ON FUNCTION is_admin() IS 'Check if current user has admin privileges (hacker_level >= 10)';
COMMENT ON FUNCTION check_message_rate_limit() IS 'Check and enforce daily message sending limits for admins';