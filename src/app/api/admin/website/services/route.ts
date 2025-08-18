import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env['NEXT_PUBLIC_SUPABASE_URL']!;
const supabaseServiceKey = process.env['SUPABASE_SERVICE_ROLE_KEY']!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

interface ServicesPageConfig {
  hero_title: string;
  hero_subtitle: string;
  hero_badge_text: string;
  feature_1_title: string;
  feature_2_title: string;
  feature_3_title: string;
  training_section_title: string;
  training_section_subtitle: string;
  training_badge_text: string;
  consulting_section_title: string;
  consulting_section_subtitle: string;
  solutions_section_title: string;
  solutions_section_subtitle: string;
  cta_title: string;
  cta_subtitle: string;
  cta_button_text: string;
}

const defaultConfig: ServicesPageConfig = {
  hero_title: '全方位项目管理解决方案',
  hero_subtitle:
    '从专业培训到定制咨询，提供完整的关键链项目管理服务体系，助力企业实现项目成功',
  hero_badge_text: '专业服务',
  feature_1_title: '系统化培训',
  feature_2_title: '定制化咨询',
  feature_3_title: '行业解决方案',
  training_section_title: '系统化培训课程',
  training_section_subtitle:
    '从基础理论到高级实践，构建完整的CCPM知识体系，满足不同层次的学习需求',
  training_badge_text: '专业培训',
  consulting_section_title: '咨询服务',
  consulting_section_subtitle:
    '专业的项目管理咨询服务，为企业提供定制化的CCPM实施方案',
  solutions_section_title: '行业解决方案',
  solutions_section_subtitle: '针对不同行业特点，提供专业的CCPM解决方案',
  cta_title: '准备提升您的项目管理水平？',
  cta_subtitle: '联系我们的专家团队，获取专业的项目管理解决方案',
  cta_button_text: '立即咨询',
};

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('services_page_settings')
      .select('*')
      .single();

    if (error) {
      console.error('获取服务页面配置失败:', error);
      // 如果数据库中没有数据，返回默认配置
      return NextResponse.json(defaultConfig);
    }

    // 移除数据库字段（id, created_at, updated_at）
    const { id, created_at, updated_at, ...config } = data;

    return NextResponse.json(config);
  } catch (error) {
    console.error('服务页面配置API错误:', error);
    return NextResponse.json(defaultConfig);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 验证必需字段
    const requiredFields = [
      'hero_title',
      'hero_subtitle',
      'hero_badge_text',
      'feature_1_title',
      'feature_2_title',
      'feature_3_title',
      'training_section_title',
      'training_section_subtitle',
      'training_badge_text',
      'consulting_section_title',
      'consulting_section_subtitle',
      'solutions_section_title',
      'solutions_section_subtitle',
      'cta_title',
      'cta_subtitle',
      'cta_button_text',
    ];

    for (const field of requiredFields) {
      if (!body[field] || typeof body[field] !== 'string') {
        return NextResponse.json(
          { error: `字段 ${field} 是必需的且必须是字符串` },
          { status: 400 }
        );
      }
    }

    // 检查是否已存在记录
    const { data: existingData } = await supabaseAdmin
      .from('services_page_settings')
      .select('id')
      .single();

    let result;
    if (existingData) {
      // 更新现有记录
      const { data, error } = await supabaseAdmin
        .from('services_page_settings')
        .update(body)
        .eq('id', existingData.id)
        .select()
        .single();

      if (error) {
        console.error('更新服务页面配置失败:', error);
        return NextResponse.json({ error: '更新配置失败' }, { status: 500 });
      }
      result = data;
    } else {
      // 创建新记录
      const { data, error } = await supabaseAdmin
        .from('services_page_settings')
        .insert([body])
        .select()
        .single();

      if (error) {
        console.error('创建服务页面配置失败:', error);
        return NextResponse.json({ error: '创建配置失败' }, { status: 500 });
      }
      result = data;
    }

    // 移除数据库字段
    const { id, created_at, updated_at, ...config } = result;

    return NextResponse.json({
      message: '服务页面配置保存成功',
      data: config,
    });
  } catch (error) {
    console.error('保存服务页面配置时发生错误:', error);
    return NextResponse.json({ error: '保存配置时发生错误' }, { status: 500 });
  }
}

export const PUT = POST;
