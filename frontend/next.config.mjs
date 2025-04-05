/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
    webpack: (config) => {
        config.externals.push('pino-pretty', 'lokijs', 'encoding');
        return config;
    },
    env: {
        NEXT_PUBLIC_PROJECT_ID: '',
        NEXT_PUBLIC_WORLDCOIN_APP_ID: '',
    },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '',
            },
        ],
    },
    transpilePackages: ['@lobehub/ui'],
};

export default nextConfig;
