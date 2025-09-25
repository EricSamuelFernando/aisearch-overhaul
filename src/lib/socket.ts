import { COMMUNICATION_SOCKET_URI } from '@/shared/constants/env';
import { io } from 'socket.io-client';

const socket = io(COMMUNICATION_SOCKET_URI, {
  withCredentials: true,
  transports: ['websocket'], // Ensure WebSocket transport
});

export default socket;
