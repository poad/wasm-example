/** @type {import('next').NextConfig} */
const withPlugins = require('next-compose-plugins');
const withBundleAnalyzer = require('@next/bundle-analyzer');

module.exports = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})({
    reactStrictMode: true,
    swcMinify: true,
    experimental: {
      esmExternals: true,
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
