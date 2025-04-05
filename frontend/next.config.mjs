/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
    webpack: (config) => {
        config.externals.push('pino-pretty', 'lokijs', 'encoding');
        return config;
    },
    env: {
        NEXT_PUBLIC_PROJECT_ID: '',
    },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'sfdylvwdndtsj1a0.public.blob.vercel-storage.com',
            },
        ],
    },
    transpilePackages: ['@lobehub/ui'],
};

export default nextConfig;
