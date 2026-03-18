-- Add is_admin column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Add category column to posts table
ALTER TABLE posts ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT NULL;

-- Set your admin user (replace with your actual username)
-- UPDATE users SET is_admin = TRUE WHERE username = 'your_username_here';
