import { ReactNode, ButtonHTMLAttributes } from 'react'
import { motion } from 'framer-motion'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'outline' | 'text'
  size?: 'xs' | 'sm' | 'md' | 'lg'
  isLoading?: boolean
  loadingText?: string
  icon?: ReactNode
  iconPosition?: 'left' | 'right'
  disabled?: boolean
  fullWidth?: boolean
  className?: string
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  loadingText,
  icon,
  iconPosition = 'left',
  disabled = false,
  fullWidth = false,
  className = '',
  ...props
}) => {
  // Base classes
  const baseClasses = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2'
  
  // Size classes
  const sizeClasses = {
    xs: 'px-2.5 py-1.5 text-xs rounded',
    sm: 'px-3 py-2 text-sm leading-4 rounded-md',
    md: 'px-4 py-2 text-sm rounded-md',
    lg: 'px-6 py-3 text-base rounded-md',
  }
  
  // Variant classes
  const variantClasses = {
    primary: 'bg-primary-600 hover:bg-primary-700 text-white focus:ring-primary-500',
    secondary: 'bg-secondary-200 hover:bg-secondary-300 text-secondary-800 focus:ring-secondary-400',
    success: 'bg-success-600 hover:bg-success-700 text-white focus:ring-success-500',
    danger: 'bg-danger-600 hover:bg-danger-700 text-white focus:ring-danger-500',
    warning: 'bg-warning-500 hover:bg-warning-600 text-white focus:ring-warning-400',
    outline: 'border border-secondary-300 bg-white hover:bg-secondary-50 text-secondary-700 focus:ring-primary-500',
    text: 'bg-transparent hover:bg-secondary-100 text-primary-600 focus:ring-primary-500',
  }
  
  // Width class
  const widthClass = fullWidth ? 'w-full' : ''
  
  // Disabled class
  const disabledClass = disabled || isLoading ? 'opacity-60 cursor-not-allowed' : ''
  
  // Combine all classes
  const buttonClasses = `
    ${baseClasses}
    ${sizeClasses[size]}
    ${variantClasses[variant]}
    ${widthClass}
    ${disabledClass}
    ${className}
  `

  // Animation properties
  const buttonAnimation = {
    whileTap: { scale: disabled || isLoading ? 1 : 0.98 },
    whileHover: { scale: disabled || isLoading ? 1 : 1.02 }
  }

  return (
    <motion.button
      {...buttonAnimation}
      disabled={disabled || isLoading}
      className={buttonClasses}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}

      {!isLoading && icon && iconPosition === 'left' && (
        <span className="mr-2">{icon}</span>
      )}

      {isLoading && loadingText ? loadingText : children}

      {!isLoading && icon && iconPosition === 'right' && (
        <span className="ml-2">{icon}</span>
      )}
    </motion.button>
  )
}

export default Button