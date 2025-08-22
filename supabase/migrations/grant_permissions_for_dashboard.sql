-- 为仪表板数据授予anon角色访问权限

-- 授予contact_submissions表的SELECT权限给anon角色
GRANT SELECT ON contact_submissions TO anon;

-- 授予assessment_records表的SELECT权限给anon角色
GRANT SELECT ON assessment_records TO anon;

-- 检查当前权限
SELECT grantee, table_name, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
AND grantee IN ('anon', 'authenticated') 
AND table_name IN ('contact_submissions', 'assessment_records')
ORDER BY table_name, grantee;