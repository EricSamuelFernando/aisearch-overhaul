'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { getInitials } from '@/lib/helpers';
import { useAuthActions } from '@/shared/hooks/useAuth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import CustomAvatar from './customs/avatar';
import MenuDropdown, { MenuItem } from './customs/menu';
import { Avatar } from './ui/avatar';
import { useUserAuthApi } from '@/hooks/api/auth/useUserAuthApi';
import { getProfileImageUrl } from '@/lib/utils';

type Props = {
  username: string;
  avatar?: string | null;
  firstName: string;
  lastName: string;
  containerClassName?: string;
  menuClassName?: string;
};

function AccountDropdown({
  username,
  avatar,
  firstName,
  lastName,
  containerClassName,
  menuClassName,
}: Props) {
  const { logout } = useAuthActions();
  const router = useRouter();
  const MORTGAGE_URL = process.env.NEXT_PUBLIC_MORTGAGE_FRONTEND_URL
  const [showAvatar, setShowAvatar] = useState(!!avatar);

  useEffect(() => {
    setShowAvatar(!!avatar);
  }, [avatar]);

  const menuItems: { text: string; path: any }[] = [
    // { text: 'Mortgage-old', path: MORTGAGE_URL },
    // { text: 'Mortgage', path: `/mortgage` },
    // { text: 'Shared Properties', path: `/shared-properties` },
    { text: 'Account', path: `/account` },
    { text: 'Profile', path: `/profile` },
    // { text: 'Invoice', path: `/payments` },
    // { text: 'Settings', path: `/settings` },
    { text: 'Logout', path: `/logout` },
  ];
  const { userLogout } = useUserAuthApi();
  const handleLogout = async () => {
    // console.log("Callledddd ; ");

    userLogout.mutate();
  }

  const dropdownItems: MenuItem[] = menuItems.map((menuItem) => ({
    label:
      menuItem.text === 'Logout' ? (
        <Button
          variant='ghost'
          className='font-500 w-full cursor-pointer  justify-start bg-transparent p-0  text-left text-sm font-normal'
          onClick={() => {

            handleLogout();
          }}
        >
          {menuItem.text}
        </Button>
      ) : (
        <Link className='font-500 block pb-2 text-sm' href={menuItem.path}>
          {menuItem.text}
        </Link>
      ),
  }));

  return (
    <MenuDropdown
      containerClassName={containerClassName}
      dropdownClassName={menuClassName}
      buttonLabel={
        <div className='flex cursor-pointer items-center gap-x-1'>

          <CustomAvatar
            className='h-[2.4rem] w-[2.4rem] text-base text-white'
            alt='Jane Doe'
            size={'2.4rem'}
          > {
              avatar && showAvatar ?
                <img
                  src={getProfileImageUrl(avatar)}
                  alt="Profile Preview"
                  className="w-full h-full rounded-full object-cover transition-transform duration-300 group-hover:scale-105"
                  onError={() => setShowAvatar(false)}
                />
                : getInitials(firstName, lastName) || 'SH'
            }

          </CustomAvatar>
          <span className='hidden text-sm text-black md:inline-block'>
            {username}
          </span>
        </div>
      }
      items={dropdownItems}
    />
  );
}

export default AccountDropdown;
