-- Migration for Telegram bot integration
-- Creates telegram_users table to link Telegram accounts to application users

-- Create telegram_users table
CREATE TABLE telegram_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  telegram_id bigint NOT NULL UNIQUE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  username text,
  first_name text,
  last_name text,
  created_at timestamptz DEFAULT now()
);

-- Create index for performance
CREATE INDEX idx_telegram_users_telegram_id ON telegram_users(telegram_id);
CREATE INDEX idx_telegram_users_user_id ON telegram_users(user_id);

-- Enable Row Level Security
ALTER TABLE telegram_users ENABLE ROW LEVEL SECURITY;

-- RLS Policy - users can only access their own telegram_users records
CREATE POLICY "Users can only access their own telegram accounts"
  ON telegram_users FOR ALL
  USING (auth.uid() = user_id);