-- Fix admin_users table permissions for anonymous access
-- This addresses the ERR_ABORTED and Failed to fetch errors

-- First, ensure RLS is enabled
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow anonymous to check admin existence" ON admin_users;
DROP POLICY IF EXISTS "Allow authenticated admin access" ON admin_users;

-- Create a more permissive policy for anonymous users to check admin existence
CREATE POLICY "Anonymous can check admin count" ON admin_users
  FOR SELECT
  TO anon
  USING (true);

-- Create policy for authenticated users
CREATE POLICY "Authenticated admin full access" ON admin_users
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Ensure proper grants
GRANT SELECT ON admin_users TO anon;
GRANT ALL ON admin_users TO authenticated;

-- Also grant usage on the sequence if it exists
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Verify the policies are created
SELECT schemaname, tablename, policyname, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'admin_users';