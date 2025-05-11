import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  // Temporarily comment out export for development
  // output: 'export',
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Fix for source map errors
  webpack: (config, { dev, isServer }) => {
    // Optimize source maps in development mode
    if (dev) {
      config.devtool = 'eval-source-map';
    }
    return config;
  },
  // Disable source maps in production
  productionBrowserSourceMaps: false,
  images: {
    unoptimized: true, // Disable image optimization for static export
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'thesstudioonline.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.cloudinary.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.githubusercontent.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'source.unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;

