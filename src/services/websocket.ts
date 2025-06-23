// Real-time WebSocket service for live updates
// Temporarily disabled due to backend compatibility issues

export class WebSocketService {
  constructor() {
    // WebSocket functionality disabled
    console.log('WebSocket service initialized (disabled mode)');
  }

  isConnected(): boolean {
    return false; // Always false when disabled
  }

  subscribeToUpdates(employeeName: string): void {
    console.log(`WebSocket: Would subscribe to updates for ${employeeName} (disabled)`);
  }

  on(event: string, callback: Function): void {
    console.log(`WebSocket: Would listen for ${event} (disabled)`);
  }

  off(event: string, callback?: Function): void {
    console.log(`WebSocket: Would stop listening for ${event} (disabled)`);
  }

  emit(event: string, data: any): void {
    console.log(`WebSocket: Would emit ${event} (disabled)`);
  }

  disconnect(): void {
    console.log('WebSocket: Would disconnect (disabled)');
  }
}

export const webSocketService = new WebSocketService();
