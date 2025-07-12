-- Function to validate and consume telegram link codes
-- This bypasses RLS since the bot needs to validate codes across users

CREATE OR REPLACE FUNCTION validate_telegram_link_code(
  input_code text,
  telegram_user_id bigint,
  telegram_username text DEFAULT NULL,
  telegram_first_name text DEFAULT NULL,
  telegram_last_name text DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER -- This allows the function to bypass RLS
AS $$
DECLARE
  link_record telegram_link_codes%ROWTYPE;
  user_record auth.users%ROWTYPE;
  result json;
BEGIN
  -- Find valid, unused, non-expired code
  SELECT * INTO link_record
  FROM telegram_link_codes
  WHERE code = input_code
    AND used = false
    AND expires_at > now();
  
  -- Check if code was found
  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Invalid or expired link code'
    );
  END IF;
  
  -- Check if this Telegram user is already linked
  IF EXISTS (
    SELECT 1 FROM telegram_users 
    WHERE telegram_id = telegram_user_id
  ) THEN
    RETURN json_build_object(
      'success', false,
      'error', 'This Telegram account is already linked to another user'
    );
  END IF;
  
  -- Mark code as used
  UPDATE telegram_link_codes
  SET used = true
  WHERE code = input_code;
  
  -- Create telegram_users entry
  INSERT INTO telegram_users (
    telegram_id,
    user_id,
    username,
    first_name,
    last_name
  ) VALUES (
    telegram_user_id,
    link_record.user_id,
    telegram_username,
    telegram_first_name,
    telegram_last_name
  );
  
  -- Get user info for response
  SELECT * INTO user_record
  FROM auth.users
  WHERE id = link_record.user_id;
  
  -- Return success with user info
  RETURN json_build_object(
    'success', true,
    'user_id', link_record.user_id,
    'telegram_id', telegram_user_id,
    'username', telegram_username,
    'first_name', telegram_first_name,
    'last_name', telegram_last_name
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Database error: ' || SQLERRM
    );
END;
$$;