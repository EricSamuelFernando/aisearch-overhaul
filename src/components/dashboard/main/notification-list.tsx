'use client';

import { useNotificationApi } from '@/hooks/api/user/useNotification';
import { EmptySkeleton } from '@/components/empty-skeleton';
import Heading from '@/components/heading';
import Link from 'next/link';
import { NotificationCard } from './notification-card';
import { SocketContext } from '@/providers/socket.context';
import { useContext, useEffect, useState } from 'react';

export function NotificationList() {

 
  const { socket, state, setState } = useContext(SocketContext) 
  const [notifications , setNotifications] = useState([{
    id:"",
    message:""
  }])

  useEffect(() => {

    socket?.on('new_offer_received', (data) => {
      console.log('New offer received:', data);
      
      // Update the state with the new offer
      setNotifications((prevNoti) => [...prevNoti, data]);
    });

  }, [socket]);

  return (
    <div className='w-full'>
      <div className='my-4 flex w-full items-center text-base font-bold'>
        <Heading title='Notification' className='text-xl font-bold' />
        <span className='ml-4 inline-block h-6 w-6 rounded-full bg-ocOrange text-center text-white'>
          {notifications.length}
        </span>
      </div>
      <div>
        {notifications.length > 0 ? (
          <section>
            <NotificationCard
              key={''}
              body={''}
            />
            <div className='my-2 text-right'>
              <Link
                href='/dashboard/notifications'
                className='text-[1.125rem]'
              >
                View all
              </Link>
            </div>
          </section>
        ) : (
          <EmptySkeleton className='w-full' />
        )}
      </div>
    </div>
  );
}
