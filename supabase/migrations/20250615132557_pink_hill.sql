/*
  # Create users table and authentication setup

  1. New Tables
    - `users`
      - `id` (uuid, primary key, references auth.users)
      - `email` (text, unique)
      - `role` (text, default 'user')
      - `package_type` (text, nullable)
      - `package_expires_at` (timestamptz, nullable)
      - `streams_allowed` (integer, default 0)
      - `streams_active` (integer, default 0)
      - `created_at` (timestamptz, default now())

  2. Security
    - Enable RLS on `users` table
    - Add policies for users to read their own data
    - Add policies for admins to manage all users
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  role text DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  package_type text CHECK (package_type IN ('starter', 'creator', 'pro')),
  package_expires_at timestamptz,
  streams_allowed integer DEFAULT 0,
  streams_active integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy for users to read their own data
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Policy for users to update their own data
CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Policy for admins to read all data
CREATE POLICY "Admins can read all data"
  ON users
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Policy for admins to update all data
CREATE POLICY "Admins can update all data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Function to create user profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO users (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Create admin user (you'll need to update this with actual admin email)
INSERT INTO users (id, email, role, streams_allowed)
SELECT 
  id,
  email,
  'admin',
  999
FROM auth.users 
WHERE email = 'admin@streamax.app'
ON CONFLICT (id) DO UPDATE SET
  role = 'admin',
  streams_allowed = 999;