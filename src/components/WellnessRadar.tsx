import React, { useState, useEffect } from 'react';
import { Radar, Activity, Brain, Heart, Zap, Shield } from 'lucide-react';

interface WellnessMetric {
  category: string;
  score: number;
  trend: 'up' | 'down' | 'stable';
  color: string;
}

interface EmployeeWellness {
  name: string;
  department: string;
  overallScore: number;
  metrics: WellnessMetric[];
  lastUpdated: string;
}

interface WellnessRadarProps {
  selectedEmployee?: string;
  className?: string;
}

export const WellnessRadar: React.FC<WellnessRadarProps> = ({ 
  selectedEmployee = 'John Doe', 
  className = '' 
}) => {
  const [wellnessData, setWellnessData] = useState<EmployeeWellness | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWellnessData();
    const interval = setInterval(fetchWellnessData, 20000); // Update every 20 seconds
    return () => clearInterval(interval);
  }, [selectedEmployee]);

  const fetchWellnessData = async () => {
    try {
      // Simulate real-time wellness data
      const mockData: EmployeeWellness = {
        name: selectedEmployee,
        department: 'Engineering',
        overallScore: 78,
        metrics: [
          { category: 'Mental Health', score: 85, trend: 'up', color: '#8B5CF6' },
          { category: 'Stress Level', score: 45, trend: 'down', color: '#EF4444' },
          { category: 'Work-Life Balance', score: 72, trend: 'stable', color: '#06B6D4' },
          { category: 'Job Satisfaction', score: 88, trend: 'up', color: '#10B981' },
          { category: 'Social Connection', score: 65, trend: 'stable', color: '#F59E0B' },
          { category: 'Energy Level', score: 79, trend: 'up', color: '#EC4899' }
        ],
        lastUpdated: new Date().toISOString()
      };
      
      setWellnessData(mockData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching wellness data:', error);
      setLoading(false);
    }
  };
  const RadarChart = ({ data }: { data: WellnessMetric[] }) => {
    const size = 280; // Increased from 200 for better visibility
    const center = size / 2;
    const radius = Math.min(size * 0.35, 100); // Responsive radius
    const angleStep = (2 * Math.PI) / data.length;

    // Calculate points for the radar chart
    const getPoint = (index: number, value: number) => {
      const angle = index * angleStep - Math.PI / 2;
      const r = (value / 100) * radius;
      return {
        x: center + r * Math.cos(angle),
        y: center + r * Math.sin(angle)
      };
    };

    // Create grid circles
    const gridCircles = [20, 40, 60, 80, 100].map(percent => {
      const r = (percent / 100) * radius;
      return (
        <circle
          key={percent}
          cx={center}
          cy={center}
          r={r}
          fill="none"
          stroke="#E5E7EB"
          strokeWidth="1"
        />
      );
    });

    // Create grid lines
    const gridLines = data.map((_, index) => {
      const point = getPoint(index, 100);
      return (
        <line
          key={index}
          x1={center}
          y1={center}
          x2={point.x}
          y2={point.y}
          stroke="#E5E7EB"
          strokeWidth="1"
        />
      );
    });

    // Create data polygon
    const polygonPoints = data.map((metric, index) => {
      const point = getPoint(index, metric.score);
      return `${point.x},${point.y}`;
    }).join(' ');

    // Create data points
    const dataPoints = data.map((metric, index) => {
      const point = getPoint(index, metric.score);
      return (
        <circle
          key={index}
          cx={point.x}
          cy={point.y}
          r="4"
          fill={metric.color}
          stroke="white"
          strokeWidth="2"
        />
      );
    });

    // Create labels
    const labels = data.map((metric, index) => {
      const point = getPoint(index, 110); // Slightly outside the chart
      return (
        <text
          key={index}
          x={point.x}
          y={point.y}
          textAnchor="middle"
          alignmentBaseline="middle"
          className="text-xs font-medium fill-gray-700"
        >
          {metric.category}
        </text>
      );
    });    return (
      <div className="w-full max-w-sm mx-auto">
        <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-auto max-h-80">
          {gridCircles}
          {gridLines}
          <polygon
            points={polygonPoints}
            fill="rgba(139, 92, 246, 0.1)"
            stroke="#8B5CF6"
            strokeWidth="2"
          />
          {dataPoints}
          {labels}
        </svg>
      </div>
    );
  };

  const getTrendIcon = (trend: string) => {
    if (trend === 'up') return <Zap className="text-green-500" size={14} />;
    if (trend === 'down') return <Activity className="text-red-500" size={14} />;
    return <Shield className="text-gray-500" size={14} />;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading || !wellnessData) {
    return (
      <div className={`bg-white rounded-2xl shadow-lg border border-gray-100 p-6 ${className}`}>
        <div className="flex items-center space-x-2 mb-4">
          <Radar className="text-purple-600" size={24} />
          <h3 className="text-lg font-semibold text-gray-900">Wellness Radar</h3>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          <span className="ml-3 text-gray-600">Loading wellness data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-2xl shadow-lg border border-gray-100 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Radar className="text-purple-600" size={24} />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Wellness Radar</h3>
            <p className="text-sm text-gray-600">{wellnessData.name} - {wellnessData.department}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-purple-600">{wellnessData.overallScore}</div>
          <div className="text-xs text-gray-500">Overall Score</div>
        </div>
      </div>

      {/* Radar Chart */}
      <div className="mb-6">
        <RadarChart data={wellnessData.metrics} />
      </div>

      {/* Metrics Details */}
      <div className="space-y-3">
        {wellnessData.metrics.map((metric, index) => (
          <div key={index} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50">
            <div className="flex items-center space-x-3">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: metric.color }}
              ></div>
              <span className="font-medium text-gray-900">{metric.category}</span>
            </div>
            <div className="flex items-center space-x-2">
              {getTrendIcon(metric.trend)}
              <span className={`font-bold ${getScoreColor(metric.score)}`}>
                {metric.score}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Insights */}
      <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl">
        <div className="flex items-center space-x-2 mb-2">
          <Brain className="text-purple-600" size={20} />
          <h4 className="font-medium text-gray-900">AI Insights</h4>
        </div>
        <div className="space-y-1 text-sm text-gray-700">
          <p>• Strong mental health and job satisfaction indicators</p>
          <p>• Stress levels need attention - consider workload review</p>
          <p>• Social connections show room for improvement</p>
        </div>
      </div>

      {/* Action Recommendations */}
      <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl">
        <div className="flex items-center space-x-2 mb-2">
          <Heart className="text-green-600" size={20} />
          <h4 className="font-medium text-gray-900">Recommended Actions</h4>
        </div>
        <div className="space-y-1 text-sm text-gray-700">
          <p>• Schedule stress management workshop</p>
          <p>• Encourage team-building activities</p>
          <p>• Provide flexible work arrangements</p>
        </div>
      </div>

      <div className="mt-4 text-xs text-gray-500 text-center">
        Last updated: {new Date(wellnessData.lastUpdated).toLocaleTimeString()}
      </div>
    </div>
  );
};
