/** @type {import('next').NextConfig} */
const withPlugins = require('next-compose-plugins');
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withPlugins([
  [withBundleAnalyzer],
],
  {
    webpack5: true,
    reactStrictMode: true,
    esmExternals: true,
    swcLoader: true,
    swcMinify: true,
    experimental: {
      asyncWebAssembly: true,
    },
    webpack: (config, { isServer }) => {
      config.experiments = {
        asyncWebAssembly: true,
      };
      config.output.webassemblyModuleFilename = (isServer ? '../' : '') + 'static/wasm/webassembly.wasm';
      return config;
    }
  }
);
