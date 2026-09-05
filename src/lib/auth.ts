import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { authConfig } from "@/lib/auth.config";
import { UserRole } from "@prisma/client";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),

    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        const normalizedEmail = (credentials.email as string).toLowerCase().trim();
        const user = await prisma.user.findUnique({
          where: { email: normalizedEmail },
        });

        if (!user || !user.password) {
          throw new Error("No account found with this email");
        }

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isValid) {
          throw new Error("Incorrect password");
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role || "freelancer",
          clientId: user.clientId || undefined,
        };
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        if (!user.email) {
          throw new Error("No email returned from Google");
        }
        const normalizedEmail = user.email.toLowerCase().trim();
        let dbUser = await prisma.user.findUnique({
          where: { email: normalizedEmail },
        });

        if (!dbUser) {
          dbUser = await prisma.user.create({
            data: {
              name: user.name || "Google User",
              email: normalizedEmail,
              image: user.image || null,
              role: UserRole.freelancer,
            },
          });

          // Create default workspace for new Google user
          await prisma.workspace.create({
            data: {
              name: `${dbUser.name}'s Workspace`,
              slug: `ws-${dbUser.id.slice(-8)}`,
              ownerId: dbUser.id,
            },
          });
        }

        user.id = dbUser.id;
        user.role = dbUser.role;
        user.clientId = dbUser.clientId || undefined;
      }
      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role || "freelancer";
        token.clientId = user.clientId;
      }

      if (token.id) {
        const dbUser = token.email
          ? await prisma.user.findUnique({
              where: { email: (token.email as string).toLowerCase().trim() },
            })
          : await prisma.user.findUnique({
              where: { id: token.id as string },
            });

        if (dbUser) {
          token.id = dbUser.id;
          token.picture = dbUser.image;
          token.name = dbUser.name;
          token.role = dbUser.role || "freelancer";
          token.clientId = dbUser.clientId || undefined;
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = (token.role as "freelancer" | "client") || "freelancer";
        session.user.clientId = token.clientId as string | undefined;
      }
      return session;
    },
  },
});
