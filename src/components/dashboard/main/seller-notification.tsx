'use client';

import React, { FC } from 'react';
import { FiArrowLeft } from 'react-icons/fi';
import { FaCheckCircle } from 'react-icons/fa';
import Link from 'next/link';
import CustomButton from '@/components/custom-button';
import { useNotificationApi } from '@/hooks/api/user/useNotification';
import NotificationModal from './notification-modal';
import { Button } from '@/components/ui/button';

interface Notification {
  _id: string;
  title: string;
  body: string;
  user: string;
  userType: string;
  read: boolean;
  createdAt: string;
  updatedAt: string;
}

const SellerNotifications: FC = () => {
  const { notificationsQuery, markOneAsReadMutation, markAllAsReadMutation } =
    useNotificationApi();
  const rawApiData = notificationsQuery.data?.data as any;
  const notificationList = Array.isArray(rawApiData)
    ? rawApiData
    : rawApiData?.data?.result?.result || rawApiData?.result || [];
  const [currentTab, setCurrentTab] = React.useState<'unread' | 'read'>(
    'unread',
  );
  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  const [selectedNotification, setSelectedNotification] =
    React.useState<Notification | null>(null);

  React.useEffect(() => {
    if (notificationList.length > 0) {
      setNotifications(notificationList);
    }
  }, [notificationList]);

  const handleTabChange = (tab: 'unread' | 'read') => {
    setCurrentTab(tab);
  };

  const handleReview = (notification: Notification) => {
    setSelectedNotification(notification);
  };

  const handleMarkAsRead = async (id: string) => {
    await markOneAsReadMutation.mutate(id);
    setNotifications((prevNotifications) =>
      prevNotifications.map((notification) =>
        notification._id === id
          ? { ...notification, read: true }
          : notification,
      ),
    );
  };

  const handleCloseModal = async () => {
    if (selectedNotification) {
      await handleMarkAsRead(selectedNotification._id);
      setSelectedNotification(null);
      setCurrentTab('read');
    }
  };

  const handleClearAll = () => {
    markAllAsReadMutation.mutate(undefined, {
      onSuccess: () => {
        setNotifications((prevNotifications) =>
          prevNotifications.map((notification) => ({
            ...notification,
            read: true,
          })),
        );
      },
    });
  };

  const unreadCount = notifications.filter(
    (notification) => !notification.read,
  ).length;

  const filteredNotifications = [
    {
      _id: "1",
      title: "New Order Received",
      body: "You have a new order from customer John Doe.",
      user: "John Doe",
      userType: "buyer",
      read: false,
      createdAt: "2025-02-06T14:30:00Z",
      updatedAt: "2025-02-06T14:30:00Z",
    },
    {
      _id: "2",
      title: "Payment Processed",
      body: "Your recent transaction has been successfully processed.",
      user: "System",
      userType: "system",
      read: true,
      createdAt: "2025-02-05T10:15:00Z",
      updatedAt: "2025-02-05T10:15:00Z",
    },
    {
      _id: "3",
      title: "Item Shipped",
      body: "Your item has been shipped and is on the way!",
      user: "Logistics",
      userType: "system",
      read: false,
      createdAt: "2025-02-04T08:00:00Z",
      updatedAt: "2025-02-04T08:00:00Z",
    },
    {
      _id: "4",
      title: "New Message",
      body: "You have received a new message from Jane Smith.",
      user: "Jane Smith",
      userType: "buyer",
      read: true,
      createdAt: "2025-02-03T15:45:00Z",
      updatedAt: "2025-02-03T15:45:00Z",
    },
    {
      _id: "5",
      title: "Review Reminder",
      body: "Don't forget to leave a review for your recent transaction.",
      user: "System",
      userType: "system",
      read: false,
      createdAt: "2025-02-02T12:20:00Z",
      updatedAt: "2025-02-02T12:20:00Z",
    },
  ];

  // const filteredNotifications = notifications.filter((notification) =>
  //   currentTab === 'unread' ? !notification.read : notification.read,
  // );

  return (
    <div className='flex min-h-screen flex-col px-16'>
      <Link
        href='/dashboard'
        className='mt-6 flex items-center font-medium text-black'
      >
        <FiArrowLeft className='mr-2' size={20} />
        Back to dashboard
      </Link>
      <div className='mt-14 flex flex-grow flex-col'>
        <div className='mb-6 flex items-center justify-between'>
          <div className='flex gap-10 px-4'>
            <button
              className={`font-bold ${currentTab === 'unread' ? 'text-black' : 'text-gray-400'
                }`}
              onClick={() => handleTabChange('unread')}
            >
              Unread{' '}
              {unreadCount > 0 ? (
                <span>({unreadCount})</span>
              ) : (
                <span>(0)</span>
              )}
            </button>
            <button
              className={`font-bold ${currentTab === 'read' ? 'text-black' : 'text-gray-400'
                }`}
              onClick={() => handleTabChange('read')}
            >
              Read
            </button>
          </div>
          <div className='flex space-x-12'>
            {currentTab === 'unread' && (
              <button
                onClick={handleClearAll}
                className='text-sm font-medium text-gray-600'
              >
                Mark all as read
              </button>
            )}

            <Button
              roundness='full'
              variant='default'
              className='border-[1px] px-8 py-1 text-sm font-medium text-white'
              onClick={handleClearAll}
            >
              <span>Clear all</span>
            </Button>
          </div>
        </div>

        <div className='flex flex-grow flex-col divide-y divide-gray-200 px-2'>
          {filteredNotifications.length === 0 ? (
            <div className='flex flex-grow items-center justify-center text-center text-gray-500'>
              {currentTab === 'unread'
                ? 'No unread messages'
                : 'No read messages'}
            </div>
          ) : (
            filteredNotifications.map((notification) => {
              const initials = notification?.user
                .split(" ")
                .map((word: string) => word[0]?.toUpperCase())
                .join("")
                .slice(0, 2);

              // Generate a unique color based on notification?.user
              const hashCode = (str: string) =>
                str.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
              const backgroundColor = `hsl(${hashCode(notification?.user) % 360}, 70%, 80%)`;

              return <div key={notification._id} className='flex items-center py-4'>
                <div className='mr-4'>
                  {notification.user ? (
                    <div
                      className="flex items-center justify-center rounded-full"
                      style={{
                        width: "50px",
                        height: "50px",
                        backgroundColor,
                      }}
                    >
                      <span className="text-white font-bold">{initials}</span>
                    </div>
                  ) : (
                    <div className='flex h-10 w-10 items-center justify-center rounded-full bg-gray-300'>
                      <FaCheckCircle className='text-green-500' />
                    </div>
                  )}
                </div>
                <div className='flex-grow'>
                  <div className='font-bold'>{notification.user}</div>
                  <div className='text-gray-600'>{notification.body}</div>
                </div>
                {!notification.read && (
                  <Button
                    roundness='full'
                    variant='outline'
                    className='mr-20 border-[1px] px-8 py-1 text-sm font-medium text-black'
                    onClick={() => handleReview(notification)}
                  >
                    <span>Review</span>
                  </Button>
                )}
                <div className='flex gap-6 text-md font-medium text-gray-400'>
                  <div>
                    {new Date(notification.createdAt).toLocaleTimeString()}
                  </div>
                  <div>
                    {new Date(notification.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            })
          )}
        </div>
      </div>

      {selectedNotification && (
        <NotificationModal onClose={handleCloseModal}>
          <div className='mb-8'>
            <h2 className='text-xl font-bold'>{selectedNotification.title}</h2>
            <p className='mt-2'>{selectedNotification.body}</p>
          </div>
        </NotificationModal>
      )}
    </div>
  );
};

export default SellerNotifications;
