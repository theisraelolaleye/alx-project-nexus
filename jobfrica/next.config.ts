import type { NextConfig } from 'next'

// Beginner-friendly image configuration: allow known external hosts
// Add any new CDN or logo host here so <Image /> works without errors.
const nextConfig: NextConfig = {
  images: {
    // Simple list of allowed domains (easy for beginners)
    domains: [
      'encrypted-tbn0.gstatic.com', // Google cached thumbs
      'media.licdn.com',            // LinkedIn logos/photos
      'pbs.twimg.com',              // Twitter/X images
      'githubusercontent.com',      // GitHub avatars
      'assets.coingecko.com'        // Example extra (remove if unused)
    ],
    // If you later need pattern matching, you can switch to remotePatterns.
    // remotePatterns: [
    //   { protocol: 'https', hostname: 'encrypted-tbn0.gstatic.com' }
    // ]
  }
}

export default nextConfig
