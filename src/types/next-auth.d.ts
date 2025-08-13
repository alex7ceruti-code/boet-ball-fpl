import { SubscriptionType, UserPreferences, AdminRole } from '@prisma/client';
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
      role?: AdminRole | null;
      fplTeamId?: number | null;
      miniLeague1Id?: number | null;
      miniLeague2Id?: number | null;
      favoriteTeam?: number | null;
      location?: string | null;
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
    role?: AdminRole | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    subscriptionType?: SubscriptionType;
    isActive?: boolean;
    role?: AdminRole | null;
  }
}
