import { User, UserPreferences, SubscriptionType } from '@/generated/prisma';

export interface SessionUser {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
  subscriptionType: SubscriptionType;
  isActive: boolean;
  preferences?: UserPreferences | null;
}

export interface AuthUser extends User {
  preferences?: UserPreferences | null;
}

export interface SignUpFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  marketingOptIn: boolean;
}

export interface SignInFormData {
  email: string;
  password: string;
}

export interface ProfileSetupData {
  fplTeamId?: number;
  favoriteTeam?: number;
  location?: string;
  preferences?: {
    slangIntensity?: 'NONE' | 'LIGHT' | 'MODERATE' | 'HEAVY';
    emailNotifications?: boolean;
    weeklyReports?: boolean;
    transferReminders?: boolean;
  };
}
