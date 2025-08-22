'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from 'react';
import { AuthService, AdminUser } from '@/services/authService';
import { useErrorHandler } from '@/contexts/ErrorContext';
import { AuthLoading } from '@/components/ui/LoadingStates';

interface AuthContextType {
  user: AdminUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authInitialized, setAuthInitialized] = useState(false);
  const userCache = useRef<{
    userId: string;
    user: AdminUser;
    timestamp: number;
  } | null>(null);
  const { handleError } = useErrorHandler();

  const isAuthenticated = !!user;

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const result = await AuthService.login(email, password);

      if (result.success && result.user) {
        setUser(result.user);
      }

      setIsLoading(false);
      return result;
    } catch (error) {
      setIsLoading(false);
      handleError(error instanceof Error ? error : new Error(String(error)));
      return { success: false, error: '登录过程中发生错误' };
    }
  };

  const logout = async () => {
    try {
      await AuthService.logout();
      setUser(null);
    } catch (error) {
      handleError(error instanceof Error ? error : new Error(String(error)));
    }
  };

  const checkAuth = useCallback(async () => {
    setIsLoading(true);
    try {
      const currentUser = await AuthService.getCurrentUser();

      // 缓存用户信息，避免重复API调用
      if (currentUser) {
        userCache.current = {
          userId: currentUser.id,
          user: currentUser,
          timestamp: Date.now(),
        };
      }

      setUser(currentUser);
    } catch (error) {
      handleError(error instanceof Error ? error : new Error(String(error)));
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [handleError]);

  const hasRole = (role: string): boolean => {
    return AuthService.hasRole(user, role);
  };

  const hasAnyRole = (roles: string[]): boolean => {
    return AuthService.hasAnyRole(user, roles);
  };

  // 监听认证状态变化
  useEffect(() => {
    let mounted = true;
    let timeoutId: NodeJS.Timeout | null = null;

    // 设置超时机制，确保即使认证检查失败也能设置loading为false
    console.log(
      'AuthProvider: useEffect执行，开始认证检查，当前isLoading:',
      isLoading
    );
    timeoutId = setTimeout(() => {
      if (mounted && isLoading) {
        console.warn('AuthProvider: 认证检查超时，强制设置loading为false');
        setIsLoading(false);
      }
    }, 10000); // 10秒超时

    const { data } = AuthService.onAuthStateChange((authUser) => {
      try {
        console.log(
          'AuthProvider: onAuthStateChange回调触发，用户:',
          authUser ? authUser.email : 'null'
        );
        if (!mounted) {
          console.log('AuthProvider: 组件已卸载，忽略认证状态变化');
          return;
        }

        // 清除超时定时器
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }

        // 设置认证已初始化
        setAuthInitialized(true);

        // 检查缓存，避免重复设置相同用户
        const cache = userCache.current;
        const cacheValid =
          cache &&
          cache.userId === authUser?.id &&
          Date.now() - cache.timestamp < 30000; // 30秒缓存

        if (cacheValid && authUser) {
          // 使用缓存的用户信息
          setUser(cache.user);
        } else {
          // 设置新的用户信息
          setUser(authUser);
          if (authUser) {
            userCache.current = {
              userId: authUser.id,
              user: authUser,
              timestamp: Date.now(),
            };
          } else {
            userCache.current = null;
          }
        }

        // 无论是否有用户，都要设置加载状态为false
        console.log(
          'AuthProvider: 认证状态更新完成，用户:',
          authUser ? '已登录' : '未登录',
          '设置isLoading为false'
        );
        setIsLoading(false);
      } catch (error) {
        console.error('AuthProvider: 认证状态处理错误:', error);
        handleError(error instanceof Error ? error : new Error(String(error)));
        // 确保即使出错也设置loading为false
        console.log('AuthProvider: 错误处理完成，设置isLoading为false');
        setAuthInitialized(true);
        setIsLoading(false);
        setUser(null);
      }
    });

    return () => {
      mounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      data?.subscription?.unsubscribe();
    };
  }, [handleError]);

  // 添加额外的超时保护，确保认证状态最终会被设置
  useEffect(() => {
    const fallbackTimeout = setTimeout(() => {
      if (!authInitialized && isLoading) {
        console.warn('AuthProvider: 认证初始化超时，强制设置为未登录状态');
        setAuthInitialized(true);
        setIsLoading(false);
        setUser(null);
      }
    }, 8000); // 8秒后强制完成初始化

    return () => clearTimeout(fallbackTimeout);
  }, [authInitialized, isLoading]);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    checkAuth,
    hasRole,
    hasAnyRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// HOC for components that require authentication
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  allowedRoles?: string[]
) {
  return function AuthenticatedComponent(props: P) {
    const { user, isLoading, hasAnyRole } = useAuth();

    if (isLoading) {
      return <AuthLoading />;
    }

    if (!user) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">需要登录</h2>
            <p className="text-gray-600 mb-6">请先登录以访问此页面。</p>
            <a
              href="/login"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors inline-block"
            >
              前往登录
            </a>
          </div>
        </div>
      );
    }

    if (allowedRoles && allowedRoles.length > 0 && !hasAnyRole(allowedRoles)) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-red-500 text-6xl mb-4">🚫</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              访问被拒绝
            </h2>
            <p className="text-gray-600 mb-6">
              您没有访问此页面的权限。如需帮助，请联系管理员。
            </p>
            <a
              href="/dashboard"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors inline-block"
            >
              返回首页
            </a>
          </div>
        </div>
      );
    }

    return <Component {...props} />;
  };
}
