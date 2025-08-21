'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthProvider';

export default function AdminPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const hasRedirected = useRef(false);
  const redirectTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // 清除之前的定时器
    if (redirectTimeout.current) {
      clearTimeout(redirectTimeout.current);
    }

    // 只有在认证状态确定且未重定向过时才执行重定向
    if (!isLoading && !hasRedirected.current) {
      hasRedirected.current = true;

      // 使用setTimeout避免立即重定向导致的循环
      redirectTimeout.current = setTimeout(() => {
        if (!user) {
          router.replace('/admin/login');
        } else {
          router.replace('/admin/dashboard');
        }
      }, 100);
    }

    // 清理函数
    return () => {
      if (redirectTimeout.current) {
        clearTimeout(redirectTimeout.current);
      }
    };
  }, [user, isLoading, router]);

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

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">正在跳转...</p>
      </div>
    </div>
  );
}
