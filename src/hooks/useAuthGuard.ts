import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthProvider';

interface UseAuthGuardOptions {
  redirectTo?: string;
  allowedRoles?: string[];
  requireAuth?: boolean;
}

/**
 * 认证守卫钩子
 * 用于在组件中处理认证和权限检查
 */
export function useAuthGuard(options: UseAuthGuardOptions = {}) {
  const {
    redirectTo = '/login',
    allowedRoles = [],
    requireAuth = true,
  } = options;

  const { user, isLoading, isAuthenticated, hasAnyRole } = useAuth();
  const router = useRouter();

  const checkPermission = useCallback(() => {
    return allowedRoles.length === 0 || hasAnyRole(allowedRoles);
  }, [allowedRoles, hasAnyRole]);

  useEffect(() => {
    // 如果还在加载中，不做任何操作
    if (isLoading) return;

    // 如果需要认证但用户未登录，重定向到登录页
    if (requireAuth && !isAuthenticated) {
      router.push(redirectTo);
      return;
    }

    // 如果指定了角色要求但用户没有相应权限，重定向到首页
    if (isAuthenticated && allowedRoles.length > 0 && !checkPermission()) {
      router.push('/dashboard');
      return;
    }
  }, [
    isLoading,
    isAuthenticated,
    requireAuth,
    redirectTo,
    router,
    checkPermission,
  ]);

  return {
    user,
    isLoading,
    isAuthenticated,
    hasPermission: checkPermission(),
    canAccess: isAuthenticated && checkPermission(),
  };
}

/**
 * 页面级认证钩子
 * 用于页面组件的认证检查
 */
export function usePageAuth(allowedRoles?: string[]) {
  return useAuthGuard({
    allowedRoles,
    requireAuth: true,
    redirectTo: '/login',
  });
}

/**
 * 可选认证钩子
 * 用于不强制要求登录的页面
 */
export function useOptionalAuth() {
  return useAuthGuard({
    requireAuth: false,
  });
}
