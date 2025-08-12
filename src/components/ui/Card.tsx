'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'premium' | 'outline' | 'elevated';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  interactive?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', padding = 'md', interactive = false, children, ...props }, ref) => {
    const baseClasses = 'rounded-xl transition-all duration-200';
    
    const variants = {
      default: 'bg-white border border-gray-200 shadow-md',
      premium: 'premium-card',
      outline: 'bg-white border-2 border-springbok-200 hover:border-springbok-300',
      elevated: 'bg-white shadow-lg hover:shadow-xl'
    };

    const paddings = {
      none: '',
      sm: 'p-3',
      md: 'p-4',
      lg: 'p-6',
      xl: 'p-8'
    };

    const interactiveClasses = interactive 
      ? 'cursor-pointer hover:-translate-y-1 hover:shadow-lg' 
      : '';

    return (
      <div
        className={cn(
          baseClasses,
          variants[variant],
          paddings[padding],
          interactiveClasses,
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, title, subtitle, action, children, ...props }, ref) => {
    return (
      <div
        className={cn('flex items-start justify-between pb-3 border-b border-gray-100', className)}
        ref={ref}
        {...props}
      >
        <div className="space-y-1">
          {title && (
            <h3 className="text-lg font-semibold text-gray-900 font-accent">{title}</h3>
          )}
          {subtitle && (
            <p className="text-sm text-gray-600">{subtitle}</p>
          )}
          {children}
        </div>
        {action && <div className="ml-4">{action}</div>}
      </div>
    );
  }
);

CardHeader.displayName = 'CardHeader';

export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        className={cn('pt-3', className)}
        ref={ref}
        {...props}
      />
    );
  }
);

CardContent.displayName = 'CardContent';

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

export const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        className={cn('pt-3 border-t border-gray-100', className)}
        ref={ref}
        {...props}
      />
    );
  }
);

CardFooter.displayName = 'CardFooter';
