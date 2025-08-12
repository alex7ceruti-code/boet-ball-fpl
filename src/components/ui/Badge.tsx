'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'premium' | 'success' | 'warning' | 'error' | 'info' | 'springbok' | 'gold';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}

export const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = 'default', size = 'md', icon, children, ...props }, ref) => {
    const baseClasses = 'inline-flex items-center gap-1 font-medium rounded-full transition-all duration-200';
    
    const variants = {
      default: 'bg-gray-100 text-gray-800 border border-gray-200',
      premium: 'premium-badge',
      success: 'bg-springbok-100 text-springbok-800 border border-springbok-200',
      warning: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
      error: 'bg-red-100 text-red-800 border border-red-200',
      info: 'bg-blue-100 text-blue-800 border border-blue-200',
      springbok: 'bg-springbok-600 text-white shadow-springbok',
      gold: 'bg-sa-gold text-gray-900 shadow-sa-gold'
    };

    const sizes = {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-2.5 py-1 text-sm',
      lg: 'px-3 py-1.5 text-base'
    };

    return (
      <div
        className={cn(
          baseClasses,
          variants[variant],
          sizes[size],
          className
        )}
        ref={ref}
        {...props}
      >
        {icon && icon}
        {children}
      </div>
    );
  }
);

Badge.displayName = 'Badge';

// Loading Spinner Component
export interface LoadingSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'springbok' | 'gold' | 'default';
}

export const LoadingSpinner = React.forwardRef<HTMLDivElement, LoadingSpinnerProps>(
  ({ className, size = 'md', variant = 'springbok', ...props }, ref) => {
    const sizes = {
      sm: 'w-4 h-4 border-2',
      md: 'w-6 h-6 border-3',
      lg: 'w-8 h-8 border-3',
      xl: 'w-12 h-12 border-4'
    };

    const variants = {
      springbok: 'border-springbok-200 border-t-springbok-600',
      gold: 'border-sa-gold-200 border-t-sa-gold',
      default: 'border-gray-200 border-t-gray-600'
    };

    return (
      <div
        className={cn(
          'rounded-full animate-springbok-spin',
          sizes[size],
          variants[variant],
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

LoadingSpinner.displayName = 'LoadingSpinner';

// Skeleton Component
export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  lines?: number;
  height?: string;
  width?: string;
}

export const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, lines = 1, height, width, ...props }, ref) => {
    const skeletonLines = Array.from({ length: lines }, (_, i) => (
      <div
        key={i}
        className={cn(
          'skeleton',
          i === lines - 1 && lines > 1 ? 'w-3/4' : 'w-full',
          height ? `h-[${height}]` : 'h-4'
        )}
        style={{ height, width: i === lines - 1 && lines > 1 ? '75%' : width }}
      />
    ));

    return (
      <div
        className={cn('space-y-2', className)}
        ref={ref}
        {...props}
      >
        {skeletonLines}
      </div>
    );
  }
);

Skeleton.displayName = 'Skeleton';

// Live Indicator Component
export interface LiveIndicatorProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'green' | 'gold' | 'red';
  text?: string;
}

export const LiveIndicator = React.forwardRef<HTMLDivElement, LiveIndicatorProps>(
  ({ className, variant = 'green', text = 'Live', ...props }, ref) => {
    const variants = {
      green: 'bg-springbok-600',
      gold: 'bg-sa-gold',
      red: 'bg-red-500'
    };

    return (
      <div
        className={cn('inline-flex items-center gap-2', className)}
        ref={ref}
        {...props}
      >
        <div className={cn('w-2 h-2 rounded-full pulse-green', variants[variant])} />
        <span className="text-sm font-medium text-gray-700">{text}</span>
      </div>
    );
  }
);

LiveIndicator.displayName = 'LiveIndicator';
