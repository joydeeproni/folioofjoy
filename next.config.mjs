/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  turbopack: {
    root: '.',
  },
  // The Dive Club review copy is public-by-link only; keep it out of search
  // (the /dive layout also sets a robots meta tag).
  async headers() {
    return ['/dive', '/dive/:path*'].map((source) => ({
      source,
      headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
    }))
  },
}

export default nextConfig
