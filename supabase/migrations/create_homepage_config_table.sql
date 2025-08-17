-- 创建首页配置表
CREATE TABLE IF NOT EXISTS homepage_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  hero_title TEXT NOT NULL DEFAULT 'CCPM360 - 更专业的项目管理解决方案',
  hero_subtitle TEXT NOT NULL DEFAULT '专业的关键链项目管理培训与咨询服务，帮助企业提升项目管理效率，实现项目成功交付。基于约束理论的科学方法，让项目管理更简单、更高效。',
  statistics JSONB NOT NULL DEFAULT '{"projects": 500, "clients": 200, "success_rate": 95, "experience": 10}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建更新时间触发器
CREATE OR REPLACE FUNCTION update_homepage_config_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_homepage_config_updated_at
  BEFORE UPDATE ON homepage_config
  FOR EACH ROW
  EXECUTE FUNCTION update_homepage_config_updated_at();

-- 启用行级安全策略
ALTER TABLE homepage_config ENABLE ROW LEVEL SECURITY;

-- 创建策略：允许所有人读取首页配置
CREATE POLICY "Allow public read access to homepage config" ON homepage_config
  FOR SELECT USING (true);

-- 创建策略：只允许认证用户修改首页配置
CREATE POLICY "Allow authenticated users to modify homepage config" ON homepage_config
  FOR ALL USING (auth.role() = 'authenticated');

-- 授予权限
GRANT SELECT ON homepage_config TO anon;
GRANT ALL PRIVILEGES ON homepage_config TO authenticated;

-- 插入默认设置（如果表为空）
INSERT INTO homepage_config (
  hero_title,
  hero_subtitle,
  statistics
) 
SELECT 
  'CCPM360 - 更专业的项目管理解决方案',
  '专业的关键链项目管理培训与咨询服务，帮助企业提升项目管理效率，实现项目成功交付。基于约束理论的科学方法，让项目管理更简单、更高效。',
  '{"projects": 500, "clients": 200, "success_rate": 95, "experience": 10}'
WHERE NOT EXISTS (SELECT 1 FROM homepage_config);