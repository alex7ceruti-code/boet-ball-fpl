'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'premium';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant = 'primary', 
    size = 'md',
    isLoading = false,
    leftIcon,
    rightIcon,
    children, 
    disabled,
    ...props 
  }, ref) => {
    const baseClasses = 'inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none touch-target';
    
    const variants = {
      primary: 'bg-gradient-to-br from-springbok-600 to-springbok-700 text-white shadow-springbok hover:from-springbok-700 hover:to-springbok-800 hover:shadow-springbok-lg hover:-translate-y-0.5 active:scale-98 focus:ring-springbok-500',
      secondary: 'bg-gradient-to-br from-sa-gold to-sa-gold-600 text-gray-900 shadow-sa-gold hover:from-sa-gold-600 hover:to-yellow-600 hover:shadow-sa-gold-lg hover:-translate-y-0.5 active:scale-98 focus:ring-sa-gold',
      outline: 'border-2 border-springbok-600 text-springbok-600 bg-white hover:bg-springbok-50 hover:border-springbok-700 focus:ring-springbok-500',
      ghost: 'text-springbok-600 hover:bg-springbok-50 hover:text-springbok-700 focus:ring-springbok-500',
      premium: 'bg-gradient-to-br from-sa-gold via-yellow-400 to-sa-gold-600 text-gray-900 shadow-sa-gold-lg hover:from-yellow-400 hover:to-sa-gold hover:shadow-xl hover:-translate-y-1 active:scale-98 focus:ring-sa-gold font-semibold'
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-sm rounded-md',
      md: 'px-4 py-2 text-base rounded-lg',
      lg: 'px-6 py-3 text-lg rounded-xl',
      xl: 'px-8 py-4 text-xl rounded-xl'
    };

    return (
      <button
        className={cn(
          baseClasses,
          variants[variant],
          sizes[size],
          className
        )}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <div className="springbok-spinner w-4 h-4" />
        )}
        {!isLoading && leftIcon && leftIcon}
        {children}
        {!isLoading && rightIcon && rightIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';
