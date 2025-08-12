import { SubscriptionType } from '@/generated/prisma';

export interface FeatureAccess {
  hasAccess: boolean;
  requiresUpgrade: boolean;
  feature: string;
  plan: SubscriptionType;
}

export const FEATURE_LIMITS = {
  FREE: {
    // Core features
    dashboard: true,
    fixtures: true,
    players: true,
    myTeam: true,
    miniLeague: true,
    
    // Limited features
    maxLeaguesTracked: 1,
    maxPlayerComparisons: 3,
    advancedStats: false,
    historicalData: false,
    customAlerts: false,
    exportData: false,
    premiumInsights: false,
    
    // Premium-only features
    transferPlanner: false,
    injuryTracker: false,
    performanceAnalytics: false,
    customDashboard: false,
    prioritySupport: false,
  },
  PREMIUM: {
    // All core features
    dashboard: true,
    fixtures: true,
    players: true,
    myTeam: true,
    miniLeague: true,
    
    // Unlimited features
    maxLeaguesTracked: -1, // -1 = unlimited
    maxPlayerComparisons: -1,
    advancedStats: true,
    historicalData: true,
    customAlerts: true,
    exportData: true,
    premiumInsights: true,
    
    // Premium-only features
    transferPlanner: true,
    injuryTracker: true,
    performanceAnalytics: true,
    customDashboard: true,
    prioritySupport: true,
  },
};

/**
 * Check if a user has access to a specific feature
 */
export function checkFeatureAccess(
  userPlan: SubscriptionType | null | undefined,
  featureName: keyof typeof FEATURE_LIMITS.FREE
): FeatureAccess {
  const plan = userPlan || 'FREE';
  const limits = FEATURE_LIMITS[plan];
  const hasAccess = limits[featureName] as boolean;

  return {
    hasAccess,
    requiresUpgrade: !hasAccess && plan === 'FREE',
    feature: featureName,
    plan,
  };
}

/**
 * Check if a user can perform an action that has usage limits
 */
export function checkUsageLimit(
  userPlan: SubscriptionType | null | undefined,
  featureName: keyof typeof FEATURE_LIMITS.FREE,
  currentUsage: number
): FeatureAccess & { limit: number; canUse: boolean } {
  const plan = userPlan || 'FREE';
  const limits = FEATURE_LIMITS[plan];
  const limit = limits[featureName] as number;
  
  const canUse = limit === -1 || currentUsage < limit;
  const hasAccess = limits[featureName] !== false;

  return {
    hasAccess,
    requiresUpgrade: !canUse && plan === 'FREE',
    feature: featureName,
    plan,
    limit,
    canUse,
  };
}

/**
 * Get user-friendly messages for feature access
 */
export function getFeatureAccessMessage(
  featureAccess: FeatureAccess,
  featureDisplayName?: string
): {
  title: string;
  message: string;
  actionText: string;
} {
  const feature = featureDisplayName || featureAccess.feature;

  if (featureAccess.hasAccess) {
    return {
      title: 'Access Granted',
      message: `You have access to ${feature}.`,
      actionText: 'Continue',
    };
  }

  if (featureAccess.requiresUpgrade) {
    return {
      title: 'Premium Feature',
      message: `${feature} is available with Premium. Upgrade to unlock this feature and many more!`,
      actionText: 'Upgrade to Premium',
    };
  }

  return {
    title: 'Access Denied',
    message: `You don't have access to ${feature}.`,
    actionText: 'Contact Support',
  };
}

/**
 * Premium features list for marketing
 */
export const PREMIUM_FEATURES = [
  {
    name: 'Advanced Statistics',
    description: 'Detailed player and team analytics with historical data',
    icon: 'BarChart3',
  },
  {
    name: 'Transfer Planner',
    description: 'AI-powered transfer suggestions and scenario planning',
    icon: 'ArrowRightLeft',
  },
  {
    name: 'Unlimited League Tracking',
    description: 'Track as many mini-leagues as you want',
    icon: 'Users',
  },
  {
    name: 'Custom Alerts',
    description: 'Personalized notifications for transfers, injuries, and more',
    icon: 'Bell',
  },
  {
    name: 'Historical Data',
    description: 'Access to multiple seasons of FPL data and trends',
    icon: 'Calendar',
  },
  {
    name: 'Data Export',
    description: 'Export your data and analytics to CSV/Excel',
    icon: 'Download',
  },
  {
    name: 'Premium Insights',
    description: 'Exclusive analysis and predictions with SA flair',
    icon: 'Lightbulb',
  },
  {
    name: 'Priority Support',
    description: 'Get help faster with dedicated support',
    icon: 'Headphones',
  },
];

/**
 * Check if user is on a premium plan
 */
export function isPremiumUser(userPlan: SubscriptionType | null | undefined): boolean {
  return userPlan === 'PREMIUM';
}

/**
 * Check if user is on a free plan
 */
export function isFreeUser(userPlan: SubscriptionType | null | undefined): boolean {
  return !userPlan || userPlan === 'FREE';
}
