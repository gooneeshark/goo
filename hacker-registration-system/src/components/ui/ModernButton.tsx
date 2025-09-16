import React from 'react';

interface ModernButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'ghost' | 'neon';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  fullWidth?: boolean;
  glitch?: boolean;
}

const ModernButton: React.FC<ModernButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  className = '',
  type = 'button',
  fullWidth = false,
  glitch = false,
}) => {
  const baseClasses = `
    relative inline-flex items-center justify-center
    font-mono font-bold uppercase tracking-wider
    transition-all duration-300 ease-in-out
    border-2 rounded-lg
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black
    disabled:opacity-50 disabled:cursor-not-allowed
    overflow-hidden
    ${fullWidth ? 'w-full' : ''}
    ${glitch ? 'glitch-button' : ''}
  `;

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
    xl: 'px-8 py-4 text-lg',
  };

  const variantClasses = {
    primary: `
      bg-gradient-to-r from-green-500 to-emerald-500
      border-green-400 text-black
      hover:from-green-400 hover:to-emerald-400
      hover:shadow-lg hover:shadow-green-400/50
      focus:ring-green-400
      active:scale-95
    `,
    secondary: `
      bg-gradient-to-r from-gray-700 to-gray-600
      border-gray-500 text-green-400
      hover:from-gray-600 hover:to-gray-500
      hover:shadow-lg hover:shadow-gray-400/30
      focus:ring-gray-400
      active:scale-95
    `,
    danger: `
      bg-gradient-to-r from-red-600 to-red-500
      border-red-400 text-white
      hover:from-red-500 hover:to-red-400
      hover:shadow-lg hover:shadow-red-400/50
      focus:ring-red-400
      active:scale-95
    `,
    success: `
      bg-gradient-to-r from-emerald-600 to-green-500
      border-emerald-400 text-black
      hover:from-emerald-500 hover:to-green-400
      hover:shadow-lg hover:shadow-emerald-400/50
      focus:ring-emerald-400
      active:scale-95
    `,
    warning: `
      bg-gradient-to-r from-yellow-600 to-orange-500
      border-yellow-400 text-black
      hover:from-yellow-500 hover:to-orange-400
      hover:shadow-lg hover:shadow-yellow-400/50
      focus:ring-yellow-400
      active:scale-95
    `,
    ghost: `
      bg-transparent border-green-400 text-green-400
      hover:bg-green-400 hover:text-black
      hover:shadow-lg hover:shadow-green-400/30
      focus:ring-green-400
      active:scale-95
    `,
    neon: `
      bg-black border-cyan-400 text-cyan-400
      hover:bg-cyan-400 hover:text-black
      hover:shadow-lg hover:shadow-cyan-400/50
      focus:ring-cyan-400
      active:scale-95
      neon-glow
    `,
  };

  const combinedClasses = `
    ${baseClasses}
    ${sizeClasses[size]}
    ${variantClasses[variant]}
    ${className}
  `.trim();

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={combinedClasses}
    >
      {/* Glitch Effect Overlay */}
      {glitch && (
        <>
          <span className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-blue-500/20 animate-pulse"></span>
          <span className="absolute inset-0 bg-gradient-to-l from-green-500/10 to-purple-500/10 animate-ping"></span>
        </>
      )}

      {/* Loading Spinner */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* Content */}
      <span className={`flex items-center gap-2 ${loading ? 'opacity-0' : 'opacity-100'}`}>
        {icon && iconPosition === 'left' && (
          <span className="flex-shrink-0">{icon}</span>
        )}
        <span>{children}</span>
        {icon && iconPosition === 'right' && (
          <span className="flex-shrink-0">{icon}</span>
        )}
      </span>

      {/* Hover Effect Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-700 ease-in-out"></div>
    </button>
  );
};

export default ModernButton;