import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-server';

// 关于我们页面配置的数据类型
interface AboutPageConfig {
  id?: string;
  hero_title: string;
  hero_subtitle: string;
  mission_title: string;
  mission_description: string;
  values_title: string;
  values_subtitle: string;
  value_1_title: string;
  value_1_description: string;
  value_2_title: string;
  value_2_description: string;
  value_3_title: string;
  value_3_description: string;
  cta_title: string;
  cta_subtitle: string;
  cta_button_text: string;
  created_at?: string;
  updated_at?: string;
}

// GET - 获取关于我们页面配置
export async function GET() {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { data, error } = await supabaseAdmin
      .from('about_page_settings')
      .select('*')
      .maybeSingle();

    if (error) {
      console.error('获取关于我们页面配置失败:', error);
      return NextResponse.json(
        { error: '获取关于我们页面配置失败' },
        { status: 500 }
      );
    }

    // 如果没有找到记录，返回默认设置
    if (!data) {
      const defaultSettings = {
        hero_title: '关于 CCPM360',
        hero_subtitle:
          '我们是专业的关键链项目管理(CCPM)咨询服务提供商，致力于帮助企业提升项目管理效率，实现项目按时交付和资源优化配置。',
        mission_title: '我们的使命',
        mission_description:
          '通过先进的关键链项目管理理论和实践，帮助企业解决项目延期、资源冲突、成本超支等常见问题，提升项目成功率和企业竞争力。',
        values_title: '核心价值观',
        values_subtitle:
          '我们坚持以客户为中心，以结果为导向，为企业创造真正的价值',
        value_1_title: '客户至上',
        value_1_description: '始终以客户需求为出发点，提供最适合的解决方案',
        value_2_title: '追求卓越',
        value_2_description: '不断提升服务质量，追求项目管理的卓越表现',
        value_3_title: '持续改进',
        value_3_description: '持续学习和改进，与时俱进的管理理念',
        cta_title: '准备开始您的项目管理转型之旅？',
        cta_subtitle: '联系我们的专家团队，获取专业的CCPM咨询服务',
        cta_button_text: '立即咨询',
      };
      return NextResponse.json(defaultSettings);
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('获取关于我们页面配置时发生错误:', error);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}

// POST - 保存关于我们页面配置
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 验证必填字段
    const requiredFields = [
      'hero_title',
      'hero_subtitle',
      'mission_title',
      'mission_description',
      'values_title',
      'values_subtitle',
      'value_1_title',
      'value_1_description',
      'value_2_title',
      'value_2_description',
      'value_3_title',
      'value_3_description',
      'cta_title',
      'cta_subtitle',
      'cta_button_text',
    ];

    for (const field of requiredFields) {
      if (!body[field] || body[field].trim() === '') {
        return NextResponse.json(
          { error: `${field} 是必填字段` },
          { status: 400 }
        );
      }
    }

    // 准备要保存的数据
    const configData: Omit<
      AboutPageConfig,
      'id' | 'created_at' | 'updated_at'
    > = {
      hero_title: body.hero_title.trim(),
      hero_subtitle: body.hero_subtitle.trim(),
      mission_title: body.mission_title.trim(),
      mission_description: body.mission_description.trim(),
      values_title: body.values_title.trim(),
      values_subtitle: body.values_subtitle.trim(),
      value_1_title: body.value_1_title.trim(),
      value_1_description: body.value_1_description.trim(),
      value_2_title: body.value_2_title.trim(),
      value_2_description: body.value_2_description.trim(),
      value_3_title: body.value_3_title.trim(),
      value_3_description: body.value_3_description.trim(),
      cta_title: body.cta_title.trim(),
      cta_subtitle: body.cta_subtitle.trim(),
      cta_button_text: body.cta_button_text.trim(),
    };

    // 检查是否已存在记录
    const supabaseAdmin = getSupabaseAdmin();
    const { data: existingData } = await supabaseAdmin
      .from('about_page_settings')
      .select('id')
      .maybeSingle();

    let result;
    if (existingData) {
      // 更新现有记录
      result = await supabaseAdmin
        .from('about_page_settings')
        .update({
          ...configData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingData.id)
        .select()
        .maybeSingle();
    } else {
      // 创建新记录
      result = await supabaseAdmin
        .from('about_page_settings')
        .insert({
          ...configData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .maybeSingle();
    }

    if (result.error) {
      console.error('保存关于我们页面配置失败:', result.error);
      return NextResponse.json(
        { error: '保存关于我们页面配置失败' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: '关于我们页面配置保存成功',
      data: result.data,
    });
  } catch (error) {
    console.error('保存关于我们页面配置时发生错误:', error);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}

// PUT - 更新关于我们页面配置（与POST相同的逻辑）
export async function PUT(request: NextRequest) {
  return POST(request);
}
