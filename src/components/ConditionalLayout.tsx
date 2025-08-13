'use client';

import { usePathname } from 'next/navigation';
import Layout from './Layout';

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

export default function ConditionalLayout({
  children,
}: ConditionalLayoutProps) {
  const pathname = usePathname();

  // 如果是管理后台路径，不使用前台布局
  if (pathname?.startsWith('/admin')) {
    return <>{children}</>;
  }

  // 其他路径使用前台布局（包含Header和Footer）
  return <Layout>{children}</Layout>;
}
