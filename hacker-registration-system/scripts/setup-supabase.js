#!/usr/bin/env node

/**
 * Supabase Setup Helper Script
 * 
 * This script helps validate and set up the Supabase configuration
 * for the Hacker Registration System.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ENV_FILE = path.join(__dirname, '..', '.env');
const ENV_EXAMPLE_FILE = path.join(__dirname, '..', '.env.example');

function readEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return {};
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  const env = {};
  
  content.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key && valueParts.length > 0) {
        env[key.trim()] = valueParts.join('=').trim();
      }
    }
  });
  
  return env;
}

function validateSupabaseUrl(url) {
  if (!url) return false;
  if (url.includes('temp-project')) return false;
  if (!url.startsWith('https://')) return false;
  if (!url.includes('.supabase.co')) return false;
  return true;
}

function validateSupabaseKey(key) {
  if (!key) return false;
  if (key.includes('temp-')) return false;
  if (!key.startsWith('eyJ')) return false; // JWT tokens start with eyJ
  return key.length > 100; // Supabase keys are quite long
}

function checkSupabaseSetup() {
  console.log('🔍 Checking Supabase configuration...\n');
  
  // Check if .env file exists
  if (!fs.existsSync(ENV_FILE)) {
    console.log('❌ .env file not found!');
    console.log('📝 Creating .env file from .env.example...');
    
    if (fs.existsSync(ENV_EXAMPLE_FILE)) {
      fs.copyFileSync(ENV_EXAMPLE_FILE, ENV_FILE);
      console.log('✅ .env file created');
      console.log('⚠️  Please update it with your Supabase credentials\n');
    } else {
      console.log('❌ .env.example file not found either!');
      return false;
    }
  }
  
  const env = readEnvFile(ENV_FILE);
  
  // Check Supabase URL
  const supabaseUrl = env.VITE_SUPABASE_URL;
  const urlValid = validateSupabaseUrl(supabaseUrl);
  
  console.log(`📡 Supabase URL: ${urlValid ? '✅' : '❌'} ${supabaseUrl || 'Not set'}`);
  
  if (!urlValid) {
    if (!supabaseUrl) {
      console.log('   → URL is not set');
    } else if (supabaseUrl.includes('temp-project')) {
      console.log('   → Using temporary placeholder URL');
    } else {
      console.log('   → URL format is invalid');
    }
  }
  
  // Check Supabase Key
  const supabaseKey = env.VITE_SUPABASE_ANON_KEY;
  const keyValid = validateSupabaseKey(supabaseKey);
  
  console.log(`🔑 Supabase Key: ${keyValid ? '✅' : '❌'} ${keyValid ? 'Valid JWT token' : 'Invalid or placeholder'}`);
  
  if (!keyValid) {
    if (!supabaseKey) {
      console.log('   → Key is not set');
    } else if (supabaseKey.includes('temp-')) {
      console.log('   → Using temporary placeholder key');
    } else {
      console.log('   → Key format is invalid (should be a JWT token)');
    }
  }
  
  console.log('');
  
  if (urlValid && keyValid) {
    console.log('🎉 Supabase configuration looks good!');
    console.log('💡 Run "npm run dev" and check the Supabase Status widget');
    console.log('🧪 Click "Test DB" to verify database connection');
    return true;
  } else {
    console.log('⚠️  Supabase is not properly configured');
    console.log('');
    console.log('📋 Next steps:');
    console.log('1. Create a Supabase project at https://supabase.com');
    console.log('2. Get your project URL and anon key from Settings → API');
    console.log('3. Update your .env file with the real credentials');
    console.log('4. Run the database migrations (see supabase/setup-instructions.md)');
    console.log('5. Run this script again to verify');
    console.log('');
    console.log('📖 See supabase/setup-instructions.md for detailed setup guide');
    return false;
  }
}

function showMigrationInstructions() {
  console.log('');
  console.log('🗄️  Database Migration Instructions:');
  console.log('');
  console.log('Option 1 - Using Supabase Dashboard (Recommended):');
  console.log('1. Go to your Supabase project dashboard');
  console.log('2. Navigate to SQL Editor');
  console.log('3. Copy and paste supabase/migrations/001_initial_schema.sql');
  console.log('4. Click Run');
  console.log('5. Copy and paste supabase/migrations/002_rls_policies.sql');
  console.log('6. Click Run');
  console.log('');
  console.log('Option 2 - Using Supabase CLI:');
  console.log('1. npm install -g supabase');
  console.log('2. supabase login');
  console.log('3. supabase link --project-ref YOUR_PROJECT_REF');
  console.log('4. supabase db push');
}

// Main execution
console.log('🚀 Supabase Setup Helper\n');

const isConfigured = checkSupabaseSetup();

if (!isConfigured) {
  showMigrationInstructions();
}

console.log('');
console.log('🔗 Useful links:');
console.log('• Supabase Dashboard: https://supabase.com/dashboard');
console.log('• Setup Guide: ./supabase/setup-instructions.md');
console.log('• Project README: ./README.md');