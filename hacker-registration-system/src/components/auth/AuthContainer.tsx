import React, { useState } from 'react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

type AuthMode = 'login' | 'register';

interface AuthContainerProps {
  initialMode?: AuthMode;
  className?: string;
}

const AuthContainer: React.FC<AuthContainerProps> = ({
  initialMode = 'login',
  className = '',
}) => {
  const [mode, setMode] = useState<AuthMode>(initialMode);

  const switchToLogin = () => setMode('login');
  const switchToRegister = () => setMode('register');

  return (
    <div className={`auth-container ${className}`}>
      {/* Mode Indicator */}
      <div className="flex justify-center mb-6">
        <div className="flex border border-hacker-green bg-black bg-opacity-50">
          <button
            onClick={switchToLogin}
            className={`px-4 py-2 text-xs font-mono transition-colors ${
              mode === 'login'
                ? 'bg-hacker-green text-black'
                : 'text-hacker-green hover:bg-hacker-green hover:bg-opacity-20'
            }`}
            type="button"
          >
            LOGIN
          </button>
          <button
            onClick={switchToRegister}
            className={`px-4 py-2 text-xs font-mono transition-colors ${
              mode === 'register'
                ? 'bg-hacker-green text-black'
                : 'text-hacker-green hover:bg-hacker-green hover:bg-opacity-20'
            }`}
            type="button"
          >
            REGISTER
          </button>
        </div>
      </div>

      {/* Form Container */}
      <div className="form-container">
        {mode === 'login' ? (
          <LoginForm onSwitchToRegister={switchToRegister} />
        ) : (
          <RegisterForm onSwitchToLogin={switchToLogin} />
        )}
      </div>

      {/* Terminal Command Line */}
      <div className="mt-6 text-center">
        <div className="text-xs font-mono text-gray-500">
          <span className="text-hacker-green">root@hacker-system:</span>
          <span className="text-white">~$ </span>
          <span className="text-gray-400">
            {mode === 'login' ? 'authenticate --user' : 'useradd --create-home'}
          </span>
          <span className="terminal-cursor ml-1"></span>
        </div>
      </div>
    </div>
  );
};

export default AuthContainer;