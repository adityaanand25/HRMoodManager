import React, { useState, useEffect } from 'react';
import { Bell, AlertTriangle, CheckCircle, Clock, X } from 'lucide-react';
import { getSmartNotifications } from '../services/enhancedApi';

interface SmartNotificationsPanelProps {
  employeeName?: string;
  onNotificationAction?: (notification: any, action: string) => void;
}

interface Notification {
  type: string;
  priority: number;
  title: string;
  message: string;
  actions: string[];
  timestamp: string;
  requires_acknowledgment: boolean;
}

export const SmartNotificationsPanel: React.FC<SmartNotificationsPanelProps> = ({ 
  employeeName,
  onNotificationAction 
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [acknowledgedNotifications, setAcknowledgedNotifications] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (employeeName) {
      fetchNotifications();
    }
  }, [employeeName]);

  const fetchNotifications = async () => {
    if (!employeeName) return;

    try {
      setLoading(true);
      setError(null);
      // Mock data for demonstration - in real app, this would come from mood/burnout analysis
      const mockMood = 'stressed';
      const mockBurnoutScore = 45;
      
      const data = await getSmartNotifications(employeeName, mockMood, mockBurnoutScore);
      setNotifications(data?.notifications || []);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Failed to load notifications');
      // Fallback notifications for demo
      setNotifications([
        {
          type: 'wellness_reminder',
          priority: 4,
          title: '🌟 Wellness Check-In Reminder',
          message: 'Time for your daily wellness check-in!',
          actions: ['Check In Now', 'Remind Later'],
          timestamp: new Date().toISOString(),
          requires_acknowledgment: false
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityIcon = (priority: number) => {
    switch (priority) {
      case 1: return <AlertTriangle className="text-red-600" size={20} />;
      case 2: return <AlertTriangle className="text-orange-600" size={20} />;
      case 3: return <Bell className="text-yellow-600" size={20} />;
      default: return <Bell className="text-blue-600" size={20} />;
    }
  };

  const getPriorityLabel = (priority: number): string => {
    switch (priority) {
      case 1: return 'Critical';
      case 2: return 'High';
      case 3: return 'Medium';
      default: return 'Low';
    }
  };

  const handleNotificationAction = (notification: Notification, action: string) => {
    if (action === 'Acknowledge' || action === 'Mark as Read') {
      const notificationId = `${notification.type}_${notification.timestamp}`;
      setAcknowledgedNotifications(prev => new Set([...prev, notificationId]));
    }
    
    onNotificationAction?.(notification, action);
  };

  const dismissNotification = (index: number) => {
    setNotifications(prev => prev.filter((_, i) => i !== index));
  };

  const getTimeAgo = (timestamp: string): string => {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffMs = now.getTime() - notificationTime.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return `${Math.floor(diffMins / 1440)}d ago`;
  };

  const unacknowledgedNotifications = (notifications || []).filter(notification => {
    if (!notification) return false;
    const notificationId = `${notification.type}_${notification.timestamp}`;
    return notification.requires_acknowledgment && !acknowledgedNotifications.has(notificationId);
  });

  if (loading && (!notifications || notifications.length === 0)) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bell className="text-blue-600" size={24} />
            <h3 className="text-lg font-semibold text-gray-900">Smart Notifications</h3>
            {unacknowledgedNotifications.length > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                {unacknowledgedNotifications.length}
              </span>
            )}
          </div>
          <button
            onClick={fetchNotifications}
            disabled={loading}
            className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-h-96 overflow-y-auto">
        {(!notifications || notifications.length === 0) ? (
          <div className="p-8 text-center">
            <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">All caught up!</h4>
            <p className="text-gray-600">No new notifications at this time.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {(notifications || []).map((notification, index) => {
              if (!notification) return null;
              const notificationId = `${notification.type}_${notification.timestamp}`;
              const isAcknowledged = acknowledgedNotifications.has(notificationId);
              
              return (
                <div
                  key={index}
                  className={`p-4 transition-all duration-200 ${
                    isAcknowledged ? 'opacity-60' : ''
                  } ${notification.priority <= 2 ? 'bg-red-25' : ''}`}
                >
                  <div className="flex items-start space-x-3">
                    {/* Priority Icon */}
                    <div className="flex-shrink-0 mt-1">
                      {getPriorityIcon(notification.priority)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="text-sm font-semibold text-gray-900">
                            {notification.title}
                          </h4>
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                            notification.priority === 1 ? 'bg-red-100 text-red-800' :
                            notification.priority === 2 ? 'bg-orange-100 text-orange-800' :
                            notification.priority === 3 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {getPriorityLabel(notification.priority)}
                          </span>
                          {isAcknowledged && (
                            <CheckCircle size={16} className="text-green-600" />
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500 flex items-center">
                            <Clock size={12} className="mr-1" />
                            {getTimeAgo(notification.timestamp)}
                          </span>
                          <button
                            onClick={() => dismissNotification(index)}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-700 mb-3">{notification.message}</p>

                      {/* Actions */}
                      {notification.actions?.length > 0 && !isAcknowledged && (
                        <div className="flex flex-wrap gap-2">
                          {notification.actions.map((action, actionIndex) => (
                            <button
                              key={actionIndex}
                              onClick={() => handleNotificationAction(notification, action)}
                              className={`text-xs px-3 py-1 rounded-lg font-medium transition-colors ${
                                action.includes('immediate') || action.includes('Schedule') || action.includes('Contact')
                                  ? 'bg-red-600 text-white hover:bg-red-700'
                                  : action.includes('Review') || action.includes('Monitor')
                                  ? 'bg-orange-600 text-white hover:bg-orange-700'
                                  : action.includes('Send') || action.includes('Offer')
                                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                              }`}
                            >
                              {action}
                            </button>
                          ))}
                          {notification.requires_acknowledgment && (
                            <button
                              onClick={() => handleNotificationAction(notification, 'Acknowledge')}
                              className="text-xs px-3 py-1 rounded-lg font-medium bg-green-600 text-white hover:bg-green-700 transition-colors"
                            >
                              ✓ Acknowledge
                            </button>
                          )}
                        </div>
                      )}

                      {isAcknowledged && (
                        <div className="flex items-center space-x-2 mt-2">
                          <CheckCircle size={16} className="text-green-600" />
                          <span className="text-xs text-green-700 font-medium">
                            Acknowledged
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      {notifications && notifications.length > 0 && (
        <div className="px-6 py-3 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">
              {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
            </span>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">
                {unacknowledgedNotifications.length} require action
              </span>
              {unacknowledgedNotifications.length > 0 && (
                <button
                  onClick={() => {
                    unacknowledgedNotifications.forEach(notification => {
                      handleNotificationAction(notification, 'Acknowledge');
                    });
                  }}
                  className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
                >
                  Acknowledge All
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 bg-yellow-50 border-t border-yellow-200">
          <div className="flex items-center space-x-2 text-yellow-800">
            <AlertTriangle size={16} />
            <span className="text-sm">{error}</span>
          </div>
        </div>
      )}
    </div>
  );
};
