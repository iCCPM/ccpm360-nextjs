-- Fix admin_users table permissions
-- Grant basic read access to anon role for checking admin existence
GRANT SELECT ON admin_users TO anon;

-- Grant full access to authenticated role
GRANT ALL PRIVILEGES ON admin_users TO authenticated;

-- Check current permissions
SELECT grantee, table_name, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
AND table_name = 'admin_users'
AND grantee IN ('anon', 'authenticated') 
ORDER BY table_name, grantee;