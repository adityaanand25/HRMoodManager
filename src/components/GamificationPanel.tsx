import React, { useState, useEffect, useCallback } from 'react';
import { Award, TrendingUp, Star, Target, Trophy, Zap, RefreshCw } from 'lucide-react';
import { getGamificationProfile } from '../services/enhancedApi';

interface Achievement {
  badge: string;
  earned_date: string;
  description: string;
}

interface NextBadge {
  badge: string;
  name: string;
  description: string;
}

interface GamificationData {
  employee_name: string;
  wellness_score: number;
  current_streak: number;
  achievements: Achievement[];
  next_badge: NextBadge;
  leaderboard_position: number;
}

interface GamificationPanelProps {
  employeeName: string;
  onAchievementUnlocked?: (achievement: Achievement) => void;
}

export const GamificationPanel: React.FC<GamificationPanelProps> = ({ 
  employeeName, 
  onAchievementUnlocked 
}) => {
  const [gamificationData, setGamificationData] = useState<GamificationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchGamificationData = useCallback(async () => {
    if (!employeeName) {
      setError('Employee name is required');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await getGamificationProfile(employeeName);
      
      // Ensure data structure is valid
      if (!data) {
        throw new Error('No gamification data received');
      }

      // Defensively handle achievements array
      const currentAchievements = gamificationData?.achievements || [];
      const newAchievementsData = data.achievements || [];

      // Check for new achievements
      if (gamificationData && newAchievementsData.length > currentAchievements.length) {
        const newAchievements = newAchievementsData.filter(
          (achievement: Achievement) => !currentAchievements.some(
            (existing: Achievement) => existing.badge === achievement.badge
          )
        );
        newAchievements.forEach((achievement: Achievement) => {
          onAchievementUnlocked?.(achievement);
        });
      }
      
      // Ensure all required fields are present with fallbacks
      const processedData: GamificationData = {
        employee_name: data.employee_name || employeeName,
        wellness_score: Math.max(0, Math.min(100, data.wellness_score || 0)),
        current_streak: Math.max(0, data.current_streak || 0),
        achievements: newAchievementsData,
        next_badge: data.next_badge || {
          badge: 'wellness_starter',
          name: 'Wellness Starter',
          description: 'Begin your wellness journey'
        },
        leaderboard_position: Math.max(1, data.leaderboard_position || 1)
      };

      setGamificationData(processedData);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching gamification data:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load gamification data';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [employeeName, gamificationData?.achievements, onAchievementUnlocked]);

  useEffect(() => {
    fetchGamificationData();
  }, [fetchGamificationData]);

  const getBadgeIcon = (badgeType: string) => {
    switch (badgeType) {
      case 'wellness_champion': return <Trophy className="text-yellow-500" size={20} />;
      case 'mood_tracker': return <Target className="text-blue-500" size={20} />;
      case 'team_supporter': return <Star className="text-purple-500" size={20} />;
      case 'growth_mindset': return <TrendingUp className="text-green-500" size={20} />;
      case 'resilience_star': return <Zap className="text-red-500" size={20} />;
      case 'wellness_starter': return <Award className="text-green-500" size={20} />;
      case 'consistency_champion': return <Zap className="text-orange-500" size={20} />;
      case 'positive_vibes': return <Star className="text-pink-500" size={20} />;
      case 'wellness_warrior': return <Trophy className="text-red-500" size={20} />;
      case 'team_player': return <Target className="text-purple-500" size={20} />;
      case 'improvement_hero': return <TrendingUp className="text-blue-500" size={20} />;
      default: return <Award className="text-gray-500" size={20} />;
    }
  };

  const formatBadgeName = (badgeName: string): string => {
    return badgeName
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const getWellnessColor = (score: number): string => {
    if (score >= 90) return 'from-emerald-400 to-emerald-600';
    if (score >= 80) return 'from-green-400 to-green-600';
    if (score >= 70) return 'from-lime-400 to-lime-600';
    if (score >= 60) return 'from-yellow-400 to-yellow-600';
    if (score >= 50) return 'from-orange-400 to-orange-600';
    if (score >= 40) return 'from-red-400 to-red-600';
    return 'from-red-600 to-red-800';
  };

  const getPositionColor = (position: number): string => {
    if (position === 1) return 'text-yellow-600 font-bold';
    if (position <= 3) return 'text-gray-600 font-semibold';
    if (position <= 5) return 'text-orange-600 font-medium';
    if (position <= 10) return 'text-blue-600';
    return 'text-gray-500';
  };

  const getPositionEmoji = (position: number): string => {
    if (position === 1) return '🥇';
    if (position === 2) return '🥈';
    if (position === 3) return '🥉';
    if (position <= 10) return '🏅';
    return '📊';
  };

  const getStreakMessage = (streak: number): string => {
    if (streak === 0) return 'Start your wellness journey today! 🌱';
    if (streak < 7) return `Great start! ${streak} day${streak > 1 ? 's' : ''} and counting! 🌟`;
    if (streak < 30) return `Amazing consistency! ${streak} days strong! 🔥`;
    if (streak < 100) return `Incredible dedication! ${streak} day streak! 🚀`;
    return `Legendary wellness warrior! ${streak} days! 👑`;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-6">
            <div className="h-6 bg-gray-200 rounded w-48"></div>
            <div className="h-5 bg-gray-200 rounded w-16"></div>
          </div>
          <div className="mb-6">
            <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-full"></div>
          </div>
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
            <div className="h-6 bg-gray-200 rounded w-16"></div>
          </div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-32"></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="h-16 bg-gray-200 rounded"></div>
              <div className="h-16 bg-gray-200 rounded"></div>
            </div>
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
          <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to Load Gamification Data</h3>
          <p className="text-gray-500 mb-4">{error || 'Gamification data not available'}</p>
          <button
            onClick={fetchGamificationData}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <RefreshCw size={16} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Retrying...' : 'Try Again'}
          </button>
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
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">Rank</span>
            <div className="flex items-center space-x-1">
              <span className="text-lg">{getPositionEmoji(gamificationData.leaderboard_position)}</span>
              <span className={`text-sm ${getPositionColor(gamificationData.leaderboard_position)}`}>
                #{gamificationData.leaderboard_position}
              </span>
            </div>
          </div>
          <button
            onClick={fetchGamificationData}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
            title="Refresh data"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Last Updated Info */}
      {lastUpdated && (
        <div className="text-xs text-gray-500 mb-4">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </div>
      )}

      {/* Wellness Score */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Wellness Score</span>
          <div className="text-right">
            <span className="text-2xl font-bold text-gray-900">{gamificationData.wellness_score}</span>
            <span className="text-sm text-gray-500 ml-1">/100</span>
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div 
            className={`h-3 rounded-full bg-gradient-to-r ${getWellnessColor(gamificationData.wellness_score)} transition-all duration-1000 ease-out`}
            style={{ width: `${Math.min(100, Math.max(0, gamificationData.wellness_score))}%` }}
          ></div>
        </div>
        <div className="text-xs text-gray-600 mt-1">
          {gamificationData.wellness_score >= 80 ? 'Excellent! Keep it up! 🌟' :
           gamificationData.wellness_score >= 60 ? 'Good progress! 👍' :
           gamificationData.wellness_score >= 40 ? 'Getting better! 💪' :
           'Room for improvement 📈'}
        </div>
      </div>

      {/* Current Streak */}
      <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Zap className="text-blue-600" size={20} />
            <span className="text-sm font-medium text-gray-700">Current Streak</span>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">{gamificationData.current_streak}</div>
            <div className="text-xs text-gray-500">day{gamificationData.current_streak !== 1 ? 's' : ''}</div>
          </div>
        </div>
        <div className="mt-2 text-xs text-gray-600">
          {getStreakMessage(gamificationData.current_streak)}
        </div>
      </div>

      {/* Achievements */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-gray-700">Earned Badges</h4>
          <span className="text-xs text-gray-500">
            {gamificationData.achievements ? gamificationData.achievements.length : 0} badge{gamificationData.achievements && gamificationData.achievements.length !== 1 ? 's' : ''}
          </span>
        </div>
        {gamificationData.achievements && gamificationData.achievements.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {gamificationData.achievements.map((achievement, index) => (
              <div key={index} className="p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    {getBadgeIcon(achievement.badge)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">
                      {formatBadgeName(achievement.badge)}
                    </p>
                    <p className="text-xs text-gray-500 line-clamp-2">{achievement.description}</p>
                    {achievement.earned_date && (
                      <p className="text-xs text-gray-400 mt-1">
                        Earned: {new Date(achievement.earned_date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
            <Award size={32} className="text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500 font-medium">No badges earned yet</p>
            <p className="text-xs text-gray-400 mt-1">Keep up the great work to unlock your first badge!</p>
          </div>
        )}
      </div>

      {/* Next Badge */}
      {gamificationData.next_badge && (
        <div className="border-t border-gray-200 pt-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
            <Target size={16} className="mr-2 text-blue-500" />
            Next Badge to Unlock
          </h4>
          <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0 opacity-60 transform scale-110">
                {getBadgeIcon(gamificationData.next_badge.badge)}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-800">{gamificationData.next_badge.name}</p>
                <p className="text-xs text-gray-600 mt-1">{gamificationData.next_badge.description}</p>
                <div className="mt-2 text-xs text-blue-600 font-medium">
                  🎯 Keep going to unlock this achievement!
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
};
