/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // 忽略handlebars的require.extensions警告
    config.ignoreWarnings = [
      {
        module: /node_modules\/handlebars\/lib\/index\.js/,
        message: /require\.extensions is not supported by webpack/,
      },
    ];

    // 处理Supabase realtime-js的动态导入警告
    config.module.rules.push({
      test: /node_modules\/@supabase\/realtime-js\/.*\.js$/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: ['next/babel'],
        },
      },
    });

    // 忽略关键依赖警告
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };

    return config;
  },
  experimental: {
    // 启用服务器组件
    serverComponentsExternalPackages: ['@supabase/supabase-js'],
  },
};

export default nextConfig;
