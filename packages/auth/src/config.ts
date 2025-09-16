// ASH AI Authentication Configuration
// NextAuth.js configuration with custom providers and callbacks

import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "@ash-ai/database";
import { verifyPassword } from "./utils";
import { UserRole } from "./types";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        workspace_id: { label: "Workspace ID", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password || !credentials?.workspace_id) {
          return null;
        }

        try {
          const user = await db.user.findFirst({
            where: {
              email: credentials.email,
              workspace_id: credentials.workspace_id,
              is_active: true,
              deleted_at: null,
            },
            include: {
              workspace: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  is_active: true,
                },
              },
            },
          });

          if (!user || !user.password_hash) {
            return null;
          }

          if (!user.workspace.is_active) {
            throw new Error("Workspace is not active");
          }

          const isValidPassword = await verifyPassword(
            credentials.password,
            user.password_hash
          );

          if (!isValidPassword) {
            return null;
          }

          // Update last login
          await db.user.update({
            where: { id: user.id },
            data: { last_login_at: new Date() },
          });

          return {
            id: user.id,
            email: user.email,
            name: `${user.first_name} ${user.last_name}`,
            image: user.avatar_url,
            role: user.role as UserRole,
            workspace_id: user.workspace_id,
            workspace_name: user.workspace.name,
            permissions: user.permissions ? JSON.parse(user.permissions) : [],
            requires_2fa: user.requires_2fa,
          };
        } catch (error) {
          console.error("Authentication error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // Initial sign in
      if (user) {
        token.role = user.role;
        token.workspace_id = user.workspace_id;
        token.workspace_name = user.workspace_name;
        token.permissions = user.permissions;
        token.requires_2fa = user.requires_2fa;
      }

      // Handle session updates
      if (trigger === "update" && session) {
        if (session.role) token.role = session.role;
        if (session.permissions) token.permissions = session.permissions;
      }

      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!;
        session.user.role = token.role as UserRole;
        session.user.workspace_id = token.workspace_id as string;
        session.user.workspace_name = token.workspace_name as string;
        session.user.permissions = token.permissions as string[];
        session.user.requires_2fa = token.requires_2fa as boolean;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Handle redirects after authentication
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
    updateAge: 60 * 60, // 1 hour
  },
  jwt: {
    maxAge: 24 * 60 * 60, // 24 hours
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  events: {
    async signIn(message) {
      // Log successful sign-ins
      console.log(`User signed in: ${message.user.email}`);
    },
    async signOut(message) {
      // Log sign-outs
      console.log(`User signed out: ${message.token?.email}`);
    },
  },
  debug: process.env.NODE_ENV === "development",
};