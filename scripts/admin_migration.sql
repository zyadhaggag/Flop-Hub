-- Migration: Admin Extensions
-- Run this in your Supabase SQL Editor or Neon Console

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS followers_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS override_post_count INTEGER DEFAULT NULL,
ADD COLUMN IF NOT EXISTS timeout_until TIMESTAMP WITH TIME ZONE DEFAULT NULL,
ADD COLUMN IF NOT EXISTS timeout_reason TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS timeout_by TEXT DEFAULT NULL;

-- Index for timeout checks
CREATE INDEX IF NOT EXISTS idx_users_timeout ON users(timeout_until) WHERE timeout_until IS NOT NULL;
