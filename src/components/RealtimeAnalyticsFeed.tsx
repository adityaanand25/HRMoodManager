import React, { useState, useEffect, useCallback } from 'react';
import { Activity, Clock, AlertTriangle, TrendingUp, Zap, Users, Brain } from 'lucide-react';
import { enhancedApi } from '../services/enhancedApi';

interface ActivityItem {
  id: string;
  type: string;
  employee: string;
  timestamp: string;
  time_ago: string;
  details: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  actionable: boolean;
}

interface AnalyticsSummary {
  total_activities: number;
  alerts_count: number;
  positive_activities: number;
  trend_analysis: {
    stress_trend: string;
    mood_trend: string;
    engagement_trend: string;
  };
  predictions: Array<{
    type: string;
    message: string;
    confidence: number;
    action_required: boolean;
  }>;
  timestamp: string;
}

interface RealtimeAnalyticsFeedProps {
  className?: string;
}

export const RealtimeAnalyticsFeed: React.FC<RealtimeAnalyticsFeedProps> = ({ className = '' }) => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchAnalyticsFeed = useCallback(async () => {
    try {
      const data = await enhancedApi.getRealtimeAnalyticsFeed();
      setActivities(data.activities || []);
      setSummary(data.summary);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching analytics feed:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-refresh every 15 seconds
  useEffect(() => {
    fetchAnalyticsFeed();
    const interval = setInterval(fetchAnalyticsFeed, 15000);
    return () => clearInterval(interval);
  }, [fetchAnalyticsFeed]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'mood_checkin': return <Users size={16} className="text-blue-600" />;
      case 'wellness_alert': return <AlertTriangle size={16} className="text-red-600" />;
      case 'achievement': return <TrendingUp size={16} className="text-green-600" />;
      case 'stress_spike': return <Zap size={16} className="text-orange-600" />;
      case 'team_collaboration': return <Users size={16} className="text-purple-600" />;
      case 'break_taken': return <Clock size={16} className="text-teal-600" />;
      case 'overtime_detected': return <AlertTriangle size={16} className="text-yellow-600" />;
      case 'positive_feedback': return <TrendingUp size={16} className="text-emerald-600" />;
      default: return <Activity size={16} className="text-gray-600" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'border-l-red-500 bg-red-50';
      case 'high': return 'border-l-orange-500 bg-orange-50';
      case 'medium': return 'border-l-yellow-500 bg-yellow-50';
      case 'low': return 'border-l-green-500 bg-green-50';
      default: return 'border-l-gray-300 bg-gray-50';
    }
  };

  const getTrendColor = (trend: string) => {
    if (trend.includes('increas') || trend.includes('improv') || trend.includes('ris')) {
      return 'text-green-600';
    } else if (trend.includes('decreas') || trend.includes('declin') || trend.includes('fall')) {
      return 'text-red-600';
    }
    return 'text-blue-600';
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-2xl shadow-lg border border-gray-100 p-6 ${className}`}>
        <div className="flex items-center space-x-2 mb-4">
          <Activity className="text-blue-600" size={24} />
          <h3 className="text-lg font-semibold text-gray-900">Real-time Activity Feed</h3>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading activities...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-2xl shadow-lg border border-gray-100 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Activity className="text-blue-600" size={24} />
          <h3 className="text-lg font-semibold text-gray-900">Real-time Activity Feed</h3>
          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
            LIVE
          </span>
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-500">Last updated</div>
          <div className="text-sm font-medium text-gray-900">
            {lastUpdated.toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Total Activities</p>
                <p className="text-2xl font-bold text-blue-900">{summary.total_activities}</p>
              </div>
              <Activity className="text-blue-600" size={24} />
            </div>
          </div>

          <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600 font-medium">Active Alerts</p>
                <p className="text-2xl font-bold text-red-900">{summary.alerts_count}</p>
              </div>
              <AlertTriangle className="text-red-600" size={24} />
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Positive Events</p>
                <p className="text-2xl font-bold text-green-900">{summary.positive_activities}</p>
              </div>
              <TrendingUp className="text-green-600" size={24} />
            </div>
          </div>
        </div>
      )}

      {/* Trend Analysis */}
      {summary?.trend_analysis && (
        <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl">
          <div className="flex items-center space-x-2 mb-3">
            <Brain className="text-purple-600" size={20} />
            <h4 className="font-medium text-gray-900">AI Trend Analysis</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <span className="text-gray-600">Stress:</span>
              <span className={`font-medium ${getTrendColor(summary.trend_analysis.stress_trend)}`}>
                {summary.trend_analysis.stress_trend}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-gray-600">Mood:</span>
              <span className={`font-medium ${getTrendColor(summary.trend_analysis.mood_trend)}`}>
                {summary.trend_analysis.mood_trend}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-gray-600">Engagement:</span>
              <span className={`font-medium ${getTrendColor(summary.trend_analysis.engagement_trend)}`}>
                {summary.trend_analysis.engagement_trend}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* AI Predictions */}
      {summary?.predictions && summary.predictions.length > 0 && (
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 mb-3 flex items-center space-x-2">
            <Brain className="text-purple-600" size={18} />
            <span>AI Predictions</span>
          </h4>
          <div className="space-y-2">
            {summary.predictions.map((prediction, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border-l-4 ${
                  prediction.action_required ? 'border-l-orange-500 bg-orange-50' : 'border-l-blue-500 bg-blue-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-700">{prediction.message}</p>
                  <div className="flex items-center space-x-2 text-xs">
                    <span className="text-gray-500">{prediction.confidence}% confidence</span>
                    {prediction.action_required && (
                      <span className="bg-orange-200 text-orange-800 px-2 py-1 rounded-full">
                        Action Needed
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Activities List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        <h4 className="font-medium text-gray-900 mb-3">Recent Activities</h4>
        {activities.length > 0 ? (
          activities.map((activity) => (
            <div
              key={activity.id}
              className={`border-l-4 rounded-lg p-4 transition-all hover:shadow-sm ${getSeverityColor(activity.severity)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className="mt-1">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-gray-900">{activity.employee}</span>
                      <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full">
                        {activity.type.replace('_', ' ')}
                      </span>
                      {activity.actionable && (
                        <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded-full">
                          Actionable
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-700 mb-1">{activity.details}</p>
                    <p className="text-xs text-gray-500">{activity.time_ago}</p>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Activity size={48} className="mx-auto mb-2 opacity-50" />
            <p>No recent activities</p>
          </div>
        )}
      </div>
    </div>
  );
};
