import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 创建服务端Supabase客户端
function createServerSupabaseClient() {
  const supabaseUrl = process.env['NEXT_PUBLIC_SUPABASE_URL'];
  const supabaseServiceRoleKey = process.env['SUPABASE_SERVICE_ROLE_KEY'];

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error('Supabase配置错误：缺少必要的环境变量');
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: '缺少邮箱参数' }, { status: 400 });
    }

    // 创建服务端Supabase客户端（使用service role key）
    const supabase = createServerSupabaseClient();

    // 激活指定邮箱的管理员用户
    const { data, error } = await supabase
      .from('admin_users')
      .update({ is_active: true })
      .eq('email', email)
      .select();

    if (error) {
      console.error('激活管理员用户失败:', error.message);
      return NextResponse.json(
        {
          success: false,
          error: '激活管理员用户失败',
          details: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data,
    });
  } catch (error) {
    console.error('API错误:', error);

    if (error instanceof Error && error.message.includes('Supabase配置错误')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Supabase配置错误',
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: '服务器内部错误',
      },
      { status: 500 }
    );
  }
}
