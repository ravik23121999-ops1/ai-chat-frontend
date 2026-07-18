import { io, Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;
  private serverUrl: string;
  private connectionAttempts = 0;
  private maxConnectionAttempts = 3;

  constructor() {
    this.serverUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
  }

  public connect(): Socket {
    if (!this.socket && this.connectionAttempts < this.maxConnectionAttempts) {
      this.connectionAttempts++;

      this.socket = io(this.serverUrl, {
        transports: ['websocket', 'polling'],
        reconnection: false,
        forceNew: true
      });

      this.socket.on('connect', () => {
        this.connectionAttempts = 0;
      });

      this.socket.on('connect_error', (error) => {
        if (process.env.NODE_ENV === 'development') {
          console.error('Socket connection error:', error);
        }
      });

      this.socket.on('disconnect', () => {
        this.socket = null;
      });
    }

    if (!this.socket) {
      throw new Error('Could not connect to the chat server. Please refresh and try again.');
    }

    return this.socket;
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connectionAttempts = 0;
    }
  }

  public getSocket(): Socket | null {
    return this.socket;
  }
}

export const socketService = new SocketService();
