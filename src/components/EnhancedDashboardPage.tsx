import React, { useState, useEffect } from 'react';
import { Brain } from 'lucide-react';
import { Navigation } from './Navigation';
import { SummaryCards } from './SummaryCards';
import { MoodChart } from './MoodChart';
import { QuietQuitDetector } from './QuietQuitDetector';
import { EmployeeDashboardTable } from './EmployeeDashboardTableNew';
import { GamificationPanel } from './GamificationPanel';
import { SmartNotificationsPanel } from './SmartNotificationsPanel';
import { VoiceMoodAnalyzer } from './VoiceMoodAnalyzer';
import { PredictiveInsights } from './PredictiveInsights';
import { SentimentHeatmap } from './SentimentHeatmap';
import { WellnessRadar } from './WellnessRadar';
import { BiometricIntegration } from './BiometricIntegration';
import { TeamDynamicsAnalyzer } from './TeamDynamicsAnalyzer';
import { WellnessChatbot } from './WellnessChatbot';
import { RealtimeAnalyticsFeed } from './RealtimeAnalyticsFeed';
import { User } from '../types';
import { dashboardStats, moodTrendData } from '../data/mockData';
import { enhancedApi } from '../services/enhancedApi';
import { EnhancedDashboard } from './EnhancedDashboard';

interface EnhancedDashboardPageProps {
  user: User;
  onLogout: () => void;
  onOpenCheckIn: () => void;
}

interface EmployeeData {
  name: string;
  score: number;
  mood?: string;
  suggestion?: string;
}

