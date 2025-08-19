import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env['NEXT_PUBLIC_SUPABASE_URL']!;
const supabaseAnonKey = process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY']!;
const supabaseServiceKey = process.env['SUPABASE_SERVICE_ROLE_KEY']!;

// 用于公开读取的客户端
const supabase = createClient(supabaseUrl, supabaseAnonKey);
// 用于管理操作的客户端（绕过 RLS）
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    // 获取已发布的案例列表
    const {
      data: caseStudies,
      error,
      count,
    } = await supabase
      .from('case_studies')
      .select('*', { count: 'exact' })
      .eq('published', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('获取案例列表失败:', error);
      return NextResponse.json({ error: '获取案例列表失败' }, { status: 500 });
    }

    return NextResponse.json({
      data: caseStudies || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error('API错误:', error);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('接收到的请求数据:', JSON.stringify(body, null, 2));

    // 验证必填字段
    if (!body.title || !body.client || !body.description) {
      console.error('必填字段验证失败:', {
        title: body.title,
        client: body.client,
        description: body.description,
      });
      return NextResponse.json(
        { error: '案例标题、客户名称和案例描述为必填项' },
        { status: 400 }
      );
    }

    // 处理 team_size 字段类型转换
    let teamSizeValue = null;
    if (body.teamSize) {
      const parsedTeamSize = parseInt(body.teamSize.toString(), 10);
      if (!isNaN(parsedTeamSize)) {
        teamSizeValue = parsedTeamSize;
      } else {
        console.warn('team_size 字段无法转换为整数:', body.teamSize);
      }
    }

    // 准备案例数据，映射到正确的数据库字段
    const caseData = {
      title: body.title,
      client_name: body.client, // 映射到数据库的 client_name 字段
      industry: body.industry || '',
      challenge: body.challenge || body.description, // 优先使用 challenge，回退到 description
      solution: body.solution || '',
      results: body.results || '',
      project_duration: body.duration || body.projectDuration || '', // 项目周期
      team_size: teamSizeValue, // 团队规模 - 转换为整数或null
      featured_image_url: body.featuredImage || '', // 特色图片
      gallery: Array.isArray(body.gallery) ? body.gallery : [], // 图片库数组
      tags: Array.isArray(body.technologies)
        ? body.technologies
        : body.tags
          ? body.tags.split(',')
          : [], // 技术栈数组
      published: body.status === 'published',
      // created_at 和 updated_at 由数据库自动设置
    };

    console.log('准备插入数据库的数据:', JSON.stringify(caseData, null, 2));

    // 保存到数据库（使用管理员客户端绕过 RLS）
    const { data, error } = await supabaseAdmin
      .from('case_studies')
      .insert([caseData])
      .select()
      .single();

    if (error) {
      console.error('数据库插入失败:', {
        error: error,
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
      return NextResponse.json(
        { error: '创建案例失败: ' + error.message },
        { status: 500 }
      );
    }

    console.log('案例创建成功:', data);
    return NextResponse.json({
      success: true,
      data: data,
      message: body.status === 'published' ? '案例发布成功' : '草稿保存成功',
    });
  } catch (error) {
    console.error('API异常错误:', {
      error: error,
      message: error instanceof Error ? error.message : '未知错误',
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      {
        error:
          '服务器内部错误: ' +
          (error instanceof Error ? error.message : '未知错误'),
      },
      { status: 500 }
    );
  }
}
