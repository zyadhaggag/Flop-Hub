import { neon, neonConfig } from '@neondatabase/serverless';

const databaseUrl = process.env.DATABASE_URL;
const isBuild = process.env.NEXT_PHASE === 'phase-production-build';

// Enable connection pooling via HTTP/2 fetch for better performance
neonConfig.fetchConnectionCache = true;

export const sql = (databaseUrl && !isBuild) ? neon(databaseUrl) : ((...args: any[]) => {
  if (isBuild) {
    // Silent during build to avoid failing page data collection
    return Promise.resolve([]);
  }
  console.warn("DATABASE_URL is missing. Database calls will fail.");
  return Promise.resolve([]);
}) as any;
