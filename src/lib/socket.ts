// import { COMMUNICATION_SOCKET_URI } from '@/shared/constants/env';
// import { createWebSocketClient } from './websocket-client';

// const socketUrl = COMMUNICATION_SOCKET_URI || 'http://localhost:4000';
// const socket = createWebSocketClient(socketUrl);
// socket.connect();

// export default socket;


// ⚠️ DISABLED: Socket is now managed by SocketContext to prevent duplicate connections
// Use SocketContext instead of this singleton
// import { COMMUNICATION_SOCKET_URI } from '@/shared/constants/env';
// import { createWebSocketClient } from './websocket-client';

// const SOCKET_URL = COMMUNICATION_SOCKET_URI || 'http://localhost:4000';

// // 🔥 Create socket instance (singleton)
// const socket = createWebSocketClient(SOCKET_URL);

// // 🔥 Connect once
// socket.connect();

// ===================== DEBUG LISTENERS =====================
// socket.on('connect', () => {
//   console.log('✅ WebSocket connected');
// });

// socket.on('disconnect', (reason) => {
//   console.log('❌ WebSocket disconnected:', reason);
// });

// socket.on('connect_error', (err) => {
//   console.error('⚠️ WebSocket connection error:', err);
// });

// // 🔥 ROOM EVENTS
// socket.on('userJoined', (data) => {
//   console.log('👤 User joined room:', data);
// });

// socket.on('userLeft', (data) => {
//   console.log('👋 User left room:', data);
// });

// // 🔥 MESSAGE EVENTS
// socket.on('newMessage', (data) => {
//   console.log('💬 New message:', data);
// });

// // 🔥 TYPING
// socket.on('typing', (data) => {
//   console.log('✍️ Typing event:', data);
// });

// Export null to prevent usage - use SocketContext instead
const socket = null;
export default socket;
