import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        '@agoralabs-sh/avm-web-provider': false,
        '@algorandfoundation/liquid-auth-use-wallet-client': false,
        '@perawallet/connect-beta': false,
        '@walletconnect/modal': false,
        '@walletconnect/sign-client': false,
        'lute-connect': false,
      };
    }
    return config;
  },
};

export default nextConfig;
