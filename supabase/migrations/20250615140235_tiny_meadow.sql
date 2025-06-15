/*
  # Fix user creation trigger

  1. Updates
    - Fix the `handle_new_user` trigger function to properly handle user creation
    - Ensure all required fields are populated when creating users in public.users table
    
  2. Changes
    - Update trigger function to use auth.users data for id and email
    - Add proper error handling
*/

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Update the handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, role, streams_allowed, streams_active)
  VALUES (
    NEW.id,
    NEW.email,
    'user',
    0,
    0
  );
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    -- Log the error and re-raise it
    RAISE LOG 'Error in handle_new_user: %', SQLERRM;
    RAISE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();