import { IFooterItems, MainNavItem } from '../interfaces/footer.interface';
import { Facebook, Instagram, Linkedin, Rss, TwitterIcon } from 'lucide-react';

export const footerLinks: Record<string, IFooterItems> = {
  company: {
    title: 'Company',
    links: [
      {
        title: 'About Us',
        href: '/about',
      },
      {
        title: 'Career',
        href: '/career',
      },
      // {
      //   title: 'Investor',
      //   href: '/investor',
      // },
      {
        title: 'Blog',
        href: '/blogs',
      },
    ],
  },
  contact: {
    title: 'Company',
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
        href: '/email',
      },
    ],
  },
  legal: {
    title: 'Legal',
    links: [
      {
        title: 'Terms and Conditions',
        href: '/terms-condition',
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
    href: 'https://instagram.com',
    icon: Facebook,
  },
  {
    title: 'twitter',
    external: true,
    href: 'https://instagram.com',
    icon: TwitterIcon,
  },
  {
    title: 'linkedin',
    external: true,
    href: 'https://instagram.com',
    icon: Linkedin,
  },
  {
    title: 'instagram',
    external: true,
    href: 'https://instagram.com',
    icon: Instagram,
  },
  {
    title: 'rss',
    external: true,
    href: 'https://instagram.com',
    icon: Rss,
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
