import { NewsArticle, ArticleStatus, AdminRole } from '@/generated/prisma';

export interface NewsArticleWithAuthor extends NewsArticle {
  author: {
    id: string;
    name: string | null;
    email: string;
  };
  _count?: {
    analytics: number;
  };
}

export interface CreateArticleData {
  title: string;
  subtitle?: string;
  content: string;
  excerpt: string;
  coverImage?: string;
  metaTitle?: string;
  metaDescription?: string;
  tags: string[];
  isPremium: boolean;
  status: ArticleStatus;
  publishedAt?: Date;
}

export interface UpdateArticleData extends Partial<CreateArticleData> {
  id: string;
}

export interface AdminPermissions {
  canCreateArticles: boolean;
  canEditAnyArticle: boolean;
  canDeleteArticles: boolean;
  canManageUsers: boolean;
  canViewAnalytics: boolean;
  canManageAdmins: boolean;
}

export interface NewsFilters {
  status?: ArticleStatus;
  isPremium?: boolean;
  tags?: string[];
  authorId?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export const DEFAULT_PERMISSIONS: Record<AdminRole, AdminPermissions> = {
  SUPER_ADMIN: {
    canCreateArticles: true,
    canEditAnyArticle: true,
    canDeleteArticles: true,
    canManageUsers: true,
    canViewAnalytics: true,
    canManageAdmins: true,
  },
  ADMIN: {
    canCreateArticles: true,
    canEditAnyArticle: true,
    canDeleteArticles: true,
    canManageUsers: false,
    canViewAnalytics: true,
    canManageAdmins: false,
  },
  EDITOR: {
    canCreateArticles: true,
    canEditAnyArticle: false,
    canDeleteArticles: false,
    canManageUsers: false,
    canViewAnalytics: false,
    canManageAdmins: false,
  },
};

// Common FPL tags for articles
export const FPL_TAGS = [
  'transfers',
  'captaincy',
  'gameweek-preview',
  'gameweek-review',
  'player-analysis',
  'team-news',
  'fixtures',
  'statistics',
  'differentials',
  'budget-picks',
  'premium-picks',
  'injury-updates',
  'price-changes',
  'south-africa',
  'sa-content',
  'opinion',
  'strategy',
  'wildcards',
  'free-hit',
  'triple-captain',
  'bench-boost',
];

// Copyright-safe content guidelines
export const CONTENT_GUIDELINES = {
  sources: [
    'Official FPL API data',
    'Original analysis and opinions',
    'Public statistical websites',
    'Social media with proper attribution',
    'User-generated insights',
  ],
  avoid: [
    'Copying full articles from other sites',
    'Using copyrighted images without permission',
    'Reproducing premium content from other platforms',
    'Plagiarizing analysis from other FPL creators',
  ],
  best_practices: [
    'Always cite sources when referencing external data',
    'Use original analysis and commentary',
    'Create unique insights with South African perspective',
    'Focus on data interpretation rather than data copying',
    'Include disclaimers for any referenced content',
  ],
};
