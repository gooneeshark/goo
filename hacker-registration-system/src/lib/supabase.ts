import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Supabase configuration (DOG = Server, CAT = Client)
const supabaseUrl = import.meta.env.VITE_DOG;
const supabaseAnonKey = import.meta.env.VITE_CAT;

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables!');
  console.error('Please check your .env file and ensure you have:');
  console.error('- VITE_DOG (Server URL)');
  console.error('- VITE_CAT (Client Key)');
  console.error('\nSee supabase/setup-instructions.md for setup guide.');
}

// Check if we're using temporary/placeholder values
const isUsingTempCredentials = 
  supabaseUrl?.includes('temp-project') || 
  supabaseAnonKey?.includes('temp-') ||
  !supabaseUrl ||
  !supabaseAnonKey;

if (isUsingTempCredentials && import.meta.env.DEV) {
  console.warn('⚠️  Using temporary Supabase credentials!');
  console.warn('Please set up your Supabase project and update .env file.');
  console.warn('See supabase/setup-instructions.md for setup guide.');
}

// Create Supabase client
export const supabase: SupabaseClient = createClient(
  supabaseUrl || 'https://temp-project.supabase.co',
  supabaseAnonKey || 'temp-key',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    },
    realtime: {
      params: {
        eventsPerSecond: 10
      }
    }
  }
);

// Connection status
export const isSupabaseConfigured = !isUsingTempCredentials;

// Database types
export interface Profile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  hacker_level: number;
  total_score: number;
  created_at: string;
  updated_at: string;
}

export interface ActivityLog {
  id: string;
  user_id: string;
  action_type: string;
  action_details: unknown;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export interface EasterEggProgress {
  id: string;
  user_id: string;
  egg_type: string;
  discovered_at: string;
  score_earned: number;
}