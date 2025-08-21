'use client';

import { useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthProvider';
import { AuthService } from '@/services/authService';
import { AuthLoading } from '@/components/ui/LoadingStates';

interface AuthGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
  redirectTo?: string;
  allowedRoles?: string[];
}

/**
 * 认证保护组件
 * 用于保护需要认证的页面和组件
 */
export function AuthGuard({
  children,
  fallback: _fallback,
  redirectTo = '/admin/login',
  allowedRoles = [],
}: AuthGuardProps) {
  const { user, isLoading, checkAuth } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // 如果已经在登录页面，不需要检查认证
    if (pathname === redirectTo) {
      return;
    }

    // 检查认证状态
    checkAuth();
  }, [pathname, redirectTo]);

  // 处理未认证用户的重定向
  useEffect(() => {
    // 如果用户未登录且不在登录页面，重定向到登录页面
    if (!isLoading && !user && pathname !== redirectTo) {
      router.push(redirectTo);
    }
  }, [user, isLoading, pathname, redirectTo, router]);

  // 如果正在加载，显示加载状态
  if (isLoading) {
    return <AuthLoading />;
  }

  // 如果用户未登录且不在登录页面，显示加载状态（等待重定向）
  if (!user && pathname !== redirectTo) {
    return <AuthLoading />;
  }

  // 如果指定了角色限制，检查用户角色
  if (
    user &&
    allowedRoles.length > 0 &&
    !AuthService.hasAnyRole(user, allowedRoles)
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">访问被拒绝</h1>
          <p className="text-gray-600 mb-4">您没有权限访问此页面</p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            返回上一页
          </button>
        </div>
      </div>
    );
  }

  // 如果用户已登录或在登录页面，渲染子组件
  return <>{children}</>;
}

/**
 * 高阶组件版本的认证保护
 */
export function withAuthGuard<P extends object>(
  Component: React.ComponentType<P>,
  options?: Omit<AuthGuardProps, 'children'>
) {
  return function AuthGuardedComponent(props: P) {
    return (
      <AuthGuard {...options}>
        <Component {...props} />
      </AuthGuard>
    );
  };
}

/**
 * 角色检查Hook
 */
export function useRoleCheck(requiredRoles: string[] = []) {
  const { user } = useAuth();

  const hasRole = (role: string) => user?.role === role;
  const hasAnyRole = (roles: string[]) =>
    roles.some((role) => user?.role === role);
  const hasRequiredRole =
    requiredRoles.length === 0 || hasAnyRole(requiredRoles);

  return {
    user,
    hasRole,
    hasAnyRole,
    hasRequiredRole,
    isAdmin: hasRole('admin') || hasRole('super_admin'),
    isSuperAdmin: hasRole('super_admin'),
  };
}
