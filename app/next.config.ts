import { NextConfig } from "next";

import withBundleAnalyzer from '@next/bundle-analyzer';

const config: NextConfig = {
  output: "export",
  reactStrictMode: true,
  experimental: {
    esmExternals: true,
  },
  webpack: (config, { isServer }) => {
    config.experiments = {
      asyncWebAssembly: true,
      layers: true,
    };
    config.output.webassemblyModuleFilename = (isServer ? '../' : '') + 'static/wasm/webassembly.wasm';
    return config;
  }
};

module.exports = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})(config);
