import { getAuthToken } from '@/lib/storage';

export interface WebSocketClient {
  id: string | null;
  connected: boolean;
  on(event: string, callback: (data: any) => void): void;
  off(event: string, callback?: (data: any) => void): void;
  emit(event: string, data?: any): void;
  disconnect(): void;
  connect(): void;
  // Room management methods
  createOrJoinRoom(roomData: CreateRoomData): void;
  sendMessage(messageData: SendMessageData): void;
  joinRoom(roomId: string): void;
  leaveRoom(roomId: string): void;
  ping(): void;
}

export interface CreateRoomData {
  threadId?: string;
  propertyId?: string;
  userId: string;
  userType?: string;
  propertyOwnerId?: string;
  buyerAgentId?: string;
  sellerAgentId?: string;
  roomId?: string;
  threadName?: string;
  propertyName?: string;
  propertyAddress?: string;
}

export interface SendMessageData {
  threadId: string;
  message: string;
  userId: string;
  receiverId?: string;
  recipient?: string;
  reciepent?: string;
  messageType?: string;
  fileType?: string;
  parentMessageId?: string;
}

interface MessagePacket {
  event?: string;
  action?: string;
  data?: any;
  id?: string;
}

export class WebSocketClientImpl implements WebSocketClient {
  private ws: WebSocket | null = null;
  private url: string;
  private token: string | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 20;
  private reconnectDelay = 1000;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private eventHandlers = new Map<string, Set<(data: any) => void>>();
  private messageQueue: MessagePacket[] = [];
  public id: string | null = null;
  public connected = false;

  constructor(url: string) {
    // // Convert http:// to ws:// and https:// to wss://
    // // Detect if this is Lambda/API Gateway (contains execute-api.amazonaws.com or API Gateway patterns)
    // // API Gateway WebSocket URLs typically look like: wss://{api-id}.execute-api.{region}.amazonaws.com/{stage}
    // // Also check for common API Gateway patterns
    // const isApiGatewayPattern = url.includes('execute-api.amazonaws.com') ||
    //   url.includes('execute-api.') ||
    //   /execute-api\.[a-z0-9-]+\.amazonaws\.com/i.test(url);

    // // Force Lambda mode if URL contains execute-api (API Gateway WebSocket)
    // // OR if environment variable explicitly indicates API Gateway
    // this.isLambda = isApiGatewayPattern ||
    //   process.env.NEXT_PUBLIC_USE_LAMBDA_WEBSOCKET === 'true' ||
    //   url.includes('amazonaws.com');

    // console.log('[WebSocket] URL detection:', {
    //   originalUrl: url,
    //   isLambda: this.isLambda,
    //   containsExecuteApi: url.includes('execute-api'),
    //   isApiGatewayPattern,
    //   envFlag: process.env.NEXT_PUBLIC_USE_LAMBDA_WEBSOCKET
    // });

    // if (this.isLambda) {
    //   // API Gateway WebSocket format: wss://{api-id}.execute-api.{region}.amazonaws.com/{stage}
    //   // Convert http/https to ws/wss
    //   // IMPORTANT: Keep the stage path (e.g., /ws, /prod, /dev) as it's part of the API Gateway route
    //   // Example: https://ge7k22aqak.execute-api.us-west-1.amazonaws.com/ws
    //   //          becomes: wss://ge7k22aqak.execute-api.us-west-1.amazonaws.com/ws
    //   this.url = url.startsWith('ws') ? url : url.replace(/^http/, 'ws');
    //   // Do NOT remove /ws or any stage path - it's required for API Gateway routing
    // } else {
    //   // Local NestJS backend uses /ws path
    //   this.url = url.replace(/^http/, 'ws');
    //   if (!this.url.endsWith('/ws')) {
    //     this.url = this.url + '/ws';
    //   }
    // }

    // const isApiGatewayPattern =
    //   url.includes('execute-api.amazonaws.com') ||
    //   url.includes('execute-api.') ||
    //   /execute-api\.[a-z0-9-]+\.amazonaws\.com/i.test(url);

    // this.url = url.startsWith('ws') ? url : url.replace(/^http/, 'ws');
    this.url = url

    // console.log('[WebSocket] URL detection:', {
    //   originalUrl: url,
    //   containsExecuteApi: url.includes('execute-api'),
    //   isApiGatewayPattern,
    // });

    console.log('[WebSocket] Base URL:', url, '-> WebSocket URL:', this.url);



    const token: string | null = getAuthToken() ?? null;
    this.token = token;
  }

