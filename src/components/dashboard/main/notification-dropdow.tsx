import { useEffect, useState } from 'react';
import {
  Menu,
  UnstyledButton,
  Indicator,
  Text,
  ScrollArea,
  Box,
} from '@mantine/core';
import { BellDot, CheckCheck } from 'lucide-react';
import { useAuth } from '@/shared/hooks/useAuth';
import { useGetAccessRequestsByUserId, useRepoManagementApi } from '@/hooks/api/document/useRepoManagement';


export default function NotificationDropdown() {
  const {user} = useAuth()
  const userId = user?.id as string;

  const { data: accessRequests = [], refetch } = useGetAccessRequestsByUserId(userId);

  const unreadCount = accessRequests?.filter((n:any) => n.status === 'PENDING').length;

  const {updateAccessRequestStatus:{
    mutate,
    isPending
  }} = useRepoManagementApi()

 
  const handleStatusUpdate = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    const payload = {
      requestId: id,
      status,
      accessType: 'OWNER',
    };
  
    mutate(payload, {
      onSuccess: () => {
        // ✅ Refetch access requests after successful mutation
        refetch();
      },
    });
  };

  return (
    <Menu shadow="md" radius={'lg'} width={280} position="bottom-end">
      <Menu.Target>
        <UnstyledButton>
          <Indicator color="red" size={12} disabled={!unreadCount}>
            <BellDot size={24} />
          </Indicator>
        </UnstyledButton>
      </Menu.Target>

      <Menu.Dropdown>
        <ScrollArea h={350}>
          {accessRequests.length === 0 && (
            <Box p="md">
              <Text size="sm" color="dimmed">
                No notifications
              </Text>
            </Box>
          )}

          {accessRequests.map((req:any) => (
            <Box
              key={req.id}
              p="xs"
              className="bg-slate-50 p-2 mb-1 flex flex-col gap-2 rounded-md"
            >
              <div className="flex items-start gap-2">
                <CheckCheck strokeWidth={1} size={16} />
                <Text size="sm">
                  Access request for <strong>{req.repo?.name}</strong>
                </Text>
              </div>
              {req.status === 'PENDING' && (
                <div className="flex gap-2 text-[10px] justify-end">
                  <button
                    disabled={isPending}
                    onClick={() => handleStatusUpdate(req.id, 'APPROVED')}
                    className="p-2 bg-green-600 py-1 text-white rounded-md"
                  >
                    Accept
                  </button>
                  <button
                    disabled={isPending}
                    onClick={() => handleStatusUpdate(req.id, 'REJECTED')}
                    className="p-2 bg-red-600 py-1 text-white rounded-md"
                  >
                    Reject
                  </button>
                </div>
              )}
              {req.status !== 'PENDING' && (
                <div className="text-[10px] text-right text-gray-500 italic">
                  Status: {req.status}
                </div>
              )}
            </Box>
          ))}
        </ScrollArea>
      </Menu.Dropdown>
    </Menu>
  );
}


// "use client";

// import { useState, useEffect } from "react";
// import { Menu, UnstyledButton, Indicator, Text, ScrollArea, Box } from "@mantine/core";
// import { BellDot, CheckCheck } from "lucide-react";
// import { useAuth } from "@/shared/hooks/useAuth";
// import { useGetAccessRequestsByUserId, useRepoManagementApi } from "@/hooks/api/document/useRepoManagement";
// import { useRouter } from "next/navigation";

// export default function NotificationDropdown() {
//   const { user } = useAuth();
//   const userId = user?.id as string;
//   const router = useRouter();

//   // Fetch access requests initially
//   const { data: accessRequests = [], refetch } = useGetAccessRequestsByUserId(userId);
//   const unreadCount = accessRequests?.filter((n: any) => n.status === "PENDING").length;

//   const { updateAccessRequestStatus: { mutate, isPending } } = useRepoManagementApi();

//   const [notifications, setNotifications] = useState<any[]>(accessRequests);
//   const [newNotification, setNewNotification] = useState<boolean>(false);

//   // Handle status update for access requests
//   const handleStatusUpdate = async (id: string, status: "APPROVED" | "REJECTED") => {
//     const payload = {
//       requestId: id,
//       status,
//       accessType: "OWNER",
//     };

//     mutate(payload, {
//       onSuccess: () => {
//         // Refetch access requests after successful mutation
//         refetch();
//       },
//     });
//   };

//   // Handle visibility for new notifications (similar to NewNotification)
//   useEffect(() => {
//     const showTimer = setTimeout(() => {
//       setNewNotification(false); // Hide new notification indicator after 10 seconds
//     }, 10000);

//     return () => clearTimeout(showTimer); // Clean up timer on component unmount
//   }, [newNotification]);

