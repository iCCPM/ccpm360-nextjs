import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env['NEXT_PUBLIC_SUPABASE_URL'];
const supabaseServiceKey = process.env['SUPABASE_SERVICE_ROLE_KEY'];

let supabase: any = null;

if (supabaseUrl && supabaseServiceKey) {
  supabase = createClient(supabaseUrl, supabaseServiceKey);
}

// 密码强度验证
function validatePassword(password: string): string | null {
  if (password.length < 8) {
    return '密码至少需要8个字符';
  }
  if (!/(?=.*[a-z])/.test(password)) {
    return '密码必须包含至少一个小写字母';
  }
  if (!/(?=.*[A-Z])/.test(password)) {
    return '密码必须包含至少一个大写字母';
  }
  if (!/(?=.*\d)/.test(password)) {
    return '密码必须包含至少一个数字';
  }
  if (!/(?=.*[!@#$%^&*])/.test(password)) {
    return '密码必须包含至少一个特殊字符 (!@#$%^&*)';
  }
  return null;
}

export async function POST(request: NextRequest) {
  try {
    // 检查Supabase配置
    if (!supabase) {
      return NextResponse.json(
        { error: 'Service temporarily unavailable' },
        { status: 503 }
      );
    }

    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json(
        { error: '令牌和密码不能为空' },
        { status: 400 }
      );
    }

    // 验证密码强度
    const passwordError = validatePassword(password);
    if (passwordError) {
      return NextResponse.json({ error: passwordError }, { status: 400 });
    }

    // 查询并验证令牌
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
      return NextResponse.json({ error: '无效的重置令牌' }, { status: 400 });
    }

    // 检查令牌是否已使用
    if (resetToken.used) {
      return NextResponse.json({ error: '重置令牌已被使用' }, { status: 400 });
    }

    // 检查令牌是否过期
    const now = new Date();
    const expiresAt = new Date(resetToken.expires_at);

    if (now > expiresAt) {
      return NextResponse.json({ error: '重置令牌已过期' }, { status: 400 });
    }

    // 检查关联的管理员用户是否有效
    if (!resetToken.admin_users[0]?.is_active) {
      return NextResponse.json(
        { error: '关联的管理员账户已被禁用' },
        { status: 400 }
      );
    }

    // 生成新密码的哈希
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // 开始事务：更新密码并标记令牌为已使用
    const { error: updateError } = await supabase.rpc('reset_admin_password', {
      p_admin_user_id: resetToken.admin_user_id,
      p_new_password_hash: passwordHash,
      p_token_id: resetToken.id,
    });

    if (updateError) {
      console.error('Error updating password:', updateError);
      return NextResponse.json({ error: '密码更新失败' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: '密码重置成功',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}
