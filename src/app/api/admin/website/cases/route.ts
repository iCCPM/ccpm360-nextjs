import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 案例页面配置数据类型
interface CasesPageConfig {
  // 页面头部
  page_title: string;
  page_subtitle: string;

  // 统计数据部分
  stats_title: string;
  stats_subtitle: string;

  // 统计数据项
  stat1_number: string;
  stat1_label: string;
  stat1_icon: string;

  stat2_number: string;
  stat2_label: string;
  stat2_icon: string;

  stat3_number: string;
  stat3_label: string;
  stat3_icon: string;

  stat4_number: string;
  stat4_label: string;
  stat4_icon: string;

  // CTA部分
  cta_title: string;
  cta_subtitle: string;
  cta_button_text: string;
  cta_button_link: string;
  cta_secondary_text: string;
  cta_secondary_link: string;
}

// 默认配置
const defaultConfig: CasesPageConfig = {
  page_title: '成功案例',
  page_subtitle: '真实案例见证CCPM360的专业实力，为各行业客户创造价值',
  stats_title: '服务成果统计',
  stats_subtitle: '数据说话，用实际成果证明CCPM360的专业价值',
  stat1_number: '500+',
  stat1_label: '服务企业',
  stat1_icon: 'Building',
  stat2_number: '5000+',
  stat2_label: '培训学员',
  stat2_icon: 'Users',
  stat3_number: '95%',
  stat3_label: '客户满意度',
  stat3_icon: 'Award',
  stat4_number: '30%',
  stat4_label: '平均效率提升',
  stat4_icon: 'TrendingUp',
  cta_title: '让您的项目也成为成功案例',
  cta_subtitle: '联系我们，获取专业的关键链项目管理解决方案',
  cta_button_text: '开始咨询',
  cta_button_link: '/contact',
  cta_secondary_text: '查看服务',
  cta_secondary_link: '/services',
};

// 初始化 Supabase 客户端
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET 方法 - 获取案例页面配置
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('cases_page_settings')
      .select('*')
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // 没有找到记录，返回默认配置
        return NextResponse.json(defaultConfig);
      }
      throw error;
    }

    // 返回数据库中的配置，如果某些字段为空则使用默认值
    const config: CasesPageConfig = {
      page_title: data.page_title || defaultConfig.page_title,
      page_subtitle: data.page_subtitle || defaultConfig.page_subtitle,
      stats_title: data.stats_title || defaultConfig.stats_title,
      stats_subtitle: data.stats_subtitle || defaultConfig.stats_subtitle,
      stat1_number: data.stat1_number || defaultConfig.stat1_number,
      stat1_label: data.stat1_label || defaultConfig.stat1_label,
      stat1_icon: data.stat1_icon || defaultConfig.stat1_icon,
      stat2_number: data.stat2_number || defaultConfig.stat2_number,
      stat2_label: data.stat2_label || defaultConfig.stat2_label,
      stat2_icon: data.stat2_icon || defaultConfig.stat2_icon,
      stat3_number: data.stat3_number || defaultConfig.stat3_number,
      stat3_label: data.stat3_label || defaultConfig.stat3_label,
      stat3_icon: data.stat3_icon || defaultConfig.stat3_icon,
      stat4_number: data.stat4_number || defaultConfig.stat4_number,
      stat4_label: data.stat4_label || defaultConfig.stat4_label,
      stat4_icon: data.stat4_icon || defaultConfig.stat4_icon,
      cta_title: data.cta_title || defaultConfig.cta_title,
      cta_subtitle: data.cta_subtitle || defaultConfig.cta_subtitle,
      cta_button_text: data.cta_button_text || defaultConfig.cta_button_text,
      cta_button_link: data.cta_button_link || defaultConfig.cta_button_link,
      cta_secondary_text:
        data.cta_secondary_text || defaultConfig.cta_secondary_text,
      cta_secondary_link:
        data.cta_secondary_link || defaultConfig.cta_secondary_link,
    };

    return NextResponse.json(config);
  } catch (error) {
    console.error('Error fetching cases page config:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cases page config' },
      { status: 500 }
    );
  }
}

// POST 方法 - 保存案例页面配置
export async function POST(request: NextRequest) {
  try {
    const config: CasesPageConfig = await request.json();

    // 验证必填字段
    if (!config.page_title || !config.cta_title) {
      return NextResponse.json(
        { error: 'Page title and CTA title are required' },
        { status: 400 }
      );
    }

    // 检查是否已存在记录
    const { data: existingData } = await supabase
      .from('cases_page_settings')
      .select('id')
      .single();

    let result;
    if (existingData) {
      // 更新现有记录
      result = await supabase
        .from('cases_page_settings')
        .update({
          page_title: config.page_title,
          page_subtitle: config.page_subtitle,
          stats_title: config.stats_title,
          stats_subtitle: config.stats_subtitle,
          stat1_number: config.stat1_number,
          stat1_label: config.stat1_label,
          stat1_icon: config.stat1_icon,
          stat2_number: config.stat2_number,
          stat2_label: config.stat2_label,
          stat2_icon: config.stat2_icon,
          stat3_number: config.stat3_number,
          stat3_label: config.stat3_label,
          stat3_icon: config.stat3_icon,
          stat4_number: config.stat4_number,
          stat4_label: config.stat4_label,
          stat4_icon: config.stat4_icon,
          cta_title: config.cta_title,
          cta_subtitle: config.cta_subtitle,
          cta_button_text: config.cta_button_text,
          cta_button_link: config.cta_button_link,
          cta_secondary_text: config.cta_secondary_text,
          cta_secondary_link: config.cta_secondary_link,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingData.id);
    } else {
      // 插入新记录
      result = await supabase.from('cases_page_settings').insert({
        page_title: config.page_title,
        page_subtitle: config.page_subtitle,
        stats_title: config.stats_title,
        stats_subtitle: config.stats_subtitle,
        stat1_number: config.stat1_number,
        stat1_label: config.stat1_label,
        stat1_icon: config.stat1_icon,
        stat2_number: config.stat2_number,
        stat2_label: config.stat2_label,
        stat2_icon: config.stat2_icon,
        stat3_number: config.stat3_number,
        stat3_label: config.stat3_label,
        stat3_icon: config.stat3_icon,
        stat4_number: config.stat4_number,
        stat4_label: config.stat4_label,
        stat4_icon: config.stat4_icon,
        cta_title: config.cta_title,
        cta_subtitle: config.cta_subtitle,
        cta_button_text: config.cta_button_text,
        cta_button_link: config.cta_button_link,
        cta_secondary_text: config.cta_secondary_text,
        cta_secondary_link: config.cta_secondary_link,
      });
    }

    if (result.error) {
      throw result.error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving cases page config:', error);
    return NextResponse.json(
      { error: 'Failed to save cases page config' },
      { status: 500 }
    );
  }
}

// PUT 方法 - 更新案例页面配置（与POST相同）
export async function PUT(request: NextRequest) {
  return POST(request);
}
