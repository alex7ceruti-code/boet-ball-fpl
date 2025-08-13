import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { db } from './db';

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/auth/signin',
    newUser: '/profile/setup',
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await db.user.findUnique({
          where: {
            email: credentials.email,
          },
        });

        if (!user || !user.password) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          return null;
        }

        // Update login tracking
        await db.user.update({
          where: { id: user.id },
          data: {
            lastLoginAt: new Date(),
            loginCount: { increment: 1 },
          },
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      
      // Fetch fresh user data for every token to ensure isActive is up-to-date
      if (token.id) {
        try {
          const dbUser = await db.user.findUnique({
            where: { id: token.id as string },
            include: {
              adminUser: true,
            },
          });
          
          if (dbUser) {
            token.isActive = dbUser.isActive;
            token.subscriptionType = dbUser.subscriptionType;
            token.role = dbUser.adminUser?.role || null;
          }
        } catch (error) {
          console.error('Error fetching user in JWT callback:', error);
          // Don't block the token if there's a DB error
        }
      }
      
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        
        // Fetch fresh user data
        try {
          const dbUser = await db.user.findUnique({
            where: { id: token.id as string },
            include: {
              preferences: true,
              adminUser: true,
            },
          });
          
          if (dbUser) {
            session.user.name = dbUser.name;
            session.user.subscriptionType = dbUser.subscriptionType;
            session.user.isActive = dbUser.isActive;
            session.user.preferences = dbUser.preferences;
            session.user.role = dbUser.adminUser?.role || null;
            session.user.fplTeamId = dbUser.fplTeamId;
            session.user.miniLeague1Id = dbUser.miniLeague1Id;
            session.user.miniLeague2Id = dbUser.miniLeague2Id;
            session.user.favoriteTeam = dbUser.favoriteTeam;
            session.user.location = dbUser.location;
          }
        } catch (error) {
          console.error('Error fetching user in session callback:', error);
          // Set safe defaults if DB error
          session.user.subscriptionType = 'FREE';
          session.user.isActive = true;
        }
      }
      return session;
    },
  },
};
