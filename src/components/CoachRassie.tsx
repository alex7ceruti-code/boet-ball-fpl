'use client';

import React, { useState, useEffect } from 'react';
import { MessageCircle, X, Trophy, Target, Users, Calendar } from 'lucide-react';
import { Card, CardContent, Button, Badge } from '@/components/ui';
import { getContextualMessage } from '@/utils/saTheme';
import { cn } from '@/lib/utils';

interface CoachRassieProps {
  context?: 'captain-selection' | 'transfer-suggestion' | 'chip-usage' | 'fixture-difficulty' | 'mini-league-advice';
  trigger?: 'hover' | 'click' | 'auto';
  position?: 'top-right' | 'bottom-right' | 'center';
  className?: string;
}

const contextIcons = {
  'captain-selection': Trophy,
  'transfer-suggestion': Users,
  'chip-usage': Target,
  'fixture-difficulty': Calendar,
  'mini-league-advice': MessageCircle,
};

const contextColors = {
  'captain-selection': 'from-yellow-400 to-yellow-600',
  'transfer-suggestion': 'from-springbok-600 to-springbok-800',
  'chip-usage': 'from-purple-500 to-purple-700',
  'fixture-difficulty': 'from-blue-500 to-blue-700',
  'mini-league-advice': 'from-orange-500 to-orange-600',
};

export function CoachRassie({ 
  context = 'mini-league-advice', 
  trigger = 'click',
  position = 'bottom-right',
  className 
}: CoachRassieProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [advice, setAdvice] = useState('');
  const [hasShown, setHasShown] = useState(false);

  const IconComponent = contextIcons[context];
  const gradientClass = contextColors[context];

  useEffect(() => {
    if (trigger === 'auto' && !hasShown) {
      const timer = setTimeout(() => {
        setAdvice(getContextualMessage(context));
        setIsVisible(true);
        setHasShown(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [context, trigger, hasShown]);

  const handleShow = () => {
    if (!advice || Math.random() > 0.7) { // 30% chance to get new advice
      setAdvice(getContextualMessage(context));
    }
    setIsVisible(true);
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  const positionClasses = {
    'top-right': 'top-4 right-4',
    'bottom-right': 'bottom-4 right-4',
    'center': 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2',
  };

  if (trigger === 'hover') {
    return (
      <div className={cn('relative inline-block', className)} 
           onMouseEnter={handleShow} 
           onMouseLeave={handleClose}>
        <div className="cursor-help">
          <Badge variant="springbok" className="gap-1">
            <IconComponent className="w-3 h-3" />
            Coach Tip
          </Badge>
        </div>
        
        {isVisible && (
          <div className="absolute z-50 top-full mt-2 w-80 p-1">
            <Card variant="premium" className="shadow-lg border-2 border-springbok-300">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-full bg-gradient-to-br ${gradientClass} shadow-lg`}>
                    <IconComponent className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="gold" size="sm">Coach Rassie</Badge>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed font-medium">
                      "{advice || getContextualMessage(context)}"
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      {/* Floating Coach Button */}
      <div className={cn('fixed z-40', positionClasses[position], className)}>
        <Button
          onClick={handleShow}
          className={`rounded-full p-4 bg-gradient-to-br ${gradientClass} text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110 border-3 border-white ring-2 ring-orange-200`}
          size="lg"
        >
          <IconComponent className="w-6 h-6" />
        </Button>
      </div>

      {/* Coach Advice Modal */}
      {isVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <Card variant="premium" className="max-w-md w-full shadow-2xl border-2 border-springbok-300 bg-white/95 backdrop-blur-sm">
            <CardContent className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-full bg-gradient-to-br ${gradientClass} shadow-lg`}>
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <Badge variant="gold" className="mb-1">Coach Rassie</Badge>
                    <p className="text-xs text-gray-600 capitalize">{context.replace('-', ' ')} advice</p>
                  </div>
                </div>
                <Button variant="ghost" onClick={handleClose} className="p-1">
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Advice Content */}
              <div className="mb-6">
                <p className="text-gray-700 leading-relaxed font-medium text-sm">
                  "{advice || getContextualMessage(context)}"
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button 
                  variant="secondary" 
                  size="sm" 
                  onClick={() => {
                    setAdvice(getContextualMessage(context));
                  }}
                  className="flex-1"
                >
                  More Wisdom
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleClose}
                  className="flex-1"
                >
                  Got it, Coach!
                </Button>
              </div>

              {/* SA Signature */}
              <div className="text-center mt-4 pt-3 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  "Trust the process" 🏉 🇿🇦
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}

// Specialized Coach Components for different contexts
export function CaptainCoach({ className }: { className?: string }) {
  return (
    <CoachRassie 
      context="captain-selection" 
      trigger="hover"
      className={className}
    />
  );
}

export function TransferCoach({ className }: { className?: string }) {
  return (
    <CoachRassie 
      context="transfer-suggestion" 
      trigger="click"
      className={className}
    />
  );
}

export function ChipCoach({ className }: { className?: string }) {
  return (
    <CoachRassie 
      context="chip-usage" 
      trigger="hover"
      className={className}
    />
  );
}

export function FixtureCoach({ className }: { className?: string }) {
  return (
    <CoachRassie 
      context="fixture-difficulty" 
      trigger="hover"
      className={className}
    />
  );
}

export function MiniLeagueCoach({ className }: { className?: string }) {
  return (
    <CoachRassie 
      context="mini-league-advice" 
      position="bottom-right"
      className={className}
    />
  );
}
