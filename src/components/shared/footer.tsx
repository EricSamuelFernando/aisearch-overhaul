import { footerLinks, socialLinks } from '@/data/links';
import { IFooterItems } from '@/interfaces/footer.interface';
import { nanoid } from 'nanoid';
import Image from 'next/image';
import Link from 'next/link';

function Footer() {
  return (
    <footer className='mt-auto w-full bg-[#170800] py-4'>
      <section className='mx-auto px-4 md:px-[3.219rem]'>
        <div className='grid py-8 text-white md:grid-cols-4 md:py-16'>
   {/* Logo and Tagline Section */}
      <div className='col-span-1'>
            <div className='logo'>
              <Link href='/'>
                <Image
                  src={'/assets/images/logo-main.png'} // Adjust logo path if necessary
                  alt='Footer Logo'
                  height={100}
                  width={150}
                />
              </Link>
              <p className='text-[#8E8B8A] text-[14px] mt-2'>
                Making real estate simple, fast, and seamless.
              </p>
            </div>

            {/* Social Media Icons, placed under logo and tagline */}
            <nav className='flex gap-x-4 mt-4'>
              {socialLinks.map((item, i) => (
                <Link
                  key={i}
                  href={item.href}
                  target={item.external ? '_blank' : ''}
                  rel={item.external ? 'noreferrer' : ''}
                  className='flex items-center gap-x-2'
                >
                  {item.icon ? <item.icon className="h-5 w-5" /> : null}
                </Link>
              ))}
            </nav>
          </div>

          {/* Footer Categories: Company, Contact, Legal */}
          <div className='col-span-3 my-4 grid grid-cols-2 items-start justify-between md:my-0 md:justify-around lg:grid-cols-3'>
            <FooterCategory {...footerLinks.company} />
            <FooterCategory {...footerLinks.contact} />
            <FooterCategory {...footerLinks.legal} />
          </div>
        </div>

  <div className='flex items-center justify-center border-t-[1px] border-white py-6'>
  <div className='text-grey-510 text-center'>
    <span className='font-[500]'>
      © SNAPHOMZ, LLC. {new Date().getFullYear()}
    </span>
  </div>
</div>

      </section>
    </footer>
  );
}

export default Footer;

const FooterCategory = ({ title, links }: IFooterItems) => {
  return (
    <div>
      <h3 className='text-lg font-bold'>{title}</h3>
      <ul className='space-y-4 py-8 text-grey-510'>
        {links.map((item) => (
          <li key={nanoid()}>
            <Link href={item.href!}>{item.title}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
};
