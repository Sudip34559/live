import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      _id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      isProfileComplete?: boolean;
      role?: string;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    isProfileComplete?: boolean;
    globalRole?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    _id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    isProfileComplete?: boolean;
    role?: string;
  }
}
