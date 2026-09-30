/** @type {import('next').NextConfig} */
const nextConfig = {
  // Production builds must fail on TypeScript errors rather than shipping a
  // broken release. Keep this strict for Play Store and web deployments.
  typescript: {
    ignoreBuildErrors: false,
  },

  async rewrites() {\n    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;\n    return projectId\n      ? [\n          {\n            source: '/__/auth/:path*',\n            destination: `https://${projectId}.firebaseapp.com/__/auth/:path*`,\n          },\n        ]\n      : [];\n  },\n\n  images: {
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
