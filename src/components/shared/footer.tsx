import { footerLinks, socialLinks } from '@/data/links';
import { IFooterItems } from '@/interfaces/footer.interface';
import Image from 'next/image';
import Link from 'next/link';

function Footer() {
  return (
    <footer className="mt-auto w-full bg-[#170800]">
      <section className="mx-auto w-full px-4 md:px-12">
        {/* Top */}
        <div className="grid grid-cols-1 gap-10 py-10 text-white md:grid-cols-4 md:gap-6 md:py-14">
          {/* LEFT: Logo + tagline + social */}
          <div className="flex h-full flex-col">
            <Link href="/" className="mb-4 inline-flex items-center">
              <Image
                src="/assets/images/logo-main.png"
                alt="Snaphomz Logo"
                height={60}
                width={176}
                unoptimized
                className="object-contain"
              />
            </Link>

            <p className="mb-0 max-w-[260px] text-sm leading-relaxed text-[#8E8B8A]">
              Making real estate simple, fast, and seamless.
            </p>

            {/* Mobile: sits under tagline. Desktop: pushed down like reference */}
            <div className="mt-6 flex items-center gap-5 md:mt-auto">
              {socialLinks.map((item, i) => (
                <Link
                  key={`${item.title}-${i}`}
                  href={item.href}
                  target={item.external ? '_blank' : undefined}
                  rel={item.external ? 'noreferrer' : undefined}
                  aria-label={item.title}
                  className="inline-flex h-8 w-8 items-center justify-center leading-none transition-opacity hover:opacity-80"
                >
                  {item.icon ? (
                    <item.icon className="h-[18px] w-[18px] text-white" />
                  ) : null}
                </Link>
              ))}
            </div>
          </div>

          {/* RIGHT: Categories
              ✅ Mobile requirement (like your screenshot):
              - Company + Contact: 2 columns
              - Legal: full width below them
              ✅ Desktop stays exactly 3 columns
          */}
          <div className="md:col-span-3">
            <div className="grid grid-cols-2 gap-x-10 gap-y-10 md:grid-cols-3 md:gap-6">
              <FooterCategory {...footerLinks.company} />
              <FooterCategory {...footerLinks.contact} />

              {/* Legal spans full width ONLY on mobile */}
              <div className="col-span-2 md:col-span-1">
                <FooterCategory {...footerLinks.legal} />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-white/20 py-6">
          <p className="text-center text-sm text-white/70">
            © Snaphomz Inc. {new Date().getFullYear()}
          </p>
        </div>
      </section>
    </footer>
  );
}

export default Footer;

const FooterCategory = ({ title, links }: IFooterItems) => {
  return (
    <div className="flex flex-col">
      {/* Keep desktop unchanged; mobile matches screenshot styling */}
      <h3 className="mb-4 text-sm font-semibold text-white">{title}</h3>

      <ul className="space-y-3 text-[#8E8B8A]">
        {links.map((item) => (
          <li key={item.href ?? item.title}>
            <Link
              href={item.href!}
              className="text-sm transition-colors hover:text-white"
            >
              {item.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};
