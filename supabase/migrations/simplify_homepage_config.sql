-- 简化homepage_config表结构，只保留必要字段
-- 删除不需要的字段：hero_images, company_intro, service_highlights, updated_by

ALTER TABLE homepage_config 
DROP COLUMN IF EXISTS hero_images,
DROP COLUMN IF EXISTS company_intro,
DROP COLUMN IF EXISTS service_highlights,
DROP COLUMN IF EXISTS updated_by;

-- 添加created_at字段（如果不存在）
ALTER TABLE homepage_config 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- 确保statistics字段存在且为jsonb类型
ALTER TABLE homepage_config 
ALTER COLUMN statistics SET DEFAULT '{"projects": 500, "clients": 200, "success_rate": 95, "experience": 10}'::jsonb;

-- 设置字段为NOT NULL（除了id、created_at、updated_at）
ALTER TABLE homepage_config 
ALTER COLUMN hero_title SET NOT NULL,
ALTER COLUMN hero_subtitle SET NOT NULL,
ALTER COLUMN statistics SET NOT NULL;

-- 清理现有数据并插入默认数据
TRUNCATE TABLE homepage_config;

INSERT INTO homepage_config (hero_title, hero_subtitle, statistics, created_at, updated_at)
VALUES (
  'CCPM360 - 更专业的项目管理解决方案',
  '专业的关键链项目管理培训与咨询服务，帮助企业提升项目管理效率，实现项目成功交付。基于约束理论的科学方法，让项目管理更简单、更高效。',
  '{"projects": 500, "clients": 200, "success_rate": 95, "experience": 10}'::jsonb,
  NOW(),
  NOW()
);