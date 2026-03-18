// src/types/next-auth.d.ts
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    // add the custom property you store for your users
    social_links?: string | Record<string, any> | Array<Record<string, any>>;
  }

  interface Session {
    user: DefaultSession["user"] & {
      social_links?: string | Record<string, any> | Array<Record<string, any>>;
    };
  }
}
