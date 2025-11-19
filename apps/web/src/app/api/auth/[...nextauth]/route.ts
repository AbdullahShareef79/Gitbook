import NextAuth, { NextAuthOptions } from 'next-auth';
import GithubProvider from 'next-auth/providers/github';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export const authOptions: NextAuthOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID || '',
      clientSecret: process.env.GITHUB_SECRET || '',
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        // Call our backend to create/update user and get JWT token
        const githubProfile = profile as any;
        const response = await fetch(`${API_URL}/auth/github`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: user.email,
            name: user.name,
            image: user.image,
            githubId: githubProfile.id?.toString() || account?.providerAccountId,
            handle: githubProfile.login || user.email?.split('@')[0],
          }),
        });

        if (!response.ok) {
          console.error('Failed to authenticate with backend');
          return false;
        }

        const data = await response.json();
        // Store the JWT token in the account for later use
        if (account) {
          (account as any).jwt = data.accessToken;
          (account as any).backendUser = data.user;
        }
        return true;
      } catch (error) {
        console.error('Error during sign in:', error);
        return false;
      }
    },
    async jwt({ token, account }) {
      // Persist the JWT token from our backend
      if (account) {
        token.accessToken = (account as any).jwt;
        token.backendUser = (account as any).backendUser;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = (token.backendUser as any)?.id || token.sub;
        (session.user as any).handle = (token.backendUser as any)?.handle;
        (session as any).accessToken = token.accessToken;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
