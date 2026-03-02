'use client';
import { MouseEvent, useCallback, useState } from 'react';

import { UserCard } from '@/components/modals/user-card';
import { useRegisterActions } from '@/hooks/api/auth/useRegister';
import { storeCookie } from '@/lib/storage';
import { useModalContext } from '@/providers/modal-provider';
import { USER_ROLE } from '@/shared/constants/env';
import { UserType } from '@/types/user.types';
import { Icons } from '../icons';
import { Button } from '@/components/ui/button';
import { updateUserType } from '@/slices/onboarding/onboarding-slice';
import { useAppDispatch } from '@/lib/hook';

export const UserTypeSelection = ({
  onSetView,
  origin,
}: {
  onSetView?: (view: string | null) => void;
  origin?: 'page' | 'modal';
}) => {
  const { selectAccountType } = useRegisterActions();
  const dispatch = useAppDispatch();
  const [activeUserType, setActiveUserType] = useState<null | UserType>(null);
  const { closeModal } = useModalContext();
  const handleCardClick = useCallback(
    (userType: UserType) => {
      if (activeUserType === userType) {
        setActiveUserType(null);
        storeCookie({ key: USER_ROLE, value: undefined });
        dispatch(updateUserType({ userType: null }));
      } else {
        storeCookie({ key: USER_ROLE, value: userType });
        setActiveUserType(userType);
        dispatch(updateUserType({ userType }));
      }
    },
    [activeUserType, dispatch],
  );

  const navigateUser = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      e.preventDefault();
      if (activeUserType === 'agent' && typeof window !== 'undefined') {
        window.location.href = 'https://agents.snaphomz.com/signUp';
      } else {
        selectAccountType(activeUserType as UserType);
        onSetView?.('send-code');
      }
    },
    [activeUserType, onSetView, selectAccountType],
  );

  return (
    <div className='w-full'>
      {origin === 'modal' ? (
        <div className='flex justify-end'>
          <Button
            onClick={() => closeModal()}
            variant='secondary'
            size='icon'
            className='cursor-pointer bg-transparent hover:bg-transparent'
          >
            <Icons.Close className='h-5 w-5' />
          </Button>
        </div>
      ) : null}
      <h1 className='m-5 text-center text-2xl font-bold'>Choose User Type</h1>
      <div className='flex flex-col items-center justify-center space-y-5 pb-5'>
        <div className='w-full'>
          {['buyer', 'seller', 'agent'].map((item) => (
            <UserCard
              key={item}
              userType={item as UserType}
              onClick={() => handleCardClick(item as UserType)}
              isActive={activeUserType === item}
            />
          ))}
        </div>

        <Button
          onClick={navigateUser}
          className='h-12 w-full text-lg font-bold text-white'
          type='submit'
        >
          Continue
        </Button>
      </div>
    </div>
  );
};
