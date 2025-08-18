import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env['NEXT_PUBLIC_SUPABASE_URL'];
const supabaseServiceKey = process.env['SUPABASE_SERVICE_ROLE_KEY'];

let supabase: any = null;

if (supabaseUrl && supabaseServiceKey) {
  supabase = createClient(supabaseUrl, supabaseServiceKey);
}

export async function POST(request: NextRequest) {
  try {
    // 检查Supabase配置
    if (!supabase) {
      return NextResponse.json(
        {
          valid: false,
          error: 'Service temporarily unavailable',
        },
        { status: 503 }
      );
    }

    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ error: '令牌不能为空' }, { status: 400 });
    }

    // 查询令牌信息
    const { data: resetToken, error: tokenError } = await supabase
      .from('password_reset_tokens')
      .select(
        `
        id,
        admin_user_id,
        expires_at,
        used,
        admin_users!inner(
          id,
          email,
          full_name,
          is_active
        )
      `
      )
      .eq('token', token)
      .single();

    if (tokenError || !resetToken) {
      return NextResponse.json(
        {
          valid: false,
          error: '无效的重置令牌',
        },
        { status: 400 }
      );
    }

    // 检查令牌是否已使用
    if (resetToken.used) {
      return NextResponse.json(
        {
          valid: false,
          error: '重置令牌已被使用',
        },
        { status: 400 }
      );
    }

    // 检查令牌是否过期
    const now = new Date();
    const expiresAt = new Date(resetToken.expires_at);

    if (now > expiresAt) {
      return NextResponse.json(
        {
          valid: false,
          error: '重置令牌已过期',
        },
        { status: 400 }
      );
    }

    // 检查关联的管理员用户是否有效
    if (!resetToken.admin_users[0]?.is_active) {
      return NextResponse.json(
        {
          valid: false,
          error: '关联的管理员账户已被禁用',
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      valid: true,
      user: {
        id: resetToken.admin_users[0]?.id,
        email: resetToken.admin_users[0]?.email,
        full_name: resetToken.admin_users[0]?.full_name,
      },
    });
  } catch (error) {
    console.error('Validate reset token error:', error);
    return NextResponse.json(
      {
        valid: false,
        error: '服务器内部错误',
      },
      { status: 500 }
    );
  }
}
