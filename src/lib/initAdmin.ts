import { supabase } from './supabase';

/**
 * 验证邀请码
 */
export async function validateInvitationCode(code: string, email: string) {
  try {
    const { data, error } = await supabase.rpc('validate_invitation_code', {
      code,
      email,
    });

    if (error) {
      console.error('验证邀请码失败:', error.message);
      return { valid: false, error: error.message };
    }

    return { valid: data, error: null };
  } catch (error) {
    console.error('验证邀请码异常:', error);
    return { valid: false, error: '验证失败' };
  }
}

/**
 * 标记邀请码为已使用
 */
export async function markInvitationCodeAsUsed(code: string, email: string) {
  try {
    const { data, error } = await supabase.rpc('use_invitation_code', {
      code,
      email,
    });

    if (error) {
      console.error('使用邀请码失败:', error.message);
      return { success: false, error: error.message };
    }

    return { success: data, error: null };
  } catch (error) {
    console.error('使用邀请码异常:', error);
    return { success: false, error: '使用失败' };
  }
}

/**
 * 创建管理员用户（需要邀请码验证）
 * 在管理后台中使用，不在应用启动时自动调用
 */
export async function createAdminUser(
  email: string,
  password: string,
  fullName: string,
  invitationCode: string
) {
  try {
    // 首先验证邀请码
    const { valid, error: validationError } = await validateInvitationCode(
      invitationCode,
      email
    );
    if (!valid) {
      return { success: false, error: validationError || '邀请码无效或已过期' };
    }

    // 创建新用户（启用邮箱验证）
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp(
      {
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            invitation_code: invitationCode,
          },
        },
      }
    );

    if (signUpError) {
      console.error('创建管理员失败:', signUpError.message);
      return { success: false, error: signUpError.message };
    }

    console.log('管理员用户创建成功，等待邮箱验证');

    // 获取邀请码信息以确定角色
    const { data: invitationData } = await supabase
      .from('admin_invitations')
      .select('role')
      .eq('invitation_code', invitationCode)
      .eq('invited_email', email)
      .single();

    const userRole = invitationData?.role || 'admin';

    // 在admin_users表中创建记录（使用upsert避免重复插入）
    if (signUpData.user) {
      // 使用API端点创建管理员记录
      const upsertResponse = await fetch('/api/admin/upsert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          adminData: {
            id: signUpData.user.id,
            email: email,
            password_hash: 'managed_by_supabase_auth',
            full_name: fullName,
            role: userRole,
            is_active: false, // 初始状态为未激活，需要邮箱验证后激活
          },
          onConflict: 'id',
        }),
        cache: 'no-cache',
      });

      if (!upsertResponse.ok) {
        const errorData = await upsertResponse.json().catch(() => ({}));
        console.error('更新admin_users表失败:', errorData);
        return {
          success: false,
          error: errorData.error || '更新admin_users表失败',
        };
      }

      const upsertResult = await upsertResponse.json();
      if (!upsertResult.success) {
        console.error('更新admin_users表失败:', upsertResult.error);
        return { success: false, error: upsertResult.error };
      }

      // 标记邀请码为已使用
      const useResult = await markInvitationCodeAsUsed(invitationCode, email);
      if (!useResult.success) {
        console.warn('标记邀请码为已使用失败');
      }
    }

    return {
      success: true,
      message: '管理员用户创建成功，请检查邮箱并点击验证链接完成注册',
      requiresEmailVerification: true,
    };
  } catch (error) {
    console.error('创建管理员失败:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '创建失败',
    };
  }
}

/**
 * 激活现有的管理员用户
 * 使用API端点而不是直接查询Supabase以避免网络资源错误
 */
