-- Create about_page_settings table
CREATE TABLE about_page_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    hero_title TEXT NOT NULL DEFAULT '关于 CCPM360',
    hero_subtitle TEXT NOT NULL DEFAULT '我们是专业的关键链项目管理(CCPM)咨询服务提供商，致力于帮助企业提升项目管理效率，实现项目按时交付和资源优化配置。',
    mission_title TEXT NOT NULL DEFAULT '我们的使命',
    mission_description TEXT NOT NULL DEFAULT '通过先进的关键链项目管理理论和实践，帮助企业解决项目延期、资源冲突、成本超支等常见问题，提升项目成功率和企业竞争力。',
    values_title TEXT NOT NULL DEFAULT '核心价值观',
    values_subtitle TEXT NOT NULL DEFAULT '我们坚持以客户为中心，以结果为导向，为企业创造真正的价值',
    value_1_title TEXT NOT NULL DEFAULT '客户至上',
    value_1_description TEXT NOT NULL DEFAULT '始终以客户需求为出发点，提供最适合的解决方案',
    value_2_title TEXT NOT NULL DEFAULT '追求卓越',
    value_2_description TEXT NOT NULL DEFAULT '不断提升服务质量，追求项目管理的卓越表现',
    value_3_title TEXT NOT NULL DEFAULT '持续改进',
    value_3_description TEXT NOT NULL DEFAULT '持续学习和改进，与时俱进的管理理念',
    cta_title TEXT NOT NULL DEFAULT '准备开始您的项目管理转型之旅？',
    cta_subtitle TEXT NOT NULL DEFAULT '联系我们的专家团队，获取专业的CCPM咨询服务',
    cta_button_text TEXT NOT NULL DEFAULT '立即咨询',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create updated_at trigger
CREATE TRIGGER set_about_page_settings_updated_at
    BEFORE UPDATE ON about_page_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE about_page_settings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public read access" ON about_page_settings
    FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to update" ON about_page_settings
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert" ON about_page_settings
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Insert default data
INSERT INTO about_page_settings (
    hero_title,
    hero_subtitle,
    mission_title,
    mission_description,
    values_title,
    values_subtitle,
    value_1_title,
    value_1_description,
    value_2_title,
    value_2_description,
    value_3_title,
    value_3_description,
    cta_title,
    cta_subtitle,
    cta_button_text
) VALUES (
    '关于 CCPM360',
    '我们是专业的关键链项目管理(CCPM)咨询服务提供商，致力于帮助企业提升项目管理效率，实现项目按时交付和资源优化配置。',
    '我们的使命',
    '通过先进的关键链项目管理理论和实践，帮助企业解决项目延期、资源冲突、成本超支等常见问题，提升项目成功率和企业竞争力。',
    '核心价值观',
    '我们坚持以客户为中心，以结果为导向，为企业创造真正的价值',
    '客户至上',
    '始终以客户需求为出发点，提供最适合的解决方案',
    '追求卓越',
    '不断提升服务质量，追求项目管理的卓越表现',
    '持续改进',
    '持续学习和改进，与时俱进的管理理念',
    '准备开始您的项目管理转型之旅？',
    '联系我们的专家团队，获取专业的CCPM咨询服务',
    '立即咨询'
);