-- 创建案例页面设置表
CREATE TABLE cases_page_settings (
  id SERIAL PRIMARY KEY,
  -- 页面头部
  page_title VARCHAR(255) NOT NULL DEFAULT '成功案例',
  page_subtitle TEXT DEFAULT '真实案例见证CCPM360的专业实力，为各行业客户创造价值',
  
  -- 统计数据部分
  stats_title VARCHAR(255) NOT NULL DEFAULT '服务成果统计',
  stats_subtitle TEXT DEFAULT '数据说话，用实际成果证明CCPM360的专业价值',
  
  -- 统计数据项
  stat1_number VARCHAR(50) DEFAULT '500+',
  stat1_label VARCHAR(100) DEFAULT '服务企业',
  stat1_icon VARCHAR(50) DEFAULT 'Building',
  
  stat2_number VARCHAR(50) DEFAULT '5000+',
  stat2_label VARCHAR(100) DEFAULT '培训学员',
  stat2_icon VARCHAR(50) DEFAULT 'Users',
  
  stat3_number VARCHAR(50) DEFAULT '95%',
  stat3_label VARCHAR(100) DEFAULT '客户满意度',
  stat3_icon VARCHAR(50) DEFAULT 'Award',
  
  stat4_number VARCHAR(50) DEFAULT '30%',
  stat4_label VARCHAR(100) DEFAULT '平均效率提升',
  stat4_icon VARCHAR(50) DEFAULT 'TrendingUp',
  
  -- CTA部分
  cta_title VARCHAR(255) NOT NULL DEFAULT '让您的项目也成为成功案例',
  cta_subtitle TEXT DEFAULT '联系我们，获取专业的关键链项目管理解决方案',
  cta_button_text VARCHAR(100) DEFAULT '开始咨询',
  cta_button_link VARCHAR(255) DEFAULT '/contact',
  cta_secondary_text VARCHAR(100) DEFAULT '查看服务',
  cta_secondary_link VARCHAR(255) DEFAULT '/services',
  
  -- 元数据
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 启用行级安全策略
ALTER TABLE cases_page_settings ENABLE ROW LEVEL SECURITY;

-- 创建策略：允许匿名用户读取
CREATE POLICY "Allow anonymous read access" ON cases_page_settings
  FOR SELECT
  TO anon
  USING (true);

-- 创建策略：允许认证用户完全访问
CREATE POLICY "Allow authenticated full access" ON cases_page_settings
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 插入默认数据
INSERT INTO cases_page_settings (
  page_title,
  page_subtitle,
  stats_title,
  stats_subtitle,
  stat1_number,
  stat1_label,
  stat1_icon,
  stat2_number,
  stat2_label,
  stat2_icon,
  stat3_number,
  stat3_label,
  stat3_icon,
  stat4_number,
  stat4_label,
  stat4_icon,
  cta_title,
  cta_subtitle,
  cta_button_text,
  cta_button_link,
  cta_secondary_text,
  cta_secondary_link
) VALUES (
  '成功案例',
  '真实案例见证CCPM360的专业实力，为各行业客户创造价值',
  '服务成果统计',
  '数据说话，用实际成果证明CCPM360的专业价值',
  '500+',
  '服务企业',
  'Building',
  '5000+',
  '培训学员',
  'Users',
  '95%',
  '客户满意度',
  'Award',
  '30%',
  '平均效率提升',
  'TrendingUp',
  '让您的项目也成为成功案例',
  '联系我们，获取专业的关键链项目管理解决方案',
  '开始咨询',
  '/contact',
  '查看服务',
  '/services'
);

-- 创建更新时间触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_cases_page_settings_updated_at
    BEFORE UPDATE ON cases_page_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();