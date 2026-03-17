import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function migrate() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('DATABASE_URL is missing');
    return;
  }

  const sql = neon(databaseUrl);

  console.log('Migrating database...');
  try {
    // Add missing columns if they don't exist
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS name VARCHAR(255)`;
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS password VARCHAR(255)`;
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS image_url TEXT`;
    
    // Create saves table
    await sql`
      CREATE TABLE IF NOT EXISTS saves (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, post_id)
      )
    `;
    
    console.log('Migration successful!');
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

migrate();
