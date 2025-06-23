import React, { useState, useEffect } from 'react';
import { Users, GitBranch, Zap, TrendingUp, Award, AlertTriangle } from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  collaborationScore: number;
  communicationFreq: number;
  influence: number;
  stressLevel: number;
}

interface TeamConnection {
  from: string;
  to: string;
  strength: number;
  type: 'collaboration' | 'mentorship' | 'conflict' | 'support';
}

interface TeamDynamics {
  teamName: string;
  members: TeamMember[];
  connections: TeamConnection[];
  overallHealth: number;
  insights: string[];
  recommendations: string[];
}

interface TeamDynamicsAnalyzerProps {
  teamId?: string;
  className?: string;
}

export const TeamDynamicsAnalyzer: React.FC<TeamDynamicsAnalyzerProps> = ({ 
  teamId = 'engineering',
  className = '' 
}) => {
  const [teamData, setTeamData] = useState<TeamDynamics | null>(null);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [viewMode, setViewMode] = useState<'network' | 'metrics' | 'insights'>('network');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeamDynamics();
    const interval = setInterval(fetchTeamDynamics, 30000);
    return () => clearInterval(interval);
  }, [teamId]);

  const fetchTeamDynamics = async () => {
    try {
      // Simulate complex team dynamics data
      const mockData: TeamDynamics = {
        teamName: 'Engineering Team',
        members: [
          { id: '1', name: 'Alex Chen', role: 'Tech Lead', collaborationScore: 89, communicationFreq: 45, influence: 85, stressLevel: 60 },
          { id: '2', name: 'Sarah Kim', role: 'Senior Dev', collaborationScore: 92, communicationFreq: 38, influence: 72, stressLevel: 45 },
          { id: '3', name: 'Mike Johnson', role: 'Frontend Dev', collaborationScore: 76, communicationFreq: 52, influence: 58, stressLevel: 70 },
          { id: '4', name: 'Lisa Wang', role: 'Backend Dev', collaborationScore: 88, communicationFreq: 41, influence: 79, stressLevel: 35 },
          { id: '5', name: 'David Brown', role: 'DevOps', collaborationScore: 71, communicationFreq: 33, influence: 65, stressLevel: 55 },
          { id: '6', name: 'Emma Wilson', role: 'QA Lead', collaborationScore: 84, communicationFreq: 47, influence: 68, stressLevel: 50 }
        ],
        connections: [
          { from: '1', to: '2', strength: 0.9, type: 'collaboration' },
          { from: '1', to: '4', strength: 0.8, type: 'mentorship' },
          { from: '2', to: '3', strength: 0.7, type: 'support' },
          { from: '3', to: '6', strength: 0.6, type: 'collaboration' },
          { from: '4', to: '5', strength: 0.8, type: 'collaboration' },
          { from: '5', to: '6', strength: 0.7, type: 'support' },
          { from: '1', to: '6', strength: 0.9, type: 'collaboration' },
          { from: '2', to: '4', strength: 0.85, type: 'collaboration' }
        ],
        overallHealth: 78,
        insights: [
          'Strong collaboration between Alex and Sarah drives team productivity',
          'Mike shows signs of communication overload - may need support',
          'Lisa demonstrates excellent work-life balance with low stress',
          'Team has well-distributed influence, preventing single points of failure',
          'Emma serves as effective bridge between development and quality assurance'
        ],
        recommendations: [
          'Consider reducing Mike\'s meeting load to prevent burnout',
          'Leverage Lisa\'s low-stress approach as a team wellness model',
          'Create more cross-functional pairing opportunities',
          'Establish regular team retrospectives for continuous improvement'
        ]
      };
      
      setTeamData(mockData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching team dynamics:', error);
      setLoading(false);
    }
  };

  const getConnectionColor = (type: string) => {
    switch (type) {
      case 'collaboration': return '#10B981';
      case 'mentorship': return '#3B82F6';
      case 'support': return '#8B5CF6';
      case 'conflict': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getInfluenceSize = (influence: number) => {
    return Math.max(20, influence / 5); // Scale influence to node size
  };

  const getStressColor = (stressLevel: number) => {
    if (stressLevel < 40) return 'text-green-600';
    if (stressLevel < 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const NetworkVisualization = () => {
    if (!teamData) return null;

    const positions = [
      { x: 50, y: 20 }, // Center top
      { x: 20, y: 50 }, // Left
      { x: 80, y: 50 }, // Right
      { x: 35, y: 80 }, // Bottom left
      { x: 65, y: 80 }, // Bottom right
      { x: 50, y: 65 }  // Center bottom
    ];

    return (
      <div className="relative bg-gray-50 rounded-xl p-6" style={{ height: '400px' }}>
        <svg width="100%" height="100%" viewBox="0 0 100 100" className="absolute inset-0">
          {/* Connections */}
          {teamData.connections.map((connection, index) => {
            const fromPos = positions[parseInt(connection.from) - 1];
            const toPos = positions[parseInt(connection.to) - 1];
            return (
              <line
                key={index}
                x1={fromPos.x}
                y1={fromPos.y}
                x2={toPos.x}
                y2={toPos.y}
                stroke={getConnectionColor(connection.type)}
                strokeWidth={connection.strength * 3}
                opacity={0.6}
              />
            );
          })}
          
          {/* Nodes */}
          {teamData.members.map((member, index) => {
            const pos = positions[index];
            return (
              <g key={member.id}>
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={getInfluenceSize(member.influence) / 5}
                  fill="#3B82F6"
                  opacity={0.8}
                  className="cursor-pointer hover:opacity-100"
                  onClick={() => setSelectedMember(member)}
                />
                <text
                  x={pos.x}
                  y={pos.y + 8}
                  textAnchor="middle"
                  className="text-xs fill-white font-medium pointer-events-none"
                >
                  {member.name.split(' ')[0]}
                </text>
              </g>
            );
          })}
        </svg>
        
        {/* Legend */}
        <div className="absolute bottom-2 left-2 bg-white rounded-lg p-2 shadow-sm text-xs">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-0.5 bg-green-500"></div>
              <span>Collaboration</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-0.5 bg-blue-500"></div>
              <span>Mentorship</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-0.5 bg-purple-500"></div>
              <span>Support</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-2xl shadow-lg border border-gray-100 p-6 ${className}`}>
        <div className="flex items-center space-x-2 mb-4">
          <GitBranch className="text-indigo-600" size={24} />
          <h3 className="text-lg font-semibold text-gray-900">Team Dynamics Analyzer</h3>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <span className="ml-3 text-gray-600">Analyzing team dynamics...</span>
        </div>
      </div>
    );
  }

  if (!teamData) {
    return (
      <div className={`bg-white rounded-2xl shadow-lg border border-gray-100 p-6 ${className}`}>
        <div className="text-center py-8">
          <Users size={48} className="text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">No Team Data Available</h4>
          <p className="text-gray-600">Team dynamics data will appear here once available</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-2xl shadow-lg border border-gray-100 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <GitBranch className="text-indigo-600" size={24} />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Team Dynamics Analyzer</h3>
            <p className="text-sm text-gray-600">{teamData.teamName}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="text-right mr-4">
            <div className="text-2xl font-bold text-indigo-600">{teamData.overallHealth}</div>
            <div className="text-xs text-gray-500">Health Score</div>
          </div>
          
          <div className="flex bg-gray-100 rounded-lg p-1">
            {['network', 'metrics', 'insights'].map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode as any)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  viewMode === mode
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {viewMode === 'network' && <NetworkVisualization />}

      {viewMode === 'metrics' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teamData.members.map((member) => (
              <div
                key={member.id}
                className="border rounded-xl p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedMember(member)}
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-medium text-gray-900">{member.name}</h4>
                    <p className="text-xs text-gray-600">{member.role}</p>
                  </div>
                  <div className={`text-right text-xs ${getStressColor(member.stressLevel)}`}>
                    <div className="font-bold">{member.stressLevel}%</div>
                    <div>Stress</div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span>Collaboration</span>
                    <span className="font-medium">{member.collaborationScore}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1">
                    <div
                      className="bg-green-500 h-1 rounded-full"
                      style={{ width: `${member.collaborationScore}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex justify-between text-xs">
                    <span>Influence</span>
                    <span className="font-medium">{member.influence}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1">
                    <div
                      className="bg-blue-500 h-1 rounded-full"
                      style={{ width: `${member.influence}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {viewMode === 'insights' && (
        <div className="space-y-6">
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <Zap className="text-yellow-600" size={20} />
              <h4 className="font-medium text-gray-900">Key Insights</h4>
            </div>
            <div className="space-y-2">
              {teamData.insights.map((insight, index) => (
                <div key={index} className="flex items-start space-x-2 p-3 bg-yellow-50 rounded-lg">
                  <TrendingUp size={16} className="text-yellow-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-700">{insight}</p>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <Award className="text-blue-600" size={20} />
              <h4 className="font-medium text-gray-900">Recommendations</h4>
            </div>
            <div className="space-y-2">
              {teamData.recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start space-x-2 p-3 bg-blue-50 rounded-lg">
                  <AlertTriangle size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-700">{recommendation}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Member Detail Modal */}
      {selectedMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setSelectedMember(null)}>
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-900">Team Member Profile</h4>
              <button
                onClick={() => setSelectedMember(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="text-center">
                <h5 className="text-xl font-bold text-gray-900">{selectedMember.name}</h5>
                <p className="text-gray-600">{selectedMember.role}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-lg font-bold text-green-600">{selectedMember.collaborationScore}</div>
                  <div className="text-xs text-gray-600">Collaboration</div>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-lg font-bold text-blue-600">{selectedMember.influence}</div>
                  <div className="text-xs text-gray-600">Influence</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-lg font-bold text-purple-600">{selectedMember.communicationFreq}</div>
                  <div className="text-xs text-gray-600">Communications</div>
                </div>
                <div className={`text-center p-3 rounded-lg ${
                  selectedMember.stressLevel < 40 ? 'bg-green-50' : 
                  selectedMember.stressLevel < 70 ? 'bg-yellow-50' : 'bg-red-50'
                }`}>
                  <div className={`text-lg font-bold ${getStressColor(selectedMember.stressLevel)}`}>
                    {selectedMember.stressLevel}%
                  </div>
                  <div className="text-xs text-gray-600">Stress Level</div>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-3">
                <h6 className="font-medium text-gray-900 mb-2">Collaboration Patterns</h6>
                <div className="space-y-1 text-sm text-gray-600">
                  {teamData.connections
                    .filter(conn => conn.from === selectedMember.id || conn.to === selectedMember.id)
                    .map((conn, index) => {
                      const otherMemberId = conn.from === selectedMember.id ? conn.to : conn.from;
                      const otherMember = teamData.members.find(m => m.id === otherMemberId);
                      return (
                        <div key={index} className="flex justify-between">
                          <span>{otherMember?.name}</span>
                          <span className="capitalize">{conn.type}</span>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
            
            <button
              onClick={() => setSelectedMember(null)}
              className="mt-4 w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
