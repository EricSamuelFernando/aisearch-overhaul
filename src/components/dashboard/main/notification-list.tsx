'use client';

import { EmptySkeleton } from '@/components/empty-skeleton';
import Heading from '@/components/heading';
import Link from 'next/link';
import { NotificationCard } from './notification-card';
import { SocketContext } from '@/providers/socket.context';
import { useContext, useEffect, useState } from 'react';

export function NotificationList() {
  const { socket } = useContext(SocketContext);

  const [notifications, setNotifications] = useState([
    {
      id: '',
      message: '',
    },
  ]);

  useEffect(() => {
    socket?.on('new_offer_received', (data) => {
      setNotifications((prevNoti) => [...prevNoti, data]);
    });

    return () => {
      socket?.off('new_offer_received');
    };
  }, [socket]);

  return (
    <div className="w-full min-w-0">
      {/* Header */}
      <div className="my-4 flex w-full items-center gap-3">
        <Heading title="Notification" className="text-xl font-bold" />

        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-ocOrange text-white">
          {notifications.length}
        </span>
      </div>

      {/* Content */}
      <div className="w-full min-w-0">
        {notifications.length > 0 ? (
          <section className="w-full min-w-0">
            <NotificationCard key={''} body={''} />

            <div className="my-2 text-right">
              <Link
                href="/dashboard/notifications"
                className="text-[1.125rem]"
              >
                View all
              </Link>
            </div>
          </section>
        ) : (
          <EmptySkeleton className="w-full" />
        )}
      </div>
    </div>
  );
}
