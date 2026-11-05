const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  experimental: {
    appDir: false,
    esmExternals: "loose",
  },
  transpilePackages: [
    "@vanilla-extract/sprinkles",
    "@rainbow-me/rainbowkit",
    "@reown/appkit",
    "@walletconnect/ethereum-provider",
    "@walletconnect/universal-provider",
    "@metamask/utils",
    "@metamask/rpc-errors",
    "@wagmi/connectors",
  ],
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@metamask/scure-bip39/dist/wordlists/english.js": path.resolve(
        __dirname,
        "shims/metamask-bip39-english.js"
      ),
    };

    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      crypto: false,
      stream: false,
      http: false,
      https: false,
      zlib: false,
      path: false,
      os: false,
    };

    config.externals.push({
      "utf-8-validate": "commonjs utf-8-validate",
      bufferutil: "commonjs bufferutil",
    });

    config.module.rules.push({
      test: /\.m?js$/,
      type: "javascript/auto",
      resolve: {
        fullySpecified: false,
      },
    });

    config.module.rules.push({
      test: /\.mjs$/,
      include: /node_modules/,
      type: "javascript/auto",
    });

    return config;
  },
};

module.exports = nextConfig;
