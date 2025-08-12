import { supabase } from './supabase';

/**
 * 验证邀请码
 */
export async function validateInvitationCode(code: string, email: string) {
  try {
    const { data, error } = await supabase.rpc('validate_invitation_code', {
      code,
      email
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
      email
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
export async function createAdminUser(email: string, password: string, fullName: string, invitationCode: string) {
  try {
    // 首先验证邀请码
    const { valid, error: validationError } = await validateInvitationCode(invitationCode, email);
    if (!valid) {
      return { success: false, error: validationError || '邀请码无效或已过期' };
    }
    
    // 创建新用户（启用邮箱验证）
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          invitation_code: invitationCode
        }
      }
    });
    
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
      const { error: upsertError } = await supabase
        .from('admin_users')
        .upsert({
          id: signUpData.user.id,
          email: email,
          password_hash: 'managed_by_supabase_auth',
          full_name: fullName,
          role: userRole,
          is_active: false // 初始状态为未激活，需要邮箱验证后激活
        }, {
          onConflict: 'id'
        });
        
      if (upsertError) {
        console.error('更新admin_users表失败:', upsertError.message);
        return { success: false, error: upsertError.message };
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
      requiresEmailVerification: true
    };
  } catch (error) {
    console.error('创建管理员失败:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : '创建失败' 
    };
  }
}

/**
 * 创建首个管理员用户（无需邀请码）
 */
export async function createFirstAdminUser(email: string, password: string, fullName: string) {
  try {
    // 检查是否已存在管理员
    const existingAdmin = await checkAdminExists();
    if (existingAdmin.exists) {
      return { success: false, error: '系统中已存在管理员用户' };
    }

    // 创建用户账户
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: 'super_admin'
        }
      }
    });

    if (authError) {
      return { success: false, error: authError.message };
    }

    if (!authData.user) {
      return { success: false, error: '用户创建失败' };
    }

    // 创建管理员记录
    const { error: adminError } = await supabase
      .from('admin_users')
      .upsert({
        id: authData.user.id,
        email: email,
        password_hash: 'managed_by_supabase_auth',
        full_name: fullName,
        role: 'super_admin', // 首个管理员设为超级管理员
        is_active: false // 初始状态为未激活，需要邮箱验证后激活
      }, {
        onConflict: 'id'
      });

    if (adminError) {
      return { success: false, error: adminError.message };
    }

    return {
      success: true,
      message: '首个管理员用户创建成功，请检查邮箱并点击验证链接完成注册',
      requiresEmailVerification: true
    };
  } catch (error) {
    console.error('创建首个管理员用户失败:', error);
    return { success: false, error: '创建首个管理员用户时发生错误' };
  }
}

/**
 * 检查是否存在管理员用户
 */
export async function checkAdminExists() {
  try {
    // 检查环境变量是否可用
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.warn('Supabase环境变量不可用，假设不存在管理员用户');
      return { exists: false, error: 'Supabase环境变量不可用' };
    }

    const { data, error } = await supabase
      .from('admin_users')
      .select('id')
      .eq('is_active', true)
      .limit(1);
    
    if (error) {
      console.error('检查管理员用户失败:', error.message);
      // 如果是API密钥相关错误，返回特定的错误信息
      if (error.message.includes('Invalid API key') || error.message.includes('No API key')) {
        return { exists: false, error: 'API密钥配置错误，请检查环境变量' };
      }
      return { exists: false, error: error.message };
    }
    
    return { exists: data && data.length > 0 };
  } catch (error) {
    console.error('检查管理员用户异常:', error);
    return { exists: false, error: '检查失败' };
  }
}