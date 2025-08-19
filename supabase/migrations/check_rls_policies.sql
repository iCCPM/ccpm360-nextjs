-- 查看当前的 RLS 策略
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'case_studies';

-- 查看当前权限
SELECT grantee, table_name, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
AND table_name = 'case_studies'
AND grantee IN ('anon', 'authenticated') 
ORDER BY table_name, grantee;