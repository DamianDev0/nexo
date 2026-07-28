const API_INTERNAL_URL = process.env.API_INTERNAL_URL ?? 'http://localhost:8080'

const nextConfig = {
  allowedDevOrigins: ['http://localhost:3000'],
  rewrites: async () => [
    {
      source: '/api/v1/:path*',
      destination: `${API_INTERNAL_URL}/api/v1/:path*`,
    },
  ],
}

export default nextConfig
