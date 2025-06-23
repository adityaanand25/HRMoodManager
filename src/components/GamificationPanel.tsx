import React, { useState, useEffect } from 'react';
import { Award, TrendingUp, Star, Target, Trophy, Zap } from 'lucide-react';
import { getGamificationProfile } from '../services/enhancedApi';

interface GamificationPanelProps {
  employeeName: string;
  onAchievementUnlocked?: (achievement: any) => void;
}

interface GamificationData {
  employee_name: string;
  wellness_score: number;
  current_streak: number;
  achievements: Array<{
    badge: string;
    earned_date: string;
    description: string;
  }>;
  next_badge: {
    badge: string;
    name: string;
    description: string;
  };
  leaderboard_position: number;
}

export const GamificationPanel: React.FC<GamificationPanelProps> = ({ 
  employeeName, 
  onAchievementUnlocked 
}) => {
  const [gamificationData, setGamificationData] = useState<GamificationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchGamificationData();
  }, [employeeName]);

  const fetchGamificationData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getGamificationProfile(employeeName);
      
      // Defensively handle achievements array
      const currentAchievements = gamificationData?.achievements || [];
      const newAchievementsData = data.achievements || [];

      // Check for new achievements
      if (gamificationData && newAchievementsData.length > currentAchievements.length) {
        const newAchievements = newAchievementsData.filter(
          (achievement: any) => !currentAchievements.some(
            (existing: any) => existing.badge === achievement.badge
          )
        );
        newAchievements.forEach(achievement => {
          onAchievementUnlocked?.(achievement);
        });
      }
      
      setGamificationData({ ...data, achievements: newAchievementsData });
    } catch (err) {
      console.error('Error fetching gamification data:', err);
      setError('Failed to load gamification data');
    } finally {
      setLoading(false);
    }
  };

  const getBadgeIcon = (badgeType: string) => {
    switch (badgeType) {
      case 'wellness_champion': return <Trophy className="text-yellow-500" size={20} />;
      case 'mood_tracker': return <Target className="text-blue-500" size={20} />;
      case 'team_supporter': return <Star className="text-purple-500" size={20} />;
      case 'growth_mindset': return <TrendingUp className="text-green-500" size={20} />;
      case 'resilience_star': return <Zap className="text-red-500" size={20} />;
      default: return <Award className="text-gray-500" size={20} />;
    }
  };

  const getWellnessColor = (score: number): string => {
    if (score >= 80) return 'from-green-400 to-green-600';
    if (score >= 60) return 'from-yellow-400 to-yellow-600';
    if (score >= 40) return 'from-orange-400 to-orange-600';
    return 'from-red-400 to-red-600';
  };

  const getPositionColor = (position: number): string => {
    if (position === 1) return 'text-yellow-600';
    if (position <= 3) return 'text-gray-600';
    if (position <= 5) return 'text-orange-600';
    return 'text-blue-600';
  };

  const getPositionEmoji = (position: number): string => {
    if (position === 1) return '🥇';
    if (position === 2) return '🥈';
    if (position === 3) return '🥉';
    return '🏅';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !gamificationData) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="text-center">
          <Award size={48} className="text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">{error || 'Gamification data not available'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Trophy className="text-yellow-500 mr-2" size={24} />
          Wellness Achievements
        </h3>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">Rank</span>
          <div className="flex items-center space-x-1">
            <span className="text-lg">{getPositionEmoji(gamificationData.leaderboard_position)}</span>
            <span className={`text-sm font-bold ${getPositionColor(gamificationData.leaderboard_position)}`}>
              #{gamificationData.leaderboard_position}
            </span>
          </div>
        </div>
      </div>

      {/* Wellness Score */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Wellness Score</span>
          <span className="text-2xl font-bold text-gray-900">{gamificationData.wellness_score}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className={`h-3 rounded-full bg-gradient-to-r ${getWellnessColor(gamificationData.wellness_score)} transition-all duration-500`}
            style={{ width: `${gamificationData.wellness_score}%` }}
          ></div>
        </div>
      </div>

      {/* Current Streak */}
      <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Zap className="text-blue-600" size={20} />
            <span className="text-sm font-medium text-gray-700">Current Streak</span>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">{gamificationData.current_streak}</div>
            <div className="text-xs text-gray-500">days</div>
          </div>
        </div>
        {gamificationData.current_streak > 0 && (
          <div className="mt-2 text-xs text-gray-600">
            Keep it up! You're on a {gamificationData.current_streak}-day wellness streak! 🔥
          </div>
        )}
      </div>

      {/* Achievements */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Earned Badges</h4>
        {gamificationData.achievements && gamificationData.achievements.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {gamificationData.achievements.map((achievement, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center space-x-3">
                  {getBadgeIcon(achievement.badge)}
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-800">{achievement.badge.replace(/_/g, ' ')}</p>
                    <p className="text-xs text-gray-500">{achievement.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-gray-500">No badges earned yet. Keep up the great work!</p>
          </div>
        )}
      </div>

      {/* Next Badge */}
      {gamificationData.next_badge && (
        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Next Badge to Unlock</h4>
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="opacity-50">
                {getBadgeIcon(gamificationData.next_badge.badge)}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-800">{gamificationData.next_badge.name}</p>
                <p className="text-xs text-gray-500">{gamificationData.next_badge.description}</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
};
