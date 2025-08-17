import { supabase } from '@/lib/supabase';
import { handleSupabaseError } from '@/utils/errorHandler';

export interface AdminUser {
  id: string;
  email: string;
  role: 'admin' | 'super_admin';
  name: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface LoginResult {
  success: boolean;
  error?: string;
  user?: AdminUser;
}

/**
 * 认证服务类
 * 负责处理所有认证相关的业务逻辑
 */
export class AuthService {
  // 用户信息缓存
  private static userCache: Map<
    string,
    { user: AdminUser; timestamp: number }
  > = new Map();
  /**
   * 用户登录
   */
  static async login(email: string, password: string): Promise<LoginResult> {
    try {
      // 1. 使用Supabase进行身份验证
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (authError) {
        const error = handleSupabaseError(authError);
        return { success: false, error: error.message };
      }

      if (!authData.user) {
        return { success: false, error: '登录失败，请重试' };
      }

      // 2. 获取管理员用户信息
      const adminUser = await this.getAdminUser(authData.user.id);
      if (!adminUser) {
        // 如果不是管理员用户，退出登录
        await supabase.auth.signOut();
        return { success: false, error: '无效的管理员账户' };
      }

      return { success: true, user: adminUser };
    } catch (error) {
      const appError = handleSupabaseError(error);
      return { success: false, error: appError.message };
    }
  }

  /**
   * 用户登出
   */
  static async logout(): Promise<void> {
    // 清除缓存
    this.userCache.clear();
    await supabase.auth.signOut();
  }

  /**
   * 获取当前用户
   */
  static async getCurrentUser(): Promise<AdminUser | null> {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        return null;
      }

      return await this.getAdminUser(user.id);
    } catch (error) {
      console.error('获取当前用户失败:', error);
      return null;
    }
  }

  /**
   * 获取管理员用户信息
   * 使用API端点而不是直接查询Supabase以避免网络资源错误
   */
  private static async getAdminUser(userId: string): Promise<AdminUser | null> {
    try {
      // 检查缓存
      const cached = this.userCache.get(userId);
      if (cached && Date.now() - cached.timestamp < 30000) {
        // 30秒缓存
        console.log('使用缓存的管理员用户信息:', cached.user.email);
        return cached.user;
      }

      console.log('通过API端点获取管理员用户信息:', userId);

      // 使用API端点获取管理员用户信息
      const response = await fetch(
        `/api/admin/get-user?userId=${encodeURIComponent(userId)}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          // 添加缓存控制
          cache: 'no-cache',
        }
      );

      if (!response.ok) {
        console.error(
          '获取管理员用户API请求失败:',
          response.status,
          response.statusText
        );
        return null;
      }

      const result = await response.json();

      if (!result.success || !result.user) {
        console.error('获取管理员用户失败:', result.error || '未知错误');
        return null;
      }

      const user = result.user as AdminUser;

      // 缓存用户信息
      this.userCache.set(userId, {
        user,
        timestamp: Date.now(),
      });

      console.log('成功获取管理员用户信息:', user.email);
      return user;
    } catch (error) {
      console.error('获取管理员用户信息失败:', error);
      return null;
    }
  }

  /**
   * 检查用户角色权限
   */
  static hasRole(user: AdminUser | null, requiredRole: string): boolean {
    if (!user) return false;

    // 超级管理员拥有所有权限
    if (user.role === 'super_admin') return true;

    // 检查具体角色
    return user.role === requiredRole;
  }

  /**
   * 检查用户是否有任一角色
   */
  static hasAnyRole(user: AdminUser | null, roles: string[]): boolean {
    if (!user || roles.length === 0) return false;
    return roles.some((role) => this.hasRole(user, role));
  }

  /**
   * 监听认证状态变化
   */
  static onAuthStateChange(callback: (user: AdminUser | null) => void) {
    const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const adminUser = await this.getAdminUser(session.user.id);
        callback(adminUser);
      } else if (event === 'SIGNED_OUT') {
        callback(null);
      }
    });

    return { data };
  }

  /**
   * 验证用户会话
   */
  static async validateSession(): Promise<boolean> {
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
      return !error && !!session;
    } catch (error) {
      return false;
    }
  }

  /**
   * 刷新用户会话
   */
  static async refreshSession(): Promise<boolean> {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      return !error && !!data.session;
    } catch (error) {
      return false;
    }
  }
}
