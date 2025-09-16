import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface NavigationBarProps {
  className?: string;
  showSystemInfo?: boolean;
}

const NavigationBar: React.FC<NavigationBarProps> = ({
  className = '',
  showSystemInfo = true,
}) => {
  const { user, signOut } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [connectionStatus, setConnectionStatus] = useState<'SECURE' | 'CONNECTING' | 'ERROR'>('SECURE');

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Simulate connection status changes
  useEffect(() => {
    const statusInterval = setInterval(() => {
      const statuses: ('SECURE' | 'CONNECTING' | 'ERROR')[] = ['SECURE', 'CONNECTING', 'ERROR'];
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
      setConnectionStatus(randomStatus);
      
      // Reset to SECURE after a short time if not SECURE
      if (randomStatus !== 'SECURE') {
        setTimeout(() => setConnectionStatus('SECURE'), 2000);
      }
    }, 30000); // Change status every 30 seconds

    return () => clearInterval(statusInterval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SECURE':
        return 'text-hacker-green';
      case 'CONNECTING':
        return 'text-yellow-400';
      case 'ERROR':
        return 'text-hacker-red';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <nav className={`terminal-nav border-b border-hacker-green bg-black bg-opacity-90 ${className}`}>
      <div className="container mx-auto px-4 py-2">
        {/* Top Bar - System Info */}
        {showSystemInfo && (
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs font-terminal space-y-2 sm:space-y-0">
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center">
                <span className="text-gray-400">STATUS:</span>
                <span className={`ml-2 font-mono ${user ? 'text-hacker-green' : 'text-hacker-red'}`}>
                  {user ? 'AUTHENTICATED' : 'UNAUTHENTICATED'}
                </span>
              </div>
              <div className="flex items-center">
                <span className="text-gray-400">CONNECTION:</span>
                <span className={`ml-2 font-mono ${getStatusColor(connectionStatus)}`}>
                  {connectionStatus}
                </span>
              </div>
              <div className="flex items-center">
                <span className="text-gray-400">TIME:</span>
                <span className="ml-2 font-mono text-hacker-green">
                  {currentTime.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: false,
                  })}
                </span>
              </div>
            </div>
            
            {/* User Info */}
            {user && (
              <div className="flex items-center space-x-4">
                <span className="text-gray-400">USER:</span>
                <span className="text-hacker-green font-mono">{user.email}</span>
                <button
                  onClick={() => signOut()}
                  className="text-hacker-red hover:text-red-400 transition-colors font-mono text-xs border border-hacker-red px-2 py-1 hover:bg-hacker-red hover:bg-opacity-20"
                  type="button"
                >
                  LOGOUT
                </button>
              </div>
            )}
          </div>
        )}

        {/* Main Navigation */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-2 pt-2 border-t border-hacker-green border-opacity-30">
          {/* Logo/Brand */}
          <div className="flex items-center space-x-2">
            <span className="text-hacker-green font-mono text-sm">root@hacker-system:</span>
            <span className="text-white font-mono text-sm">~$</span>
            <span className="terminal-cursor"></span>
          </div>

          {/* Navigation Menu */}
          <div className="flex items-center space-x-4 mt-2 sm:mt-0">
            <NavItem href="#" label="HOME" active />
            <NavItem href="#register" label="REGISTER" />
            <NavItem href="#profile" label="PROFILE" disabled={!user} />
            <NavItem href="#admin" label="ADMIN" className="text-hacker-red" />
          </div>
        </div>

        {/* Command Line Simulation */}
        <div className="mt-2 pt-2 border-t border-hacker-green border-opacity-20">
          <div className="flex items-center text-xs font-mono">
            <span className="text-hacker-green">{'>'}</span>
            <span className="ml-2 text-gray-400">Last command:</span>
            <span className="ml-2 text-white">
              {user ? 'auth --status' : 'login --required'}
            </span>
            <span className="ml-auto text-gray-600">
              [{currentTime.toISOString().split('T')[0]}]
            </span>
          </div>
        </div>
      </div>
    </nav>
  );
};

interface NavItemProps {
  href: string;
  label: string;
  active?: boolean;
  disabled?: boolean;
  className?: string;
}

const NavItem: React.FC<NavItemProps> = ({
  href,
  label,
  active = false,
  disabled = false,
  className = '',
}) => {
  const baseClasses = "font-mono text-xs transition-colors border px-2 py-1";
  const activeClasses = active 
    ? "text-black bg-hacker-green border-hacker-green" 
    : "text-hacker-green border-hacker-green hover:bg-hacker-green hover:bg-opacity-20";
  const disabledClasses = disabled 
    ? "text-gray-600 border-gray-600 cursor-not-allowed opacity-50" 
    : "cursor-pointer";

  return (
    <a
      href={disabled ? undefined : href}
      className={`${baseClasses} ${disabled ? disabledClasses : activeClasses} ${className}`}
      onClick={disabled ? (e) => e.preventDefault() : undefined}
    >
      {label}
    </a>
  );
};

export default NavigationBar;