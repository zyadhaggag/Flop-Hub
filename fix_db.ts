
import { sql } from './src/lib/db';

async function fixDb() {
  console.log("Fixing database...");
  try {
    // 1. Add updated_at if missing
    await sql`ALTER TABLE posts ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP`;
    console.log("Added updated_at to posts");

    // 2. Add category if missing
    await sql`ALTER TABLE posts ADD COLUMN IF NOT EXISTS category VARCHAR(100)`;
    console.log("Added category to posts");

    // 3. Ensure user_challenges table exists for the awards system
    await sql`
      CREATE TABLE IF NOT EXISTS user_challenges (
        user_id TEXT NOT NULL,
        challenge_id TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        progress JSONB DEFAULT '{}',
        reward_claimed BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id, challenge_id)
      )
    `;
    
    // Add celebrated_at if not exists
    try {
      await sql`ALTER TABLE user_challenges ADD COLUMN IF NOT EXISTS celebrated_at TIMESTAMP WITH TIME ZONE`;
      console.log('Ensured celebrated_at column exists in user_challenges');
    } catch (e) {
      console.log('celebrated_at column might already exist or error adding it');
    }
    console.log("Ensured user_challenges table exists");

    // 4. Ensure saves table exists
    await sql`
      CREATE TABLE IF NOT EXISTS saves (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, post_id)
      )
    `;
    console.log("Ensured saves table exists");

    console.log("Database fix completed successfully!");
  } catch (err) {
    console.error("Error fixing database:", err);
  }
}

fixDb();
