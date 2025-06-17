/*
  # Create stream requests table

  1. New Tables
    - `stream_requests`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `video_source` (text) - file path or URL
      - `video_url` (text, nullable) - original URL if provided
      - `rtmp_url` (text) - YouTube RTMP URL
      - `title` (text) - stream title
      - `description` (text, nullable) - stream description
      - `status` (text, default 'pending') - pending, approved, rejected, streaming, stopped
      - `admin_notes` (text, nullable) - admin feedback
      - `created_at` (timestamptz, default now())
      - `approved_at` (timestamptz, nullable)
      - `started_at` (timestamptz, nullable)
      - `stopped_at` (timestamptz, nullable)

  2. Security
    - Enable RLS on `stream_requests` table
    - Add policies for users to manage their own requests
    - Add policies for admins to manage all requests
*/

-- Create stream_requests table
CREATE TABLE IF NOT EXISTS stream_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  video_source text NOT NULL,
  video_url text,
  rtmp_url text NOT NULL,
  title text NOT NULL,
  description text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'streaming', 'stopped')),
  admin_notes text,
  created_at timestamptz DEFAULT now(),
  approved_at timestamptz,
  started_at timestamptz,
  stopped_at timestamptz
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_stream_requests_user_id ON stream_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_stream_requests_status ON stream_requests(status);
CREATE INDEX IF NOT EXISTS idx_stream_requests_created_at ON stream_requests(created_at);

-- Enable RLS
ALTER TABLE stream_requests ENABLE ROW LEVEL SECURITY;

-- Policy for users to read their own requests
CREATE POLICY "Users can read own requests"
  ON stream_requests
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Policy for users to create their own requests
CREATE POLICY "Users can create own requests"
  ON stream_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Policy for users to update their own requests (limited fields)
CREATE POLICY "Users can update own requests"
  ON stream_requests
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Policy for admins to read all requests
CREATE POLICY "Admins can read all requests"
  ON stream_requests
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Policy for admins to update all requests
CREATE POLICY "Admins can update all requests"
  ON stream_requests
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Policy for admins to delete all requests
CREATE POLICY "Admins can delete all requests"
  ON stream_requests
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );