'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
  color?: 'springbok' | 'gold' | 'gray';
}

function LoadingSpinner({ 
  size = 'medium', 
  className,
  color = 'springbok' 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    small: 'w-4 h-4 border-2',
    medium: 'w-8 h-8 border-2',
    large: 'w-12 h-12 border-3'
  };

  const colorClasses = {
    springbok: 'border-springbok-green-600 border-t-transparent',
    gold: 'border-sa-gold-500 border-t-transparent',
    gray: 'border-gray-300 border-t-transparent'
  };

  return (
    <div
      className={cn(
        'animate-spin rounded-full',
        sizeClasses[size],
        colorClasses[color],
        className
      )}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}

// Overlay loading component for full page loading states
interface LoadingOverlayProps {
  message?: string;
  isVisible?: boolean;
}

function LoadingOverlay({ 
  message = "Loading...", 
  isVisible = true 
}: LoadingOverlayProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="text-center">
        <LoadingSpinner size="large" color="springbok" />
        <p className="mt-4 text-springbok-green-700 font-medium">{message}</p>
      </div>
    </div>
  );
}

export default LoadingSpinner;
export { LoadingSpinner, LoadingOverlay };
