-- 检查contact_page_settings表的权限
SELECT 
    grantee, 
    table_name, 
    privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
    AND table_name = 'contact_page_settings'
    AND grantee IN ('anon', 'authenticated') 
ORDER BY table_name, grantee;

-- 检查RLS策略
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'contact_page_settings';