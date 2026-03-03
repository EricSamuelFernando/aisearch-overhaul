import { LucideProps } from 'lucide-react';
import { ComponentType, ForwardRefExoticComponent } from 'react';
import { IconType } from 'react-icons';

type LucideIcon = ForwardRefExoticComponent<LucideProps>;
type FooterIcon = LucideIcon | IconType | ComponentType<{ className?: string }>;

export interface NavItem {
  title: string;
  href?: string;
  disabled?: boolean;
  external?: boolean;
  icon?: FooterIcon;
  label?: string;
}

export interface IFooterItems {
  title: string;
  links: NavItem[];
}

export interface MainNavItem extends NavItem {}
