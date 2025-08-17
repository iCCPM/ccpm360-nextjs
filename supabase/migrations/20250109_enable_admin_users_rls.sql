-- Enable RLS for admin_users table and create policies for anonymous access

-- Enable Row Level Security on admin_users table
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anonymous users to check if any admin exists
-- This is needed for the checkAdminExists function in the login page
CREATE POLICY "Allow anonymous to check admin existence" ON admin_users
  FOR SELECT
  TO anon
  USING (true);

-- Grant SELECT permission to anon role for admin_users table
GRANT SELECT ON admin_users TO anon;

-- Create policy to allow authenticated users full access to admin_users
CREATE POLICY "Allow authenticated admin access" ON admin_users
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Grant full permissions to authenticated role for admin_users table
GRANT ALL PRIVILEGES ON admin_users TO authenticated;