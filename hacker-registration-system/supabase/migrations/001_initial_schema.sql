-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    display_name VARCHAR(100),
    avatar_url VARCHAR(500),
    bio TEXT,
    hacker_level INTEGER DEFAULT 1 CHECK (hacker_level >= 1 AND hacker_level <= 100),
    total_score INTEGER DEFAULT 0 CHECK (total_score >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create activity_logs table
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    action_type VARCHAR(50) NOT NULL CHECK (action_type IN ('login', 'logout', 'register', 'profile_update', 'easter_egg', 'vulnerability_found', 'admin_access', 'scan_attempt')),
    action_details JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create easter_eggs_progress table
CREATE TABLE IF NOT EXISTS easter_eggs_progress (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    egg_type VARCHAR(50) NOT NULL CHECK (egg_type IN ('konami_code', 'hidden_admin', 'fake_vuln_scan', 'sql_injection_attempt', 'hidden_command', 'source_code_secret')),
    discovered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    score_earned INTEGER DEFAULT 0 CHECK (score_earned >= 0),
    UNIQUE(user_id, egg_type)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action_type ON activity_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_easter_eggs_progress_user_id ON easter_eggs_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_easter_eggs_progress_egg_type ON easter_eggs_progress(egg_type);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for profiles table
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, display_name, hacker_level, total_score)
    VALUES (NEW.id, NEW.email, 1, 0);
    
    -- Log the registration
    INSERT INTO public.activity_logs (user_id, action_type, action_details, ip_address)
    VALUES (NEW.id, 'register', '{"method": "email"}', NULL);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();