-- Create site_settings table
CREATE TABLE IF NOT EXISTS public.site_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    site_title VARCHAR(255) NOT NULL DEFAULT 'CCPM360',
    site_description TEXT,
    site_logo_url TEXT,
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    contact_address TEXT,
    company_name VARCHAR(255),
    social_links JSONB DEFAULT '{}',
    seo_keywords TEXT,
    seo_description TEXT,
    analytics_code TEXT,
    maintenance_mode BOOLEAN DEFAULT false,
    maintenance_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Create policy to allow read access for everyone
CREATE POLICY "Allow public read access" ON public.site_settings
    FOR SELECT USING (true);

-- Create policy to allow authenticated users to update
CREATE POLICY "Allow authenticated users to update" ON public.site_settings
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Grant permissions
GRANT SELECT ON public.site_settings TO anon;
GRANT ALL PRIVILEGES ON public.site_settings TO authenticated;

-- Insert initial data
INSERT INTO public.site_settings (
    site_title,
    site_description,
    contact_email,
    contact_phone,
    company_name,
    social_links,
    seo_keywords,
    seo_description
) VALUES (
    'CCPM360 - 关键链项目管理专家',
    'CCPM360是专业的关键链项目管理解决方案提供商，致力于帮助企业提升项目管理效率和成功率。',
    'info@ccpm360.com',
    '+86-400-123-4567',
    'CCPM360科技有限公司',
    '{
        "wechat": "ccpm360",
        "linkedin": "https://linkedin.com/company/ccpm360",
        "weibo": "https://weibo.com/ccpm360"
    }',
    '关键链项目管理,CCPM,项目管理软件,项目管理咨询,项目管理培训',
    'CCPM360提供专业的关键链项目管理解决方案，包括软件工具、咨询服务和培训课程，帮助企业实现项目管理的数字化转型。'
) ON CONFLICT (id) DO NOTHING;

-- Create function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_site_settings_updated_at
    BEFORE UPDATE ON public.site_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();