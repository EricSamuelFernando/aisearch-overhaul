import { footerLinks, socialLinks } from '@/data/links';
import { IFooterItems } from '@/interfaces/footer.interface';
import Image from 'next/image';
import Link from 'next/link';

function Footer() {
  return (
    <footer className="mt-auto w-full bg-black text-white">
      {/* Hidden legacy footer (kept per request) */}
      <div className="hidden">
        <section className="mx-auto w-full px-4 md:px-[3.219rem]">
          <div className="grid grid-cols-1 gap-10 py-10 text-white md:grid-cols-4 md:gap-6 md:py-14">
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

            <div className="md:col-span-3">
              <div className="grid grid-cols-2 gap-x-10 gap-y-10 md:grid-cols-3 md:gap-6">
                <FooterCategory {...footerLinks.company} />
                <FooterCategory {...footerLinks.contact} />
                <div className="col-span-2 md:col-span-1">
                  <FooterCategory {...footerLinks.legal} />
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-white/20 py-6">
            <p className="text-center text-sm text-white/70">
              (c) Snaphomz Inc. {new Date().getFullYear()}
            </p>
          </div>
        </section>
      </div>

      {/* New footer layout */}
      <section className="mx-auto w-full px-4 sm:px-6 lg:px-12 py-10">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-12 lg:gap-10 items-start">
          <div className="flex flex-col gap-4 sm:col-span-2 lg:col-span-3">
            <Link href="/" className="inline-flex items-center gap-3">
              <Image
                src="/assets/images/logo-main.png"
                alt="Snaphomz Logo"
                height={44}
                width={132}
                unoptimized
                className="object-contain"
              />
            </Link>
            <div className="text-sm text-white/80">
              <div>Snaphomz Inc</div>
              <div>NMLS ID: 2790448</div>
            </div>
            <div className="flex items-center gap-2 -ml-1">
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

          <div className="lg:col-span-2">
            <h3 className="mb-4 text-sm font-semibold">Company</h3>
            <ul className="space-y-3 text-sm text-white/80">
              {footerLinks.company.links
                .filter((item) => ['About us', 'Insight'].includes(item.title))
                .map((item) => (
                  <li key={item.href ?? item.title}>
                    {item.title === 'Insight' ? (
                      <Link href="/blog" className="hover:text-white">
                        {item.title}
                      </Link>
                    ) : (
                      <Link href={item.href!} className="hover:text-white">
                        {item.title}
                      </Link>
                    )}
                  </li>
                ))}
              <li>
                <span
                  title="Stay Tuned — Selling Gets Smarter"
                  className="cursor-pointer text-white/50"
                  aria-disabled="true"
                >
                  Sell
                </span>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h3 className="mb-4 text-sm font-semibold">Legal</h3>
            <ul className="space-y-3 text-sm text-white/80">
              {footerLinks.legal.links.map((item) => (
                <li key={item.href ?? item.title}>
                  <Link href={item.href!} className="hover:text-white">
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="sm:col-span-2 lg:col-span-5 mt-2 sm:mt-0">
            <div className="text-sm text-white/80 leading-relaxed max-w-none xl:max-w-[750px]">
              <p>
                <span className="font-semibold text-white">Disclaimer:</span> Information, tools, and calculators provided on Snaphomz are for informational and illustrative purposes only. Outputs are based on assumptions and user-provided inputs and do not constitute financial, legal, tax, or lending advice. Actual costs, interest rates, terms, and eligibility may differ from any figures shown. Snaphomz is not a lender, broker, or financial advisor. Before making any real estate or financing decisions, please consult a licensed mortgage professional, financial advisor, and/or tax professional
              </p>
              <div className="mt-4">
                <Link href="/do-not-sell-or-share" className="underline text-white">
                  Do Not Sell or Share My Personal Information
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 sm:mt-14 flex flex-col gap-4 border-t border-white/20 pt-6 md:items-center md:justify-center">
          <p className="text-sm text-white/70 text-center">
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