/** @type {import('next').NextConfig} */
const nextConfig = {
  // Strict production build validation: keep TypeScript errors fatal.
  // Production builds must fail on TypeScript errors rather than shipping a
  // broken release. Keep this strict for Play Store and web deployments.
  typescript: {
    ignoreBuildErrors: false,
  },

  async rewrites() {
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    return projectId
      ? [
          {
            source: '/__/auth/:path*',
            destination: `https://${projectId}.firebaseapp.com/__/auth/:path*`,
          },
        ]
      : [];
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
