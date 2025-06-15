/*
  # Add Stream Management Functions

  1. New Functions
    - increment_user_streams: Safely increment active stream count
    - decrement_user_streams: Safely decrement active stream count
    - cleanup_orphaned_streams: Clean up streams without containers

  2. Security
    - Functions use security definer for admin operations
    - Proper validation and error handling
*/

-- Function to increment user's active streams count
CREATE OR REPLACE FUNCTION increment_user_streams(user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE users 
  SET streams_active = LEAST(streams_active + 1, streams_allowed)
  WHERE id = user_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found: %', user_id;
  END IF;
END;
$$;

-- Function to decrement user's active streams count
CREATE OR REPLACE FUNCTION decrement_user_streams(user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE users 
  SET streams_active = GREATEST(streams_active - 1, 0)
  WHERE id = user_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found: %', user_id;
  END IF;
END;
$$;

-- Function to cleanup orphaned streams (streams without running containers)
CREATE OR REPLACE FUNCTION cleanup_orphaned_streams()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  cleanup_count integer := 0;
BEGIN
  -- Update streams that have been "starting" for more than 5 minutes to error
  UPDATE stream_sessions 
  SET status = 'error'
  WHERE status = 'starting' 
    AND created_at < NOW() - INTERVAL '5 minutes';
  
  GET DIAGNOSTICS cleanup_count = ROW_COUNT;
  
  -- Update streams that have been "stopping" for more than 2 minutes to stopped
  UPDATE stream_sessions 
  SET status = 'stopped', stopped_at = NOW()
  WHERE status = 'stopping' 
    AND created_at < NOW() - INTERVAL '2 minutes';
  
  -- Reset user active stream counts based on actual running streams
  UPDATE users 
  SET streams_active = (
    SELECT COUNT(*)
    FROM stream_sessions 
    WHERE stream_sessions.user_id = users.id 
      AND stream_sessions.status IN ('running', 'starting')
  );
  
  RETURN cleanup_count;
END;
$$;

-- Create index for better performance on stream status queries
CREATE INDEX IF NOT EXISTS idx_stream_sessions_status_created 
ON stream_sessions(status, created_at);

-- Grant execute permissions to authenticated users for the increment/decrement functions
GRANT EXECUTE ON FUNCTION increment_user_streams(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION decrement_user_streams(uuid) TO authenticated;

-- Grant execute permission to service role for cleanup function
GRANT EXECUTE ON FUNCTION cleanup_orphaned_streams() TO service_role;