import { getAuthToken } from '@/lib/storage';
import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const useSocket = (): Socket | null => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected,setIsConnected] = useState(false)
  const token = getAuthToken()
  // useEffect(() => {
  //   const socketInstance = io('ws://localhost:4000',{
  //     query:{
  //       token
  //     }
  //   });
  //   setSocket(socketInstance);
  //   socketInstance.on('connect', () => {
  //     setIsConnected(true);
  //     // const userEmail = userData
  //     // socketInstance.emit('userConnected',userEmail);
  //   });
  //   return () => {
  //     socketInstance.disconnect();
  //   };
  // }, []);

  return socket;
};

export default useSocket;