export async function activateAdminUser(email: string) {
  try {
    console.log('通过API端点激活管理员用户:', email);

    // 使用API端点激活管理员用户
    const response = await fetch('/api/admin/activate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
      cache: 'no-cache',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('激活管理员用户API请求失败:', response.status, errorData);
      return {
        success: false,
        error: errorData.error || `HTTP ${response.status}`,
      };
    }

    const result = await response.json();

    if (!result.success) {
      console.error('激活管理员用户失败:', result.error);
      return { success: false, error: result.error };
    }

    console.log('成功激活管理员用户:', email);
    return { success: true, data: result.data };
  } catch (error) {
    console.error('激活管理员用户异常:', error);
    return { success: false, error: '激活失败' };
  }
}

/**
 * 创建首个管理员用户（无需邀请码）
 */
export async function createFirstAdminUser(
  email: string,
  password: string,
  fullName: string
) {
  try {
    // 检查是否已存在管理员
    const existingAdmin = await checkAdminExists();
    if (existingAdmin.exists) {
      // 如果已存在管理员，尝试激活该邮箱对应的管理员
      const activateResult = await activateAdminUser(email);
      if (activateResult.success) {
        return {
          success: true,
          message: '管理员账户已激活，请使用该账户登录',
          requiresEmailVerification: false,
        };
      } else {
        return { success: false, error: '系统中已存在管理员用户，但激活失败' };
      }
    }

    // 创建用户账户
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: 'super_admin',
        },
      },
    });

    if (authError) {
      return { success: false, error: authError.message };
    }

    if (!authData.user) {
      return { success: false, error: '用户创建失败' };
    }

    // 使用API端点创建管理员记录
    const upsertResponse = await fetch('/api/admin/upsert', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        adminData: {
          id: authData.user.id,
          email: email,
          password_hash: 'managed_by_supabase_auth',
          full_name: fullName,
          role: 'super_admin', // 首个管理员设为超级管理员
          is_active: true, // 首个管理员直接激活，无需邮箱验证
        },
        onConflict: 'id',
      }),
      cache: 'no-cache',
    });

    if (!upsertResponse.ok) {
      const errorData = await upsertResponse.json().catch(() => ({}));
      console.error('创建管理员记录失败:', errorData);
      return { success: false, error: errorData.error || '创建管理员记录失败' };
    }

    const upsertResult = await upsertResponse.json();
    if (!upsertResult.success) {
      console.error('创建管理员记录失败:', upsertResult.error);
      return { success: false, error: upsertResult.error };
    }

    return {
      success: true,
      message: '首个管理员用户创建成功，请使用新账户登录',
      requiresEmailVerification: false,
    };
  } catch (error) {
    console.error('创建首个管理员用户失败:', error);
    return { success: false, error: '创建首个管理员用户时发生错误' };
  }
}

/**
 * 检查是否存在管理员用户
 * 使用API端点而不是直接查询Supabase以避免网络资源错误
 */
export async function checkAdminExists() {
  try {
    console.log('通过API端点检查管理员用户');

    // 使用API端点检查管理员用户
    const response = await fetch('/api/admin/check-exists', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // 添加缓存控制
      cache: 'no-cache',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('API请求失败:', response.status, errorData);

      // 如果是服务器错误，返回具体错误信息
      if (response.status >= 500) {
        return {
          exists: false,
          error: errorData.error || '服务器内部错误',
          message: errorData.message || '检查管理员用户时发生服务器错误',
        };
      }

      return {
        exists: false,
        error: `HTTP ${response.status}`,
        message: '请求失败',
      };
    }

    const result = await response.json();
    console.log('管理员检查结果:', result);

    return {
      exists: result.exists || false,
      adminCount: result.adminCount,
      message: result.message,
    };
  } catch (error) {
    console.error('检查管理员用户异常:', error);

    // 如果是网络错误，提供更友好的错误信息
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return {
        exists: false,
        error: '网络连接失败',
        message: '无法连接到服务器，请检查网络连接',
      };
    }

    return {
      exists: false,
      error: error instanceof Error ? error.message : '未知错误',
      message: '检查管理员用户时发生错误',
    };
  }
}
