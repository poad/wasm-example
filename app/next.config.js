const withPlugins = require('next-compose-plugins');
const withBundleAnalyzer = require('@next/bundle-analyzer');

/** @type {import('next').NextConfig} */
const config = {
  output: "export",
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
};

module.exports = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})(config);