export const EnhancedDashboardPage: React.FC<EnhancedDashboardPageProps> = ({ 
  user, 
  onLogout, 
  onOpenCheckIn 
}) => {
  const [employeeData, setEmployeeData] = useState<EmployeeData[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'overview' | 'realtime' | 'analytics' | 'wellness'>('overview');
  const [notifications, setNotifications] = useState<any[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<any>(null);

  // Calculate dynamic stats from real employee data
  const getDynamicStats = () => {
    if (employeeData.length === 0) return dashboardStats;

    const totalEmployees = employeeData.length;
    const atRiskEmployees = employeeData.filter(emp => emp.score < 60).length;
    const averageBurnoutScore = Math.round(
      employeeData.reduce((sum, emp) => sum + emp.score, 0) / totalEmployees
    );
    const burnoutAlerts = employeeData.filter(emp => emp.score < 40).length;

    return {
      totalEmployees,
      atRiskEmployees,
      averageMoodScore: averageBurnoutScore,
      burnoutAlerts
    };
  };

  const handleEmployeeDataUpdate = (employees: EmployeeData[]) => {
    setEmployeeData(employees);
    
    // Auto-select first employee if none selected
    if (!selectedEmployee && employees.length > 0) {
      setSelectedEmployee(employees[0].name);
    }
  };

  const handleEmployeeSelect = (employeeName: string) => {
    setSelectedEmployee(employeeName);
  };

  const handleMoodDetected = async (mood: string, confidence?: number) => {
    if (selectedEmployee) {
      console.log(`Mood detected for ${selectedEmployee}: ${mood} (${confidence ? Math.round(confidence * 100) : 'N/A'}%)`);
      
      // Update employee data
      setEmployeeData(prev => 
        prev.map(emp => 
          emp.name === selectedEmployee 
            ? { ...emp, mood: mood }
            : emp
        )
      );

      // Get smart notifications
      try {
        const employee = employeeData.find(emp => emp.name === selectedEmployee);
        if (employee) {
          const notificationData = await enhancedApi.getSmartNotifications(
            selectedEmployee, 
            mood, 
            employee.score
          );
          setNotifications(prev => [...prev, ...notificationData.notifications]);
        }
      } catch (error) {
        console.warn('Could not fetch smart notifications:', error);
      }
    }
  };

  const handleNotificationAction = (notification: any, action: string) => {
    console.log(`Action taken: ${action} for notification:`, notification);
    // In real app, this would trigger appropriate HR workflows
  };

  // Load performance metrics
  useEffect(() => {
    const loadMetrics = async () => {
      try {
        const metrics = await enhancedApi.getPerformanceMetrics();
        setPerformanceMetrics(metrics);
      } catch (error) {
        console.warn('Could not load performance metrics:', error);
      }
    };
    
    loadMetrics();
    const interval = setInterval(loadMetrics, 300000); // Update every 5 minutes
    return () => clearInterval(interval);
  }, []);

  const tabs = [
    { id: 'overview', name: '📊 Overview', description: 'Team wellness overview' },
    { id: 'realtime', name: '⚡ Real-time', description: 'Live dashboard & analytics' },
    { id: 'analytics', name: '🔬 Analytics', description: 'AI insights & predictions' },
    { id: 'wellness', name: '🎯 Wellness', description: 'Employee wellness tools' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation user={user} onLogout={onLogout} onOpenCheckIn={onOpenCheckIn} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                🚀 Enhanced Wellness Dashboard
              </h2>
              <p className="text-gray-600">
                Advanced AI-powered employee wellness monitoring with real-time insights
              </p>
            </div>
            
            {/* Performance Indicator */}
            {performanceMetrics && (
              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                <div className="text-sm text-gray-600">System Performance</div>
                <div className="flex items-center space-x-4 mt-1">
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-gray-900">
                      {Math.round(performanceMetrics.cache_hit_rate * 100)}% cache hit
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {performanceMetrics.average_response_time}ms avg
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex flex-col items-center space-y-1">
                    <span>{tab.name}</span>
                    <span className="text-xs opacity-75">{tab.description}</span>
                  </div>
                </button>
              ))}
            </nav>
          </div>
        </div>        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="w-full space-y-8">
            {/* Team Overview */}
            <div className="w-full bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Team Overview</h3>
              <SummaryCards stats={getDynamicStats()} />
            </div>
            
            {/* Mood Trends */}
            <div className="w-full bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Mood Trends</h3>
              <MoodChart data={moodTrendData} title="Team Mood Trends (7 Days)" />
            </div>
            
            {/* Quiet Quitting Risk */}
            <div className="w-full bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Quiet Quitting Risk</h3>
              <QuietQuitDetector />
            </div>

            {/* Employee Dashboard */}
            <div className="w-full bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Employee Dashboard</h3>
              <EmployeeDashboardTable onDataUpdate={handleEmployeeDataUpdate} />
            </div>
          </div>
        )}

        {activeTab === 'realtime' && (
          <EnhancedDashboard />
        )}        {activeTab === 'analytics' && (
          <div className="space-y-8">
            {/* Analytics Header */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 border border-gray-100">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Brain className="text-purple-600" size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">AI-Powered Analytics</h3>
                  <p className="text-gray-600">Real-time insights and predictive analytics</p>
                </div>
              </div>
            </div>

            {/* Analytics Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              {/* Predictive Insights */}
              <PredictiveInsights className="xl:col-span-1" />
              
              {/* Real-time Activity Feed */}
              <RealtimeAnalyticsFeed className="xl:col-span-1" />

              {/* Sentiment Heatmap */}
              <SentimentHeatmap className="xl:col-span-2" />
            </div>

            {/* Team Analytics Overview */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Team Analytics Overview</h3>
              <TeamDynamicsAnalyzer />
            </div>

            {/* Wellness Radar */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Employee Wellness Analysis</h3>
              <WellnessRadar selectedEmployee="Team Average" />
            </div>
          </div>
        )}

        {activeTab === 'wellness' && (
          <div className="space-y-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-4">Wellness Tools</h3>
              <p className="text-gray-600">Gamification, resources, and other wellness tools will be available here.</p>
              {/* Placeholder for future wellness components */}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-8">
                <VoiceMoodAnalyzer 
                  employeeName={selectedEmployee}
                  onMoodDetected={handleMoodDetected} 
                  isEnabled={!!selectedEmployee}
                />
                {selectedEmployee && <GamificationPanel employeeName={selectedEmployee} />}
                <BiometricIntegration />
              </div>
              <div className="space-y-8">
                <SmartNotificationsPanel 
                  notifications={notifications}
                  onAction={handleNotificationAction}
                />
              </div>
            </div>
          </div>
        )}
        
        <WellnessChatbot />

        {/* Enhanced Floating Action Menu */}
        <div className="fixed bottom-6 left-6 z-40">
          <div className="flex flex-col space-y-3">
            <button
              onClick={onOpenCheckIn}
              className="w-14 h-14 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center group"
              title="Quick Mood Check-in"
            >
              <span className="text-2xl">😊</span>
              <div className="absolute left-16 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Quick Check-in
              </div>
            </button>
            
            <button
              className="w-14 h-14 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center group"
              title="Emergency Support"
              onClick={() => window.open('tel:988', '_blank')}
            >
              <span className="text-2xl">🆘</span>
              <div className="absolute left-16 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Crisis Support
              </div>
            </button>

            <button              className="w-14 h-14 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center group"
              title="Wellness Resources"
            >
              <span className="text-2xl">🧘</span>
              <div className="absolute left-16 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Wellness Hub
              </div>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};
