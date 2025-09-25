import { getAuthToken } from "@/lib/storage";
import socketio from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_AUTH_SERIVCE_SOCKET_URL ||"http://localhost:4000";
console.log("SOCKET_URL", process.env.NEXT_PUBLIC_AUTH_SERIVCE_SOCKET_URL,SOCKET_URL);
const token = getAuthToken()
// Create Socket.IO client
export const socket = socketio(SOCKET_URL, {
  autoConnect: true,
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 20,
  forceNew: true,
  query: {
    token: `Bearer ${token}`,
  },
  transports: ["websocket", "polling"],
});

// Log connection status
socket.on("connect", () => {
  console.log("Connected to the server:", socket.id);
});

socket.on("disconnect", () => {
  console.log("Disconnected from the server");
});

// Handle messages and other events as needed
socket.on("receiveMessage", (message) => {
  console.log("New message received:", message);
});

export default socket;
