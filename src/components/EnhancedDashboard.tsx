// Enhanced Real-time Dashboard Component with WebSocket integration
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Bell, 
  Wifi, 
  WifiOff, 
  AlertTriangle, 
  TrendingUp, 
  Users, 
  Activity,
  RefreshCw,
  X,
  CheckCircle
} from 'lucide-react';

interface Employee {
  name: string;
  score: number;
  mood?: string;
  suggestion?: string;
  isCheckingMood?: boolean;
  last_updated?: string;
}

interface DashboardData {
  employees: Employee[];
  statistics: {
    total_employees: number;
    avg_burnout: number;
    at_risk_count: number;
  };
  recent_moods: Array<{
    employee_name: string;
    mood: string;
    burnout_score: number;
    timestamp: string;
  }>;
  trends: Array<{
    date: string;
    avg_score: number;
    check_ins: number;
  }>;
}

interface NotificationItem {
  id: number;
  type: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  data?: any;
}

export const EnhancedDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    employees: [],
    statistics: { total_employees: 0, avg_burnout: 0, at_risk_count: 0 },
    recent_moods: [],
    trends: []
  });
  
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  
  // WebSocket connection simulation (replace with actual WebSocket)
  useEffect(() => {
    const connectWebSocket = () => {
      setIsConnected(true);
      setLoading(false);
      
      // Simulate real-time updates
      const interval = setInterval(() => {
        // Simulate data updates
        updateDashboardData();
        
        // Occasionally add notifications
        if (Math.random() > 0.8) {
          addRandomNotification();
        }
      }, 5000);

      return () => clearInterval(interval);
    };

    const cleanup = connectWebSocket();
    return cleanup;
  }, []);

  const updateDashboardData = useCallback(async () => {
    try {
      // In real implementation, this would come from WebSocket
      const response = await fetch('http://127.0.0.1:5000/api/trends');
      if (response.ok) {
        const trendsData = await response.json();
        
        // Update dashboard with real data
        setDashboardData(prev => ({
          ...prev,
          trends: trendsData.daily_aggregates || [],
          statistics: {
            total_employees: prev.employees.length,
            avg_burnout: prev.employees.length > 0 
              ? Math.round(prev.employees.reduce((sum, emp) => sum + emp.score, 0) / prev.employees.length)
              : 0,
            at_risk_count: prev.employees.filter(emp => emp.score < 60).length
          }
        }));
        
        setLastUpdate(new Date());
      }
    } catch (error) {
      console.error('Failed to update dashboard data:', error);
    }
  }, []);

  const addRandomNotification = useCallback(() => {
    const notifications_samples = [
      {
        type: 'mood_alert',
        priority: 'high' as const,
        title: '🔥 Mood Alert',
        message: 'Employee John Doe shows signs of stress. Consider a wellness check-in.',
      },
      {
        type: 'burnout_warning',
        priority: 'critical' as const,
        title: '⚠️ Burnout Warning',
        message: 'Sarah Wilson has a critically low burnout score (32). Immediate attention needed.',
      },
      {
        type: 'wellness_achievement',
        priority: 'medium' as const,
        title: '🎉 Wellness Achievement',
        message: 'Team Alpha has improved their average wellness score by 15% this week!',
      }
    ];

    const sample = notifications_samples[Math.floor(Math.random() * notifications_samples.length)];
    const newNotification: NotificationItem = {
      id: Date.now(),
      ...sample,
      timestamp: new Date().toISOString(),
      read: false
    };

    setNotifications(prev => [newNotification, ...prev.slice(0, 19)]);
    setUnreadCount(prev => prev + 1);

    // Show browser notification if permission granted
    if (Notification.permission === 'granted') {
      new Notification(newNotification.title, {
        body: newNotification.message,
        icon: '/favicon.ico'
      });
    }
  }, []);

  const markNotificationAsRead = (id: number) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      await Notification.requestPermission();
    }
  };

  // Request notification permission on component mount
  useEffect(() => {
    requestNotificationPermission();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Connection Status and Notifications */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-gray-900">
                Real-time Wellness Dashboard
              </h1>
              
              {/* Connection Status */}
              <div className="flex items-center space-x-2">
                {isConnected ? (
                  <div className="flex items-center text-green-600">
                    <Wifi size={16} />
                    <span className="text-sm ml-1">Connected</span>
                  </div>
                ) : (
                  <div className="flex items-center text-red-600">
                    <WifiOff size={16} />
                    <span className="text-sm ml-1">Disconnected</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Last Update Time */}
              <div className="text-sm text-gray-500">
                Last updated: {lastUpdate.toLocaleTimeString()}
              </div>

              {/* Refresh Button */}
              <button
                onClick={updateDashboardData}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Refresh Data"
              >
                <RefreshCw size={18} />
              </button>

              {/* Notifications Bell */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative"
                >
                  <Bell size={18} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border z-50">
                    <div className="p-4 border-b">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-gray-900">Notifications</h3>
                        <div className="flex items-center space-x-2">
                          {unreadCount > 0 && (
                            <button
                              onClick={markAllAsRead}
                              className="text-xs text-blue-600 hover:text-blue-800"
                            >
                              Mark all read
                            </button>
                          )}
                          <button
                            onClick={() => setShowNotifications(false)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">
                          No notifications yet
                        </div>
                      ) : (
                        notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={`p-4 border-b last:border-b-0 cursor-pointer hover:bg-gray-50 ${
                              !notification.read ? 'bg-blue-50' : ''
                            }`}
                            onClick={() => markNotificationAsRead(notification.id)}
                          >
                            <div className="flex items-start space-x-3">
                              <div className={`w-2 h-2 rounded-full mt-2 ${
                                notification.priority === 'critical' ? 'bg-red-500' :
                                notification.priority === 'high' ? 'bg-orange-500' :
                                notification.priority === 'medium' ? 'bg-yellow-500' :
                                'bg-blue-500'
                              }`} />
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <p className="text-sm font-medium text-gray-900 truncate">
                                    {notification.title}
                                  </p>
                                  <span className="text-xs text-gray-500">
                                    {formatTimeAgo(notification.timestamp)}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600 mt-1">
                                  {notification.message}
                                </p>
                                {!notification.read && (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 mt-2">
                                    New
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {/* Real-time Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Employees</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {dashboardData.statistics.total_employees}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <div className="flex items-center">
                  <TrendingUp className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Avg Burnout Score</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {dashboardData.statistics.avg_burnout}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <div className="flex items-center">
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">At Risk</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {dashboardData.statistics.at_risk_count}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <div className="flex items-center">
                  <Activity className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Recent Check-ins</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {dashboardData.recent_moods.length}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity Feed */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl shadow-sm border p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Real-time Activity Feed
                  </h2>
                  
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {dashboardData.recent_moods.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">
                        No recent activity
                      </p>
                    ) : (
                      dashboardData.recent_moods.map((mood, index) => (
                        <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">
                              {mood.employee_name} checked in with mood: {mood.mood}
                            </p>
                            <p className="text-xs text-gray-500">
                              Burnout Score: {mood.burnout_score} • {formatTimeAgo(mood.timestamp)}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Actions & Alerts */}
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm border p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Quick Actions
                  </h3>
                  
                  <div className="space-y-3">
                    <button className="w-full text-left p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Send Team Wellness Survey</span>
                        <span className="text-xs text-gray-500">→</span>
                      </div>
                    </button>
                    
                    <button className="w-full text-left p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Schedule Wellness Meeting</span>
                        <span className="text-xs text-gray-500">→</span>
                      </div>
                    </button>
                    
                    <button className="w-full text-left p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Generate Wellness Report</span>
                        <span className="text-xs text-gray-500">→</span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* System Health */}
                <div className="bg-white rounded-xl shadow-sm border p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    System Health
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">WebSocket Connection</span>
                      <span className="flex items-center text-green-600">
                        <CheckCircle size={16} className="mr-1" />
                        Active
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Database</span>
                      <span className="flex items-center text-green-600">
                        <CheckCircle size={16} className="mr-1" />
                        Connected
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">AI Analytics</span>
                      <span className="flex items-center text-green-600">
                        <CheckCircle size={16} className="mr-1" />
                        Running
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
