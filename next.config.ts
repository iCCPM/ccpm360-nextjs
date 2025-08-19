import type { NextConfig } from 'next';

// 获取调试配置
const isFastRefreshLogsEnabled =
  process.env['NEXT_PUBLIC_FAST_REFRESH_LOGS'] === 'true';
const isProduction = process.env.NODE_ENV === 'production';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'trae-api-us.mchost.guru',
        port: '',
        pathname: '/api/ide/v1/text_to_image**',
      },
      {
        protocol: 'https',
        hostname: 'veanktjlvtrycfvhlasn.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  // 开发环境配置
  ...(!isProduction && {
    // Webpack配置
    webpack: (config: any, { dev, isServer }: any) => {
      if (dev && !isServer) {
        // 在开发环境中控制HMR相关日志
        config.infrastructureLogging = {
          level: isFastRefreshLogsEnabled ? 'info' : 'error',
        };
        // 控制stats输出
        config.stats = isFastRefreshLogsEnabled ? 'normal' : 'errors-only';
      }
      return config;
    },
  }),
};

export default nextConfig;
