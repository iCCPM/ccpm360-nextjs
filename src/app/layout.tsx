import type { Metadata } from 'next';
import './globals.css';
import ConditionalLayout from '../components/ConditionalLayout';
import UmamiTracker from '../components/UmamiTracker';
import { ErrorProvider } from '../contexts/ErrorContext';
import { AuthProvider } from '../contexts/AuthProvider';
import { ErrorBoundary } from '../components/error/ErrorBoundary';
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: 'CCPM360 - 关键链项目管理研究院',
  description:
    '专注于关键链项目管理（CCPM）的培训与咨询服务，帮助企业提升项目管理效率，实现项目成功交付。',
  keywords: '关键链项目管理,CCPM,项目管理培训,项目管理咨询,企业培训',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">
        {/* Umami Analytics 追踪 */}
        {process.env['NEXT_PUBLIC_UMAMI_WEBSITE_ID'] && (
          <UmamiTracker
            websiteId={process.env['NEXT_PUBLIC_UMAMI_WEBSITE_ID']}
            src={process.env['NEXT_PUBLIC_UMAMI_SRC'] || '/umami.js'}
          />
        )}

        <ErrorProvider>
          <AuthProvider>
            <ErrorBoundary>
              <ConditionalLayout>{children}</ConditionalLayout>
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: 'white',
                    border: '1px solid #e5e7eb',
                    color: '#374151',
                  },
                }}
              />
            </ErrorBoundary>
          </AuthProvider>
        </ErrorProvider>
      </body>
    </html>
  );
}
