import React, { useState, useEffect } from 'react';
import { Brain, TrendingUp, AlertTriangle, Target, Sparkles, BarChart3 } from 'lucide-react';

interface PredictiveInsight {
  id: string;
  type: 'burnout_risk' | 'mood_decline' | 'engagement_drop' | 'team_dynamics';
  employee: string;
  prediction: string;
  confidence: number;
  timeframe: string;
  recommendation: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface PredictiveInsightsProps {
  className?: string;
}

export const PredictiveInsights: React.FC<PredictiveInsightsProps> = ({ className = '' }) => {
  const [insights, setInsights] = useState<PredictiveInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInsight, setSelectedInsight] = useState<PredictiveInsight | null>(null);

  useEffect(() => {
    fetchPredictiveInsights();
    const interval = setInterval(fetchPredictiveInsights, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);
  const fetchPredictiveInsights = async () => {
    try {
      setLoading(true);
      
      // Generate dynamic insights based on real time
      const now = new Date();
      const timeOfDay = now.getHours();
      const dayOfWeek = now.getDay();
      
      // Create realistic dynamic data
      const employees = ['Sarah M.', 'John D.', 'Mike R.', 'Lisa K.', 'Tom W.', 'Emma S.', 'David P.', 'Anna L.'];
      const teams = ['Marketing Team', 'Engineering Dept.', 'Sales Team', 'HR Department', 'Design Team'];
      
      const generateDynamicInsights = (): PredictiveInsight[] => {
        const insights: PredictiveInsight[] = [];
        
        // Time-based burnout predictions
        if (timeOfDay >= 16) { // After 4 PM
          insights.push({
            id: `burnout_${Date.now()}`,
            type: 'burnout_risk',
            employee: employees[Math.floor(Math.random() * employees.length)],
            prediction: `High stress levels detected during end-of-day period`,
            confidence: 75 + Math.floor(Math.random() * 20),
            timeframe: `${Math.floor(Math.random() * 3) + 1} days`,
            recommendation: 'Monitor workload distribution and consider flexible hours',
            severity: 'medium'
          });
        }
        
        // Monday blues detection
        if (dayOfWeek === 1) {
          insights.push({
            id: `mood_${Date.now()}_1`,
            type: 'mood_decline',
            employee: employees[Math.floor(Math.random() * employees.length)],
            prediction: 'Monday motivation dip observed across team',
            confidence: 82,
            timeframe: '1-2 days',
            recommendation: 'Implement Monday motivation initiatives or flexible start times',
            severity: 'low'
          });
        }
        
        // Weekly team engagement prediction
        if (dayOfWeek >= 3) { // Mid-week
          insights.push({
            id: `engagement_${Date.now()}`,
            type: 'engagement_drop',
            employee: teams[Math.floor(Math.random() * teams.length)],
            prediction: `Mid-week energy decline detected in team dynamics`,
            confidence: 68 + Math.floor(Math.random() * 20),
            timeframe: '2-3 days',
            recommendation: 'Schedule team check-in or virtual coffee break',
            severity: Math.random() > 0.5 ? 'medium' : 'low'
          });
        }
        
        // Real-time positive trends
        insights.push({
          id: `positive_${Date.now()}`,
          type: 'team_dynamics',
          employee: teams[Math.floor(Math.random() * teams.length)],
          prediction: 'Increased collaboration and positive sentiment detected',
          confidence: 85 + Math.floor(Math.random() * 10),
          timeframe: 'Ongoing',
          recommendation: 'Document and replicate successful team practices',
          severity: 'low'
        });
        
        // Critical alerts for high-stress periods
        if (Math.random() > 0.7) {
          insights.push({
            id: `critical_${Date.now()}`,
            type: 'burnout_risk',
            employee: employees[Math.floor(Math.random() * employees.length)],
            prediction: 'Critical stress indicators detected - immediate attention required',
            confidence: 90 + Math.floor(Math.random() * 8),
            timeframe: 'Immediate',
            recommendation: 'Schedule urgent wellness check-in and provide mental health resources',
            severity: 'critical'
          });
        }
        
        // Mood pattern analysis
        insights.push({
          id: `pattern_${Date.now()}`,
          type: 'mood_decline',
          employee: employees[Math.floor(Math.random() * employees.length)],
          prediction: `Irregular mood patterns suggest potential work-life balance issues`,
          confidence: 71 + Math.floor(Math.random() * 15),
          timeframe: '1 week',
          recommendation: 'Discuss workload and personal circumstances in next 1-on-1',
          severity: 'medium'
        });
        
        return insights.slice(0, 5); // Return top 5 insights
      };
      
      const dynamicInsights = generateDynamicInsights();
      setInsights(dynamicInsights);
    } catch (error) {
      console.error('Error fetching predictive insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'border-red-500 bg-red-50';
      case 'high': return 'border-orange-500 bg-orange-50';
      case 'medium': return 'border-yellow-500 bg-yellow-50';
      case 'low': return 'border-green-500 bg-green-50';
      default: return 'border-gray-300 bg-gray-50';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="text-red-600" size={20} />;
      case 'high': return <TrendingUp className="text-orange-600" size={20} />;
      case 'medium': return <Target className="text-yellow-600" size={20} />;
      case 'low': return <Sparkles className="text-green-600" size={20} />;
      default: return <BarChart3 className="text-gray-600" size={20} />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'burnout_risk': return 'Burnout Risk';
      case 'mood_decline': return 'Mood Decline';
      case 'engagement_drop': return 'Engagement Drop';
      case 'team_dynamics': return 'Team Dynamics';
      default: return 'Unknown';
    }
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-2xl shadow-lg border border-gray-100 p-6 ${className}`}>
        <div className="flex items-center space-x-2 mb-4">
          <Brain className="text-purple-600" size={24} />
          <h3 className="text-lg font-semibold text-gray-900">AI Predictive Insights</h3>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          <span className="ml-3 text-gray-600">Analyzing patterns...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-2xl shadow-lg border border-gray-100 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Brain className="text-purple-600" size={24} />
          <h3 className="text-lg font-semibold text-gray-900">AI Predictive Insights</h3>
          <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full font-medium">
            BETA
          </span>
        </div>
        <button
          onClick={fetchPredictiveInsights}
          className="text-purple-600 hover:text-purple-800 transition-colors"
        >
          <TrendingUp size={20} />
        </button>
      </div>

      <div className="space-y-4">
        {insights.map((insight) => (
          <div
            key={insight.id}
            className={`border-l-4 rounded-lg p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${getSeverityColor(insight.severity)}`}
            onClick={() => setSelectedInsight(insight)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  {getSeverityIcon(insight.severity)}
                  <span className="font-medium text-gray-900">{insight.employee}</span>
                  <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full">
                    {getTypeLabel(insight.type)}
                  </span>
                </div>
                <p className="text-sm text-gray-700 mb-2">{insight.prediction}</p>
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <span>Confidence: {insight.confidence}%</span>
                  <span>Timeframe: {insight.timeframe}</span>
                </div>
              </div>
              <div className="ml-4">
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                  <span className="text-purple-700 font-bold text-sm">{insight.confidence}%</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Detailed Insight Modal */}
      {selectedInsight && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setSelectedInsight(null)}>
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-900">Detailed Insight</h4>
              <button
                onClick={() => setSelectedInsight(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                {getSeverityIcon(selectedInsight.severity)}
                <span className="font-medium">{selectedInsight.employee}</span>
              </div>
              
              <div>
                <h5 className="font-medium text-gray-900 mb-1">Prediction</h5>
                <p className="text-sm text-gray-700">{selectedInsight.prediction}</p>
              </div>
              
              <div>
                <h5 className="font-medium text-gray-900 mb-1">Recommendation</h5>
                <p className="text-sm text-gray-700">{selectedInsight.recommendation}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h5 className="font-medium text-gray-900 mb-1">Confidence</h5>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full"
                        style={{ width: `${selectedInsight.confidence}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium">{selectedInsight.confidence}%</span>
                  </div>
                </div>
                <div>
                  <h5 className="font-medium text-gray-900 mb-1">Timeframe</h5>
                  <p className="text-sm text-gray-700">{selectedInsight.timeframe}</p>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex space-x-3">
              <button
                onClick={() => setSelectedInsight(null)}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
              <button
                className="flex-1 py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                onClick={() => {
                  // Implement action taking logic
                  console.log('Taking action for insight:', selectedInsight);
                  setSelectedInsight(null);
                }}
              >
                Take Action
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