//   // Simulate new notifications periodically (to mimic real-time updates)
//   useEffect(() => {
//     // This is where you simulate the notification addition, like if a new notification is received
//     const simulateNewNotification = () => {
//       const newNotification = {
//         id: `new-${Date.now()}`,  // Unique ID
//         repo: { name: "New Property" },
//         status: "PENDING",
//       };

//       // Only add if it doesn't already exist in state
//       setNotifications((prevNotifications) => {
//         if (!prevNotifications.find((notification) => notification.id === newNotification.id)) {
//           return [...prevNotifications, newNotification];
//         }
//         return prevNotifications;
//       });

//       setNewNotification(true); // Show new notification indicator
//     };

//     // Simulate new notifications every 15 seconds (for demo purposes)
//     const interval = setInterval(simulateNewNotification, 15000);

//     return () => clearInterval(interval); // Cleanup on component unmount
//   }, []);

//   return (
//     <Menu shadow="md" radius="lg" width={280} position="bottom-end">
//       <Menu.Target>
//         <UnstyledButton>
//           <Indicator color="red" size={12} disabled={!unreadCount}>
//             <BellDot size={24} />
//           </Indicator>
//         </UnstyledButton>
//       </Menu.Target>

//       <Menu.Dropdown>
//         <ScrollArea h={350}>
//           {notifications.length === 0 && (
//             <Box p="md">
//               <Text size="sm" color="dimmed">
//                 No notifications
//               </Text>
//             </Box>
//           )}

//           {notifications.map((req: any) => (
//             <Box
//               key={req.id}
//               p="xs"
//               className="bg-slate-50 p-2 mb-1 flex flex-col gap-2 rounded-md"
//             >
//               <div className="flex items-start gap-2">
//                 <CheckCheck strokeWidth={1} size={16} />
//                 <Text size="sm">
//                   Access request for <strong>{req.repo?.name}</strong>
//                 </Text>
//               </div>
//               {req.status === "PENDING" && (
//                 <div className="flex gap-2 text-[10px] justify-end">
//                   <button
//                     disabled={isPending}
//                     onClick={() => handleStatusUpdate(req.id, "APPROVED")}
//                     className="p-2 bg-green-600 py-1 text-white rounded-md"
//                   >
//                     Accept
//                   </button>
//                   <button
//                     disabled={isPending}
//                     onClick={() => handleStatusUpdate(req.id, "REJECTED")}
//                     className="p-2 bg-red-600 py-1 text-white rounded-md"
//                   >
//                     Reject
//                   </button>
//                 </div>
//               )}
//               {req.status !== "PENDING" && (
//                 <div className="text-[10px] text-right text-gray-500 italic">
//                   Status: {req.status}
//                 </div>
//               )}
//             </Box>
//           ))}

//           {newNotification && (
//             <Box p="md" className="bg-yellow-50">
//               <Text size="sm" color="yellow">
//                 New Notification Received!
//               </Text>
//             </Box>
//           )}
//         </ScrollArea>
//       </Menu.Dropdown>
//     </Menu>
//   );
// }

// "use client";

// import { useState, useEffect } from "react";
// import { Menu, UnstyledButton, Indicator, Text, ScrollArea, Box } from "@mantine/core";
// import { BellDot } from "lucide-react";

// export default function NotificationDropdown() {
//   const [notifications, setNotifications] = useState<any[]>([]);
//   const [newNotification, setNewNotification] = useState<boolean>(false);

//   // Simulate new notifications periodically (to mimic real-time updates)
//   useEffect(() => {
//     const simulateNewNotification = () => {
//       const newNotification = {
//         id: `new-${Date.now()}`,  // Unique ID
//         user: "Xavier Watt", // Simulated user
//         property: "New Property", // Simulated property
//         message: "Interested in your property", // Simulated message
//       };

//       // Add only if this notification doesn't already exist
//       setNotifications((prevNotifications) => {
//         if (!prevNotifications.find((notification) => notification.id === newNotification.id)) {
//           return [...prevNotifications, newNotification];
//         }
//         return prevNotifications;
//       });

//       setNewNotification(true); // Show new notification indicator
//     };

//     // Simulate new notifications every 15 seconds (for demo purposes)
//     const interval = setInterval(simulateNewNotification, 15000);

//     return () => clearInterval(interval); // Cleanup on component unmount
//   }, []);

//   // Handle visibility for new notifications
//   useEffect(() => {
//     const showTimer = setTimeout(() => {
//       setNewNotification(false); // Hide new notification indicator after 10 seconds
//     }, 10000);

//     return () => clearTimeout(showTimer); // Clean up timer on component unmount
//   }, [newNotification]);

