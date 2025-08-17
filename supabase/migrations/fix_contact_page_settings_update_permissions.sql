-- 修复contact_page_settings表的更新权限问题

-- 首先检查当前权限
SELECT 
    grantee, 
    table_name, 
    privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
    AND table_name = 'contact_page_settings'
    AND grantee IN ('anon', 'authenticated') 
ORDER BY table_name, grantee;

-- 确保anon角色有SELECT权限
GRANT SELECT ON contact_page_settings TO anon;

-- 确保authenticated角色有完整权限
GRANT ALL PRIVILEGES ON contact_page_settings TO authenticated;

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

-- 如果需要，删除现有的限制性策略并创建新的
DROP POLICY IF EXISTS "contact_page_settings_select_policy" ON contact_page_settings;
DROP POLICY IF EXISTS "contact_page_settings_update_policy" ON contact_page_settings;
DROP POLICY IF EXISTS "contact_page_settings_insert_policy" ON contact_page_settings;

-- 创建允许公共读取的策略
CREATE POLICY "contact_page_settings_select_policy" ON contact_page_settings
    FOR SELECT USING (true);

-- 创建允许认证用户修改的策略
CREATE POLICY "contact_page_settings_insert_policy" ON contact_page_settings
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "contact_page_settings_update_policy" ON contact_page_settings
    FOR UPDATE USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- 验证权限设置
SELECT 
    grantee, 
    table_name, 
    privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
    AND table_name = 'contact_page_settings'
    AND grantee IN ('anon', 'authenticated') 
ORDER BY table_name, grantee;