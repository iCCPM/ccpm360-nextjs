'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthProvider';

export default function AdminPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    // 如果还在加载中，等待认证状态确定
    if (isLoading) {
      return;
    }

    // 认证状态确定后立即重定向
    if (!user) {
      console.log('[AdminPage] User not authenticated, redirecting to login');
      router.replace('/admin/login');
    } else {
      console.log('[AdminPage] User authenticated, redirecting to dashboard');
      router.replace('/admin/dashboard');
    }
  }, [user, isLoading, router]);

  // 只在初始加载时显示加载状态
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">正在验证登录状态...</p>
        </div>
      </div>
    );
  }

  // 认证状态确定后不显示任何内容，直接重定向
  return null;
}
