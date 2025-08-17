-- 检查并修复 contact_page_settings 表的权限

-- 为 anon 角色授予 SELECT 权限（用于读取数据）
GRANT SELECT ON contact_page_settings TO anon;

-- 为 authenticated 角色授予所有权限（用于读取、插入、更新、删除）
GRANT ALL PRIVILEGES ON contact_page_settings TO authenticated;

-- 确保 RLS 策略正确设置
-- 删除现有策略（如果存在）
DROP POLICY IF EXISTS "contact_page_settings_select_policy" ON contact_page_settings;
DROP POLICY IF EXISTS "contact_page_settings_insert_policy" ON contact_page_settings;
DROP POLICY IF EXISTS "contact_page_settings_update_policy" ON contact_page_settings;
DROP POLICY IF EXISTS "contact_page_settings_delete_policy" ON contact_page_settings;

-- 创建新的 RLS 策略
-- 允许所有人读取联系页面设置
CREATE POLICY "contact_page_settings_select_policy" ON contact_page_settings
    FOR SELECT USING (true);

-- 只允许认证用户插入数据
CREATE POLICY "contact_page_settings_insert_policy" ON contact_page_settings
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 只允许认证用户更新数据
CREATE POLICY "contact_page_settings_update_policy" ON contact_page_settings
    FOR UPDATE USING (auth.role() = 'authenticated');

-- 只允许认证用户删除数据
CREATE POLICY "contact_page_settings_delete_policy" ON contact_page_settings
    FOR DELETE USING (auth.role() = 'authenticated');

-- 确保表启用了 RLS
ALTER TABLE contact_page_settings ENABLE ROW LEVEL SECURITY;