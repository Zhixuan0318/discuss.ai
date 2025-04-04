/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack: (config) => {
        config.externals.push('pino-pretty', 'lokijs', 'encoding');
        return config;
    },
    env: {
        NEXT_PUBLIC_PROJECT_ID: '',
        NEXT_PUBLIC_API: 'https://llm-campaign.vercel.app/api',
    },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '',
            },
        ],
    },
};

export default nextConfig;
