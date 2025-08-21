-- 检查当前权限
SELECT grantee, table_name, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
  AND table_name IN ('visitor_sessions', 'page_views', 'user_events') 
  AND grantee IN ('anon', 'authenticated') 
ORDER BY table_name, grantee;

-- 为anon角色授予基本读取权限
GRANT SELECT ON visitor_sessions TO anon;
GRANT SELECT ON page_views TO anon;
GRANT SELECT ON user_events TO anon;

-- 为authenticated角色授予完整权限
GRANT ALL PRIVILEGES ON visitor_sessions TO authenticated;
GRANT ALL PRIVILEGES ON page_views TO authenticated;
GRANT ALL PRIVILEGES ON user_events TO authenticated;

-- 再次检查权限
SELECT grantee, table_name, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
  AND table_name IN ('visitor_sessions', 'page_views', 'user_events') 
  AND grantee IN ('anon', 'authenticated') 
ORDER BY table_name, grantee;