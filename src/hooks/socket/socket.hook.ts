import { createWebSocketClient, WebSocketClient } from "@/lib/websocket-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_AUTH_SERIVCE_SOCKET_URL || "http://localhost:4000";
console.log("SOCKET_URL", process.env.NEXT_PUBLIC_AUTH_SERIVCE_SOCKET_URL, SOCKET_URL);

// ⚠️ DISABLED: Socket is now managed by SocketContext to prevent duplicate connections
// Use SocketContext instead of this singleton
// Create WebSocket client
// export const socket: WebSocketClient = createWebSocketClient(SOCKET_URL);
// socket.connect();

// Log connection status
// socket.on("connect", () => {
//   console.log("Connected to the server:", socket.id);
// });

// socket.on("disconnect", () => {
//   console.log("Disconnected from the server");
// });

// Handle messages and other events as needed
// socket.on("receiveMessage", (message) => {
//   console.log("New message received:", message);
// });

// Export null to prevent usage - use SocketContext instead
export const socket: WebSocketClient | null = null;
export default socket;
