'use client';

import React from 'react';
import { Card, CardContent, Badge, Button } from '@/components/ui';
import { getSASlang, getPerformanceMessage, saThemeConfig } from '@/utils/saTheme';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus, Flame, Star, Target } from 'lucide-react';

// Boerie Burner Card - For top performing players
interface BoerieBurnerCardProps {
  player: {
    name: string;
    points: number;
    team: string;
    position: string;
    isSelected?: boolean;
  };
  rank: number;
  className?: string;
}

export function BoerieBurnerCard({ player, rank, className }: BoerieBurnerCardProps) {
  const getBurnLevel = (points: number) => {
    if (points >= 15) return { level: 'blazing', icon: '🔥🔥🔥', color: 'from-red-500 to-orange-600' };
    if (points >= 10) return { level: 'hot', icon: '🔥🔥', color: 'from-orange-500 to-red-500' };
    if (points >= 6) return { level: 'warm', icon: '🔥', color: 'from-yellow-500 to-orange-500' };
    return { level: 'cold', icon: '❄️', color: 'from-blue-400 to-blue-600' };
  };

  const burnLevel = getBurnLevel(player.points);

  return (
    <Card className={cn('premium-card hover:scale-105 transition-all', className)}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${burnLevel.color} flex items-center justify-center text-white font-bold text-sm shadow-lg`}>
            {rank}
          </div>
          <div className="text-2xl">{burnLevel.icon}</div>
        </div>
        
        <div className="space-y-2">
          <h4 className="font-bold text-gray-800 font-accent">{player.name}</h4>
          <p className="text-sm text-gray-600">{player.team} • {player.position}</p>
          
          <div className="flex items-center justify-between">
            <div className="text-2xl font-black text-springbok-600">{player.points}</div>
            <Badge variant="gold" size="sm">
              {getSASlang('performance', 'big-haul')}
            </Badge>
          </div>
        </div>

        {player.isSelected && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <Badge variant="springbok" size="sm" className="w-full justify-center">
              In Your Squad 🎯
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Chommie Differential - For low ownership gems
interface ChommieDifferentialProps {
  player: {
    name: string;
    ownership: number;
    form: number;
    price: number;
    team: string;
  };
  className?: string;
}

export function ChommieDifferential({ player, className }: ChommieDifferentialProps) {
  const getSecrecyLevel = (ownership: number) => {
    if (ownership < 2) return { level: 'top-secret', icon: '🤫', badge: 'Slegs vir ons mense' };
    if (ownership < 5) return { level: 'insider', icon: '👀', badge: getSASlang('strategy', 'differential-picks') };
    if (ownership < 10) return { level: 'under-radar', icon: '📡', badge: 'Under the Radar' };
    return { level: 'mainstream', icon: '📢', badge: 'Everyone knows' };
  };

  const secrecy = getSecrecyLevel(player.ownership);

  return (
    <Card variant="outline" className={cn('border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50', className)}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <Badge variant="default" className="bg-purple-100 text-purple-800 border-purple-200">
            {secrecy.badge}
          </Badge>
          <div className="text-xl">{secrecy.icon}</div>
        </div>

        <div className="space-y-2">
          <h4 className="font-semibold text-gray-800">{player.name}</h4>
          <p className="text-sm text-gray-600">{player.team}</p>
          
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-xs text-gray-500">Ownership</p>
              <p className="font-bold text-purple-600">{player.ownership}%</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Form</p>
              <p className="font-bold text-springbok-600">{player.form}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Price</p>
              <p className="font-bold text-gray-800">£{player.price}m</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Fixture Difficulty Indicator with SA flavor
interface FixtureDifficultyProps {
  difficulty: number;
  opponent: string;
  isHome: boolean;
  className?: string;
}

export function FixtureDifficulty({ difficulty, opponent, isHome, className }: FixtureDifficultyProps) {
  const getDifficultyInfo = (fdr: number) => {
    if (fdr <= 2) return { 
      label: getSASlang('strategy', 'good-fixture'), 
      color: 'bg-green-500', 
      textColor: 'text-green-800',
      bgColor: 'bg-green-50',
      advice: "Easy points, boet!"
    };
    if (fdr === 3) return { 
      label: "50/50 call", 
      color: 'bg-yellow-500', 
      textColor: 'text-yellow-800',
      bgColor: 'bg-yellow-50',
      advice: "Could go either way"
    };
    return { 
      label: getSASlang('strategy', 'tough-fixture'), 
      color: 'bg-red-500', 
      textColor: 'text-red-800',
      bgColor: 'bg-red-50',
      advice: "Tough ask this one"
    };
  };

  const difficultyInfo = getDifficultyInfo(difficulty);

  return (
    <div className={cn(`inline-flex items-center gap-2 px-3 py-1 rounded-full ${difficultyInfo.bgColor}`, className)}>
      <div className={`w-2 h-2 rounded-full ${difficultyInfo.color}`} />
      <span className={`text-sm font-medium ${difficultyInfo.textColor}`}>
        {isHome ? 'H' : 'A'} vs {opponent}
      </span>
      <Badge size="sm" className={`${difficultyInfo.bgColor} ${difficultyInfo.textColor} border-current`}>
        {difficulty}
      </Badge>
    </div>
  );
}

// Price Change Indicator with SA reactions
interface PriceChangeProps {
  change: number;
  className?: string;
}

export function PriceChange({ change, className }: PriceChangeProps) {
  const getChangeInfo = (change: number) => {
    if (change > 0.2) return {
      icon: TrendingUp,
      color: 'text-green-600',
      bg: 'bg-green-50',
      border: 'border-green-200',
      message: "Racking up the cash!",
      emoji: '💰'
    };
    if (change > 0) return {
      icon: TrendingUp,
      color: 'text-green-500',
      bg: 'bg-green-25',
      border: 'border-green-100',
      message: "Slight rise, china",
      emoji: '📈'
    };
    if (change < -0.2) return {
      icon: TrendingDown,
      color: 'text-red-600',
      bg: 'bg-red-50',
      border: 'border-red-200',
      message: "Proper price crash!",
      emoji: '📉'
    };
    if (change < 0) return {
      icon: TrendingDown,
      color: 'text-red-500',
      bg: 'bg-red-25',
      border: 'border-red-100',
      message: "Slight drop there",
      emoji: '📉'
    };
    return {
      icon: Minus,
      color: 'text-gray-500',
      bg: 'bg-gray-50',
      border: 'border-gray-200',
      message: "Steady as she goes",
      emoji: '➖'
    };
  };

  const changeInfo = getChangeInfo(change);
  const IconComponent = changeInfo.icon;

  if (change === 0) return null;

  return (
    <div className={cn(`inline-flex items-center gap-2 px-2 py-1 rounded-lg border ${changeInfo.bg} ${changeInfo.border}`, className)}>
      <IconComponent className={`w-4 h-4 ${changeInfo.color}`} />
      <span className={`text-sm font-medium ${changeInfo.color}`}>
        {change > 0 ? '+' : ''}£{change.toFixed(1)}m
      </span>
      <span className="text-xs">{changeInfo.emoji}</span>
    </div>
  );
}

// Mini League Position with SA banter
interface MiniLeaguePositionProps {
  position: number;
  totalPlayers: number;
  movement?: number;
  className?: string;
}

export function MiniLeaguePosition({ position, totalPlayers, movement = 0, className }: MiniLeaguePositionProps) {
  const getPositionInfo = (pos: number, total: number) => {
    const percentage = (pos / total) * 100;
    
    if (pos === 1) return {
      label: getSASlang('performance', 'top-performer'),
      color: 'from-yellow-400 to-yellow-600',
      textColor: 'text-yellow-800',
      emoji: '👑',
      message: "Leading the pack!"
    };
    if (percentage <= 10) return {
      label: "Top Tier",
      color: 'from-green-400 to-green-600', 
      textColor: 'text-green-800',
      emoji: '🔥',
      message: "In the green!"
    };
    if (percentage <= 25) return {
      label: "Solid Position",
      color: 'from-blue-400 to-blue-600',
      textColor: 'text-blue-800', 
      emoji: '💪',
      message: "Holding strong"
    };
    if (percentage <= 75) return {
      label: "Mid Pack",
      color: 'from-gray-400 to-gray-600',
      textColor: 'text-gray-800',
      emoji: '😐',
      message: "Room for improvement"
    };
    return {
      label: "Struggle Street",
      color: 'from-red-400 to-red-600',
      textColor: 'text-red-800',
      emoji: '😅',
      message: "Time to make moves!"
    };
  };

  const positionInfo = getPositionInfo(position, totalPlayers);

  return (
    <Card className={cn('premium-card', className)}>
      <CardContent className="p-4 text-center">
        <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br ${positionInfo.color} text-white text-2xl font-bold shadow-lg mb-3`}>
          {position}
        </div>
        
        <div className="space-y-2">
          <Badge variant="default" className={`${positionInfo.textColor} border-current`}>
            {positionInfo.label}
          </Badge>
          
          <p className="text-sm text-gray-600">
            {positionInfo.message} {positionInfo.emoji}
          </p>
          
          <p className="text-xs text-gray-500">
            out of {totalPlayers} managers
          </p>

          {movement !== 0 && (
            <div className={`inline-flex items-center gap-1 text-xs ${
              movement > 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {movement > 0 ? (
                <>
                  <TrendingUp className="w-3 h-3" />
                  <span>+{movement} spots 📈</span>
                </>
              ) : (
                <>
                  <TrendingDown className="w-3 h-3" />
                  <span>{movement} spots 📉</span>
                </>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// SA Loading States
interface SALoadingProps {
  message?: string;
  type?: 'spinner' | 'skeleton' | 'pulse';
  className?: string;
}

export function SALoading({ message, type = 'spinner', className }: SALoadingProps) {
  const loadingMessages = [
    "Fetching the goods... 🏉",
    "Getting the inside scoop... 👀", 
    "Checking with the boetie network... 🤝",
    "Loading the magic... ✨",
    "Braai'ing up the data... 🔥"
  ];

  const defaultMessage = message || loadingMessages[Math.floor(Math.random() * loadingMessages.length)];

  if (type === 'spinner') {
    return (
      <div className={cn('flex flex-col items-center justify-center p-8', className)}>
        <div className="springbok-spinner w-8 h-8 mb-4" />
        <p className="text-gray-600 text-center font-medium">{defaultMessage}</p>
      </div>
    );
  }

  if (type === 'skeleton') {
    return (
      <div className={cn('space-y-3', className)}>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="skeleton h-4 rounded" />
        ))}
      </div>
    );
  }

  return (
    <div className={cn('flex items-center gap-3 p-4', className)}>
      <div className="w-3 h-3 bg-springbok-600 rounded-full pulse-green" />
      <p className="text-gray-600 font-medium">{defaultMessage}</p>
    </div>
  );
}

// Empty State with SA humor
interface SAEmptyStateProps {
  title?: string;
  message?: string;
  action?: React.ReactNode;
  icon?: string;
  className?: string;
}

export function SAEmptyState({ 
  title = "Nothing here, boet!", 
  message = "Looks like this space is emptier than the Highveld after a drought.", 
  action,
  icon = "🏜️",
  className 
}: SAEmptyStateProps) {
  return (
    <div className={cn('text-center py-12 px-6', className)}>
      <div className="text-6xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-gray-800 mb-2 font-accent">{title}</h3>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">{message}</p>
      {action && <div>{action}</div>}
    </div>
  );
}
