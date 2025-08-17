import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 使用服务端环境变量创建Supabase客户端
function createServerSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables');
  }

  return createClient(supabaseUrl, supabaseServiceKey);
}

export async function GET(_request: NextRequest) {
  console.log('=== 开始检查管理员用户 ===');

  try {
    // 检查环境变量
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    console.log('环境变量检查:');
    console.log(
      '- NEXT_PUBLIC_SUPABASE_URL:',
      supabaseUrl ? '已设置' : '未设置'
    );
    console.log(
      '- SUPABASE_SERVICE_ROLE_KEY:',
      supabaseServiceKey ? '已设置' : '未设置'
    );

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('❌ 环境变量缺失');
      return NextResponse.json(
        {
          exists: false,
          error: 'Supabase配置错误',
          message: '环境变量缺失',
        },
        { status: 500 }
      );
    }

    // 创建服务端Supabase客户端（使用service role key）
    console.log('创建Supabase客户端...');
    const supabase = createServerSupabaseClient();
    console.log('✅ Supabase客户端创建成功');

    // 检查是否存在任何管理员用户
    console.log('查询admin_users表...');
    const { data, error } = await supabase
      .from('admin_users')
      .select('id, is_active')
      .limit(1);

    if (error) {
      console.error('❌ 数据库查询失败:', error);
      console.error('错误详情:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
      return NextResponse.json(
        {
          exists: false,
          error: error.message,
          message: '数据库查询失败',
          errorDetails: error,
        },
        { status: 500 }
      );
    }

    const hasAnyAdmin = data && data.length > 0;
    console.log('✅ 查询成功:', {
      hasAnyAdmin,
      adminCount: data?.length || 0,
      data,
    });

    return NextResponse.json({
      exists: hasAnyAdmin,
      adminCount: data?.length || 0,
      message: hasAnyAdmin ? '存在管理员用户' : '不存在管理员用户',
    });
  } catch (error) {
    console.error('❌ API执行错误:', error);
    console.error(
      '错误堆栈:',
      error instanceof Error ? error.stack : 'No stack trace'
    );

    // 如果是环境变量缺失错误，返回特定响应
    if (error instanceof Error && error.message.includes('Missing Supabase')) {
      return NextResponse.json(
        {
          exists: false,
          error: 'Supabase配置错误',
          message: '请检查环境变量配置',
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        exists: false,
        error: error instanceof Error ? error.message : '未知错误',
        message: '检查管理员用户时发生错误',
        errorType:
          error instanceof Error ? error.constructor.name : typeof error,
      },
      { status: 500 }
    );
  }
}

// 支持OPTIONS请求（CORS预检）
export async function OPTIONS(_request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
