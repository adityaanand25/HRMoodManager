import React, { useState, useEffect } from 'react';
import { Thermometer, Users, AlertCircle, CheckCircle, Clock } from 'lucide-react';

interface SentimentData {
  employee: string;
  department: string;
  sentiment: number; // -100 to 100
  mood: string;
  timestamp: string;
  position: { x: number; y: number };
}

interface SentimentHeatmapProps {
  className?: string;
}

export const SentimentHeatmap: React.FC<SentimentHeatmapProps> = ({ className = '' }) => {
  const [sentimentData, setSentimentData] = useState<SentimentData[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<SentimentData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSentimentData();
    const interval = setInterval(fetchSentimentData, 15000); // Update every 15 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchSentimentData = async () => {
    try {
      // Simulate real-time sentiment data
      const departments = ['Engineering', 'Marketing', 'Sales', 'HR', 'Design'];
      const mockData: SentimentData[] = Array.from({ length: 25 }, (_, i) => ({
        employee: `Employee ${i + 1}`,
        department: departments[i % departments.length],
        sentiment: Math.floor(Math.random() * 200 - 100), // -100 to 100
        mood: ['Happy', 'Neutral', 'Stressed', 'Excited', 'Tired'][Math.floor(Math.random() * 5)],
        timestamp: new Date(Date.now() - Math.random() * 3600000).toISOString(),
        position: {
          x: (i % 5) * 20 + 10, // Grid layout
          y: Math.floor(i / 5) * 20 + 10
        }
      }));
      
      setSentimentData(mockData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching sentiment data:', error);
      setLoading(false);
    }
  };

  const getSentimentColor = (sentiment: number) => {
    if (sentiment >= 50) return '#10B981'; // Green - Very Positive
    if (sentiment >= 20) return '#34D399'; // Light Green - Positive
    if (sentiment >= -20) return '#FBBF24'; // Yellow - Neutral
    if (sentiment >= -50) return '#F87171'; // Light Red - Negative
    return '#EF4444'; // Red - Very Negative
  };

  const getSentimentOpacity = (sentiment: number) => {
    return Math.abs(sentiment) / 100 * 0.8 + 0.2; // 0.2 to 1.0
  };

  const getOverallSentiment = () => {
    if (sentimentData.length === 0) return 0;
    return sentimentData.reduce((sum, data) => sum + data.sentiment, 0) / sentimentData.length;
  };

  const getSentimentStats = () => {
    const positive = sentimentData.filter(d => d.sentiment > 20).length;
    const neutral = sentimentData.filter(d => d.sentiment >= -20 && d.sentiment <= 20).length;
    const negative = sentimentData.filter(d => d.sentiment < -20).length;
    
    return { positive, neutral, negative, total: sentimentData.length };
  };

  const stats = getSentimentStats();
  const overallSentiment = getOverallSentiment();

  if (loading) {
    return (
      <div className={`bg-white rounded-2xl shadow-lg border border-gray-100 p-6 ${className}`}>
        <div className="flex items-center space-x-2 mb-4">
          <Thermometer className="text-blue-600" size={24} />
          <h3 className="text-lg font-semibold text-gray-900">Real-Time Sentiment Heatmap</h3>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading sentiment data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-2xl shadow-lg border border-gray-100 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Thermometer className="text-blue-600" size={24} />
          <h3 className="text-lg font-semibold text-gray-900">Real-Time Sentiment Heatmap</h3>
          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
            LIVE
          </span>
        </div>
        <div className="flex items-center space-x-2 text-sm">
          <Clock size={16} className="text-gray-400" />
          <span className="text-gray-500">Updates every 15s</span>
        </div>
      </div>

      {/* Overall Sentiment Score */}
      <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-gray-900 mb-1">Overall Team Sentiment</h4>
            <div className="flex items-center space-x-2">
              <div className="text-2xl font-bold" style={{ color: getSentimentColor(overallSentiment) }}>
                {overallSentiment.toFixed(1)}
              </div>
              <div className="text-sm text-gray-600">
                {overallSentiment > 20 ? 'Positive' : overallSentiment > -20 ? 'Neutral' : 'Needs Attention'}
              </div>
            </div>
          </div>
          <div className="flex space-x-4 text-sm">
            <div className="text-center">
              <div className="flex items-center space-x-1">
                <CheckCircle size={16} className="text-green-500" />
                <span className="font-medium">{stats.positive}</span>
              </div>
              <div className="text-xs text-gray-500">Positive</div>
            </div>
            <div className="text-center">
              <div className="flex items-center space-x-1">
                <Users size={16} className="text-yellow-500" />
                <span className="font-medium">{stats.neutral}</span>
              </div>
              <div className="text-xs text-gray-500">Neutral</div>
            </div>
            <div className="text-center">
              <div className="flex items-center space-x-1">
                <AlertCircle size={16} className="text-red-500" />
                <span className="font-medium">{stats.negative}</span>
              </div>
              <div className="text-xs text-gray-500">At Risk</div>
            </div>
          </div>
        </div>
      </div>

      {/* Heatmap Visualization */}
      <div className="relative bg-gray-50 rounded-xl p-4 mb-4" style={{ height: '300px' }}>
        <svg width="100%" height="100%" viewBox="0 0 100 100" className="absolute inset-0">
          {sentimentData.map((employee, index) => (
            <circle
              key={index}
              cx={employee.position.x}
              cy={employee.position.y}
              r="3"
              fill={getSentimentColor(employee.sentiment)}
              opacity={getSentimentOpacity(employee.sentiment)}
              className="cursor-pointer hover:r-4 transition-all duration-200"
              onClick={() => setSelectedEmployee(employee)}
            />
          ))}
        </svg>
        
        {/* Department Labels */}
        <div className="absolute top-2 left-2 text-xs text-gray-500">
          <div>Engineering</div>
        </div>
        <div className="absolute top-2 right-2 text-xs text-gray-500">
          <div>Marketing</div>
        </div>
        <div className="absolute bottom-2 left-2 text-xs text-gray-500">
          <div>Sales</div>
        </div>
        <div className="absolute bottom-2 right-2 text-xs text-gray-500">
          <div>HR & Design</div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center space-x-6 text-xs">
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <span>Very Negative</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 rounded-full bg-red-300"></div>
          <span>Negative</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
          <span>Neutral</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 rounded-full bg-green-300"></div>
          <span>Positive</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span>Very Positive</span>
        </div>
      </div>

      {/* Employee Details Modal */}
      {selectedEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setSelectedEmployee(null)}>
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-900">Employee Details</h4>
              <button
                onClick={() => setSelectedEmployee(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-3">
              <div>
                <span className="text-sm text-gray-500">Employee:</span>
                <p className="font-medium">{selectedEmployee.employee}</p>
              </div>
              
              <div>
                <span className="text-sm text-gray-500">Department:</span>
                <p className="font-medium">{selectedEmployee.department}</p>
              </div>
              
              <div>
                <span className="text-sm text-gray-500">Current Mood:</span>
                <p className="font-medium">{selectedEmployee.mood}</p>
              </div>
              
              <div>
                <span className="text-sm text-gray-500">Sentiment Score:</span>
                <div className="flex items-center space-x-2">
                  <div 
                    className="font-bold text-lg"
                    style={{ color: getSentimentColor(selectedEmployee.sentiment) }}
                  >
                    {selectedEmployee.sentiment}
                  </div>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full"
                      style={{ 
                        backgroundColor: getSentimentColor(selectedEmployee.sentiment),
                        width: `${(selectedEmployee.sentiment + 100) / 2}%`
                      }}
                    ></div>
                  </div>
                </div>
              </div>
              
              <div>
                <span className="text-sm text-gray-500">Last Update:</span>
                <p className="text-sm">{new Date(selectedEmployee.timestamp).toLocaleTimeString()}</p>
              </div>
            </div>
            
            <button
              onClick={() => setSelectedEmployee(null)}
              className="mt-4 w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
