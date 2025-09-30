import { NextAuthOptions } from "next-auth";
import EmailProvider from "next-auth/providers/email";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import { connectDB, getMongoDbClient } from "@/lib/database";
import { User } from "@/models/User";
import { sendVerificationRequest } from "@/services/verificationMail";

await connectDB();
export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(getMongoDbClient() as any),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: parseInt(process.env.EMAIL_SERVER_PORT!),
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM,
      sendVerificationRequest,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      await connectDB();
      const mongoClient = getMongoDbClient();
      const db = mongoClient.db();
      const existingUser = await User.findOne({ email: user.email });
      const existingAccount = await db.collection("accounts").findOne({
        providerAccountId: account?.providerAccountId,
      });
      if (
        existingUser &&
        (account?.provider === "google" || account?.provider === "github")
      ) {
        if (!existingAccount) {
          await db.collection("accounts").insertOne({
            userId: existingUser?._id,
            type: account?.type,
            provider: account?.provider,
            providerAccountId: account?.providerAccountId,
            access_token: account?.access_token,
            refresh_token: account?.refresh_token,
            expires_at: account?.expires_at,
            token_type: account?.token_type,
            scope: account?.scope,
            id_token: account?.id_token,
          });
        }
      }

      if (!existingUser) {
        const newUser = await User.create({
          name: user.name || "",
          email: user.email,
          image: user.image || "",
          emailVerified: new Date(),
          isProfileComplete:
            account?.provider === "google" || account?.provider === "github"
              ? true
              : false,
          globalRole: "user",
        });
        console.log(account);

        if (account) {
          await db.collection("accounts").insertOne({
            userId: newUser._id,
            type: account.type,
            provider: account.provider,
            providerAccountId: account.providerAccountId,
            access_token: account.access_token,
            refresh_token: account.refresh_token,
            expires_at: account.expires_at,
            token_type: account.token_type,
            scope: account.scope,
            id_token: account.id_token,
          });
        }
        return true;
      }
      return true;
    },

    async jwt({ token, user, trigger }) {
      if (user) {
        token._id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.image = user.image;
        token.isProfileComplete = user.isProfileComplete ?? false;
        token.role = user.globalRole;
      }
      if (trigger === "update" || !token.isProfileComplete) {
        await connectDB();
        const dbUser = await User.findOne({ email: token.email });
        if (dbUser) {
          token._id = dbUser._id;
          token.name = dbUser.name;
          token.email = dbUser.email;
          token.image = dbUser.image;
          token.isProfileComplete = dbUser.isProfileComplete;
          token.globalRole = dbUser.globalRole;
        }
      }

      return token;
    },
    async session({ session, token }) {
      session.user._id = token._id;
      session.user.name = token.name;
      session.user.email = token.email;
      session.user.image = token.image;
      session.user.isProfileComplete = token.isProfileComplete ?? false;
      session.user.role = token.role;
      // console.log(session); // --- IGNORE ---
      return session;
    },
  },
  events: {
    async createUser({ user }) {
      await connectDB();
      console.log(user); // --- IGNORE ---

      await User.findOneAndUpdate(
        { email: user.email },
        {
          isProfileComplete: user.name ? true : false,
        }
      );
    },
  },
  pages: {
    signIn: "/sign-in",
    error: "/auth/error",
    verifyRequest: "/verify-request",
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
};
