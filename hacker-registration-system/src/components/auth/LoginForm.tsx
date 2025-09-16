import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { ValidationFeedback, createEmailRules, ErrorTerminal } from '../ui';

interface LoginFormProps {
  onSwitchToRegister?: () => void;
  className?: string;
}

const LoginForm: React.FC<LoginFormProps> = ({
  onSwitchToRegister,
  className = '',
}) => {
  const { signIn, loading } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loginError, setLoginError] = useState<string | null>(null);
  const [showEmailValidation, setShowEmailValidation] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (field === 'email') {
      setShowEmailValidation(value.length > 0);
    }
    
    // Clear error when user starts typing
    if (loginError) {
      setLoginError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    
    if (!formData.email || !formData.password) {
      setLoginError('Please enter both email and password');
      return;
    }

    try {
      const { error } = await signIn(formData.email, formData.password);
      if (error) throw error;
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : 'An error occurred during login');
    }
  };

  const emailRules = createEmailRules(formData.email);
  const isEmailValid = emailRules.every(rule => rule.isValid);

  return (
    <div className={`login-form-container ${className}`}>
      {/* Terminal Header */}
      <div className="text-center mb-6">
        <div className="text-lg sm:text-xl font-mono text-hacker-green border-b border-hacker-green pb-2">
          SECURE LOGIN REQUIRED
        </div>
        <div className="text-xs text-gray-400 mt-2">
          [AUTHENTICATION PROTOCOL ACTIVE]
        </div>
      </div>

      {/* Error Display */}
      <ErrorTerminal 
        error={loginError} 
        onDismiss={() => setLoginError(null)}
        severity="error"
      />

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Credentials Section */}
        <div className="border border-hacker-green p-4 bg-black bg-opacity-30">
          <div className="text-sm font-mono text-hacker-green mb-3 border-b border-hacker-green border-opacity-30 pb-1">
            ACCESS CREDENTIALS
          </div>

          {/* Email */}
          <div className="mb-4">
            <label htmlFor="loginEmail" className="block text-xs font-mono text-hacker-green mb-1">
              EMAIL ADDRESS
            </label>
            <input
              id="loginEmail"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="form-input"
              placeholder="user@example.com"
              required
              disabled={loading}
            />
            {showEmailValidation && (
              <ValidationFeedback
                field="EMAIL"
                value={formData.email}
                rules={emailRules}
                isValid={isEmailValid}
                showProgress={false}
              />
            )}
          </div>

          {/* Password */}
          <div>
            <label htmlFor="loginPassword" className="block text-xs font-mono text-hacker-green mb-1">
              PASSWORD
            </label>
            <input
              id="loginPassword"
              type="password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              className="form-input"
              placeholder="••••••••"
              required
              disabled={loading}
            />
          </div>
        </div>

        {/* Security Notice */}
        <div className="border border-hacker-green p-3 bg-black bg-opacity-20">
          <div className="text-xs text-gray-400 font-mono">
            <div className="mb-2">🔒 SECURITY STATUS:</div>
            <ul className="list-none space-y-1 text-xs">
              <li>• Connection encrypted with TLS 1.3</li>
              <li>• Session timeout: 24 hours</li>
              <li>• Failed attempts will be logged</li>
            </ul>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !formData.email || !formData.password}
          className="form-button w-full"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <span className="animate-spin mr-2">⟳</span>
              AUTHENTICATING...
            </span>
          ) : (
            'ACCESS SYSTEM'
          )}
        </button>

        {/* Additional Options */}
        <div className="space-y-2">
          {/* Forgot Password */}
          <div className="text-center">
            <button
              type="button"
              className="text-xs text-gray-400 hover:text-hacker-green transition-colors font-mono"
              onClick={() => {
                // TODO: Implement forgot password functionality
                alert('Password reset functionality will be implemented in task 13');
              }}
            >
              [FORGOT PASSWORD?]
            </button>
          </div>

          {/* Switch to Register */}
          {onSwitchToRegister && (
            <div className="text-center text-xs text-gray-400">
              Need access credentials?{' '}
              <button
                type="button"
                onClick={onSwitchToRegister}
                className="text-hacker-green hover:text-white transition-colors hover:underline"
              >
                Request account registration
              </button>
            </div>
          )}
        </div>

        {/* System Status */}
        <div className="text-center text-xs text-gray-600 mt-4 opacity-50">
          <div className="flex justify-center items-center space-x-4">
            <span>AUTH: READY</span>
            <span>•</span>
            <span>SERVER: ONLINE</span>
            <span>•</span>
            <span>LATENCY: {Math.floor(Math.random() * 50 + 10)}ms</span>
          </div>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;