  connect(): void {
    // Prevent duplicate connections
    if (this.ws) {
      if (this.ws.readyState === WebSocket.OPEN) {
        console.log('[WebSocket] Already connected, skipping');
        return;
      }
      if (this.ws.readyState === WebSocket.CONNECTING) {
        console.log('[WebSocket] Already connecting, skipping');
        return;
      }
      // Clean up stale connection
      console.log('[WebSocket] Cleaning up stale connection');
      this.ws.close();
      this.ws = null;
    }

    try {
      console.log('[WebSocket] Connect requested', {
        baseUrl: this.url,
        hasToken: !!this.token,
        reconnectAttempts: this.reconnectAttempts,
      });
      const wsUrl = this.token
        ? `${this.url}?token=${encodeURIComponent(`Bearer ${this.token}`)}&authorization=${encodeURIComponent(`Bearer ${this.token}`)}`
        : this.url;

      console.log('[WebSocket] Connecting:', {
        url: this.url,
        wsUrl,
        hasToken: !!this.token,
        tokenPrefix: this.token ? this.token.slice(0, 6) + '...' : 'none',
      });

      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('[WebSocket] Connected', {
          readyState: this.ws?.readyState || 0,
          reconnectAttempts: this.reconnectAttempts,
        });
        this.connected = true;
        this.reconnectAttempts = 0;
        this.startHeartbeat();

        // Send queued messages
        while (this.messageQueue.length > 0) {
          const packet = this.messageQueue.shift();
          if (packet && this.ws?.readyState === WebSocket.OPEN) {
            // Validate packet has action/event before sending
            if (!packet.action && !packet.event) {
              console.error('[WebSocket] Skipping queued message with undefined event:', packet);
              continue;
            }
            try {
              this.ws.send(JSON.stringify(packet));
            } catch (error) {
              console.error('[WebSocket] Error sending queued message:', error, { packet });
            }
          }
        }

        // Trigger connect event
        this.triggerEvent('connect');
      };

      this.ws.onmessage = (event) => {
        try {
          const packet: MessagePacket = JSON.parse(event.data);

          console.log('[WebSocket] Received packet:', packet);

          // Handle both event and action fields (Lambda uses event, some backends use action)
          const eventName = packet.event || packet.action;

          if (eventName === 'connect' && packet.data?.id) {
            this.id = packet.data.id;
          }

          if (eventName) {
            console.log('[WebSocket] Triggering event:', eventName, 'with data:', packet.data);
            this.triggerEvent(eventName, packet.data);
          } else {
            console.warn('[WebSocket] Packet missing event/action field:', packet);
          }
        } catch (error) {
          console.error('[WebSocket] Error parsing message:', error, 'Raw data:', event.data);
        }
      };

      this.ws.onerror = (error) => {
        console.error('[WebSocket] Error event:', {
          error,
          readyState: this.ws?.readyState,
          url: this.url,
        });
        this.triggerEvent('connect_error', error);
      };

      this.ws.onclose = (event) => {
        console.log('[WebSocket] Disconnected:', {
          code: event.code,
          reason: event.reason,
          wasClean: event.wasClean,
        });
        this.connected = false;
        this.id = null;
        this.stopHeartbeat();
        this.triggerEvent('disconnect', event.reason);

        // Attempt to reconnect
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          console.log('[WebSocket] Reconnecting', {
            delayMs: this.reconnectDelay,
            attempt: this.reconnectAttempts,
            maxAttempts: this.maxReconnectAttempts,
          });
          this.reconnectTimer = setTimeout(() => {
            this.connect();
          }, this.reconnectDelay);
        } else {
          console.error('[WebSocket] Max reconnection attempts reached');
        }
      };
    } catch (error) {
      console.error('[WebSocket] Connection error:', error);
      this.triggerEvent('connect_error', error);
    }
  }

  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.stopHeartbeat();

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.connected = false;
    this.id = null;
  }

  on(event: string, callback: (data: any) => void): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    this.eventHandlers.get(event)!.add(callback);
  }

  off(event: string, callback?: (data: any) => void): void {
    if (!this.eventHandlers.has(event)) return;

    if (callback) {
      this.eventHandlers.get(event)!.delete(callback);
    } else {
      this.eventHandlers.delete(event);
    }
  }

  emit(event: string, data?: any): void {
    // Validate event name
    if (!event || typeof event !== 'string' || event.trim() === '') {
      console.error('[WebSocket] emit called with invalid event:', { event, data, stack: new Error().stack });
      return;
    }

    // Block unsupported events that are not in the backend handler
    const unsupportedEvents = [
      'save_user_agent_messages',
      'save_messages',
      'save_file',
      'typing',
      'mark_as_read',
      'userConnected',
      'recievedMessage'
    ];

    if (unsupportedEvents.includes(event)) {
      console.error(`[WebSocket] Blocked unsupported event: ${event}. This event is not supported by the backend WebSocket handler.`, {
        event,
        stack: new Error().stack
      });
      return;
    }

    const packet = { action: event, data: data || {} };

    console.log('[WebSocket] Emitting:', {
      event,
      packet,
      url: this.url
    });

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify(packet));
      } catch (error) {
        console.error('[WebSocket] Error sending packet:', error, { packet });
      }
    } else {
      // Queue message if not connected
      this.messageQueue.push(packet as MessagePacket);
      // Try to connect if not already connecting
      if (!this.ws || this.ws.readyState === WebSocket.CONNECTING) {
        this.connect();
      }
    }
  }

  private triggerEvent(event: string, data?: any): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error(`[WebSocket] Error in handler for ${event}:`, error);
        }
      });
    }
  }

  private startHeartbeat(): void {
    this.stopHeartbeat();
    this.heartbeatInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        // Lambda/API Gateway uses 'action', Local NestJS uses 'event'
        const pingPacket = { action: 'ping', data: {} };
        this.ws.send(JSON.stringify(pingPacket));
      }
    }, 30000); // Every 30 seconds
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  // Update token and reconnect if needed
  updateToken(token: string | null): void {
    this.token = token;
    if (this.connected) {
      this.disconnect();
      this.connect();
    }
  }

  // Room management methods implementation
  createOrJoinRoom(roomData: CreateRoomData): void {
    if (!roomData || !roomData.userId) {
      console.error('[WebSocket] createOrJoinRoom called with invalid data:', roomData);
      return;
    }
    this.emit('createOrJoinConversation', roomData);
  }

  sendMessage(messageData: SendMessageData): void {
    console.log('[WebSocket] sendMessage called with:', messageData);
    if (!messageData || !messageData.threadId) {
      console.error('[WebSocket] sendMessage called with invalid data:', messageData);
      return;
    }
    this.emit('sendMessage', messageData);
  }

  joinRoom(roomId: string): void {
    if (!roomId) {
      console.error('[WebSocket] joinRoom called with invalid roomId:', roomId);
      return;
    }
    console.log('[WebSocket] Joining room:', roomId);
    this.emit('joinRoom', { roomId }); // Send as object with roomId property
  }

  leaveRoom(roomId?: string): void {
    if (!roomId) {
      console.log('[WebSocket] leaveRoom called without roomId, skipping');
      return;
    }
    console.log('[WebSocket] Leaving room:', roomId);
    this.emit('leaveRoom', { roomId }); // Send as object with roomId property
  }

  ping(): void {
    this.emit('ping', {});
  }

  // Additional utility methods
  markAsRead(threadId: string, userId: string): void {
    this.emit('mark_as_read', { threadId, userId });
  }

  sendTyping(threadId: string, userId: string, isTyping: boolean): void {
    this.emit('typing', { threadId, userId, isTyping });
  }

  sendComment(commentData: {
    propertyId: string;
    userId: string;
    comment: string;
    userType?: string;
  }): void {
    this.emit('addComment', commentData);
  }

  // Connection status methods
  isConnected(): boolean {
    return this.connected && this.ws?.readyState === WebSocket.OPEN;
  }

  getConnectionId(): string | null {
    return this.id;
  }

  // Get connection state for debugging
  getConnectionState(): {
    connected: boolean;
    readyState: number | null;
    reconnectAttempts: number;
    queuedMessages: number;
    id: string | null;
  } {
    return {
      connected: this.connected,
      readyState: this.ws?.readyState ?? null,
      reconnectAttempts: this.reconnectAttempts,
      queuedMessages: this.messageQueue.length,
      id: this.id,
    };
  }
}

// Factory function to create WebSocket client
export function createWebSocketClient(url: string): WebSocketClient {
  return new WebSocketClientImpl(url);
}
