import { NextAuthOptions, DefaultSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

// Proper type augmentation for NextAuth
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username?: string | null;
    } & DefaultSession["user"]
  }

  interface User {
    id: string;
    username?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    username?: string | null;
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
            SELECT id, email, name, password, image_url, username 
            FROM users 
            WHERE email = ${credentials.email}
          `;

          const user = users[0];

          if (!user || user.password !== credentials.password) return null;

          return {
            id: user.id.toString(),
            name: user.name,
            email: user.email,
            image: user.image_url,
            username: user.username,
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
          const existingUsers = await sql`SELECT id, username FROM users WHERE email = ${user.email}`;
          
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
              VALUES (${user.email}, ${user.name}, ${finalUsername}, ${user.image})
              RETURNING id, username
            `;
            user.id = result[0].id.toString();
            user.username = result[0].username;
          } else {
            user.id = existingUsers[0].id.toString();
            user.username = existingUsers[0].username;
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
      }
      
      // Handle session update
      if (trigger === "update" && session) {
        if (session.username) token.username = session.username;
        if (session.name) token.name = session.name;
        if (session.image) token.picture = session.image;
      }
      
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.username = token.username;
        session.user.name = token.name;
        session.user.image = token.picture as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  }
};
