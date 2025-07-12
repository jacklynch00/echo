-- Migration for Telegram linking verification codes
-- Creates telegram_link_codes table for secure account linking

-- Create telegram_link_codes table
CREATE TABLE telegram_link_codes (
  code text PRIMARY KEY, -- 6-digit verification code
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  expires_at timestamptz NOT NULL,
  used boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create index for performance and cleanup
CREATE INDEX idx_telegram_link_codes_user_id ON telegram_link_codes(user_id);
CREATE INDEX idx_telegram_link_codes_expires_at ON telegram_link_codes(expires_at);
CREATE INDEX idx_telegram_link_codes_used ON telegram_link_codes(used);

-- Enable Row Level Security
ALTER TABLE telegram_link_codes ENABLE ROW LEVEL SECURITY;

-- RLS Policy - users can only access their own link codes
CREATE POLICY "Users can only access their own link codes"
  ON telegram_link_codes FOR ALL
  USING (auth.uid() = user_id);

-- Function to cleanup expired codes (optional - can be run periodically)
CREATE OR REPLACE FUNCTION cleanup_expired_link_codes()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM telegram_link_codes 
  WHERE expires_at < now() OR used = true;
END;
$$;