//   return (
//     <Menu shadow="md" radius="lg" width={280} position="bottom-end">
//       <Menu.Target>
//         <UnstyledButton>
//           <Indicator color="red" size={12} disabled={!notifications.length}>
//             <BellDot size={24} />
//           </Indicator>
//         </UnstyledButton>
//       </Menu.Target>

//       <Menu.Dropdown>
//         <ScrollArea h={350}>
//           {notifications.length === 0 && (
//             <Box p="md">
//               <Text size="sm" color="dimmed">
//                 No notifications
//               </Text>
//             </Box>
//           )}

//           {notifications.map((req: any) => (
//             <Box
//               key={req.id}
//               p="xs"
//               className="bg-slate-50 p-2 mb-1 flex flex-col gap-2 rounded-md"
//             >
//               <div className="flex items-start gap-2">
//                 <Text size="sm">
//                   Access request from <strong>{req.user}</strong> for <strong>{req.property}</strong>
//                 </Text>
//                 <Text size="xs" color="gray">
//                   {req.message}
//                 </Text>
//               </div>
//             </Box>
//           ))}

//           {newNotification && (
//             <Box p="md" className="bg-yellow-50">
//               <Text size="sm" color="yellow">
//                 New Notification Received!
//               </Text>
//             </Box>
//           )}
//         </ScrollArea>
//       </Menu.Dropdown>
//     </Menu>
//   );
// }


// import { useEffect, useState } from 'react';
// import {
//   Menu,
//   UnstyledButton,
//   Indicator,
//   Text,
//   ScrollArea,
//   Box,
// } from '@mantine/core';
// import { BellDot, CheckCheck } from 'lucide-react';
// import { useAuth } from '@/shared/hooks/useAuth';
// import { useGetAccessRequestsByUserId, useRepoManagementApi } from '@/hooks/api/document/useRepoManagement';
// import NewNotification from '@/components/chat-box/notification-bar';


// export default function NotificationDropdown() {
//   const {user} = useAuth()
//   const userId = user?.id as string;

//   const { data: accessRequests = [], refetch } = useGetAccessRequestsByUserId(userId);

//   const unreadCount = accessRequests?.filter((n:any) => n.status === 'PENDING').length;

//   const {updateAccessRequestStatus:{
//     mutate,
//     isPending
//   }} = useRepoManagementApi()

 
//   const handleStatusUpdate = async (id: string, status: 'APPROVED' | 'REJECTED') => {
//     const payload = {
//       requestId: id,
//       status,
//       accessType: 'OWNER',
//     };
  
//     mutate(payload, {
//       onSuccess: () => {
//         // ✅ Refetch access requests after successful mutation
//         refetch();
//       },
//     });
//   };

//   return (
//     <Menu shadow="md" radius={'lg'} width={280} position="bottom-end">
//       <Menu.Target>
//         <UnstyledButton>
//           <Indicator color="red" size={12} disabled={!unreadCount}>
//             <BellDot size={24} />
//           </Indicator>
//         </UnstyledButton>
//       </Menu.Target>

//       <Menu.Dropdown>
//         <ScrollArea h={350}>
//           {accessRequests.length === 0 && (
//             <Box p="md">
//               <Text size="sm" color="dimmed">
//                 No notifications
//               </Text>
//             </Box>
//           )}

//           {accessRequests.map((req:any) => (
//             <Box
//               key={req.id}
//               p="xs"
//               className="bg-slate-50 p-2 mb-1 flex flex-col gap-2 rounded-md"
//             >
//               <div className="flex items-start gap-2">
//                 <CheckCheck strokeWidth={1} size={16} />
//                 <Text size="sm">
//                   Access request for <strong>{req.repo?.name}</strong>
//                 </Text>
//               </div>
//               {req.status === 'PENDING' && (
//                 <div className="flex gap-2 text-[10px] justify-end">
//                   <button
//                     disabled={isPending}
//                     onClick={() => handleStatusUpdate(req.id, 'APPROVED')}
//                     className="p-2 bg-green-600 py-1 text-white rounded-md"
//                   >
//                     Accept
//                   </button>
//                   <button
//                     disabled={isPending}
//                     onClick={() => handleStatusUpdate(req.id, 'REJECTED')}
//                     className="p-2 bg-red-600 py-1 text-white rounded-md"
//                   >
//                     Reject
//                   </button>
//                 </div>
//               )}
//               {req.status !== 'PENDING' && (
//                 <div className="text-[10px] text-right text-gray-500 italic">
//                   Status: {req.status}
//                 </div>
//               )}
//             </Box>
//           ))}
//         </ScrollArea>
//       </Menu.Dropdown>
//     </Menu>
//   );
// }
