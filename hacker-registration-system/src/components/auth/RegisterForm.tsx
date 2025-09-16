import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { ValidationFeedback, createPasswordRules, createEmailRules, ErrorTerminal } from '../ui';

interface RegisterFormProps {
  onSwitchToLogin?: () => void;
  className?: string;
}

const RegisterForm: React.FC<RegisterFormProps> = ({
  onSwitchToLogin,
  className = '',
}) => {
  const { signUp, loading } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [showValidation, setShowValidation] = useState<Record<string, boolean>>({});

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear field-specific error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    
    // Show validation for the field being edited
    setShowValidation(prev => ({ ...prev, [field]: true }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Email validation
    const emailRules = createEmailRules(formData.email);
    const emailValid = emailRules.every(rule => rule.isValid);
    if (!emailValid) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    const passwordRules = createPasswordRules(formData.password);
    const passwordValid = passwordRules.every(rule => rule.isValid);
    if (!passwordValid) {
      newErrors.password = 'Password does not meet requirements';
    }

    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Name validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError(null);

    if (!validateForm()) {
      setRegisterError('Please fix the errors above');
      return;
    }

    try {
      const { error } = await signUp(
        formData.email,
        formData.password,
        {
          first_name: formData.firstName,
          last_name: formData.lastName,
        }
      );

      if (error) throw error;

      // Success - user will be redirected by AuthContext
    } catch (err) {
      setRegisterError(err instanceof Error ? err.message : 'Registration failed');
    }
  };

  const emailRules = createEmailRules(formData.email);
  const passwordRules = createPasswordRules(formData.password);
  const isEmailValid = emailRules.every(rule => rule.isValid);
  const isPasswordValid = passwordRules.every(rule => rule.isValid);
  const isConfirmPasswordValid = formData.password === formData.confirmPassword && formData.confirmPassword.length > 0;

  return (
    <div className={`register-form-container ${className}`}>
      {/* Terminal Header */}
      <div className="text-center mb-6">
        <div className="text-lg sm:text-xl font-mono text-hacker-green border-b border-hacker-green pb-2">
          SYSTEM REGISTRATION
        </div>
        <div className="text-xs text-gray-400 mt-2">
          [SECURE CHANNEL ESTABLISHED]
        </div>
      </div>

      {/* Error Display */}
      <ErrorTerminal 
        error={registerError} 
        onDismiss={() => setRegisterError(null)}
        severity="error"
      />

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Personal Information Section */}
        <div className="border border-hacker-green p-4 bg-black bg-opacity-30">
          <div className="text-sm font-mono text-hacker-green mb-3 border-b border-hacker-green border-opacity-30 pb-1">
            PERSONAL INFORMATION
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* First Name */}
            <div>
              <label htmlFor="firstName" className="block text-xs font-mono text-hacker-green mb-1">
                FIRST NAME *
              </label>
              <input
                id="firstName"
                type="text"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                className={`form-input ${errors.firstName ? 'border-hacker-red' : ''}`}
                placeholder="Enter first name"
                required
                disabled={loading}
              />
              {errors.firstName && (
                <div className="text-hacker-red text-xs mt-1 font-mono">
                  ❌ {errors.firstName}
                </div>
              )}
            </div>

            {/* Last Name */}
            <div>
              <label htmlFor="lastName" className="block text-xs font-mono text-hacker-green mb-1">
                LAST NAME *
              </label>
              <input
                id="lastName"
                type="text"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                className={`form-input ${errors.lastName ? 'border-hacker-red' : ''}`}
                placeholder="Enter last name"
                required
                disabled={loading}
              />
              {errors.lastName && (
                <div className="text-hacker-red text-xs mt-1 font-mono">
                  ❌ {errors.lastName}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Account Credentials Section */}
        <div className="border border-hacker-green p-4 bg-black bg-opacity-30">
          <div className="text-sm font-mono text-hacker-green mb-3 border-b border-hacker-green border-opacity-30 pb-1">
            ACCOUNT CREDENTIALS
          </div>

          {/* Email */}
          <div className="mb-4">
            <label htmlFor="email" className="block text-xs font-mono text-hacker-green mb-1">
              EMAIL ADDRESS *
            </label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={`form-input ${errors.email ? 'border-hacker-red' : ''}`}
              placeholder="user@example.com"
              required
              disabled={loading}
            />
            {showValidation.email && (
              <ValidationFeedback
                field="EMAIL"
                value={formData.email}
                rules={emailRules}
                isValid={isEmailValid}
                showProgress={true}
              />
            )}
          </div>

          {/* Password */}
          <div className="mb-4">
            <label htmlFor="password" className="block text-xs font-mono text-hacker-green mb-1">
              PASSWORD *
            </label>
            <input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              className={`form-input ${errors.password ? 'border-hacker-red' : ''}`}
              placeholder="••••••••"
              required
              disabled={loading}
            />
            {showValidation.password && (
              <ValidationFeedback
                field="PASSWORD"
                value={formData.password}
                rules={passwordRules}
                isValid={isPasswordValid}
                showProgress={true}
              />
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-xs font-mono text-hacker-green mb-1">
              CONFIRM PASSWORD *
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              className={`form-input ${errors.confirmPassword ? 'border-hacker-red' : ''}`}
              placeholder="••••••••"
              required
              disabled={loading}
            />
            {formData.confirmPassword && (
              <div className={`mt-2 text-xs font-mono flex items-center ${
                isConfirmPasswordValid ? 'text-hacker-green' : 'text-hacker-red'
              }`}>
                <span className="mr-2">
                  {isConfirmPasswordValid ? '✓' : '✗'}
                </span>
                <span>
                  PASSWORD CONFIRMATION - {isConfirmPasswordValid ? 'MATCH' : 'NO MATCH'}
                </span>
              </div>
            )}
            {errors.confirmPassword && (
              <div className="text-hacker-red text-xs mt-1 font-mono">
                ❌ {errors.confirmPassword}
              </div>
            )}
          </div>
        </div>

        {/* Terms and Conditions */}
        <div className="border border-hacker-green p-3 bg-black bg-opacity-20">
          <div className="text-xs text-gray-400 font-mono">
            <div className="mb-2">⚠️ SECURITY NOTICE:</div>
            <ul className="list-none space-y-1 text-xs">
              <li>• Your data will be encrypted and stored securely</li>
              <li>• Account activation requires email verification</li>
              <li>• By registering, you agree to our security protocols</li>
            </ul>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !isEmailValid || !isPasswordValid || !isConfirmPasswordValid || !formData.firstName || !formData.lastName}
          className="form-button w-full"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <span className="animate-spin mr-2">⟳</span>
              CREATING ACCOUNT...
            </span>
          ) : (
            'CREATE ACCOUNT'
          )}
        </button>

        {/* Switch to Login */}
        {onSwitchToLogin && (
          <div className="text-center text-xs text-gray-400 mt-4">
            Already have an account?{' '}
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="text-hacker-green hover:text-white transition-colors hover:underline"
            >
              Sign in here
            </button>
          </div>
        )}

        {/* System Status */}
        <div className="text-center text-xs text-gray-600 mt-4 opacity-50">
          <div className="flex justify-center items-center space-x-4">
            <span>SYSTEM: ONLINE</span>
            <span>•</span>
            <span>ENCRYPTION: AES-256</span>
            <span>•</span>
            <span>STATUS: SECURE</span>
          </div>
        </div>
      </form>
    </div>
  );
};

export default RegisterForm;