/** @type {import('next').NextConfig} */

import path from 'node:path';
import CopyPlugin from 'copy-webpack-plugin';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const nextConfig = {
  output: 'standalone',
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: [
      'raw.githubusercontent.com',
      'res.cloudinary.com',
      'dx41nk9nsacii.cloudfront.net',
      '*.amazonaws.com',
      'example.com',
      'images.unsplash.com',
      'ocrealstoragebucket.s3.eu-north-1.amazonaws.com',
      'dx41nk9nsacii.cloudfront.net',
      'xomesearch.propertiescdn.com',
      'ssl.cdn-redfin.com',
      'www.compass.com',
      'maps.googleapis.com',
      'images1.apartments.com',
      'images1.forrent.com',
      'pi.movoto.com',
      'images.estately.net',
      's1.rea.global',
      'ssl.cdn-redfin.com',
      'ssl.cdn-redfin.com',
      'i.pravatar.cc',
      'imagecdn.realty.com',
      'snaphomz.s3.eu-north-1.amazonaws.com',
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'dx41nk9nsacii.cloudfront.net',
        port: '',
      },
      {
        protocol: 'https',
        hostname: '*.amazonaws.com',
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc',
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'imagecdn.realty.com',
        port: '',
      },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  transpilePackages: ['lucide-react'],
  reactStrictMode: true,
  swcMinify: true,
  future: {
    webpack5: true,
  },
  webpack: (config) => {
    config.plugins.push(
      new CopyPlugin({
        patterns: [
          {
            from: path.join(__dirname, 'node_modules/tinymce'),
            to: path.join(__dirname, 'public/assets/libs/tinymce'),
          },
        ],
      }),
    );
    return config;
  },
  env: {
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
    NEXT_PUBLIC_MAP_KEY: process.env.NEXT_PUBLIC_MAP_KEY,
    NEXT_PUBLIC_ACCESS_AWS_KEY: process.env.NEXT_PUBLIC_ACCESS_AWS_KEY,
    NEXT_PUBLIC_SECRET_AWS_ACCESS_KEY:
      process.env.NEXT_PUBLIC_SECRET_AWS_ACCESS_KEY,
    NEXT_PUBLIC_S3_BUCKET_NAME: process.env.NEXT_PUBLIC_S3_BUCKET_NAME,
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME:
      process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET:
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
    NEXT_PUBLIC_DOMAIN: process.env.NEXT_PUBLIC_DOMAIN,
  },
};

export default nextConfig;
