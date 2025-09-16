import React, { useEffect, useState } from 'react';

interface ValidationRule {
  id: string;
  label: string;
  isValid: boolean;
  severity?: 'error' | 'warning' | 'success';
}

interface ValidationFeedbackProps {
  field: string;
  value: string;
  rules: ValidationRule[];
  isValid: boolean;
  showOnFocus?: boolean;
  showProgress?: boolean;
  className?: string;
}

const ValidationFeedback: React.FC<ValidationFeedbackProps> = ({
  field,
  value,
  rules,
  isValid,
  showOnFocus = true,
  showProgress = true,
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    if (value.length > 0) {
      setHasInteracted(true);
      setIsVisible(true);
    } else if (!showOnFocus) {
      setIsVisible(false);
      setHasInteracted(false);
    }
  }, [value, showOnFocus]);

  const handleFocus = () => {
    if (showOnFocus) {
      setIsVisible(true);
    }
  };

  const handleBlur = () => {
    if (showOnFocus && value.length === 0) {
      setIsVisible(false);
    }
  };

  if (!isVisible && !hasInteracted) {
    return null;
  }

  const validRules = rules.filter(rule => rule.isValid);
  const invalidRules = rules.filter(rule => !rule.isValid);
  const progressPercentage = (validRules.length / rules.length) * 100;

  const getFieldIcon = () => {
    if (value.length === 0) return '⚪';
    return isValid ? '✅' : '❌';
  };

  const getOverallStatus = () => {
    if (value.length === 0) return 'PENDING';
    return isValid ? 'VALID' : 'INVALID';
  };

  const getStatusColor = () => {
    if (value.length === 0) return 'text-gray-400';
    return isValid ? 'text-hacker-green' : 'text-hacker-red';
  };

  return (
    <div
      className={`validation-feedback mt-2 ${className}`}
      onFocus={handleFocus}
      onBlur={handleBlur}
    >
      {/* Main Status Display */}
      <div className={`flex items-center space-x-2 text-sm font-mono ${getStatusColor()}`}>
        <span className="text-lg">{getFieldIcon()}</span>
        <span className="uppercase tracking-wider">
          {field} - {getOverallStatus()}
        </span>
      </div>

      {/* Progress Bar */}
      {showProgress && hasInteracted && (
        <div className="mt-2">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>VALIDATION PROGRESS</span>
            <span>{Math.round(progressPercentage)}%</span>
          </div>
          <div className="h-1 bg-gray-800 border border-gray-600">
            <div
              className={`h-full transition-all duration-300 ${
                isValid ? 'bg-hacker-green' : 'bg-yellow-500'
              }`}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      )}

      {/* Detailed Rules */}
      {hasInteracted && (
        <div className="mt-3 space-y-1">
          {/* Valid Rules */}
          {validRules.map((rule) => (
            <ValidationRuleItem
              key={rule.id}
              rule={rule}
              status="valid"
            />
          ))}

          {/* Invalid Rules */}
          {invalidRules.map((rule) => (
            <ValidationRuleItem
              key={rule.id}
              rule={rule}
              status="invalid"
            />
          ))}
        </div>
      )}

      {/* Terminal-style Summary */}
      {hasInteracted && (
        <div className="mt-3 p-2 border border-gray-600 bg-black bg-opacity-50 text-xs font-mono">
          <div className="flex justify-between">
            <span className="text-gray-400">CHECKS PASSED:</span>
            <span className="text-hacker-green">{validRules.length}/{rules.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">FIELD STATUS:</span>
            <span className={getStatusColor()}>{getOverallStatus()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">TIMESTAMP:</span>
            <span className="text-gray-500">
              {new Date().toLocaleTimeString('en-US', { hour12: false })}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

interface ValidationRuleItemProps {
  rule: ValidationRule;
  status: 'valid' | 'invalid';
}

const ValidationRuleItem: React.FC<ValidationRuleItemProps> = ({ rule, status }) => {
  const getIcon = () => {
    switch (status) {
      case 'valid':
        return '✓';
      case 'invalid':
        return rule.severity === 'warning' ? '⚠' : '✗';
      default:
        return '○';
    }
  };

  const getColor = () => {
    if (status === 'valid') return 'text-hacker-green';
    if (rule.severity === 'warning') return 'text-yellow-400';
    return 'text-hacker-red';
  };

  const getAnimation = () => {
    if (status === 'valid') return 'animate-pulse-glow';
    if (status === 'invalid' && rule.severity !== 'warning') return 'animate-shake';
    return '';
  };

  return (
    <div className={`flex items-center space-x-2 text-xs font-mono ${getColor()} ${getAnimation()}`}>
      <span className="w-4 text-center">{getIcon()}</span>
      <span className="flex-1">{rule.label}</span>
      <span className="text-gray-500 text-xs">
        [{status.toUpperCase()}]
      </span>
    </div>
  );
};

// Utility function to create common validation rules
export const createPasswordRules = (password: string): ValidationRule[] => {
  return [
    {
      id: 'length',
      label: 'At least 8 characters',
      isValid: password.length >= 8,
      severity: 'error',
    },
    {
      id: 'uppercase',
      label: 'Contains uppercase letter',
      isValid: /[A-Z]/.test(password),
      severity: 'warning',
    },
    {
      id: 'lowercase',
      label: 'Contains lowercase letter',
      isValid: /[a-z]/.test(password),
      severity: 'warning',
    },
    {
      id: 'number',
      label: 'Contains number',
      isValid: /\d/.test(password),
      severity: 'warning',
    },
    {
      id: 'special',
      label: 'Contains special character',
      isValid: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
      severity: 'warning',
    },
  ];
};

export const createEmailRules = (email: string): ValidationRule[] => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  return [
    {
      id: 'format',
      label: 'Valid email format',
      isValid: emailRegex.test(email),
      severity: 'error',
    },
    {
      id: 'length',
      label: 'Reasonable length (5-254 chars)',
      isValid: email.length >= 5 && email.length <= 254,
      severity: 'error',
    },
    {
      id: 'domain',
      label: 'Valid domain extension',
      isValid: email.includes('.') && email.split('.').pop()!.length >= 2,
      severity: 'warning',
    },
  ];
};

export default ValidationFeedback;