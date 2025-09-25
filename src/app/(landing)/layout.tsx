
import { MainLayout } from '@/layouts';
import { LandingBuyPropertyProvider } from '@/providers/landing-buy-property-provider';
import { PropertiesProvider } from '@/providers/property-provider';

export default async function LandingPageLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <LandingBuyPropertyProvider>
      <PropertiesProvider>
        <MainLayout>{children}</MainLayout>
      </PropertiesProvider>
    </LandingBuyPropertyProvider>
  );
}
