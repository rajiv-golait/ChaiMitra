import React from 'react';
import { motion } from 'framer-motion';

const MobileResponsiveWrapper = ({ 
  children, 
  className = '', 
  enableSwipe = false,
  fullHeight = false 
}) => {
  const baseClasses = `
    w-full
    ${fullHeight ? 'min-h-screen' : 'min-h-0'}
    px-4 sm:px-6 lg:px-8
    py-4 sm:py-6
    ${className}
  `;

  const containerClasses = `
    max-w-7xl
    mx-auto
    ${enableSwipe ? 'overflow-x-auto' : ''}
  `;

  return (
    <div className={baseClasses}>
      <div className={containerClasses}>
        {children}
      </div>
    </div>
  );
};

// Mobile-optimized card component
export const MobileCard = ({ 
  children, 
  className = '', 
  padding = 'default',
  shadow = true 
}) => {
  const paddingClasses = {
    none: '',
    small: 'p-3 sm:p-4',
    default: 'p-4 sm:p-6',
    large: 'p-6 sm:p-8'
  };

  const cardClasses = `
    bg-white
    rounded-lg sm:rounded-xl
    ${shadow ? 'shadow-sm sm:shadow-lg' : ''}
    ${paddingClasses[padding]}
    w-full
    ${className}
  `;

  return (
    <motion.div
      className={cardClasses}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
};

// Mobile-optimized button component
export const MobileButton = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  size = 'default',
  fullWidth = false,
  disabled = false,
  className = ''
}) => {
  const variants = {
    primary: 'bg-orange-600 hover:bg-orange-700 text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-900',
    outline: 'border-2 border-orange-600 text-orange-600 hover:bg-orange-50',
    ghost: 'text-orange-600 hover:bg-orange-50'
  };

  const sizes = {
    small: 'px-3 py-2 text-sm',
    default: 'px-4 py-3 sm:px-6 sm:py-3 text-base',
    large: 'px-6 py-4 sm:px-8 sm:py-4 text-lg'
  };

  const buttonClasses = `
    ${variants[variant]}
    ${sizes[size]}
    ${fullWidth ? 'w-full' : ''}
    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
    rounded-lg
    font-semibold
    transition-all
    duration-200
    focus:outline-none
    focus:ring-2
    focus:ring-orange-500
    focus:ring-offset-2
    active:scale-95
    ${className}
  `;

  return (
    <button
      className={buttonClasses}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

// Mobile-optimized grid component
export const MobileGrid = ({ 
  children, 
  cols = { mobile: 1, tablet: 2, desktop: 3 },
  gap = 'default',
  className = ''
}) => {
  const gapClasses = {
    none: '',
    small: 'gap-2 sm:gap-3',
    default: 'gap-4 sm:gap-6',
    large: 'gap-6 sm:gap-8'
  };

  const gridClasses = `
    grid
    grid-cols-${cols.mobile}
    sm:grid-cols-${cols.tablet}
    lg:grid-cols-${cols.desktop}
    ${gapClasses[gap]}
    ${className}
  `;

  return (
    <div className={gridClasses}>
      {children}
    </div>
  );
};

// Mobile-optimized text component
export const MobileText = ({ 
  children, 
  variant = 'body',
  color = 'default',
  align = 'left',
  className = ''
}) => {
  const variants = {
    h1: 'text-2xl sm:text-3xl lg:text-4xl font-bold',
    h2: 'text-xl sm:text-2xl lg:text-3xl font-bold',
    h3: 'text-lg sm:text-xl lg:text-2xl font-semibold',
    h4: 'text-base sm:text-lg font-semibold',
    body: 'text-sm sm:text-base',
    small: 'text-xs sm:text-sm',
    caption: 'text-xs'
  };

  const colors = {
    default: 'text-gray-900',
    muted: 'text-gray-600',
    light: 'text-gray-500',
    primary: 'text-orange-600',
    success: 'text-green-600',
    warning: 'text-yellow-600',
    error: 'text-red-600'
  };

  const alignments = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  };

  const textClasses = `
    ${variants[variant]}
    ${colors[color]}
    ${alignments[align]}
    ${className}
  `;

  const Component = variant.startsWith('h') ? variant : 'p';

  return React.createElement(Component, { className: textClasses }, children);
};

// Mobile-optimized input component
export const MobileInput = ({ 
  label,
  placeholder,
  value,
  onChange,
  type = 'text',
  error,
  required = false,
  className = ''
}) => {
  const inputClasses = `
    w-full
    px-3 py-3 sm:px-4 sm:py-3
    border
    ${error ? 'border-red-500' : 'border-gray-300'}
    rounded-lg
    focus:ring-2
    focus:ring-orange-500
    focus:border-orange-500
    text-base
    ${className}
  `;

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={inputClasses}
        required={required}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

// Mobile-optimized modal component
export const MobileModal = ({ 
  isOpen, 
  onClose, 
  title, 
  children,
  size = 'default' 
}) => {
  if (!isOpen) return null;

  const sizes = {
    small: 'max-w-sm',
    default: 'max-w-md',
    large: 'max-w-lg',
    full: 'max-w-full mx-4'
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div 
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className={`
            inline-block w-full ${sizes[size]}
            p-6 my-8 overflow-hidden text-left align-middle
            transition-all transform bg-white shadow-xl rounded-2xl
          `}
        >
          {title && (
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">{title}</h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
          {children}
        </motion.div>
      </div>
    </div>
  );
};

export default MobileResponsiveWrapper;
