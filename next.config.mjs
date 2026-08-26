/** @type {import('next').NextConfig} */
const nextConfig = {
  // Production builds must fail on TypeScript errors rather than shipping a
  // broken release. Keep this strict for Play Store and web deployments.
  typescript: {
    ignoreBuildErrors: false,
  },

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'firebasestorage.googleapis.com' }
    ]
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin-allow-popups',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
