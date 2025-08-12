-- Add missing fields to resources table to match frontend interface
-- This migration adds type and external_url fields and modifies existing structure

-- Add type field with enum constraint
ALTER TABLE resources 
ADD COLUMN IF NOT EXISTS type VARCHAR(20) CHECK (type IN ('document', 'video', 'template', 'guide'));

-- Add external_url field for external resources
ALTER TABLE resources 
ADD COLUMN IF NOT EXISTS external_url TEXT;

-- Update existing records to have proper type values based on category
UPDATE resources 
SET type = CASE 
  WHEN category = 'guide' THEN 'guide'
  WHEN category = 'template' THEN 'template'
  WHEN category = 'case_study' THEN 'document'
  ELSE 'document'
END
WHERE type IS NULL;

-- Make file_url optional since some resources might use external_url instead
ALTER TABLE resources 
ALTER COLUMN file_url DROP NOT NULL;

-- Make file_name optional for external resources
ALTER TABLE resources 
ALTER COLUMN file_name DROP NOT NULL;

-- Make file_size optional for external resources
ALTER TABLE resources 
ALTER COLUMN file_size DROP NOT NULL;

-- Make file_type optional for external resources
ALTER TABLE resources 
ALTER COLUMN file_type DROP NOT NULL;

-- Add constraint to ensure either file_url or external_url is provided
ALTER TABLE resources 
ADD CONSTRAINT check_url_provided 
CHECK (file_url IS NOT NULL OR external_url IS NOT NULL);

-- Create index for type field
CREATE INDEX IF NOT EXISTS idx_resources_type ON resources(type);

-- Update sample data to include type and some external resources
UPDATE resources 
SET type = 'guide'
WHERE title = 'CCPM项目管理指南';

UPDATE resources 
SET type = 'template'
WHERE title = '项目计划模板';

UPDATE resources 
SET type = 'document'
WHERE title = '成功案例分析报告';

-- Insert additional sample data with external resources
INSERT INTO resources (
  title,
  description,
  type,
  category,
  external_url,
  tags,
  is_featured,
  is_published
) VALUES 
(
  'CCPM实施视频教程',
  '详细的CCPM实施视频教程，通过实际案例演示关键链项目管理的应用。',
  'video',
  '视频教程',
  'https://example.com/ccpm-video-tutorial',
  ARRAY['CCPM', '视频教程', '实施'],
  true,
  true
),
(
  '项目缓冲区设置指南',
  '专业的项目缓冲区设置指南，帮助项目经理正确配置和管理项目缓冲。',
  'guide',
  '实施指南',
  'https://example.com/buffer-guide',
  ARRAY['缓冲区', '项目管理', '指南'],
  false,
  true
);

-- Update the increment_download_count function to handle external resources
CREATE OR REPLACE FUNCTION increment_download_count(resource_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE resources 
  SET download_count = download_count + 1,
      updated_at = NOW()
  WHERE id = resource_id AND is_published = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;