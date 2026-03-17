-- Execute these commands in your Neon SQL Editor
-- This adds the missing columns needed for authentication
ALTER TABLE users ADD COLUMN IF NOT EXISTS name VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS password VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS image_url TEXT;
