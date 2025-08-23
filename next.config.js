/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Ignore handlebars and other common warnings
    config.ignoreWarnings = [
      {
        module: /node_modules\/handlebars\/lib\/index\.js/,
        message:
          /Critical dependency: the request of a dependency is an expression/,
      },
      {
        module: /node_modules\/handlebars\/lib\/index\.js/,
        message: /require\.extensions is not supported by webpack/,
      },
      // Ignore all handlebars related warnings
      (warning) => {
        return (
          warning.module &&
          warning.module.resource &&
          warning.module.resource.includes('node_modules/handlebars')
        );
      },
    ];

    // Handle client-side fallbacks
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }

    return config;
  },
  serverExternalPackages: ['@supabase/supabase-js'],
};

export default nextConfig;
