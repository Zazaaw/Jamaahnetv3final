-- =====================================================
-- Chat Notification Trigger Setup
-- =====================================================
-- This migration creates a database trigger that calls
-- the Supabase Edge Function when a new message is inserted
-- =====================================================

-- Step 1: Enable the pg_net extension (required for HTTP requests)
-- This extension allows PostgreSQL to make HTTP calls
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Step 2: Create or replace the notification function
-- This function is triggered after each message insert
CREATE OR REPLACE FUNCTION notify_new_message()
RETURNS trigger AS $$
DECLARE
  webhook_url text;
  request_id bigint;
BEGIN
  -- ⚠️ IMPORTANT: Replace YOUR_PROJECT_REF with your actual Supabase project reference
  -- Example: https://abcdefghijk.supabase.co
  webhook_url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-chat-notification';
  
  -- Make async HTTP POST request to edge function
  -- The edge function will handle the FCM notification
  SELECT net.http_post(
    url := webhook_url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.anon_key', true)
    ),
    body := jsonb_build_object(
      'type', 'INSERT',
      'table', TG_TABLE_NAME,
      'schema', TG_TABLE_SCHEMA,
      'record', row_to_json(NEW),
      'old_record', NULL
    )
  ) INTO request_id;

  -- Log the request ID for debugging
  RAISE LOG 'Notification webhook triggered with request_id: %', request_id;
  
  -- Return NEW to allow the insert to complete
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the insert
    RAISE WARNING 'Failed to trigger notification webhook: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 3: Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_message_inserted ON messages;

-- Step 4: Create the trigger on the messages table
CREATE TRIGGER on_message_inserted
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_message();

-- Step 5: Grant necessary permissions
-- Ensure the function can access settings
GRANT USAGE ON SCHEMA net TO postgres, anon, authenticated, service_role;

-- =====================================================
-- MANUAL CONFIGURATION REQUIRED:
-- =====================================================
-- 1. Update webhook_url in the function above with your project ref
-- 2. Set the anon_key in your database settings:
--    ALTER DATABASE postgres SET app.settings.anon_key = 'your-anon-key';
-- 3. Deploy the edge function first:
--    supabase functions deploy send-chat-notification
-- 4. Set Firebase Server Key as Supabase secret:
--    supabase secrets set FIREBASE_SERVER_KEY=your-server-key
-- =====================================================

-- Test the trigger with a sample insert:
-- INSERT INTO messages (chat_id, sender_id, recipient_id, content)
-- VALUES ('test-chat', 'sender-uuid', 'recipient-uuid', 'Test message');

-- Check trigger is active:
-- SELECT * FROM pg_trigger WHERE tgname = 'on_message_inserted';

-- View function definition:
-- \df+ notify_new_message

COMMENT ON FUNCTION notify_new_message() IS 
'Triggers chat notification edge function when new message is inserted. Sends push notification via FCM to recipient.';

COMMENT ON TRIGGER on_message_inserted ON messages IS 
'Calls notify_new_message() function to send push notifications for new chat messages.';
