import { SubscriptionType, UserPreferences } from '@/generated/prisma';
import NextAuth from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      subscriptionType: SubscriptionType;
      isActive: boolean;
      preferences?: UserPreferences | null;
    };
  }

  interface User {
    id: string;
    email: string;
    name?: string | null;
    image?: string | null;
    subscriptionType?: SubscriptionType;
    isActive?: boolean;
    preferences?: UserPreferences | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    subscriptionType?: SubscriptionType;
    isActive?: boolean;
  }
}
