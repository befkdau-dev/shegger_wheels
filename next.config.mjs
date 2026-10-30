/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    // Car photos are local SVG placeholders in /public/cars. Remote hosts are
    // intentionally not allow-listed; add them here if you switch to hosted photos.
    formats: ['image/avif', 'image/webp'],
  },
};

export default nextConfig;
