-- 检查assessment_records表的权限配置
SELECT grantee, table_name, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
  AND table_name = 'assessment_records' 
  AND grantee IN ('anon', 'authenticated') 
ORDER BY grantee;

-- 检查RLS策略
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename = 'assessment_records';

-- 检查表中的数据
SELECT COUNT(*) as total_records, 
       AVG(total_score) as average_score,
       MIN(total_score) as min_score,
       MAX(total_score) as max_score
FROM assessment_records;

-- 查看最近的几条记录
SELECT id, user_name, total_score, assessment_level, completed_at
FROM assessment_records
ORDER BY completed_at DESC
LIMIT 5;