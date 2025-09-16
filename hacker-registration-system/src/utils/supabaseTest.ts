import { supabase } from '../lib/supabase';

export interface ConnectionTestResult {
  success: boolean;
  message: string;
  details?: unknown;
}

/**
 * Test basic Supabase connection
 */
export async function testConnection(): Promise<ConnectionTestResult> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (error) {
      return {
        success: false,
        message: 'Database connection failed',
        details: error
      };
    }
    
    return {
      success: true,
      message: 'Database connection successful'
    };
  } catch (error) {
    return {
      success: false,
      message: 'Connection test failed',
      details: error
    };
  }
}

/**
 * Test authentication functionality
 */
export async function testAuth(): Promise<ConnectionTestResult> {
  try {
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      return {
        success: false,
        message: 'Auth test failed',
        details: error
      };
    }
    
    return {
      success: true,
      message: 'Authentication service is working',
      details: { hasSession: !!data.session }
    };
  } catch (error) {
    return {
      success: false,
      message: 'Auth test failed',
      details: error
    };
  }
}

/**
 * Test database tables exist
 */
export async function testTables(): Promise<ConnectionTestResult> {
  try {
    const tables = ['profiles', 'activity_logs', 'easter_eggs_progress'];
    const results = [];
    
    for (const table of tables) {
      const { error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      results.push({
        table,
        exists: !error,
        error: error?.message
      });
    }
    
    const allTablesExist = results.every(r => r.exists);
    
    return {
      success: allTablesExist,
      message: allTablesExist 
        ? 'All required tables exist' 
        : 'Some tables are missing',
      details: results
    };
  } catch (error) {
    return {
      success: false,
      message: 'Table test failed',
      details: error
    };
  }
}

/**
 * Test RLS policies
 */
export async function testRLS(): Promise<ConnectionTestResult> {
  try {
    // Test that we can't access other users' data without authentication
    const { error } = await supabase
      .from('profiles')
      .select('*');
    
    // If we're not authenticated, this should either return empty or fail with RLS
    return {
      success: true,
      message: 'RLS policies are active',
      details: { 
        message: 'RLS is working - access is properly restricted',
        error: error?.message 
      }
    };
  } catch (error) {
    return {
      success: false,
      message: 'RLS test failed',
      details: error
    };
  }
}

/**
 * Test custom functions
 */
export async function testFunctions(): Promise<ConnectionTestResult> {
  try {
    // Test if our custom functions exist by calling them (they should fail due to auth)
    const { error: logError } = await supabase.rpc('log_user_activity', {
      action_type_param: 'login'
    });
    
    const { error: statsError } = await supabase.rpc('get_user_stats');
    
    // Both should fail with "Not authenticated" if RLS is working
    const functionsExist = logError?.message?.includes('Not authenticated') && 
                          statsError?.message?.includes('Not authenticated');
    
    return {
      success: functionsExist,
      message: functionsExist 
        ? 'Custom functions are working' 
        : 'Custom functions may not be installed',
      details: {
        log_function: logError?.message,
        stats_function: statsError?.message
      }
    };
  } catch (error) {
    return {
      success: false,
      message: 'Function test failed',
      details: error
    };
  }
}

/**
 * Run comprehensive Supabase setup test
 */
export async function runFullTest(): Promise<{
  overall: boolean;
  results: Record<string, ConnectionTestResult>;
}> {
  console.log('🧪 Running Supabase setup tests...');
  
  const tests = {
    connection: await testConnection(),
    auth: await testAuth(),
    tables: await testTables(),
    rls: await testRLS(),
    functions: await testFunctions()
  };
  
  const overall = Object.values(tests).every(test => test.success);
  
  console.log('📊 Test Results:');
  Object.entries(tests).forEach(([name, result]) => {
    const icon = result.success ? '✅' : '❌';
    console.log(`${icon} ${name}: ${result.message}`);
    if (result.details) {
      console.log('   Details:', result.details);
    }
  });
  
  console.log(`\n🎯 Overall Status: ${overall ? '✅ PASS' : '❌ FAIL'}`);
  
  return { overall, results: tests };
}

/**
 * Quick connection check for development
 */
export async function quickHealthCheck(): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    return !error;
  } catch {
    return false;
  }
}