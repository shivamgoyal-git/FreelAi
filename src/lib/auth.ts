import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { authConfig } from "@/lib/auth.config";

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

        await connectDB();

        const user = await User.findOne({ email: credentials.email }).select(
          "+password"
        );

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
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          image: user.image,
        };
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      // Handle Google sign-in — upsert user in MongoDB and store the MongoDB _id
      if (account?.provider === "google") {
        if (!user.email) {
          throw new Error("No email returned from Google");
        }
        await connectDB();
        let dbUser = await User.findOne({ email: user.email });
        if (!dbUser) {
          dbUser = await User.create({
            name: user.name || "Google User",
            email: user.email,
            image: user.image || undefined,
          });
        }
        // Override Google's UUID with the real MongoDB ObjectId string
        user.id = dbUser._id.toString();
      }
      return true;
    },

    async jwt({ token, user }) {
      // On first sign-in, attach extra fields to the token
      if (user) {
        token.id = user.id;
      }

      // Ensure we have the actual MongoDB ObjectId (Google OAuth uses UUID as default token.id)
      if (token.id) {
        await connectDB();
        const dbUser = token.email
          ? await User.findOne({ email: token.email })
          : await User.findById(token.id).catch(() => null);
        if (dbUser) {
          token.id = dbUser._id.toString(); // normalize to MongoDB _id
          token.picture = dbUser.image;
          token.name = dbUser.name;
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});
