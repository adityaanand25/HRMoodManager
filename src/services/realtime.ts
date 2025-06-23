// Real-time WebSocket client for live dashboard updates
interface WebSocketMessage {
  type: string;
  [key: string]: any;
}

interface MoodUpdate {
  employeeName: string;
  mood: string;
  burnoutScore: number;
  timestamp: string;
}

interface Alert {
  type: string;
  severity: string;
  employee?: string;
  message: string;
  action_required?: boolean;
  timestamp: string;
}

interface Notification {
  id: number;
  type: string;
  priority: string;
  title: string;
  message: string;
  data?: any;
  timestamp: string;
  read: boolean;
}

class WebSocketService {
  private socket: WebSocket | null = null;
  private isConnected: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 1000;
  private listeners: Map<string, Function[]> = new Map();
  private messageQueue: WebSocketMessage[] = [];

  constructor() {
    // Properties initialized above
  }

  connect(userId: string | null = null): void {
    try {
      this.socket = new WebSocket('ws://localhost:8765');
      
      this.socket.onopen = () => {
        console.log('✅ WebSocket connected');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        
        // Authenticate if userId provided
        if (userId) {
          this.send({
            type: 'authenticate',
            user_id: userId
          });
        }
        
        // Process queued messages
        this.processMessageQueue();
        
        // Notify listeners
        this.emit('connected');
      };

      this.socket.onmessage = (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data);
          this.handleMessage(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.socket.onclose = () => {
        console.log('🔌 WebSocket disconnected');
        this.isConnected = false;
        this.emit('disconnected');
        this.attemptReconnect();
      };

      this.socket.onerror = (error: Event) => {
        console.error('WebSocket error:', error);
        this.emit('error', error);
      };

    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
    }
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
      this.isConnected = false;
    }
  }

  send(message: WebSocketMessage): void {
    if (this.isConnected && this.socket) {
      this.socket.send(JSON.stringify(message));
    } else {
      // Queue message for when connection is restored
      this.messageQueue.push(message);
    }
  }

  private processMessageQueue(): void {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      if (message) {
        this.send(message);
      }
    }
  }

  private handleMessage(data: any): void {
    const { type } = data;
    
    switch (type) {
      case 'initial_data':
        this.emit('initialData', data.data);
        break;
        
      case 'dashboard_update':
        this.emit('dashboardUpdate', data.data);
        break;
        
      case 'mood_updated':
        this.emit('moodUpdate', {
          employeeName: data.employee_name,
          mood: data.mood,
          burnoutScore: data.burnout_score,
          timestamp: data.timestamp
        });
        break;
        
      case 'alert':
        this.emit('alert', data.alert);
        break;
        
      case 'health_check':
        this.emit('healthCheck', data.data);
        break;
        
      case 'authenticated':
        this.emit('authenticated', data.user_id);
        break;
        
      case 'error':
        this.emit('error', data.message);
        break;
        
      default:
        console.log('Unknown message type:', type, data);
    }
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
      
      console.log(`🔄 Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);
      
      setTimeout(() => {
        this.connect();
      }, delay);
    } else {
      console.error('❌ Max reconnection attempts reached');
      this.emit('maxReconnectAttemptsReached');
    }
  }

  // Event listener management
  on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)?.push(callback);
  }

  off(event: string, callback: Function): void {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    }
  }

  private emit(event: string, data: any = null): void {
    if (this.listeners.has(event)) {
      this.listeners.get(event)?.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in ${event} listener:`, error);
        }
      });
    }
  }

  // Convenience methods for common operations
  requestDashboardData(): void {
    this.send({ type: 'request_data' });
  }

  subscribeToNotifications(employeeName: string | null = null): void {
    this.send({
      type: 'subscribe_notifications',
      employee_name: employeeName
    });
  }

  updateMood(employeeName: string, mood: string, burnoutScore: number): void {
    this.send({
      type: 'mood_update',
      employee_name: employeeName,
      mood: mood,
      burnout_score: burnoutScore
    });
  }
}

// Notification Service for handling alerts and notifications
class NotificationService {
  private notifications: Notification[] = [];
  private unreadCount: number = 0;
  private listeners: Map<string, Function[]> = new Map();
  private maxNotifications: number = 100;

  constructor() {
    // Properties initialized above
  }

  addNotification(notification) {
    const enrichedNotification = {
      id: Date.now() + Math.random(),
      timestamp: new Date().toISOString(),
      read: false,
      ...notification
    };

    this.notifications.unshift(enrichedNotification);
    
    // Keep only the latest notifications
    if (this.notifications.length > this.maxNotifications) {
      this.notifications = this.notifications.slice(0, this.maxNotifications);
    }

    if (!enrichedNotification.read) {
      this.unreadCount++;
    }

    this.emit('notificationAdded', enrichedNotification);
    this.showBrowserNotification(enrichedNotification);
    
    return enrichedNotification;
  }

