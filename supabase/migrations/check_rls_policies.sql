-- 检查assessment_questions表的当前RLS策略
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
WHERE tablename = 'assessment_questions';

-- 检查表的权限设置
SELECT 
    grantee, 
    table_name, 
    privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
    AND table_name = 'assessment_questions' 
    AND grantee IN ('anon', 'authenticated') 
ORDER BY table_name, grantee;