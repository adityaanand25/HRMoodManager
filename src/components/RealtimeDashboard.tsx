import React, { useState, useEffect, useCallback } from 'react';
import { AlertCircle, TrendingUp, Users, Activity, Bell, Shield, Award, Zap } from 'lucide-react';
import { enhancedApi } from '../services/enhancedApi';
import { webSocketService } from '../services/websocket';

interface RealtimeDashboardProps {
  onEmployeeSelect?: (employeeName: string) => void;
}

interface DashboardMetrics {
  active_employees: number;
  mood_distribution: { [key: string]: number };
  burnout_alerts: number;
  team_wellness_score: number;
  trending_concerns: string[];
  recent_activities: Array<{
    type: string;
    employee: string;
    time: string;
  }>;
}

interface TeamAnalytics {
  team_metrics: {
    average_wellness: number;
    at_risk_count: number;
    engagement_score: number;
    total_employees: number;
  };
  mood_distribution: { [key: string]: number };
  trends: string[];
  alerts: Array<{
    type: string;
    employee: string;
    message: string;
    severity: string;
  }>;
  recommendations: string[];
}

export const RealtimeDashboard: React.FC<RealtimeDashboardProps> = ({ onEmployeeSelect }) => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [teamAnalytics, setTeamAnalytics] = useState<TeamAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isConnected, setIsConnected] = useState(false);

  // Real-time data fetching
  const fetchRealtimeData = useCallback(async () => {
    try {
      setError(null);
      const [metricsData, analyticsData] = await Promise.all([
        enhancedApi.getRealtimeDashboard(),
        enhancedApi.getTeamAnalytics()
      ]);

      setMetrics(metricsData);
      setTeamAnalytics(analyticsData);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching realtime data:', err);
      setError('Failed to fetch real-time data');
    } finally {
      setLoading(false);
    }
  }, []);

  // Set up WebSocket connection for real-time updates
  useEffect(() => {
    // Set up WebSocket listeners
    const handleConnectionStatus = (data: any) => {
      setIsConnected(data.connected);
    };

    const handleMoodUpdate = (data: any) => {
      console.log('Real-time mood update:', data);
      // Refresh data when mood updates are received
      fetchRealtimeData();
    };

    const handleNotification = (data: any) => {
      console.log('Real-time notification:', data);
      // Refresh data when notifications are received
      fetchRealtimeData();
    };

    // Subscribe to WebSocket events
    webSocketService.on('connection_status', handleConnectionStatus);
    webSocketService.on('mood_update', handleMoodUpdate);
    webSocketService.on('live_mood_update', handleMoodUpdate);
    webSocketService.on('notification', handleNotification);

    // Initial connection status
    setIsConnected(webSocketService.isConnected());

    // Cleanup on unmount
    return () => {
      webSocketService.off('connection_status', handleConnectionStatus);
      webSocketService.off('mood_update', handleMoodUpdate);
      webSocketService.off('live_mood_update', handleMoodUpdate);
      webSocketService.off('notification', handleNotification);
    };
  }, [fetchRealtimeData]);

  // Auto-refresh every 30 seconds as fallback + initial load
  useEffect(() => {
    fetchRealtimeData();
    const interval = setInterval(fetchRealtimeData, 30000);
    return () => clearInterval(interval);
  }, [fetchRealtimeData]);

  const getMoodEmoji = (mood: string): string => {
    const emojiMap: { [key: string]: string } = {
      happy: '😊',
      excited: '🤩',
      calm: '😌',
      neutral: '😐',
      tired: '😴',
      stressed: '😰',
      sad: '😢',
      angry: '😡'
    };
    return emojiMap[mood] || '😐';
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'mood_checkin': return <Activity size={16} className="text-blue-600" />;
      case 'wellness_alert': return <AlertCircle size={16} className="text-red-600" />;
      case 'achievement': return <Award size={16} className="text-green-600" />;
      default: return <Bell size={16} className="text-gray-600" />;
    }
  };  const handleEmployeeClick = (employeeName: string) => {
    if (onEmployeeSelect) {
      onEmployeeSelect(employeeName);
    }
    
    // Subscribe to updates for this employee via WebSocket
    if (isConnected) {
      webSocketService.subscribeToUpdates(employeeName);
    }
  };

  const getWellnessColor = (score: number): string => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading && !metrics) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
          <span className="ml-3 text-gray-600">Loading real-time data...</span>
        </div>
      </div>
    );
  }

  if (error && !metrics) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-red-200 p-8">
        <div className="text-center">
          <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-red-900 mb-2">Connection Error</h3>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={fetchRealtimeData}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">      {/* Header with Live Status */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
              <span className="text-sm font-medium text-gray-900">
                {isConnected ? 'Live Dashboard' : 'Dashboard (Polling)'}
              </span>
            </div>
            <div className="text-xs text-gray-500">
              Last updated: {lastUpdated.toLocaleTimeString()}
              {isConnected && ' • Real-time connected'}
            </div>
          </div>
          <button
            onClick={fetchRealtimeData}
            disabled={loading}
            className="flex items-center space-x-2 px-3 py-2 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors"
          >
            <Zap size={16} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Active Employees */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users size={24} className="text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Employees</p>
              <p className="text-2xl font-bold text-gray-900">{metrics?.active_employees || 0}</p>
            </div>
          </div>
        </div>

        {/* Team Wellness Score */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <TrendingUp size={24} className="text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Team Wellness</p>
              <p className={`text-2xl font-bold ${getWellnessColor(metrics?.team_wellness_score || 0)}`}>
                {metrics?.team_wellness_score || 0}%
              </p>
            </div>
          </div>
        </div>

        {/* Burnout Alerts */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-red-100 rounded-lg">
              <AlertCircle size={24} className="text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Alerts</p>
              <p className="text-2xl font-bold text-red-600">{metrics?.burnout_alerts || 0}</p>
            </div>
          </div>
        </div>

        {/* At Risk Count */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 rounded-lg">
              <Shield size={24} className="text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">At Risk</p>
              <p className="text-2xl font-bold text-orange-600">
                {teamAnalytics?.team_metrics.at_risk_count || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Mood Distribution and Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mood Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Mood Distribution</h3>
          <div className="space-y-4">
            {Object.entries(metrics?.mood_distribution || {}).map(([mood, count]) => (
              <div key={mood} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getMoodEmoji(mood)}</span>
                  <span className="text-sm font-medium text-gray-700 capitalize">{mood}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(count / (metrics?.active_employees || 1)) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-bold text-gray-900">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activities</h3>
          <div className="space-y-4">
            {metrics?.recent_activities.slice(0, 5).map((activity, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                {getActivityIcon(activity.type)}
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{activity.employee}</p>
                  <p className="text-xs text-gray-500 capitalize">
                    {activity.type.replace('_', ' ')} • {activity.time}
                  </p>
                </div>
              </div>
            )) || (
              <div className="text-center py-8 text-gray-500">
                <Activity size={48} className="mx-auto mb-2 opacity-50" />
                <p>No recent activities</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Team Insights */}
      {teamAnalytics && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Insights</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Trends */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Current Trends</h4>
              <div className="space-y-2">
                {teamAnalytics.trends.map((trend, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <TrendingUp size={16} className="text-blue-600 mt-0.5" />
                    <span className="text-sm text-gray-600">{trend}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">AI Recommendations</h4>
              <div className="space-y-2">
                {teamAnalytics.recommendations.map((rec, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <Zap size={16} className="text-green-600 mt-0.5" />
                    <span className="text-sm text-gray-600">{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Active Alerts */}
          {teamAnalytics.alerts.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="text-sm font-medium text-red-700 mb-3 flex items-center">
                <AlertCircle size={16} className="mr-2" />
                Active Alerts
              </h4>
              <div className="space-y-2">
                {teamAnalytics.alerts.map((alert, index) => (
                  <div key={index} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-red-900">{alert.employee}</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        alert.severity === 'high' ? 'bg-red-200 text-red-800' : 
                        alert.severity === 'medium' ? 'bg-yellow-200 text-yellow-800' : 
                        'bg-blue-200 text-blue-800'
                      }`}>
                        {alert.severity} priority
                      </span>
                    </div>
                    <p className="text-sm text-red-700 mt-1">{alert.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
