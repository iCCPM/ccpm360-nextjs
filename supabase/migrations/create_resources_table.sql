-- Create resources table for managing downloadable resources
CREATE TABLE IF NOT EXISTS resources (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_size BIGINT NOT NULL,
  file_type VARCHAR(100) NOT NULL,
  category VARCHAR(50) NOT NULL DEFAULT 'document',
  tags TEXT[] DEFAULT '{}',
  download_count INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  is_published BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_resources_category ON resources(category);
CREATE INDEX IF NOT EXISTS idx_resources_is_published ON resources(is_published);
CREATE INDEX IF NOT EXISTS idx_resources_is_featured ON resources(is_featured);
CREATE INDEX IF NOT EXISTS idx_resources_created_at ON resources(created_at);
CREATE INDEX IF NOT EXISTS idx_resources_created_by ON resources(created_by);
CREATE INDEX IF NOT EXISTS idx_resources_tags ON resources USING GIN(tags);

-- Enable Row Level Security
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;

-- Create policies for resources table
-- Allow public read access to published resources
CREATE POLICY "Public can view published resources" ON resources
  FOR SELECT
  USING (is_published = true);

-- Allow authenticated admin users to manage all resources
CREATE POLICY "Admin users can manage resources" ON resources
  FOR ALL
  USING (
    auth.uid() IN (
      SELECT id FROM admin_users WHERE is_active = true
    )
  );

-- Grant permissions to anon and authenticated roles
GRANT SELECT ON resources TO anon;
GRANT ALL PRIVILEGES ON resources TO authenticated;

-- Create function to update download count
CREATE OR REPLACE FUNCTION increment_download_count(resource_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE resources 
  SET download_count = download_count + 1,
      updated_at = NOW()
  WHERE id = resource_id AND is_published = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION increment_download_count(UUID) TO anon;
GRANT EXECUTE ON FUNCTION increment_download_count(UUID) TO authenticated;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_resources_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER trigger_update_resources_updated_at
  BEFORE UPDATE ON resources
  FOR EACH ROW
  EXECUTE FUNCTION update_resources_updated_at();

-- Insert some sample data for testing
INSERT INTO resources (
  title,
  description,
  file_url,
  file_name,
  file_size,
  file_type,
  category,
  tags,
  is_featured,
  is_published
) VALUES 
(
  'CCPM项目管理指南',
  '全面的CCPM项目管理实施指南，包含理论基础、实施步骤和最佳实践。',
  'https://example.com/ccpm-guide.pdf',
  'ccpm-guide.pdf',
  2048000,
  'application/pdf',
  'guide',
  ARRAY['CCPM', '项目管理', '指南'],
  true,
  true
),
(
  '项目计划模板',
  '标准化的项目计划Excel模板，适用于各种规模的项目。',
  'https://example.com/project-template.xlsx',
  'project-template.xlsx',
  512000,
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'template',
  ARRAY['模板', '项目计划', 'Excel'],
  false,
  true
),
(
  '成功案例分析报告',
  '详细分析三个成功实施CCPM的企业案例，总结经验和教训。',
  'https://example.com/case-study.pdf',
  'case-study.pdf',
  3072000,
  'application/pdf',
  'case_study',
  ARRAY['案例分析', 'CCPM', '成功案例'],
  true,
  true
);