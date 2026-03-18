import { NextAuthOptions, DefaultSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

// Proper type augmentation for NextAuth
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username?: string | null;
      bio?: string | null;
      banner_url?: string | null;
      social_links?: any[] | null;
    } & DefaultSession["user"]
  }

  interface User {
    id: string;
    username?: string | null;
    bio?: string | null;
    banner_url?: string | null;
    social_links?: any[] | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    username?: string | null;
    bio?: string | null;
    banner_url?: string | null;
    social_links?: any[] | null;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const { sql } = await import("@/lib/db");
        
        try {
          const users = await sql`
            SELECT id, email, name, password, image_url, username, banner_url, bio, social_links
            FROM users 
            WHERE email = ${credentials.email}
          `;

          const user = users[0];

          if (!user || user.password !== credentials.password) return null;

          return {
            id: user.id.toString(),
            name: user.name,
            email: user.email,
            image: user.image_url || "/api/placeholder/user",
            username: user.username,
            banner_url: user.banner_url,
            bio: user.bio,
            social_links: user.social_links,
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      }
    })
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        const { sql } = await import("@/lib/db");
        
        try {
          // Check if user exists
          const existingUsers = await sql`SELECT id, username, banner_url, bio, social_links FROM users WHERE email = ${user.email}`;
          
          if (existingUsers.length === 0) {
            // Create user for first time
            let baseUsername = user.email?.split("@")[0] || "user";
            baseUsername = baseUsername.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
            
            // Check if username unique
            const sameUsername = await sql`SELECT id FROM users WHERE username = ${baseUsername}`;
            let finalUsername = baseUsername;
            if (sameUsername.length > 0) {
              finalUsername = `${baseUsername}${Math.floor(Math.random() * 1000)}`;
            }

            const result = await sql`
              INSERT INTO users (email, name, username, image_url)
              VALUES (${user.email}, ${user.name}, ${finalUsername}, ${user.image || "/api/placeholder/user"})
              RETURNING id, username
            `;
            user.id = result[0].id.toString();
            user.username = result[0].username;
          } else {
            user.id = existingUsers[0].id.toString();
            user.username = existingUsers[0].username;
            user.banner_url = existingUsers[0].banner_url;
            user.bio = existingUsers[0].bio;
            user.social_links = existingUsers[0].social_links;
            user.image = existingUsers[0].image_url || "/api/placeholder/user";
          }
          return true;
        } catch (error) {
          console.error("Google sync error:", error);
          return true; // Still allow login
        }
      }
      return true;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.name = user.name;
        token.picture = user.image;
        token.banner_url = user.banner_url;
        token.bio = user.bio;
        token.social_links = user.social_links;
      }
      
      // Handle session update
      if (trigger === "update" && session) {
        if (session.username) token.username = session.username;
        if (session.name) token.name = session.name;
        if (session.image) token.picture = session.image;
        if (session.banner_url) token.banner_url = session.banner_url;
        if (session.bio) token.bio = session.bio;
        if (session.social_links) token.social_links = session.social_links;
      }
      
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.username = token.username;
        session.user.name = token.name;
        session.user.image = token.picture as string;
        session.user.banner_url = token.banner_url;
        session.user.bio = token.bio;
        session.user.social_links = token.social_links;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  }
};
