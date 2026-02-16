import { IFooterItems, MainNavItem } from '../interfaces/footer.interface';
import { Facebook, Instagram, Linkedin } from 'lucide-react';
import TikTokIcon from '@/components/icons/tiktok-icon';
import XIcon from '@/components/icons/x-icon';

export const footerLinks: Record<string, IFooterItems> = {
  company: {
    title: 'Company',
    links: [
      {
        title: 'About us',
        href: '/company',
      },
      {
        title: 'Career',
        href: '/career',
      },
      {
        title: 'Investor',
        href: '/investor',
      },
      {
        title: 'Insight',
        href: '/blog',
      },
    ],
  },
  contact: {
    title: 'Contact',
    links: [
      {
        title: 'Help and Support',
        href: '/help-and-support',
      },
      {
        title: 'FAQ',
        href: '/faq',
      },
      {
        title: 'Email',
        href: 'mailto:support@snaphomz.com',
      },
      {
        title: 'Do Not Sell or Share Information',
        href: '/do-not-sell-or-share',
      },
    ],
  },
  legal: {
    title: 'Legal',
    links: [
      {
        title: 'Terms and Conditions',
        href: '/terms-and-conditions',
      },
      {
        title: 'Privacy Policy',
        href: '/privacy-policy',
      },
      {
        title: 'Cookie-Policy',
        href: '/cookie-policy',
      },
      {
        title: 'Offer Terms',
        href: '/offer-terms',
      },
      {
        title: 'Disclosure',
        href: '/disclosure',
      },
    ],
  },
};

export const socialLinks: MainNavItem[] = [
  {
    title: 'facebook',
    external: true,
    href: 'https://www.facebook.com/profile.php?id=61575808817165',
    icon: Facebook,
  },
  {
    title: 'linkedin',
    external: true,
    href: 'https://www.linkedin.com/company/snaphomz/posts/?feedView=all',
    icon: Linkedin,
  },
  {
    title: 'instagram',
    external: true,
    href: 'https://www.instagram.com/snaphomz?igsh=MTQ1dnNmZHZlZGs3bA==',
    icon: Instagram,
  },
  {
    title: 'rss',
    external: true,
    href: 'https://www.tiktok.com/@snaphomz',
    icon: TikTokIcon,
  },
  {
    title: 'x',
    external: true,
    href: 'https://x.com/snaphomz?s=20',
    icon: XIcon,
  },
];

export const mainNavsLinks: MainNavItem[] = [
  {
    title: 'Buy',
    external: true,
    href: '/home',
  },
  {
    title: 'Sell',
    external: true,
    href: '/sell',
  },
  {
    title: 'Agents',
    external: true,
    href: '/agents',
  },
  {
    title: 'Company',
    external: true,
    href: '/company',
  },
  {
    title: 'Blog',
    external: true,
    href: '/blog',
  },
];

export const linksData = [
  {
    title: 'Buy a Home With',
    links: [
      { name: 'Your Agent', href: '/home#agents' },
      { name: 'Our Real Estate Agents', href: '/home#agents' },
      // { name: 'Do it Yourself', href: '/home#agents' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { name: 'How it Works', href: '/home#how-it-works' },
      { name: 'Offer Strength Analyzer', href: '/home#strength-analyzer' },
      { name: 'Testimonials', href: '/home#testimonials' },
    ],
  },
];
