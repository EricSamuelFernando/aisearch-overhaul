import { nanoid } from 'nanoid';
import Image from 'next/image';
import Link from 'next/link';
import { footerLinks, socialLinks } from '../../data/links';
import { IFooterItems } from '../../interfaces/footer.interface';

function Footer() {
  return (
    <footer className='mt-auto w-full bg-black py-4'>
      <div className='mx-auto px-4 md:px-[3.219rem]'>
        <div className='grid py-8 text-white md:grid-cols-4 md:py-16'>
          <div className='cols-span-1'>
            <div className='logo'>
              <Link href='/'>
                <Image
                  className='h-[3.75rem] w-44'
                  src={'/assets/images/snaphomz-logo-dark.svg'}
                  alt='Footer Logo'
                  height={43}
                  width={140}
                />
              </Link>
            </div>
          </div>
          <div className='col-span-3 my-4 flex flex-wrap items-start justify-between md:my-0 md:justify-around '>
            <FooterCategory {...footerLinks.company} />
            <FooterCategory {...footerLinks.contact} />
            <FooterCategory {...footerLinks.legal} />
          </div>
        </div>

        <div className='flex items-center justify-between border-t-[1px] border-white py-6'>
          <div className='text-grey-510'>
            <span className='font-[500]'>
              © OCREAL, Inc. {new Date().getFullYear()}
            </span>
          </div>
          <nav className='flex gap-x-2 text-white'>
            {socialLinks.map((item, i) => (
              <Link
                key={i}
                href={item.href!}
                target={item.external ? '_blank' : ''}
                rel={item.external ? 'noreferrer' : ''}
                className='flex items-center gap-x-2'
              >
                {item.icon ? <item.icon /> : null}
              </Link>
            ))}
          </nav>
        </div>
      </div>
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