  markAsRead(notificationId) {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification && !notification.read) {
      notification.read = true;
      this.unreadCount = Math.max(0, this.unreadCount - 1);
      this.emit('notificationRead', notification);
    }
  }

  markAllAsRead() {
    this.notifications.forEach(n => n.read = true);
    this.unreadCount = 0;
    this.emit('allNotificationsRead');
  }

  getNotifications() {
    return this.notifications;
  }

  getUnreadCount() {
    return this.unreadCount;
  }

  clearAll() {
    this.notifications = [];
    this.unreadCount = 0;
    this.emit('notificationsCleared');
  }

  showBrowserNotification(notification) {
    if ('Notification' in window && Notification.permission === 'granted') {
      const options = {
        body: notification.message,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: notification.type,
        requireInteraction: notification.priority === 'critical'
      };

      const browserNotification = new Notification(notification.title, options);
      
      browserNotification.onclick = () => {
        window.focus();
        this.emit('notificationClicked', notification);
        browserNotification.close();
      };

      // Auto-close after 5 seconds for non-critical notifications
      if (notification.priority !== 'critical') {
        setTimeout(() => browserNotification.close(), 5000);
      }
    }
  }

  async requestNotificationPermission() {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }

  // Event management
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  emit(event, data = null) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in ${event} listener:`, error);
        }
      });
    }
  }
}

// Real-time Data Service
class RealTimeDataService {
  constructor() {
    this.wsService = new WebSocketService();
    this.notificationService = new NotificationService();
    this.data = {
      employees: [],
      statistics: {},
      trends: [],
      alerts: []
    };
    this.listeners = new Map();
    this.setupWebSocketListeners();
  }

  async initialize(userId = null) {
    // Request notification permission
    await this.notificationService.requestNotificationPermission();
    
    // Connect WebSocket
    this.wsService.connect(userId);
    
    // Subscribe to notifications
    this.wsService.subscribeToNotifications();
  }

  setupWebSocketListeners() {
    this.wsService.on('connected', () => {
      console.log('Real-time service connected');
      this.emit('connectionStatusChanged', { connected: true });
    });

    this.wsService.on('disconnected', () => {
      console.log('Real-time service disconnected');
      this.emit('connectionStatusChanged', { connected: false });
    });

    this.wsService.on('initialData', (data) => {
      this.updateData(data);
      this.emit('dataInitialized', this.data);
    });

    this.wsService.on('dashboardUpdate', (data) => {
      this.updateData(data);
      this.emit('dataUpdated', this.data);
    });

    this.wsService.on('moodUpdate', (update) => {
      this.handleMoodUpdate(update);
      this.emit('moodUpdated', update);
    });

    this.wsService.on('alert', (alert) => {
      this.handleAlert(alert);
    });

    this.wsService.on('healthCheck', (data) => {
      this.updateData(data);
      this.emit('healthCheckReceived', data);
    });
  }

  updateData(newData) {
    this.data = {
      ...this.data,
      ...newData
    };
  }

  handleMoodUpdate(update) {
    // Update employee data
    if (this.data.employees) {
      const employeeIndex = this.data.employees.findIndex(
        emp => emp.name === update.employeeName
      );
      
      if (employeeIndex > -1) {
        this.data.employees[employeeIndex] = {
          ...this.data.employees[employeeIndex],
          mood: update.mood,
          burnout_score: update.burnoutScore,
          last_updated: update.timestamp
        };
      }
    }

    // Add to recent moods if exists
    if (this.data.recent_moods) {
      this.data.recent_moods.unshift({
        employee_name: update.employeeName,
        mood: update.mood,
        burnout_score: update.burnoutScore,
        timestamp: update.timestamp
      });
      
      // Keep only recent 50 entries
      this.data.recent_moods = this.data.recent_moods.slice(0, 50);
    }
  }

  handleAlert(alert) {
    // Add to alerts
    if (!this.data.alerts) {
      this.data.alerts = [];
    }
    
    this.data.alerts.unshift(alert);
    this.data.alerts = this.data.alerts.slice(0, 20); // Keep latest 20 alerts

    // Create notification
    const notification = {
      type: alert.type,
      priority: alert.severity,
      title: `Alert: ${alert.type.replace('_', ' ').toUpperCase()}`,
      message: alert.message,
      data: alert,
      timestamp: alert.timestamp
    };

    this.notificationService.addNotification(notification);
    this.emit('alertReceived', alert);
  }

  // Public methods
  broadcastMoodUpdate(employeeName, mood, burnoutScore) {
    this.wsService.updateMood(employeeName, mood, burnoutScore);
  }

  requestDataRefresh() {
    this.wsService.requestDashboardData();
  }

  getConnectionStatus() {
    return this.wsService.isConnected;
  }

  getData() {
    return this.data;
  }

  getNotifications() {
    return this.notificationService.getNotifications();
  }

  getUnreadNotificationCount() {
    return this.notificationService.getUnreadCount();
  }

  markNotificationAsRead(notificationId) {
    this.notificationService.markAsRead(notificationId);
  }

  // Event management
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  emit(event, data = null) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in ${event} listener:`, error);
        }
      });
    }
  }

  disconnect() {
    this.wsService.disconnect();
  }
}

// Create and export singleton instances
export const webSocketService = new WebSocketService();
export const notificationService = new NotificationService();
export const realTimeDataService = new RealTimeDataService();

// Default export for easy importing
export default {
  webSocketService,
  notificationService,
  realTimeDataService
};
