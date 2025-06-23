// Enhanced Real-time Dashboard Component with mock data
import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Wifi, 
  WifiOff, 
  AlertTriangle, 
  TrendingUp, 
  Users, 
  Activity,
  RefreshCw,
  X
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
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  
  // WebSocket connection disabled - using fallback data only
  useEffect(() => {
    // Generate mock data for demonstration
    const generateMockData = () => {
      const mockEmployees = [
        'Alice Johnson', 'Bob Smith', 'Carol Davis', 'David Wilson', 
        'Eva Martinez', 'Frank Brown', 'Grace Lee', 'Henry Taylor'
      ];
      
      const moods = ['happy', 'focused', 'tired', 'energetic', 'calm', 'stressed'];
      const activities = [];
      
      // Generate some recent activities
      for (let i = 0; i < 8; i++) {
        const employee = mockEmployees[Math.floor(Math.random() * mockEmployees.length)];
        const mood = moods[Math.floor(Math.random() * moods.length)];
        const burnoutScore = Math.floor(Math.random() * 100);
        const timestamp = new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString();
        
        activities.push({
          employee_name: employee,
          mood: mood,
          burnout_score: burnoutScore,
          timestamp: timestamp
        });
      }
      
      return {
        employees: mockEmployees.map(name => ({
          name,
          score: Math.floor(Math.random() * 100),
          mood: moods[Math.floor(Math.random() * moods.length)]
        })),
        statistics: {
          total_employees: mockEmployees.length,
          avg_burnout: 72,
          at_risk_count: 2
        },
        recent_moods: activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
        trends: []
      };
    };

    // Set initial mock data and simulate connection
    const mockData = generateMockData();
    setDashboardData(mockData);
    setLoading(false);
    setIsConnected(true); // Simulate connection for UI

    // Generate sample notifications
    const sampleNotifications = [
      {
        id: 1,
        type: 'burnout_alert',
        priority: 'high' as const,
        title: 'High Burnout Alert',
        message: 'Alice Johnson shows signs of burnout (Score: 35). Consider immediate intervention.',
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        read: false
      },
      {
        id: 2,
        type: 'mood_decline',
        priority: 'medium' as const,
        title: 'Mood Decline Notice',
        message: 'Bob Smith has reported feeling stressed for 3 consecutive days.',
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        read: false
      },
      {
        id: 3,
        type: 'achievement',
        priority: 'low' as const,
        title: 'Wellness Achievement',
        message: 'Carol Davis has maintained excellent wellness scores this week!',
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        read: true
      }
    ];
    
    setNotifications(sampleNotifications);
    setUnreadCount(sampleNotifications.filter(n => !n.read).length);

    // Generate periodic updates for demo (simulate real-time data)
    const interval = setInterval(() => {
      const newMockData = generateMockData();
      setDashboardData(newMockData);
      setLastUpdate(new Date());
    }, 10000); // Update every 10 seconds

    return () => {
      clearInterval(interval);
    };
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
  const forceRefresh = () => {
    // Simulate refresh with new mock data
    setLoading(true);
    setTimeout(() => {
      // Generate new mock data
      const mockEmployees = [
        'Alice Johnson', 'Bob Smith', 'Carol Davis', 'David Wilson', 
        'Eva Martinez', 'Frank Brown', 'Grace Lee', 'Henry Taylor'
      ];
      
      const moods = ['happy', 'focused', 'tired', 'energetic', 'calm', 'stressed'];
      const activities = [];
      
      // Generate some recent activities
      for (let i = 0; i < 8; i++) {
        const employee = mockEmployees[Math.floor(Math.random() * mockEmployees.length)];
        const mood = moods[Math.floor(Math.random() * moods.length)];
        const burnoutScore = Math.floor(Math.random() * 100);
        const timestamp = new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString();
        
        activities.push({
          employee_name: employee,
          mood: mood,
          burnout_score: burnoutScore,
          timestamp: timestamp
        });
      }
      
      const newData = {
        employees: mockEmployees.map(name => ({
          name,
          score: Math.floor(Math.random() * 100),
          mood: moods[Math.floor(Math.random() * moods.length)]
        })),
        statistics: {
          total_employees: mockEmployees.length,
          avg_burnout: Math.floor(Math.random() * 30) + 60, // Random 60-90
          at_risk_count: Math.floor(Math.random() * 4) + 1 // Random 1-4
        },
        recent_moods: activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
        trends: []
      };
      
      setDashboardData(newData);
      setLoading(false);
      setLastUpdate(new Date());
    }, 1000); // Simulate loading delay
  };

  // Request notification permission on component mount
  useEffect(() => {
    requestNotificationPermission();
  }, []);
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Connection Status and Notifications */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-30">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2 sm:space-x-4 min-w-0 flex-1">
              <h1 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
                Real-time Wellness Dashboard
              </h1>
              
              {/* Connection Status */}
              <div className="hidden sm:flex items-center space-x-2">
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

            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Last Update Time */}
              <div className="hidden md:block text-sm text-gray-500">
                Last updated: {lastUpdate.toLocaleTimeString()}
              </div>

              {/* Refresh Button */}
              <button
                onClick={forceRefresh}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Refresh Data"
              >
                <RefreshCw size={18} className={`${loading ? 'animate-spin' : ''}`} />
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
                  <div className="space-y-4 max-h-96 overflow-y-auto">                    {dashboardData.recent_moods.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">
                        Loading recent activity...
                      </p>
                    ) : (
                      dashboardData.recent_moods.map((mood, index) => (
                        <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                              <span className="text-white text-sm font-medium">
                                {mood.employee_name.charAt(0)}
                              </span>
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {mood.employee_name}
                              </p>
                              <span className="text-lg">
                                {mood.mood === 'happy' ? '😊' : 
                                 mood.mood === 'focused' ? '🤔' : 
                                 mood.mood === 'tired' ? '😴' : 
                                 mood.mood === 'energetic' ? '⚡' : 
                                 mood.mood === 'calm' ? '😌' : 
                                 mood.mood === 'stressed' ? '😰' : '😐'}
                              </span>
                              <span className="text-sm text-gray-600 capitalize">
                                {mood.mood}
                              </span>
                            </div>
                            <div className="flex items-center space-x-4 mt-1">
                              <p className="text-xs text-gray-500">
                                Burnout Score: 
                                <span className={`ml-1 px-2 py-1 rounded-full text-xs font-medium ${
                                  mood.burnout_score >= 80 ? 'bg-green-100 text-green-800' :
                                  mood.burnout_score >= 60 ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {mood.burnout_score}
                                </span>
                              </p>
                              <p className="text-xs text-gray-400">
                                {formatTimeAgo(mood.timestamp)}
                              </p>
                            </div>
                          </div>
                          <div className="flex-shrink-0">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>              {/* Quick Actions & Alerts */}
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm border p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Quick Actions
                  </h3>
                  <div className="space-y-3">
                    <button 
                      onClick={() => alert('Wellness survey feature coming soon!')}
                      className="w-full text-left p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Send Team Wellness Survey</span>
                        <span className="text-xs text-gray-500">→</span>
                      </div>
                    </button>
                    <button 
                      onClick={() => alert('Meeting scheduler feature coming soon!')}
                      className="w-full text-left p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Schedule Wellness Meeting</span>
                        <span className="text-xs text-gray-500">→</span>
                      </div>
                    </button>
                    <button 
                      onClick={() => window.location.reload()}
                      className="w-full text-left p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Generate Wellness Report</span>
                        <span className="text-xs text-gray-500">→</span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Alert Summary */}
                <div className="bg-white rounded-xl shadow-sm border p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Alert Summary
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                        <span className="text-sm font-medium text-red-800">Critical Alerts</span>
                      </div>
                      <span className="text-sm font-bold text-red-800">
                        {dashboardData.statistics.at_risk_count}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Bell className="h-5 w-5 text-yellow-600" />
                        <span className="text-sm font-medium text-yellow-800">Pending Reviews</span>
                      </div>
                      <span className="text-sm font-bold text-yellow-800">
                        {Math.floor(dashboardData.statistics.total_employees * 0.3)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <TrendingUp className="h-5 w-5 text-green-600" />
                        <span className="text-sm font-medium text-green-800">Positive Trends</span>
                      </div>
                      <span className="text-sm font-bold text-green-800">
                        {Math.floor(dashboardData.statistics.total_employees * 0.6)}
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
