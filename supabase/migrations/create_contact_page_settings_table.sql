-- 创建联系页面设置表
CREATE TABLE IF NOT EXISTS contact_page_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  hero_title TEXT NOT NULL DEFAULT '联系我们',
  hero_description TEXT NOT NULL DEFAULT '我们期待与您的合作，为您提供专业的项目管理解决方案',
  phone TEXT NOT NULL DEFAULT '+86 400-123-4567',
  email TEXT NOT NULL DEFAULT 'info@ccpm360.com',
  address TEXT NOT NULL DEFAULT '北京市朝阳区建国路88号现代城A座1001室',
  working_hours TEXT DEFAULT '周一至周五 9:00-18:00',
  wechat TEXT DEFAULT 'CCPM360',
  qq TEXT DEFAULT '123456789',
  map_title TEXT DEFAULT '我们的位置',
  map_description TEXT DEFAULT '欢迎您到访我们的办公室',
  form_title TEXT DEFAULT '在线咨询',
  form_description TEXT DEFAULT '请填写以下信息，我们会尽快与您联系',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建更新时间触发器
CREATE OR REPLACE FUNCTION update_contact_page_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_contact_page_settings_updated_at
  BEFORE UPDATE ON contact_page_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_contact_page_settings_updated_at();

-- 启用行级安全策略
ALTER TABLE contact_page_settings ENABLE ROW LEVEL SECURITY;

-- 创建策略：允许所有人读取联系页面设置
CREATE POLICY "Allow public read access to contact page settings" ON contact_page_settings
  FOR SELECT USING (true);

-- 创建策略：只允许认证用户修改联系页面设置
CREATE POLICY "Allow authenticated users to modify contact page settings" ON contact_page_settings
  FOR ALL USING (auth.role() = 'authenticated');

-- 授予权限
GRANT SELECT ON contact_page_settings TO anon;
GRANT ALL PRIVILEGES ON contact_page_settings TO authenticated;

-- 插入默认设置（如果表为空）
INSERT INTO contact_page_settings (
  hero_title,
  hero_description,
  phone,
  email,
  address,
  working_hours,
  wechat,
  qq,
  map_title,
  map_description,
  form_title,
  form_description
) 
SELECT 
  '联系我们',
  '我们期待与您的合作，为您提供专业的项目管理解决方案',
  '+86 400-123-4567',
  'info@ccpm360.com',
  '北京市朝阳区建国路88号现代城A座1001室',
  '周一至周五 9:00-18:00',
  'CCPM360',
  '123456789',
  '我们的位置',
  '欢迎您到访我们的办公室',
  '在线咨询',
  '请填写以下信息，我们会尽快与您联系'
WHERE NOT EXISTS (SELECT 1 FROM contact_page_settings);