/*
  # Add monitoring and logging tables

  1. New Tables
    - `user_activities` - Track user actions and system events
    - `error_logs` - Store application errors for debugging
    - `performance_metrics` - Monitor system performance
    - `backup_metadata` - Track database backups

  2. Security
    - Enable RLS on all tables
    - Add appropriate policies for data access
*/

-- Create user_activities table
CREATE TABLE IF NOT EXISTS user_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  action text NOT NULL,
  resource text,
  metadata jsonb,
  ip text,
  user_agent text,
  timestamp timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Create error_logs table
CREATE TABLE IF NOT EXISTS error_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message text NOT NULL,
  stack text,
  url text,
  line integer,
  column integer,
  user_agent text,
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  timestamp timestamptz NOT NULL,
  severity text DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  context jsonb,
  ip text,
  created_at timestamptz DEFAULT now()
);

-- Create performance_metrics table
CREATE TABLE IF NOT EXISTS performance_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  value numeric NOT NULL,
  unit text DEFAULT 'ms',
  timestamp timestamptz NOT NULL,
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  page text,
  context jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create backup_metadata table
CREATE TABLE IF NOT EXISTS backup_metadata (
  id text PRIMARY KEY,
  created_at timestamptz DEFAULT now(),
  size bigint,
  tables text[],
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  file_path text,
  checksum text,
  s3_bucket text,
  s3_key text
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_activities_user_id ON user_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activities_timestamp ON user_activities(timestamp);
CREATE INDEX IF NOT EXISTS idx_error_logs_timestamp ON error_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_error_logs_severity ON error_logs(severity);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_name ON performance_metrics(name);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_timestamp ON performance_metrics(timestamp);

-- Enable RLS
ALTER TABLE user_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE backup_metadata ENABLE ROW LEVEL SECURITY;

-- Policies for user_activities
CREATE POLICY "Users can read own activities"
  ON user_activities
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can read all activities"
  ON user_activities
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Policies for error_logs
CREATE POLICY "Service role can manage error logs"
  ON error_logs
  FOR ALL
  TO service_role;

CREATE POLICY "Admins can read error logs"
  ON error_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Policies for performance_metrics
CREATE POLICY "Service role can manage performance metrics"
  ON performance_metrics
  FOR ALL
  TO service_role;

CREATE POLICY "Admins can read performance metrics"
  ON performance_metrics
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Policies for backup_metadata
CREATE POLICY "Admins can manage backup metadata"
  ON backup_metadata
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Service role can manage backup metadata"
  ON backup_metadata
  FOR ALL
  TO service_role;