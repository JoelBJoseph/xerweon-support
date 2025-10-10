/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,

    // Disable ESLint during Vercel build if ESLint isn't installed
    eslint: {
        ignoreDuringBuilds: true,
    },

    // Optional: prevents TypeScript build errors from stopping production build
    typescript: {
        ignoreBuildErrors: true,
    },

    // Enable experimental features safely
    experimental: {
        serverActions: true,
    },

    // Add any environment variables you need exposed
    env: {
        NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    },
};

module.exports = nextConfig;
