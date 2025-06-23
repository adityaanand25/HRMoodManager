// Real-time WebSocket service for live updates
import io from 'socket.io-client';

export class WebSocketService {
  private socket: any;
  private connected: boolean = false;
  private listeners: Map<string, Function[]> = new Map();

  constructor() {
    this.connect();
  }

  private connect() {
    this.socket = io('http://127.0.0.1:5000', {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      console.log('🔗 Connected to real-time updates');
      this.connected = true;
      this.emit('connection_status', { connected: true });
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Disconnected from real-time updates');
      this.connected = false;
      this.emit('connection_status', { connected: false });
    });

    this.socket.on('connect_error', (error: any) => {
      console.error('🚫 Connection error:', error);
      this.emit('connection_error', { error });
    });

    // Listen for real-time updates
    this.socket.on('mood_update', (data: any) => {
      console.log('📊 Mood update received:', data);
      this.emit('mood_update', data);
    });

    this.socket.on('burnout_scores_update', (data: any) => {
      console.log('🔥 Burnout scores updated:', data);
      this.emit('burnout_update', data);
    });

    this.socket.on('smart_notification', (data: any) => {
      console.log('🔔 Smart notification:', data);
      this.emit('notification', data);
    });

    this.socket.on('live_mood_update', (data: any) => {
      console.log('⚡ Live mood update:', data);
      this.emit('live_mood_update', data);
    });
  }

  // Subscribe to real-time updates for specific employee
  subscribeToUpdates(employeeName: string) {
    if (this.connected) {
      this.socket.emit('subscribe_updates', { employee_name: employeeName });
    }
  }

  // Send real-time mood update
  sendMoodUpdate(data: any) {
    if (this.connected) {
      this.socket.emit('mood_update_realtime', data);
    }
  }

  // Event listener management
  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  off(event: string, callback: Function) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      const index = eventListeners.indexOf(callback);
      if (index > -1) {
        eventListeners.splice(index, 1);
      }
    }
  }

  private emit(event: string, data: any) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(listener => {
        try {
          listener(data);
        } catch (error) {
          console.error(`Error in ${event} listener:`, error);
        }
      });
    }
  }

  // Get connection status
  isConnected(): boolean {
    return this.connected;
  }

  // Disconnect
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}

// Create singleton instance
export const webSocketService = new WebSocketService();
