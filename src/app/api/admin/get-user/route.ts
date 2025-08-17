import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 创建服务端Supabase客户端
function createServerSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error('Supabase配置错误：缺少必要的环境变量');
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: {
      fetch: (url, options = {}) => {
        return fetch(url, {
          ...options,
          signal: AbortSignal.timeout(8000), // 8秒超时
        });
      },
    },
    db: {
      schema: 'public',
    },
  });
}

export async function GET(request: NextRequest) {
  console.log('=== 开始获取管理员用户 ===');

  try {
    // 从查询参数获取用户ID
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    console.log('请求参数:', { userId });

    if (!userId) {
      console.log('❌ 缺少用户ID参数');
      return NextResponse.json({ error: '缺少用户ID参数' }, { status: 400 });
    }

    // 检查环境变量
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    console.log('环境变量检查:');
    console.log(
      '- NEXT_PUBLIC_SUPABASE_URL:',
      supabaseUrl ? '已设置' : '未设置'
    );
    console.log(
      '- SUPABASE_SERVICE_ROLE_KEY:',
      supabaseServiceRoleKey ? '已设置' : '未设置'
    );

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      console.error('❌ 环境变量缺失');
      return NextResponse.json(
        {
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

    // 查询指定ID的管理员用户（带重试机制）
    console.log('查询admin_users表，用户ID:', userId);

    let adminUsers, error;
    let retryCount = 0;
    const maxRetries = 3;

    while (retryCount < maxRetries) {
      try {
        console.log(`尝试查询 (第${retryCount + 1}次)...`);
        const result = await supabase
          .from('admin_users')
          .select('*')
          .eq('id', userId);

        adminUsers = result.data;
        error = result.error;

        if (!error) {
          console.log('✅ 查询成功');
          break;
        }

        console.log(`❌ 查询失败 (第${retryCount + 1}次):`, error.message);
        retryCount++;

        if (retryCount < maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, retryCount), 5000); // 指数退避，最大5秒
          console.log(`等待 ${delay}ms 后重试...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      } catch (fetchError) {
        console.log(`❌ 网络错误 (第${retryCount + 1}次):`, fetchError);
        retryCount++;

        if (retryCount < maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, retryCount), 5000);
          console.log(`等待 ${delay}ms 后重试...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
        } else {
          error = {
            message: `网络连接失败，已重试${maxRetries}次`,
            details: fetchError,
          };
        }
      }
    }

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
          error: '获取管理员用户失败',
          details: error.message,
          errorDetails: error,
        },
        { status: 500 }
      );
    }

    console.log('✅ 查询成功:', {
      found: adminUsers && adminUsers.length > 0,
      userCount: adminUsers?.length || 0,
      data: adminUsers,
    });

    if (!adminUsers || adminUsers.length === 0) {
      console.log('❌ 管理员用户不存在');
      return NextResponse.json({ error: '管理员用户不存在' }, { status: 404 });
    }

    const adminUser = adminUsers[0];
    console.log('✅ 返回用户信息:', {
      userId: adminUser.id,
      email: adminUser.email,
    });

    return NextResponse.json({
      success: true,
      user: adminUser,
    });
  } catch (error) {
    console.error('❌ API执行错误:', error);
    console.error(
      '错误堆栈:',
      error instanceof Error ? error.stack : 'No stack trace'
    );

    // 如果是环境变量缺失错误，返回特定响应
    if (error instanceof Error && error.message.includes('Supabase配置错误')) {
      return NextResponse.json(
        {
          error: 'Supabase配置错误',
          message: '请检查环境变量配置',
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : '未知错误',
        message: '获取管理员用户时发生错误',
        errorType:
          error instanceof Error ? error.constructor.name : typeof error,
      },
      { status: 500 }
    );
  }
}

// 支持OPTIONS请求（CORS预检）
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
