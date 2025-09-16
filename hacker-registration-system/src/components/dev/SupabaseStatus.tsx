import React, { useState, useEffect } from 'react';
import { isSupabaseConfigured } from '../../lib/supabase';

// Import the test functions individually to avoid interface import issues
import { 
  runFullTest, 
  quickHealthCheck,
  type ConnectionTestResult 
} from '../../utils/supabaseTest';

interface SupabaseStatusProps {
  showDetails?: boolean;
}

export const SupabaseStatus: React.FC<SupabaseStatusProps> = ({ showDetails = false }) => {
  const [isHealthy, setIsHealthy] = useState<boolean | null>(null);
  const [testResults, setTestResults] = useState<Record<string, ConnectionTestResult> | null>(null);
  const [isRunningTests, setIsRunningTests] = useState(false);

  useEffect(() => {
    // Quick health check on mount
    if (isSupabaseConfigured) {
      quickHealthCheck().then(setIsHealthy);
    } else {
      setIsHealthy(false);
    }
  }, []);

  const runTests = async () => {
    setIsRunningTests(true);
    try {
      const { overall, results } = await runFullTest();
      setIsHealthy(overall);
      setTestResults(results);
    } catch (error) {
      console.error('Test failed:', error);
      setIsHealthy(false);
    } finally {
      setIsRunningTests(false);
    }
  };

  if (!import.meta.env.DEV) {
    return null; // Only show in development
  }

  const getStatusIcon = () => {
    if (isHealthy === null) return '⏳';
    if (!isSupabaseConfigured) return '⚙️';
    return isHealthy ? '✅' : '❌';
  };

  const getStatusText = () => {
    if (isHealthy === null) return 'Checking...';
    if (!isSupabaseConfigured) return 'Not configured';
    return isHealthy ? 'Connected' : 'Connection failed';
  };

  const getStatusColor = () => {
    if (isHealthy === null) return 'text-yellow-400';
    if (!isSupabaseConfigured) return 'text-orange-400';
    return isHealthy ? 'text-green-400' : 'text-red-400';
  };

  return (
    <div className="fixed bottom-4 right-4 bg-black/90 border border-green-500/30 rounded p-3 font-mono text-sm z-50">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-green-400">SUPABASE:</span>
        <span className={getStatusColor()}>
          {getStatusIcon()} {getStatusText()}
        </span>
      </div>

      {!isSupabaseConfigured && (
        <div className="text-orange-400 text-xs mb-2">
          ⚠️ Update .env: VITE_DOG & VITE_CAT
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={runTests}
          disabled={isRunningTests || !isSupabaseConfigured}
          className="px-2 py-1 bg-green-500/20 text-green-400 border border-green-500/30 rounded text-xs hover:bg-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isRunningTests ? 'Testing...' : 'Test DB'}
        </button>
        
        {showDetails && testResults && (
          <button
            onClick={() => console.log('Supabase Test Results:', testResults)}
            className="px-2 py-1 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded text-xs hover:bg-blue-500/30"
          >
            Log Results
          </button>
        )}
      </div>

      {showDetails && testResults && (
        <div className="mt-2 text-xs space-y-1">
          {Object.entries(testResults).map(([name, result]) => (
            <div key={name} className="flex items-center gap-2">
              <span className={result.success ? 'text-green-400' : 'text-red-400'}>
                {result.success ? '✅' : '❌'}
              </span>
              <span className="text-gray-300">{name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SupabaseStatus;