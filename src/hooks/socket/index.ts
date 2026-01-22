// ⚠️ DISABLED: This hook creates duplicate WebSocket connections
// Use SocketContext instead to get the socket instance
// import { useEffect, useState } from 'react';
// import { WebSocketClient, createWebSocketClient } from '@/lib/websocket-client';
import { useContext } from 'react';
import { SocketContext } from '@/providers/socket.context';

const useSocket = () => {
  // Use SocketContext instead of creating a new connection
  const { socket } = useContext(SocketContext);
  return socket;
};

export default useSocket;
