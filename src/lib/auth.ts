// NextAuth.js configuration for Latzu Platform

import type { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
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
    id: string;
    email: string;
    name: string;
    image?: string;
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
  account: { access_token?: string; refresh_token?: string } | null,
  provider: string = 'google'
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
        google_id: provider === 'google' ? user.id : undefined,
        email: user.email,
        name: user.name,
        picture: user.image,
        access_token: account?.access_token,
        refresh_token: account?.refresh_token,
        provider: provider,
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

// Authenticate user with email/password
async function authenticateUser(
  email: string,
  password: string
): Promise<{
  id: string;
  email: string;
  name: string;
  profileType?: ProfileType;
  tenantId: string;
  role: 'user' | 'admin' | 'moderator';
  needsOnboarding: boolean;
} | null> {
  try {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (response.ok) {
      const data = await response.json();
      return {
        id: data.user_id,
        email: data.email,
        name: data.name,
        profileType: data.profile_type,
        tenantId: data.tenant_id || 'default',
        role: data.role || 'user',
        needsOnboarding: !data.profile_type,
      };
    }
  } catch (error) {
    console.error('Failed to authenticate user:', error);
  }

  return null;
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
    // Email/Password provider
    CredentialsProvider({
      id: 'credentials',
      name: 'Email',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email y contraseña son requeridos');
        }

        const user = await authenticateUser(credentials.email, credentials.password);
        
        if (!user) {
          throw new Error('Email o contraseña incorrectos');
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          profileType: user.profileType,
          tenantId: user.tenantId,
          role: user.role,
          needsOnboarding: user.needsOnboarding,
        };
      },
    }),
    // Google OAuth provider
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
    async signIn({ user, account, credentials }) {
      // For credentials provider, user data is already populated
      if (account?.provider === 'credentials') {
        return true;
      }

      // For Google OAuth, sync user to backend
      if (account?.provider === 'google') {
        const backendData = await syncUserToBackend(
          {
            id: user.id,
            email: user.email!,
            name: user.name!,
            image: user.image ?? undefined,
          },
          account,
          'google'
        );

        // Attach backend data to user object
        user.profileType = backendData.profileType;
        user.tenantId = backendData.tenantId;
        user.role = backendData.role;
        user.needsOnboarding = backendData.needsOnboarding;
      }

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
        const path = url.replace(baseUrl, '');
        if (path && path !== '/') {
          return url;
        }
      }
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
