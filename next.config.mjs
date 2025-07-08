/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',                 // Tarayıcıdan /api/… istekleri
        destination: 'http://localhost:4000/api/:path*' // Express sunucunuza yönlensin
      }
    ]
  }
}

export default nextConfig
