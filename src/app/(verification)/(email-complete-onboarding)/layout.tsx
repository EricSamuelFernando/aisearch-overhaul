import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import SnaphomzLogo from '@public/assets/images/snaphomz-logo.svg';

export const metadata: Metadata = {
  title: 'Onboarding Email Verification | Snaphomz',
  description: 'Snap Homz | User onboarding Verification',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <section className="min-h-screen w-full overflow-hidden bg-primary-100">
      {/* 1920 frame-like container + correct padding */}
      <div className="mx-auto flex min-h-screen w-full max-w-[1920px] flex-col px-6 pt-4 md:px-12 lg:px-16 xl:px-20 2xl:px-[90px]">
        {/* Header */}
        <header className="flex w-full items-center">
          <Link href="/">
            <Image src={SnaphomzLogo} alt="logo" className="h-[3.75rem] w-44" />
          </Link>
        </header>

        {/* Main */}
        <main className="grid flex-1 items-center md:grid-cols-1 xl:grid-cols-2 gap-10 lg:gap-16 xl:gap-20 2xl:gap-[280px]">
          {/* Left column: extra left offset to match Figma start (~130px) */}
          <div className="min-w-0 2xl:pl-[40px]">{children}</div>

          {/* Right image */}
          <section className="hidden xl:flex items-center justify-center">
            <div
              className="
                relative overflow-hidden rounded-b-xl rounded-t-full
                aspect-[689/841]
                w-[360px] lg:w-[460px] xl:w-[520px] 2xl:w-[689px]
                md:-translate-y-[16px]
                lg:-translate-y-[24px]
                xl:-translate-y-[32px]
                2xl:-translate-y-[40px]
              "
            >
              <Image
                src="/assets/images/v2/dome.png"
                alt="Snap Homz home"
                fill
                className="object-cover"
                sizes="(min-width: 1536px) 689px, (min-width: 1280px) 520px, (min-width: 1024px) 460px, 360px"
              />
            </div>
          </section>
        </main>
      </div>
    </section>
  );
}
