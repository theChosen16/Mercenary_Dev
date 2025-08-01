import { io, Socket } from 'socket.io-client';

class SocketManager {
  private socket: Socket | null = null;
  private isConnected = false;

  connect(userId: string) {
    if (this.socket?.connected) {
      return this.socket;
    }

    this.socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001', {
      auth: {
        userId
      },
      transports: ['websocket', 'polling']
    });

    this.socket.on('connect', () => {
      console.log('🔌 Socket connected:', this.socket?.id);
      this.isConnected = true;
    });

    this.socket.on('disconnect', () => {
      console.log('🔌 Socket disconnected');
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('🔌 Socket connection error:', error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  getSocket() {
    return this.socket;
  }

  isSocketConnected() {
    return this.isConnected && this.socket?.connected;
  }

  // Chat methods
  joinRoom(roomId: string) {
    this.socket?.emit('join_room', roomId);
  }

  leaveRoom(roomId: string) {
    this.socket?.emit('leave_room', roomId);
  }

  sendMessage(roomId: string, message: string, recipientId: string) {
    this.socket?.emit('send_message', {
      roomId,
      message,
      recipientId,
      timestamp: new Date().toISOString()
    });
  }

  onMessage(callback: (data: any) => void) {
    this.socket?.on('new_message', callback);
  }

  onUserOnline(callback: (userId: string) => void) {
    this.socket?.on('user_online', callback);
  }

  onUserOffline(callback: (userId: string) => void) {
    this.socket?.on('user_offline', callback);
  }

  onTyping(callback: (data: { userId: string; roomId: string; isTyping: boolean }) => void) {
    this.socket?.on('typing', callback);
  }

  emitTyping(roomId: string, isTyping: boolean) {
    this.socket?.emit('typing', { roomId, isTyping });
  }
}

export const socketManager = new SocketManager();
export default socketManager;
