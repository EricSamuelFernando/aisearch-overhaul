import type { Metadata } from 'next';
import { DashboardLayout } from '@/layouts';

export const metadata: Metadata = {
  title: 'Snaphomz | Dashboard',
  description: 'Dashboard | Snap Homz',
};

export default function DashLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
