-- 创建服务页面设置表
CREATE TABLE IF NOT EXISTS services_page_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  hero_title TEXT NOT NULL DEFAULT '全方位项目管理解决方案',
  hero_subtitle TEXT NOT NULL DEFAULT '从专业培训到定制咨询，提供完整的关键链项目管理服务体系，助力企业实现项目成功',
  hero_badge_text TEXT NOT NULL DEFAULT '专业服务',
  feature_1_title TEXT NOT NULL DEFAULT '系统化培训',
  feature_2_title TEXT NOT NULL DEFAULT '定制化咨询',
  feature_3_title TEXT NOT NULL DEFAULT '行业解决方案',
  training_section_title TEXT NOT NULL DEFAULT '系统化培训课程',
  training_section_subtitle TEXT NOT NULL DEFAULT '从基础理论到高级实践，构建完整的CCPM知识体系，满足不同层次的学习需求',
  training_badge_text TEXT NOT NULL DEFAULT '专业培训',
  consulting_section_title TEXT NOT NULL DEFAULT '咨询服务',
  consulting_section_subtitle TEXT NOT NULL DEFAULT '专业的项目管理咨询服务，为企业提供定制化的CCPM实施方案',
  solutions_section_title TEXT NOT NULL DEFAULT '行业解决方案',
  solutions_section_subtitle TEXT NOT NULL DEFAULT '针对不同行业特点，提供专业的CCPM解决方案',
  cta_title TEXT NOT NULL DEFAULT '准备提升您的项目管理水平？',
  cta_subtitle TEXT NOT NULL DEFAULT '联系我们的专家团队，获取专业的项目管理解决方案',
  cta_button_text TEXT NOT NULL DEFAULT '立即咨询',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 创建更新时间触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_services_page_settings_updated_at
    BEFORE UPDATE ON services_page_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 启用行级安全策略
ALTER TABLE services_page_settings ENABLE ROW LEVEL SECURITY;

-- 创建策略：允许所有用户读取
CREATE POLICY "Allow public read access" ON services_page_settings
    FOR SELECT USING (true);

-- 创建策略：只允许认证用户修改
CREATE POLICY "Allow authenticated users to modify" ON services_page_settings
    FOR ALL USING (auth.role() = 'authenticated');

-- 授权给anon和authenticated角色
GRANT SELECT ON services_page_settings TO anon;
GRANT ALL PRIVILEGES ON services_page_settings TO authenticated;

-- 插入默认数据
INSERT INTO services_page_settings (
  hero_title,
  hero_subtitle,
  hero_badge_text,
  feature_1_title,
  feature_2_title,
  feature_3_title,
  training_section_title,
  training_section_subtitle,
  training_badge_text,
  consulting_section_title,
  consulting_section_subtitle,
  solutions_section_title,
  solutions_section_subtitle,
  cta_title,
  cta_subtitle,
  cta_button_text
) VALUES (
  '全方位项目管理解决方案',
  '从专业培训到定制咨询，提供完整的关键链项目管理服务体系，助力企业实现项目成功',
  '专业服务',
  '系统化培训',
  '定制化咨询',
  '行业解决方案',
  '系统化培训课程',
  '从基础理论到高级实践，构建完整的CCPM知识体系，满足不同层次的学习需求',
  '专业培训',
  '咨询服务',
  '专业的项目管理咨询服务，为企业提供定制化的CCPM实施方案',
  '行业解决方案',
  '针对不同行业特点，提供专业的CCPM解决方案',
  '准备提升您的项目管理水平？',
  '联系我们的专家团队，获取专业的项目管理解决方案',
  '立即咨询'
) ON CONFLICT DO NOTHING;