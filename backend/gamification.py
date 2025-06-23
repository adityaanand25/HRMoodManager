# Gamification System for Employee Wellness
import json
from datetime import datetime, timedelta
from typing import Dict, List, Optional
from database import get_connection
import sqlite3

class WellnessGamification:
    """Gamification system to encourage wellness participation"""
    
    def __init__(self):
        self.achievement_definitions = self._load_achievement_definitions()
        self.point_system = self._load_point_system()
        self.init_gamification_database()
    
    def _load_achievement_definitions(self) -> Dict:
        """Define all available achievements"""
        return {
            'mood_tracker': {
                'name': 'Mood Tracker',
                'description': 'Check in with your mood',
                'levels': {
                    'bronze': {'requirement': 7, 'points': 50, 'badge': '🥉'},
                    'silver': {'requirement': 30, 'points': 150, 'badge': '🥈'},
                    'gold': {'requirement': 100, 'points': 300, 'badge': '🥇'},
                    'platinum': {'requirement': 365, 'points': 1000, 'badge': '💎'}
                }
            },
            'consistency_champion': {
                'name': 'Consistency Champion',
                'description': 'Check in daily for consecutive days',
                'levels': {
                    'bronze': {'requirement': 7, 'points': 100, 'badge': '🔥'},
                    'silver': {'requirement': 30, 'points': 300, 'badge': '🔥🔥'},
                    'gold': {'requirement': 90, 'points': 500, 'badge': '🔥🔥🔥'},
                    'platinum': {'requirement': 365, 'points': 1500, 'badge': '🔥🔥🔥🔥'}
                }
            },
            'positive_vibes': {
                'name': 'Positive Vibes',
                'description': 'Maintain positive mood ratings',
                'levels': {
                    'bronze': {'requirement': 10, 'points': 75, 'badge': '😊'},
                    'silver': {'requirement': 50, 'points': 200, 'badge': '😄'},
                    'gold': {'requirement': 150, 'points': 400, 'badge': '🤗'},
                    'platinum': {'requirement': 500, 'points': 1200, 'badge': '🌟'}
                }
            },
            'wellness_warrior': {
                'name': 'Wellness Warrior',
                'description': 'Complete wellness challenges',
                'levels': {
                    'bronze': {'requirement': 5, 'points': 100, 'badge': '⚔️'},
                    'silver': {'requirement': 20, 'points': 250, 'badge': '🛡️'},
                    'gold': {'requirement': 50, 'points': 500, 'badge': '👑'},
                    'platinum': {'requirement': 100, 'points': 1000, 'badge': '🏆'}
                }
            },
            'team_player': {
                'name': 'Team Player',
                'description': 'Participate in team wellness activities',
                'levels': {
                    'bronze': {'requirement': 3, 'points': 80, 'badge': '🤝'},
                    'silver': {'requirement': 10, 'points': 200, 'badge': '👥'},
                    'gold': {'requirement': 25, 'points': 400, 'badge': '🎯'},
                    'platinum': {'requirement': 50, 'points': 800, 'badge': '🌐'}
                }
            },
            'improvement_hero': {
                'name': 'Improvement Hero',
                'description': 'Show consistent wellness score improvement',
                'levels': {
                    'bronze': {'requirement': 5, 'points': 120, 'badge': '📈'},
                    'silver': {'requirement': 15, 'points': 300, 'badge': '📊'},
                    'gold': {'requirement': 30, 'points': 600, 'badge': '🚀'},
                    'platinum': {'requirement': 60, 'points': 1200, 'badge': '🌠'}
                }
            }
        }
    
    def _load_point_system(self) -> Dict:
        """Define point values for different activities"""
        return {
            'mood_checkin': 10,
            'daily_streak': 5,
            'positive_mood': 5,
            'wellness_challenge_complete': 25,
            'team_activity_participation': 20,
            'improvement_milestone': 30,
            'help_colleague': 15,
            'wellness_survey_complete': 20,
            'burnout_score_improvement': 40
        }
    
    def init_gamification_database(self):
        """Initialize gamification database tables"""
        try:
            conn = get_connection()
            cursor = conn.cursor()
            
            # User points and levels table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS user_gamification (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    employee_name TEXT NOT NULL,
                    total_points INTEGER DEFAULT 0,
                    level INTEGER DEFAULT 1,
                    current_streak INTEGER DEFAULT 0,
                    longest_streak INTEGER DEFAULT 0,
                    last_checkin_date TEXT,
                    badges TEXT DEFAULT '[]',
                    achievements TEXT DEFAULT '[]',
                    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE(employee_name)
                )
            ''')
            
            # Points history table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS points_history (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    employee_name TEXT NOT NULL,
                    activity_type TEXT NOT NULL,
                    points_awarded INTEGER NOT NULL,
                    description TEXT,
                    timestamp TEXT DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            # Challenges table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS wellness_challenges (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    title TEXT NOT NULL,
                    description TEXT,
                    challenge_type TEXT NOT NULL,
                    target_value INTEGER,
                    points_reward INTEGER,
                    start_date TEXT,
                    end_date TEXT,
                    is_active BOOLEAN DEFAULT TRUE,
                    created_at TEXT DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            # Challenge participation table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS challenge_participation (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    challenge_id INTEGER,
                    employee_name TEXT NOT NULL,
                    progress INTEGER DEFAULT 0,
                    completed BOOLEAN DEFAULT FALSE,
                    completion_date TEXT,
                    FOREIGN KEY (challenge_id) REFERENCES wellness_challenges (id)
                )
            ''')
            
            # Leaderboard view
            cursor.execute('''
                CREATE VIEW IF NOT EXISTS leaderboard AS
                SELECT 
                    employee_name,
                    total_points,
                    level,
                    current_streak,
                    longest_streak,
                    json_array_length(badges) as badge_count,
                    json_array_length(achievements) as achievement_count
                FROM user_gamification
                ORDER BY total_points DESC, level DESC
            ''')
            
            conn.commit()
            conn.close()
            
        except Exception as e:
            print(f"Error initializing gamification database: {e}")
    
    def award_points(self, employee_name: str, activity_type: str, description: str = None) -> Dict:
        """Award points for an activity"""
        if activity_type not in self.point_system:
            return {'success': False, 'message': 'Unknown activity type'}
        
        points = self.point_system[activity_type]
        
        try:
            conn = get_connection()
            cursor = conn.cursor()
            
            # Get or create user gamification record
            cursor.execute('''
                INSERT OR IGNORE INTO user_gamification (employee_name) VALUES (?)
            ''', (employee_name,))
            
            # Update points
            cursor.execute('''
                UPDATE user_gamification 
                SET total_points = total_points + ?,
                    updated_at = ?
                WHERE employee_name = ?
            ''', (points, datetime.now().isoformat(), employee_name))
            
            # Record points history
            cursor.execute('''
                INSERT INTO points_history (employee_name, activity_type, points_awarded, description)
                VALUES (?, ?, ?, ?)
            ''', (employee_name, activity_type, points, description))
            
            # Check for level up
            new_level = self._calculate_level(self._get_total_points(employee_name))
            cursor.execute('''
                UPDATE user_gamification 
                SET level = ?
                WHERE employee_name = ?
            ''', (new_level, employee_name))
            
            conn.commit()
            conn.close()
            
            # Check for new achievements
            achievements = self._check_achievements(employee_name)
            
            return {
                'success': True,
                'points_awarded': points,
                'total_points': self._get_total_points(employee_name),
                'new_level': new_level,
                'new_achievements': achievements
            }
            
        except Exception as e:
            print(f"Error awarding points: {e}")
            return {'success': False, 'message': str(e)}
    
    def update_streak(self, employee_name: str) -> Dict:
        """Update daily check-in streak"""
        try:
            conn = get_connection()
            cursor = conn.cursor()
            
            # Get current user data
            cursor.execute('''
                SELECT current_streak, longest_streak, last_checkin_date
                FROM user_gamification
                WHERE employee_name = ?
            ''', (employee_name,))
            
            result = cursor.fetchone()
            if not result:
                return {'success': False, 'message': 'User not found'}
            
            current_streak, longest_streak, last_checkin = result
            today = datetime.now().date().isoformat()
            
            # Check if already checked in today
            if last_checkin == today:
                return {'success': False, 'message': 'Already checked in today'}
            
            # Calculate new streak
            if last_checkin:
                last_date = datetime.fromisoformat(last_checkin).date()
                days_diff = (datetime.now().date() - last_date).days
                
                if days_diff == 1:
                    # Consecutive day
                    new_streak = current_streak + 1
                else:
                    # Streak broken
                    new_streak = 1
            else:
                new_streak = 1
            
            new_longest = max(longest_streak, new_streak)
            
            # Update database
            cursor.execute('''
                UPDATE user_gamification
                SET current_streak = ?,
                    longest_streak = ?,
                    last_checkin_date = ?,
                    updated_at = ?
                WHERE employee_name = ?
            ''', (new_streak, new_longest, today, datetime.now().isoformat(), employee_name))
            
            conn.commit()
            conn.close()
            
            # Award streak bonus points
            if new_streak > 1:
                self.award_points(employee_name, 'daily_streak', f'Day {new_streak} streak')
            
            return {
                'success': True,
                'current_streak': new_streak,
                'longest_streak': new_longest,
                'streak_bonus_awarded': new_streak > 1
            }
            
        except Exception as e:
            print(f"Error updating streak: {e}")
            return {'success': False, 'message': str(e)}
    
    def _get_total_points(self, employee_name: str) -> int:
        """Get total points for an employee"""
        try:
            conn = get_connection()
            cursor = conn.cursor()
            
            cursor.execute('''
                SELECT total_points FROM user_gamification WHERE employee_name = ?
            ''', (employee_name,))
            
            result = cursor.fetchone()
            conn.close()
            
            return result[0] if result else 0
            
        except Exception as e:
            print(f"Error getting total points: {e}")
            return 0
    
    def _calculate_level(self, total_points: int) -> int:
        """Calculate level based on total points"""
        # Level formula: points needed = level^2 * 100
        level = 1
        while (level + 1) ** 2 * 100 <= total_points:
            level += 1
        return level
    
    def _check_achievements(self, employee_name: str) -> List[Dict]:
        """Check for new achievements"""
        new_achievements = []
        
        try:
            # Get user stats
            stats = self._get_user_stats(employee_name)
            
            for achievement_id, achievement in self.achievement_definitions.items():
                current_achievements = stats.get('achievements', [])
                
                for level, requirements in achievement['levels'].items():
                    achievement_key = f"{achievement_id}_{level}"
                    
                    # Skip if already achieved
                    if achievement_key in current_achievements:
                        continue
                    
                    # Check requirements
                    if self._check_achievement_requirement(employee_name, achievement_id, requirements):
                        new_achievements.append({
                            'id': achievement_key,
                            'name': f"{achievement['name']} - {level.title()}",
                            'description': achievement['description'],
                            'level': level,
                            'points': requirements['points'],
                            'badge': requirements['badge']
                        })
                        
                        # Award achievement
                        self._award_achievement(employee_name, achievement_key)
            
            return new_achievements
            
        except Exception as e:
            print(f"Error checking achievements: {e}")
            return []
    
    def _check_achievement_requirement(self, employee_name: str, achievement_id: str, requirements: Dict) -> bool:
        """Check if achievement requirement is met"""
        try:
            if achievement_id == 'mood_tracker':
                # Count total mood check-ins
                conn = get_connection()
                cursor = conn.cursor()
                cursor.execute('''
                    SELECT COUNT(*) FROM mood_data WHERE employee_name = ?
                ''', (employee_name,))
                count = cursor.fetchone()[0]
                conn.close()
                return count >= requirements['requirement']
            
            elif achievement_id == 'consistency_champion':
                # Check longest streak
                stats = self._get_user_stats(employee_name)
                return stats.get('longest_streak', 0) >= requirements['requirement']
            
            elif achievement_id == 'positive_vibes':
                # Count positive moods
                conn = get_connection()
                cursor = conn.cursor()
                cursor.execute('''
                    SELECT COUNT(*) FROM mood_data 
                    WHERE employee_name = ? AND mood IN ('happy', 'content', 'excited')
                ''', (employee_name,))
                count = cursor.fetchone()[0]
                conn.close()
                return count >= requirements['requirement']
            
            # Add more achievement checks as needed
            return False
            
        except Exception as e:
            print(f"Error checking achievement requirement: {e}")
            return False
    
    def _award_achievement(self, employee_name: str, achievement_key: str):
        """Award an achievement to a user"""
        try:
            conn = get_connection()
            cursor = conn.cursor()
            
            # Get current achievements
            cursor.execute('''
                SELECT achievements FROM user_gamification WHERE employee_name = ?
            ''', (employee_name,))
            
            result = cursor.fetchone()
            if result:
                achievements = json.loads(result[0]) if result[0] else []
                achievements.append(achievement_key)
                
                cursor.execute('''
                    UPDATE user_gamification
                    SET achievements = ?
                    WHERE employee_name = ?
                ''', (json.dumps(achievements), employee_name))
                
                conn.commit()
            
            conn.close()
            
        except Exception as e:
            print(f"Error awarding achievement: {e}")
    
    def _get_user_stats(self, employee_name: str) -> Dict:
        """Get comprehensive user statistics"""
        try:
            conn = get_connection()
            cursor = conn.cursor()
            
            cursor.execute('''
                SELECT total_points, level, current_streak, longest_streak, badges, achievements
                FROM user_gamification
                WHERE employee_name = ?
            ''', (employee_name,))
            
            result = cursor.fetchone()
            if result:
                return {
                    'total_points': result[0],
                    'level': result[1],
                    'current_streak': result[2],
                    'longest_streak': result[3],
                    'badges': json.loads(result[4]) if result[4] else [],
                    'achievements': json.loads(result[5]) if result[5] else []
                }
            
            conn.close()
            return {}
            
        except Exception as e:
            print(f"Error getting user stats: {e}")
            return {}
    
    def get_leaderboard(self, limit: int = 10) -> List[Dict]:
        """Get wellness leaderboard"""
        try:
            conn = get_connection()
            cursor = conn.cursor()
            
            cursor.execute('''
                SELECT * FROM leaderboard LIMIT ?
            ''', (limit,))
            
            results = cursor.fetchall()
            conn.close()
            
            leaderboard = []
            for i, row in enumerate(results):
                leaderboard.append({
                    'rank': i + 1,
                    'employee_name': row[0],
                    'total_points': row[1],
                    'level': row[2],
                    'current_streak': row[3],
                    'longest_streak': row[4],
                    'badge_count': row[5],
                    'achievement_count': row[6]
                })
            
            return leaderboard
            
        except Exception as e:
            print(f"Error getting leaderboard: {e}")
            return []
    
    def create_wellness_challenge(self, title: str, description: str, challenge_type: str, 
                                 target_value: int, points_reward: int, duration_days: int = 30) -> Dict:
        """Create a new wellness challenge"""
        try:
            start_date = datetime.now().date()
            end_date = start_date + timedelta(days=duration_days)
            
            conn = get_connection()
            cursor = conn.cursor()
            
            cursor.execute('''
                INSERT INTO wellness_challenges 
                (title, description, challenge_type, target_value, points_reward, start_date, end_date)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ''', (title, description, challenge_type, target_value, points_reward, 
                  start_date.isoformat(), end_date.isoformat()))
            
            challenge_id = cursor.lastrowid
            conn.commit()
            conn.close()
            
            return {
                'success': True,
                'challenge_id': challenge_id,
                'title': title,
                'start_date': start_date.isoformat(),
                'end_date': end_date.isoformat()
            }
            
        except Exception as e:
            print(f"Error creating challenge: {e}")
            return {'success': False, 'message': str(e)}
    
    def get_active_challenges(self) -> List[Dict]:
        """Get all active wellness challenges"""
        try:
            conn = get_connection()
            cursor = conn.cursor()
            
            today = datetime.now().date().isoformat()
            cursor.execute('''
                SELECT * FROM wellness_challenges
                WHERE is_active = TRUE AND start_date <= ? AND end_date >= ?
                ORDER BY start_date DESC
            ''', (today, today))
            
            results = cursor.fetchall()
            conn.close()
            
            challenges = []
            for row in results:
                challenges.append({
                    'id': row[0],
                    'title': row[1],
                    'description': row[2],
                    'challenge_type': row[3],
                    'target_value': row[4],
                    'points_reward': row[5],
                    'start_date': row[6],
                    'end_date': row[7],
                    'participants': self._get_challenge_participants(row[0])
                })
            
            return challenges
            
        except Exception as e:
            print(f"Error getting active challenges: {e}")
            return []
    
    def _get_challenge_participants(self, challenge_id: int) -> int:
        """Get number of participants in a challenge"""
        try:
            conn = get_connection()
            cursor = conn.cursor()
            
            cursor.execute('''
                SELECT COUNT(*) FROM challenge_participation WHERE challenge_id = ?
            ''', (challenge_id,))
            
            count = cursor.fetchone()[0]
            conn.close()
            
            return count
            
        except Exception as e:
            print(f"Error getting challenge participants: {e}")
            return 0

# Factory function
def create_gamification_system():
    """Create gamification system instance"""
    return WellnessGamification()

# Example usage
if __name__ == "__main__":
    # Initialize gamification system
    gamification = WellnessGamification()
    
    # Example: Award points for mood check-in
    result = gamification.award_points("John Doe", "mood_checkin", "Daily mood check-in")
    print("Points awarded:", result)
    
    # Example: Update streak
    streak_result = gamification.update_streak("John Doe")
    print("Streak updated:", streak_result)
    
    # Example: Get leaderboard
    leaderboard = gamification.get_leaderboard()
    print("Leaderboard:", leaderboard)
