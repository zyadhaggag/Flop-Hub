import { neon } from '@neondatabase/serverless';

const databaseUrl = 'postgresql://neondb_owner:npg_am2xJN5DMZjy@ep-ancient-dawn-aloi1518-pooler.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
const sql = neon(databaseUrl);

async function main() {
  const usersColumns = await sql`
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_name = 'users'
  `;
  console.log('Columns in users table:', usersColumns.map(c => c.column_name).join(', '));

  const postsColumns = await sql`
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_name = 'posts'
  `;
  console.log('Columns in posts table:', postsColumns.map(c => c.column_name).join(', '));

  const sampleData = await sql`
    SELECT id, username, image_url, avatar_url, name 
    FROM users 
    LIMIT 5
  `;
  console.log('Sample user data:', JSON.stringify(sampleData, null, 2));

  const countImageUrl = await sql`
    SELECT COUNT(*) as count 
    FROM users 
    WHERE image_url IS NOT NULL AND image_url != ''
  `;
  const countAvatarUrl = await sql`
    SELECT COUNT(*) as count 
    FROM users 
    WHERE avatar_url IS NOT NULL AND avatar_url != ''
  `;
  console.log('Users with image_url:', countImageUrl[0].count);
  console.log('Users with avatar_url:', countAvatarUrl[0].count);
}

main().catch(console.error);
