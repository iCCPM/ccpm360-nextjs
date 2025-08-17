'use client';

import { ReactNode } from 'react';
import { AuthGuard } from './AuthGuard';

interface AuthLayoutProps {
  children: ReactNode;
  requireAuth?: boolean;
  allowedRoles?: string[];
  fallback?: ReactNode;
}

/**
 * 认证布局组件
 * 提供统一的认证保护和布局结构
 */
export function AuthLayout({
  children,
  requireAuth = true,
  allowedRoles = [],
  fallback,
}: AuthLayoutProps) {
  // 如果不需要认证，直接渲染子组件
  if (!requireAuth) {
    return <>{children}</>;
  }

  // 需要认证时，使用AuthGuard包装
  return (
    <AuthGuard allowedRoles={allowedRoles} fallback={fallback}>
      {children}
    </AuthGuard>
  );
}

/**
 * 管理员布局组件
 * 专门用于管理后台页面
 */
export function AdminAuthLayout({ children }: { children: ReactNode }) {
  return (
    <AuthLayout
      requireAuth={true}
      allowedRoles={['super_admin', 'admin', 'editor', 'reviewer']}
    >
      {children}
    </AuthLayout>
  );
}

/**
 * 超级管理员布局组件
 * 仅超级管理员可访问
 */
export function SuperAdminAuthLayout({ children }: { children: ReactNode }) {
  return (
    <AuthLayout requireAuth={true} allowedRoles={['super_admin']}>
      {children}
    </AuthLayout>
  );
}

/**
 * 公共布局组件
 * 不需要认证
 */
export function PublicLayout({ children }: { children: ReactNode }) {
  return <AuthLayout requireAuth={false}>{children}</AuthLayout>;
}
