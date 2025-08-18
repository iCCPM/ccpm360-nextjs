import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 创建管理员客户端（使用service role key绕过RLS）
const supabaseAdmin = createClient(
  process.env['NEXT_PUBLIC_SUPABASE_URL']!,
  process.env['SUPABASE_SERVICE_ROLE_KEY']!
);

// 首页配置的数据类型
interface HomepageConfig {
  id?: string;
  hero_title: string;
  hero_subtitle: string;
  statistics: {
    projects: number;
    clients: number;
    success_rate: number;
    experience: number;
  };
  created_at?: string;
  updated_at?: string;
}

// GET - 获取首页配置
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('homepage_config')
      .select('*')
      .maybeSingle();

    if (error) {
      console.error('获取首页配置失败:', error);
      return NextResponse.json({ error: '获取首页配置失败' }, { status: 500 });
    }

    // 如果没有找到记录，返回默认设置
    if (!data) {
      const defaultSettings = {
        hero_title: 'CCPM360 - 更专业的项目管理解决方案',
        hero_subtitle:
          '专业的关键链项目管理培训与咨询服务，帮助企业提升项目管理效率，实现项目成功交付。基于约束理论的科学方法，让项目管理更简单、更高效。',
        statistics: {
          projects: 500,
          clients: 200,
          success_rate: 95,
          experience: 10,
        },
      };
      return NextResponse.json(defaultSettings);
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('获取首页配置时发生错误:', error);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}

// POST - 保存首页配置
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 验证必填字段
    const requiredFields = ['hero_title', 'hero_subtitle'];
    for (const field of requiredFields) {
      if (!body[field] || body[field].trim() === '') {
        return NextResponse.json(
          { error: `${field} 是必填字段` },
          { status: 400 }
        );
      }
    }

    // 验证统计数据
    if (!body.statistics || typeof body.statistics !== 'object') {
      return NextResponse.json(
        { error: '统计数据格式不正确' },
        { status: 400 }
      );
    }

    const { projects, clients, success_rate, experience } = body.statistics;
    if (
      typeof projects !== 'number' ||
      typeof clients !== 'number' ||
      typeof success_rate !== 'number' ||
      typeof experience !== 'number'
    ) {
      return NextResponse.json(
        { error: '统计数据必须为数字' },
        { status: 400 }
      );
    }

    // 准备要保存的数据
    const configData: Omit<HomepageConfig, 'id' | 'created_at' | 'updated_at'> =
      {
        hero_title: body.hero_title.trim(),
        hero_subtitle: body.hero_subtitle.trim(),
        statistics: {
          projects: Number(projects),
          clients: Number(clients),
          success_rate: Number(success_rate),
          experience: Number(experience),
        },
      };

    // 检查是否已存在记录
    const { data: existingData } = await supabaseAdmin
      .from('homepage_config')
      .select('id')
      .maybeSingle();

    let result;
    if (existingData) {
      // 更新现有记录
      result = await supabaseAdmin
        .from('homepage_config')
        .update(configData)
        .eq('id', existingData.id)
        .select()
        .maybeSingle();
    } else {
      // 创建新记录
      result = await supabaseAdmin
        .from('homepage_config')
        .insert(configData)
        .select()
        .maybeSingle();
    }

    if (result.error) {
      console.error('保存首页配置失败:', result.error);
      return NextResponse.json({ error: '保存首页配置失败' }, { status: 500 });
    }

    return NextResponse.json({
      message: '首页配置保存成功',
      data: result.data,
    });
  } catch (error) {
    console.error('保存首页配置时发生错误:', error);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}

// PUT - 更新首页配置（与POST相同的逻辑）
export async function PUT(request: NextRequest) {
  return POST(request);
}
