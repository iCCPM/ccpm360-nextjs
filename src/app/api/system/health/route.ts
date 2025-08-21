import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 系统状态接口定义
interface SystemStatus {
  database: {
    status: 'healthy' | 'unhealthy' | 'checking';
    message: string;
    responseTime?: number;
  };
  storage: {
    status: 'healthy' | 'unhealthy' | 'checking';
    message: string;
    responseTime?: number;
  };
  auth: {
    status: 'healthy' | 'unhealthy' | 'checking';
    message: string;
    responseTime?: number;
  };
  overall: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
}

// 检查数据库连接状态
async function checkDatabaseHealth(): Promise<SystemStatus['database']> {
  const startTime = Date.now();

  try {
    const supabaseUrl = process.env['NEXT_PUBLIC_SUPABASE_URL'];
    const supabaseKey = process.env['SUPABASE_SERVICE_ROLE_KEY'];

    if (!supabaseUrl || !supabaseKey) {
      return {
        status: 'unhealthy',
        message: 'Supabase配置缺失',
      };
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // 执行简单的数据库查询来测试连接
    const { error } = await supabase
      .from('site_settings')
      .select('id')
      .limit(1);

    const responseTime = Date.now() - startTime;

    if (error) {
      return {
        status: 'unhealthy',
        message: `数据库连接失败: ${error.message}`,
        responseTime,
      };
    }

    return {
      status: 'healthy',
      message: '数据库连接正常',
      responseTime,
    };
  } catch (error) {
    const responseTime = Date.now() - startTime;
    return {
      status: 'unhealthy',
      message: `数据库检查异常: ${error instanceof Error ? error.message : '未知错误'}`,
      responseTime,
    };
  }
}

// 检查文件存储状态
async function checkStorageHealth(): Promise<SystemStatus['storage']> {
  const startTime = Date.now();

  try {
    const supabaseUrl = process.env['NEXT_PUBLIC_SUPABASE_URL'];
    const supabaseKey = process.env['SUPABASE_SERVICE_ROLE_KEY'];

    if (!supabaseUrl || !supabaseKey) {
      return {
        status: 'unhealthy',
        message: 'Supabase配置缺失',
      };
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // 检查存储桶是否可访问
    const { error } = await supabase.storage.listBuckets();

    const responseTime = Date.now() - startTime;

    if (error) {
      return {
        status: 'unhealthy',
        message: `存储服务连接失败: ${error.message}`,
        responseTime,
      };
    }

    return {
      status: 'healthy',
      message: '文件存储服务正常',
      responseTime,
    };
  } catch (error) {
    const responseTime = Date.now() - startTime;
    return {
      status: 'unhealthy',
      message: `存储检查异常: ${error instanceof Error ? error.message : '未知错误'}`,
      responseTime,
    };
  }
}

// 检查认证服务状态
async function checkAuthHealth(): Promise<SystemStatus['auth']> {
  const startTime = Date.now();

  try {
    const supabaseUrl = process.env['NEXT_PUBLIC_SUPABASE_URL'];
    const supabaseKey = process.env['SUPABASE_SERVICE_ROLE_KEY'];

    if (!supabaseUrl || !supabaseKey) {
      return {
        status: 'unhealthy',
        message: 'Supabase配置缺失',
      };
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // 检查认证服务是否可用（获取用户列表）
    const { error } = await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 1,
    });

    const responseTime = Date.now() - startTime;

    if (error) {
      return {
        status: 'unhealthy',
        message: `认证服务连接失败: ${error.message}`,
        responseTime,
      };
    }

    return {
      status: 'healthy',
      message: '认证服务正常',
      responseTime,
    };
  } catch (error) {
    const responseTime = Date.now() - startTime;
    return {
      status: 'unhealthy',
      message: `认证检查异常: ${error instanceof Error ? error.message : '未知错误'}`,
      responseTime,
    };
  }
}

// 计算整体系统状态
function calculateOverallStatus(
  database: SystemStatus['database'],
  storage: SystemStatus['storage'],
  auth: SystemStatus['auth']
): SystemStatus['overall'] {
  const statuses = [database.status, storage.status, auth.status];

  if (statuses.every((status) => status === 'healthy')) {
    return 'healthy';
  }

  if (statuses.every((status) => status === 'unhealthy')) {
    return 'unhealthy';
  }

  return 'degraded';
}

export async function GET() {
  try {
    // 并行执行所有健康检查
    const [databaseHealth, storageHealth, authHealth] = await Promise.all([
      checkDatabaseHealth(),
      checkStorageHealth(),
      checkAuthHealth(),
    ]);

    const overall = calculateOverallStatus(
      databaseHealth,
      storageHealth,
      authHealth
    );

    const systemStatus: SystemStatus = {
      database: databaseHealth,
      storage: storageHealth,
      auth: authHealth,
      overall,
      timestamp: new Date().toISOString(),
    };

    // 根据整体状态设置HTTP状态码
    const httpStatus =
      overall === 'healthy' ? 200 : overall === 'degraded' ? 207 : 503;

    return NextResponse.json(systemStatus, { status: httpStatus });
  } catch (error) {
    console.error('系统健康检查失败:', error);

    const errorStatus: SystemStatus = {
      database: { status: 'unhealthy', message: '检查失败' },
      storage: { status: 'unhealthy', message: '检查失败' },
      auth: { status: 'unhealthy', message: '检查失败' },
      overall: 'unhealthy',
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(errorStatus, { status: 503 });
  }
}

// 支持OPTIONS请求（CORS预检）
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
