import { io, Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;
  private serverUrl: string;
  private connectionAttempts: number = 0;
  private maxConnectionAttempts: number = 3;

  constructor() {
    this.serverUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
  }

  public connect(): Socket {
    if (!this.socket && this.connectionAttempts < this.maxConnectionAttempts) {
      this.connectionAttempts++;
      console.log(`Socket connection attempt ${this.connectionAttempts}`);
      
      this.socket = io(this.serverUrl, {
        transports: ['websocket', 'polling'],
        reconnection: false,
        forceNew: true
      });
      
      this.socket.on('connect', () => {
        console.log('Socket connected successfully');
        this.connectionAttempts = 0;
      });
      
      this.socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
      });
      
      this.socket.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
        this.socket = null;
      });
    }
    
    return this.socket as Socket;
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

  public isConnected(): boolean {
    return this.socket?.connected || false;
  }

  public resetConnection(): void {
    this.disconnect();
    this.connectionAttempts = 0;
  }
}

export const socketService = new SocketService();
