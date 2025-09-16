-- Migration: 003_add_functions.sql
-- Adds RPC functions used by the frontend: log_user_activity, discover_easter_egg, get_user_stats

-- Create a function to log user activities (can be called from client)
CREATE OR REPLACE FUNCTION public.log_user_activity(
    action_type_param VARCHAR(50),
    action_details_param JSONB DEFAULT '{}',
    ip_address_param INET DEFAULT NULL,
    user_agent_param TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    log_id UUID;
BEGIN
    -- Only allow if user is authenticated
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;
    
    -- Validate action_type
    IF action_type_param NOT IN ('login', 'logout', 'register', 'profile_update', 'easter_egg', 'vulnerability_found', 'admin_access', 'scan_attempt') THEN
        RAISE EXCEPTION 'Invalid action type';
    END IF;
    
    INSERT INTO public.activity_logs (user_id, action_type, action_details, ip_address, user_agent)
    VALUES (auth.uid(), action_type_param, action_details_param, ip_address_param, user_agent_param)
    RETURNING id INTO log_id;
    
    RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to record easter egg discovery
CREATE OR REPLACE FUNCTION public.discover_easter_egg(
    egg_type_param VARCHAR(50),
    score_earned_param INTEGER DEFAULT 10
)
RETURNS UUID AS $$
DECLARE
    progress_id UUID;
    current_score INTEGER;
BEGIN
    -- Only allow if user is authenticated
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;
    
    -- Validate egg_type
    IF egg_type_param NOT IN ('konami_code', 'hidden_admin', 'fake_vuln_scan', 'sql_injection_attempt', 'hidden_command', 'source_code_secret') THEN
        RAISE EXCEPTION 'Invalid easter egg type';
    END IF;
    
    -- Check if already discovered (unique constraint will prevent duplicates)
    INSERT INTO public.easter_eggs_progress (user_id, egg_type, score_earned)
    VALUES (auth.uid(), egg_type_param, score_earned_param)
    ON CONFLICT (user_id, egg_type) DO NOTHING
    RETURNING id INTO progress_id;
    
    -- If successfully inserted (not a duplicate), update user's total score
    IF progress_id IS NOT NULL THEN
        UPDATE public.profiles 
        SET total_score = total_score + score_earned_param,
            hacker_level = LEAST(100, GREATEST(1, (total_score + score_earned_param) / 100 + 1))
        WHERE id = auth.uid();
        
        -- Log the easter egg discovery
        PERFORM public.log_user_activity(
            'easter_egg',
            jsonb_build_object('egg_type', egg_type_param, 'score_earned', score_earned_param)
        );
    END IF;
    
    RETURN progress_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to get user stats (for dashboard)
CREATE OR REPLACE FUNCTION public.get_user_stats()
RETURNS TABLE (
    profile_data JSONB,
    total_easter_eggs INTEGER,
    recent_activities JSONB
) AS $$
BEGIN
    -- Only allow if user is authenticated
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;
    
    RETURN QUERY
    SELECT 
        to_jsonb(p.*) as profile_data,
        COALESCE(egg_count.total, 0) as total_easter_eggs,
        COALESCE(recent_logs.activities, '[]'::jsonb) as recent_activities
    FROM public.profiles p
    LEFT JOIN (
        SELECT user_id, COUNT(*) as total
        FROM public.easter_eggs_progress
        WHERE user_id = auth.uid()
        GROUP BY user_id
    ) egg_count ON p.id = egg_count.user_id
    LEFT JOIN (
        SELECT user_id, jsonb_agg(
            jsonb_build_object(
                'action_type', action_type,
                'action_details', action_details,
                'created_at', created_at
            ) ORDER BY created_at DESC
        ) as activities
        FROM (
            SELECT user_id, action_type, action_details, created_at
            FROM public.activity_logs
            WHERE user_id = auth.uid()
            ORDER BY created_at DESC
            LIMIT 10
        ) recent
        GROUP BY user_id
    ) recent_logs ON p.id = recent_logs.user_id
    WHERE p.id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
