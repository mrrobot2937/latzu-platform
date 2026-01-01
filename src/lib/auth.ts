// NextAuth.js configuration for Latzu Platform

import type { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import type { ProfileType } from '@/types/user';

// Extend the default session and JWT types
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      image?: string;
      profileType?: ProfileType;
      tenantId: string;
      role: 'user' | 'admin' | 'moderator';
      needsOnboarding: boolean;
    };
    accessToken?: string;
  }

  interface User {
    profileType?: ProfileType;
    tenantId?: string;
    role?: 'user' | 'admin' | 'moderator';
    needsOnboarding?: boolean;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    userId: string;
    profileType?: ProfileType;
    tenantId: string;
    role: 'user' | 'admin' | 'moderator';
    needsOnboarding: boolean;
    accessToken?: string;
  }
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://latzuplatform.vercel.app';

// Sync user to backend Neo4j
async function syncUserToBackend(
  user: { id: string; email: string; name: string; image?: string },
  account: { access_token?: string; refresh_token?: string } | null
): Promise<{
  profileType?: ProfileType;
  tenantId: string;
  role: 'user' | 'admin' | 'moderator';
  needsOnboarding: boolean;
}> {
  try {
    const response = await fetch(`${API_URL}/api/auth/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        google_id: user.id,
        email: user.email,
        name: user.name,
        picture: user.image,
        access_token: account?.access_token,
        refresh_token: account?.refresh_token,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      return {
        profileType: data.profile_type,
        tenantId: data.tenant_id || 'default',
        role: data.role || 'user',
        needsOnboarding: !data.profile_type,
      };
    }
  } catch (error) {
    console.error('Failed to sync user to backend:', error);
  }

  // Default values if sync fails
  return {
    tenantId: 'default',
    role: 'user',
    needsOnboarding: true,
  };
}

// Fetch user profile type from backend
async function fetchUserProfileType(userId: string): Promise<ProfileType | undefined> {
  try {
    const response = await fetch(`${API_URL}/api/users/${userId}/profile-type`, {
      headers: { 'Content-Type': 'application/json' },
    });

    if (response.ok) {
      const data = await response.json();
      return data.profile_type;
    }
  } catch (error) {
    console.error('Failed to fetch user profile type:', error);
  }

  return undefined;
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    }),
  ],

  pages: {
    signIn: '/login',
    newUser: '/onboarding',
    error: '/login',
  },

  callbacks: {
    async signIn({ user, account }) {
      // Sync user to backend Neo4j on sign-in
      const backendData = await syncUserToBackend(
        {
          id: user.id,
          email: user.email!,
          name: user.name!,
          image: user.image ?? undefined,
        },
        account
      );

      // Attach backend data to user object
      user.profileType = backendData.profileType;
      user.tenantId = backendData.tenantId;
      user.role = backendData.role;
      user.needsOnboarding = backendData.needsOnboarding;

      return true;
    },

    async jwt({ token, user, account }) {
      // Initial sign in
      if (user) {
        token.userId = user.id;
        token.profileType = user.profileType;
        token.tenantId = user.tenantId || 'default';
        token.role = user.role || 'user';
        token.needsOnboarding = user.needsOnboarding ?? true;
        token.accessToken = account?.access_token;
      }

      // Refresh profile type periodically
      if (!token.profileType && token.userId) {
        token.profileType = await fetchUserProfileType(token.userId);
        if (token.profileType) {
          token.needsOnboarding = false;
        }
      }

      return token;
    },

    async session({ session, token }) {
      session.user.id = token.userId;
      session.user.profileType = token.profileType;
      session.user.tenantId = token.tenantId;
      session.user.role = token.role;
      session.user.needsOnboarding = token.needsOnboarding;
      session.accessToken = token.accessToken;

      return session;
    },

    async redirect({ url, baseUrl }) {
      // Handle post-login redirect
      if (url.startsWith(baseUrl)) {
        // If URL already contains a specific path (not just base), use it
        const path = url.replace(baseUrl, '');
        if (path && path !== '/') {
          return url;
        }
      }
      // Always redirect to dashboard after login
      return `${baseUrl}/dashboard`;
    },
  },

  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },

  secret: process.env.NEXTAUTH_SECRET,

  debug: process.env.NODE_ENV === 'development',
};

