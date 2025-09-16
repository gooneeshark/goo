import React, { useEffect, useState } from 'react';

interface ErrorTerminalProps {
  error: string | Error | null;
  severity?: 'warning' | 'error' | 'critical';
  onDismiss?: () => void;
  autoHide?: boolean;
  autoHideDelay?: number;
  showStackTrace?: boolean;
  className?: string;
}

const ErrorTerminal: React.FC<ErrorTerminalProps> = ({
  error,
  severity = 'error',
  onDismiss,
  autoHide = true,
  autoHideDelay = 5000,
  showStackTrace = false,
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [isFlashing, setIsFlashing] = useState(false);

  useEffect(() => {
    if (error) {
      setIsVisible(true);
      
      // Trigger shake animation
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      
      // Trigger flash effect for critical errors
      if (severity === 'critical') {
        setIsFlashing(true);
        setTimeout(() => setIsFlashing(false), 300);
      }

      // Auto-hide functionality
      if (autoHide) {
        const timer = setTimeout(() => {
          handleDismiss();
        }, autoHideDelay);
        
        return () => clearTimeout(timer);
      }
    } else {
      setIsVisible(false);
    }
  }, [error, autoHide, autoHideDelay, severity]);

  const handleDismiss = () => {
    setIsVisible(false);
    if (onDismiss) {
      onDismiss();
    }
  };

  if (!error || !isVisible) {
    return null;
  }

  const errorMessage = error instanceof Error ? error.message : error;
  const errorStack = error instanceof Error ? error.stack : undefined;

  const getSeverityStyles = () => {
    switch (severity) {
      case 'warning':
        return {
          border: 'border-yellow-500',
          bg: 'bg-yellow-900 bg-opacity-20',
          text: 'text-yellow-400',
          icon: '⚠️',
          glow: 'shadow-yellow-500/50',
        };
      case 'critical':
        return {
          border: 'border-red-600',
          bg: 'bg-red-900 bg-opacity-30',
          text: 'text-red-300',
          icon: '💀',
          glow: 'shadow-red-600/50',
        };
      default: // error
        return {
          border: 'border-hacker-red',
          bg: 'bg-red-900 bg-opacity-20',
          text: 'text-hacker-red',
          icon: '❌',
          glow: 'shadow-hacker-red/50',
        };
    }
  };

  const styles = getSeverityStyles();

  return (
    <div
      className={`
        error-terminal fixed top-4 right-4 z-50 max-w-md w-full
        ${styles.border} ${styles.bg} ${styles.text}
        border-2 rounded-none font-terminal text-sm
        shadow-lg ${styles.glow}
        ${isShaking ? 'animate-shake' : ''}
        ${isFlashing ? 'animate-pulse' : ''}
        ${className}
      `}
    >
      {/* Terminal Header */}
      <div className={`flex items-center justify-between p-2 border-b ${styles.border} bg-black bg-opacity-50`}>
        <div className="flex items-center space-x-2">
          <span className="text-lg">{styles.icon}</span>
          <span className="font-mono text-xs uppercase tracking-wider">
            {severity} - SYSTEM ALERT
          </span>
        </div>
        <button
          onClick={handleDismiss}
          className={`${styles.text} hover:text-white transition-colors text-lg leading-none`}
          type="button"
          aria-label="Close error"
        >
          ×
        </button>
      </div>

      {/* Terminal Body */}
      <div className="p-3 space-y-2">
        {/* Timestamp */}
        <div className="text-xs text-gray-400 font-mono">
          [{new Date().toISOString()}]
        </div>

        {/* Error Message */}
        <div className="font-mono text-sm leading-relaxed">
          <span className="text-gray-400">ERROR:</span>
          <span className="ml-2">{errorMessage}</span>
        </div>

        {/* Stack Trace (if enabled and available) */}
        {showStackTrace && errorStack && (
          <details className="mt-2">
            <summary className="cursor-pointer text-xs text-gray-400 hover:text-white">
              Stack Trace
            </summary>
            <pre className="mt-1 text-xs text-gray-500 overflow-x-auto whitespace-pre-wrap">
              {errorStack}
            </pre>
          </details>
        )}

        {/* Terminal-style progress bar for auto-hide */}
        {autoHide && (
          <div className="mt-3">
            <div className={`h-1 ${styles.bg} rounded-none overflow-hidden`}>
              <div
                className={`h-full ${styles.text.replace('text-', 'bg-')} animate-pulse`}
                style={{
                  animation: `shrink ${autoHideDelay}ms linear`,
                }}
              />
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-2 mt-3 pt-2 border-t border-gray-700">
          <button
            onClick={handleDismiss}
            className={`
              px-3 py-1 text-xs font-mono border ${styles.border} ${styles.text}
              hover:bg-opacity-20 transition-colors
              ${styles.text.replace('text-', 'hover:bg-')}
            `}
            type="button"
          >
            DISMISS
          </button>
        </div>
      </div>

      {/* Glitch Effect for Critical Errors */}
      {severity === 'critical' && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="glitch-overlay animate-glitch opacity-30" />
        </div>
      )}
    </div>
  );
};

// CSS for shrink animation (to be added to global styles)
const style = document.createElement('style');
style.textContent = `
  @keyframes shrink {
    from { width: 100%; }
    to { width: 0%; }
  }
  
  .glitch-overlay {
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(255, 0, 0, 0.1) 25%,
      transparent 50%,
      rgba(0, 255, 0, 0.1) 75%,
      transparent 100%
    );
    height: 100%;
    width: 100%;
  }
`;
document.head.appendChild(style);

export default ErrorTerminal;