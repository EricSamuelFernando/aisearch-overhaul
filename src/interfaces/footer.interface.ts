import { LucideProps } from 'lucide-react';
import { ForwardRefExoticComponent } from 'react';

type LucideIcon = ForwardRefExoticComponent<LucideProps>;

export interface NavItem {
  title: string;
  href: string;
  disabled?: boolean;
  external?: boolean;
  icon?: LucideIcon;
  label?: string;
}

export interface IFooterItems {
  title: string;
  links: NavItem[];
}

export interface MainNavItem extends NavItem {}
