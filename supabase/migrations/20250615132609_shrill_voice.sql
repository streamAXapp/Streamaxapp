/*
  # Create stream sessions table

  1. New Tables
    - `stream_sessions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `container_id` (text, nullable)
      - `rtmp_url` (text)
      - `video_source` (text)
      - `status` (text, default 'stopped')
      - `created_at` (timestamptz, default now())
      - `started_at` (timestamptz, nullable)
      - `stopped_at` (timestamptz, nullable)

  2. Security
    - Enable RLS on `stream_sessions` table
    - Add policies for users to manage their own sessions
    - Add policies for admins to manage all sessions
*/

-- Create stream_sessions table
CREATE TABLE IF NOT EXISTS stream_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  container_id text,
  rtmp_url text NOT NULL,
  video_source text NOT NULL,
  status text DEFAULT 'stopped' CHECK (status IN ('starting', 'running', 'stopping', 'stopped', 'error')),
  created_at timestamptz DEFAULT now(),
  started_at timestamptz,
  stopped_at timestamptz
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_stream_sessions_user_id ON stream_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_stream_sessions_status ON stream_sessions(status);
CREATE INDEX IF NOT EXISTS idx_stream_sessions_created_at ON stream_sessions(created_at);

-- Enable RLS
ALTER TABLE stream_sessions ENABLE ROW LEVEL SECURITY;

-- Policy for users to read their own sessions
CREATE POLICY "Users can read own sessions"
  ON stream_sessions
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Policy for users to create their own sessions
CREATE POLICY "Users can create own sessions"
  ON stream_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Policy for users to update their own sessions
CREATE POLICY "Users can update own sessions"
  ON stream_sessions
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- Policy for users to delete their own sessions
CREATE POLICY "Users can delete own sessions"
  ON stream_sessions
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Policy for admins to read all sessions
CREATE POLICY "Admins can read all sessions"
  ON stream_sessions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Policy for admins to update all sessions
CREATE POLICY "Admins can update all sessions"
  ON stream_sessions
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Policy for admins to delete all sessions
CREATE POLICY "Admins can delete all sessions"
  ON stream_sessions
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );