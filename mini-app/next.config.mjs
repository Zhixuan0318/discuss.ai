/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'sfdylvwdndtsj1a0.public.blob.vercel-storage.com',
            },
        ],
    },
};

export default nextConfig;
