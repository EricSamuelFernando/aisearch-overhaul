'use client';

import { cn } from '@/lib/utils';
import { agentDashboardRoutes } from '@/utils/data';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ObjectString } from '@/types/global.types';

type Props = {
  basePath?: string;
};

interface NavItem {
  link: string;
  label: string;
  active: boolean;
  className?: string;
}

const NavItem: React.FC<NavItem> = ({ link, label, active, className }) => {
  return (
    <li
      className={cn(
        'text-xs',
        active ? 'font-bold text-black' : 'font-medium text-grey-400',
        className,
      )}
    >
      <Link href={`${link}` || '/'}>{label}</Link>
    </li>
  );
};

const AgentTopNav = () => {
  const pathname = usePathname();

  const activePath = (item: string) => pathname === item;

  const styles: ObjectString = {
    'manage-contracts': 'px-[26.8px] border-l border-l-grey-400 ',
    listing: 'px-0',
  };

  return (
    <nav className='container py-8 lg:mx-20'>
      <section>
        <ul className='flex items-center'>
          {agentDashboardRoutes.map((item) => {
            return (
              <NavItem
                link={item?.query}
                label={item?.title}
                active={activePath(item?.query)}
                className={styles[item?.query] ?? 'px-[26.8px]'}
                key={item?.query}
              />
            );
          })}
        </ul>
      </section>
    </nav>
  );
};

export default AgentTopNav;
