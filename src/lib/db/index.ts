import { neon } from '@neondatabase/serverless';

const databaseUrl = process.env.DATABASE_URL;
const isBuild = process.env.NEXT_PHASE === 'phase-production-build';

export const sql = (databaseUrl && !isBuild) ? neon(databaseUrl) : ((...args: any[]) => {
  if (isBuild) {
    // Silent during build to avoid failing page data collection
    return Promise.resolve([]);
  }
  console.warn("DATABASE_URL is missing. Database calls will fail.");
  return Promise.resolve([]);
}) as any;
