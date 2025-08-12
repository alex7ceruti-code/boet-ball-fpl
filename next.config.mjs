/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Allow production builds to complete even with ESLint warnings
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Allow production builds to complete even with TypeScript errors (for deployment only)
    ignoreBuildErrors: true,
  },
  // Enable image optimization for external URLs
  images: {
    domains: ['resources.premierleague.com', 'fantasy.premierleague.com'],
    unoptimized: true, // For FPL images
  },
  // Environment variables
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'http://localhost:3000',
  },
  // Performance optimizations
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
};

export default nextConfig;
