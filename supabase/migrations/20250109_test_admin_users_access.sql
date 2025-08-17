-- Test admin_users table access and create a simple test record

-- First, let's check if we can insert a test admin user
INSERT INTO admin_users (email, password_hash, full_name, role, is_active)
VALUES ('test@example.com', 'test_hash', 'Test Admin', 'admin', true)
ON CONFLICT (email) DO NOTHING;

-- Grant explicit permissions to public schema
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Grant table permissions
GRANT SELECT ON public.admin_users TO anon;
GRANT ALL PRIVILEGES ON public.admin_users TO authenticated;

-- Enable RLS and create policies
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies first
DROP POLICY IF EXISTS "Anonymous can check admin count" ON public.admin_users;
DROP POLICY IF EXISTS "Authenticated admin full access" ON public.admin_users;
DROP POLICY IF EXISTS "Allow anonymous to check admin existence" ON public.admin_users;
DROP POLICY IF EXISTS "Allow authenticated admin access" ON public.admin_users;

-- Create new policies
CREATE POLICY "anon_select_admin_users" ON public.admin_users
    FOR SELECT TO anon
    USING (true);

CREATE POLICY "authenticated_all_admin_users" ON public.admin_users
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);

-- Verify current policies
SELECT 
    schemaname,
    tablename, 
    policyname,
    roles,
    cmd,
    permissive
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'admin_users';

-- Check current grants
SELECT 
    grantee,
    table_schema,
    table_name,
    privilege_type
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
    AND table_name = 'admin_users' 
    AND grantee IN ('anon', 'authenticated')
ORDER BY grantee, privilege_type;