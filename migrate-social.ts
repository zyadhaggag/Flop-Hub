import { sql } from './src/lib/db';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function migrate() {
  console.log("Starting migration for social links...");
  try {
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '[]'::jsonb`;
    console.log("Migration successful: added social_links column.");
  } catch (error) {
    console.error("Migration failed:", error);
  }
}

migrate();
