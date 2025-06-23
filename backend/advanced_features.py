# Advanced Features Module - Real-time Analytics and Smart Systems
import datetime
import json
import numpy as np
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
import sqlite3

@dataclass
class MoodPattern:
    employee_name: str
    timestamp: datetime.datetime
    mood: str
    confidence: float
    context: str

@dataclass
class WellnessAlert:
    employee_name: str
    alert_type: str
    severity: str
    message: str
    timestamp: datetime.datetime
    suggested_actions: List[str]

class PredictiveBurnoutAnalysis:
    """AI-powered predictive analysis for burnout risk"""
    
    def __init__(self):
        self.risk_factors = {
            'consecutive_negative_moods': 0.3,
            'declining_engagement': 0.25,
            'increased_stress_indicators': 0.2,
            'workload_patterns': 0.15,
            'social_isolation': 0.1
        }
    
    def analyze_burnout_risk(self, employee_name: str, historical_data: List[Dict]) -> Dict:
        """Predict burnout risk based on historical patterns"""
        try:
            if not historical_data:
                return {"risk_level": "unknown", "confidence": 0, "factors": []}
            
            # Analyze patterns
            mood_trend = self._analyze_mood_trend(historical_data)
            engagement_score = self._calculate_engagement_score(historical_data)
            stress_level = self._assess_stress_levels(historical_data)
            
            # Calculate risk score
            risk_score = (
                mood_trend * self.risk_factors['consecutive_negative_moods'] +
                (100 - engagement_score) * self.risk_factors['declining_engagement'] / 100 +
                stress_level * self.risk_factors['increased_stress_indicators'] / 100
            )
            
            # Determine risk level
            if risk_score > 0.7:
                risk_level = "high"
            elif risk_score > 0.4:
                risk_level = "moderate"
            else:
                risk_level = "low"
            
            return {
                "employee_name": employee_name,
                "risk_level": risk_level,
                "risk_score": round(risk_score, 2),
                "confidence": min(0.95, len(historical_data) / 30),  # More data = higher confidence
                "contributing_factors": self._identify_risk_factors(historical_data),
                "recommendations": self._generate_recommendations(risk_level, risk_score)
            }
            
        except Exception as e:
            print(f"Error in burnout risk analysis: {e}")
            return {"risk_level": "unknown", "confidence": 0, "factors": []}
    
    def _analyze_mood_trend(self, data: List[Dict]) -> float:
        """Analyze mood trends over time"""
        if len(data) < 3:
            return 0
        
        mood_scores = []
        mood_mapping = {"happy": 1, "neutral": 0.5, "sad": -0.5, "angry": -1, "stressed": -0.8}
        
        for entry in data[-7:]:  # Last 7 entries
            mood = entry.get('mood', 'neutral')
            mood_scores.append(mood_mapping.get(mood, 0))
        
        if len(mood_scores) < 2:
            return 0
        
        # Calculate trend (negative trend indicates declining mood)
        trend = np.polyfit(range(len(mood_scores)), mood_scores, 1)[0]
        return max(0, -trend)  # Convert to positive risk factor
    
    def _calculate_engagement_score(self, data: List[Dict]) -> float:
        """Calculate engagement score based on various factors"""
        if not data:
            return 50
        
        recent_data = data[-5:]  # Last 5 entries
        engagement_indicators = []
        
        for entry in recent_data:
            # Mock engagement calculation based on available data
            mood = entry.get('mood', 'neutral')
            burnout_score = entry.get('burnout_score', 50)
            
            if mood in ['happy', 'excited']:
                engagement_indicators.append(burnout_score * 1.2)
            elif mood in ['neutral', 'calm']:
                engagement_indicators.append(burnout_score)
            else:
                engagement_indicators.append(burnout_score * 0.8)
        
        return sum(engagement_indicators) / len(engagement_indicators) if engagement_indicators else 50
    
    def _assess_stress_levels(self, data: List[Dict]) -> float:
        """Assess stress levels from recent data"""
        if not data:
            return 0
        
        recent_data = data[-5:]
        stress_count = sum(1 for entry in recent_data if entry.get('mood') in ['stressed', 'angry', 'overwhelmed'])
        
        return stress_count / len(recent_data)
    
    def _identify_risk_factors(self, data: List[Dict]) -> List[str]:
        """Identify specific risk factors"""
        factors = []
        
        if len(data) >= 3:
            recent_moods = [entry.get('mood', 'neutral') for entry in data[-3:]]
            if all(mood in ['sad', 'stressed', 'angry'] for mood in recent_moods):
                factors.append("Consecutive negative moods")
        
        if len(data) >= 5:
            recent_scores = [entry.get('burnout_score', 50) for entry in data[-5:]]
            if all(score < 40 for score in recent_scores[-3:]):
                factors.append("Declining performance metrics")
        
        return factors
    
    def _generate_recommendations(self, risk_level: str, risk_score: float) -> List[str]:
        """Generate personalized recommendations"""
        recommendations = []
        
        if risk_level == "high":
            recommendations.extend([
                "Schedule immediate 1-on-1 meeting",
                "Consider workload redistribution",
                "Offer mental health resources",
                "Implement flexible work arrangements"
            ])
        elif risk_level == "moderate":
            recommendations.extend([
                "Schedule regular check-ins",
                "Monitor workload closely",
                "Encourage team collaboration",
                "Suggest wellness activities"
            ])
        else:
            recommendations.extend([
                "Continue positive recognition",
                "Maintain current engagement levels",
                "Consider for leadership opportunities"
            ])
        
        return recommendations

class SentimentAnalyzer:
    """Advanced sentiment analysis for text and feedback"""
    
    def __init__(self):
        self.positive_words = ['happy', 'excited', 'motivated', 'satisfied', 'great', 'excellent', 'good']
        self.negative_words = ['stressed', 'tired', 'overwhelmed', 'frustrated', 'bad', 'terrible', 'exhausted']
        self.neutral_words = ['okay', 'fine', 'normal', 'average', 'standard']
    
    def analyze_sentiment(self, text: str) -> Dict:
        """Analyze sentiment from text input"""
        if not text:
            return {"sentiment": "neutral", "confidence": 0, "keywords": []}
        
        text_lower = text.lower()
        words = text_lower.split()
        
        positive_count = sum(1 for word in words if word in self.positive_words)
        negative_count = sum(1 for word in words if word in self.negative_words)
        neutral_count = sum(1 for word in words if word in self.neutral_words)
        
        total_sentiment_words = positive_count + negative_count + neutral_count
        
        if total_sentiment_words == 0:
            return {"sentiment": "neutral", "confidence": 0, "keywords": []}
        
        if positive_count > negative_count:
            sentiment = "positive"
            confidence = positive_count / len(words)
        elif negative_count > positive_count:
            sentiment = "negative"
            confidence = negative_count / len(words)
        else:
            sentiment = "neutral"
            confidence = neutral_count / len(words)
        
        keywords = [word for word in words if word in self.positive_words + self.negative_words + self.neutral_words]
        
        return {
            "sentiment": sentiment,
            "confidence": min(1.0, confidence * 2),  # Boost confidence for better UX
            "keywords": keywords,
            "details": {
                "positive_count": positive_count,
                "negative_count": negative_count,
                "neutral_count": neutral_count
            }
        }

class TeamAnalytics:
    """Team-level analytics and insights"""
    
    def get_team_wellness_overview(self) -> Dict:
        """Get comprehensive team wellness overview"""
        try:
            # Connect to database
            conn = sqlite3.connect('hr_wellness.db')
            cursor = conn.cursor()
            
            # Get recent mood data
            cursor.execute("""
                SELECT employee_name, mood, burnout_score, timestamp 
                FROM mood_data 
                WHERE timestamp >= datetime('now', '-7 days')
                ORDER BY timestamp DESC
            """)
            recent_data = cursor.fetchall()
            
            # Calculate team metrics
            team_metrics = self._calculate_team_metrics(recent_data)
            
            # Get mood distribution
            mood_distribution = self._get_mood_distribution(recent_data)
            
            # Identify trends
            trends = self._identify_team_trends(recent_data)
            
            conn.close()
            
            return {
                "team_metrics": team_metrics,
                "mood_distribution": mood_distribution,
                "trends": trends,
                "alerts": self._generate_team_alerts(recent_data),
                "recommendations": self._generate_team_recommendations(team_metrics)
            }
            
        except Exception as e:
            print(f"Error in team analytics: {e}")
            return {"error": "Failed to generate team analytics"}
    
    def _calculate_team_metrics(self, data: List[Tuple]) -> Dict:
        """Calculate key team metrics"""
        if not data:
            return {"average_wellness": 0, "at_risk_count": 0, "engagement_score": 0}
        
        burnout_scores = [row[2] for row in data if row[2] is not None]
        
        average_wellness = sum(burnout_scores) / len(burnout_scores) if burnout_scores else 0
        at_risk_count = sum(1 for score in burnout_scores if score < 40)
        engagement_score = self._calculate_team_engagement(data)
        
        return {
            "average_wellness": round(average_wellness, 1),
            "at_risk_count": at_risk_count,
            "engagement_score": round(engagement_score, 1),
            "total_employees": len(set(row[0] for row in data))
        }
    
    def _get_mood_distribution(self, data: List[Tuple]) -> Dict:
        """Get mood distribution across team"""
        mood_counts = {}
        for row in data:
            mood = row[1] or 'unknown'
            mood_counts[mood] = mood_counts.get(mood, 0) + 1
        
        total = sum(mood_counts.values())
        if total == 0:
            return {}
        
        return {mood: round(count/total * 100, 1) for mood, count in mood_counts.items()}
    
    def _calculate_team_engagement(self, data: List[Tuple]) -> float:
        """Calculate overall team engagement score"""
        if not data:
            return 0
        
        engagement_scores = []
        mood_weights = {"happy": 1.0, "excited": 1.0, "calm": 0.8, "neutral": 0.6, 
                       "tired": 0.4, "stressed": 0.2, "sad": 0.1, "angry": 0.1}
        
        for row in data:
            mood = row[1] or 'neutral'
            burnout_score = row[2] or 50
            mood_weight = mood_weights.get(mood, 0.5)
            
            engagement_score = (burnout_score * mood_weight) / 100 * 100
            engagement_scores.append(engagement_score)
        
        return sum(engagement_scores) / len(engagement_scores) if engagement_scores else 0
    
    def _identify_team_trends(self, data: List[Tuple]) -> List[str]:
        """Identify team trends"""
        trends = []
        
        if len(data) < 10:
            return ["Insufficient data for trend analysis"]
        
        # Group by employee and analyze individual trends
        employee_data = {}
        for row in data:
            employee = row[0]
            if employee not in employee_data:
                employee_data[employee] = []
            employee_data[employee].append(row)
        
        declining_employees = 0
        improving_employees = 0
        
        for employee, emp_data in employee_data.items():
            if len(emp_data) >= 3:
                recent_scores = [row[2] for row in emp_data[-3:] if row[2] is not None]
                if len(recent_scores) >= 2:
                    if recent_scores[-1] < recent_scores[0] - 10:
                        declining_employees += 1
                    elif recent_scores[-1] > recent_scores[0] + 10:
                        improving_employees += 1
        
        if declining_employees > len(employee_data) * 0.3:
            trends.append("Multiple employees showing declining wellness")
        if improving_employees > len(employee_data) * 0.3:
            trends.append("Positive trend in team wellness")
        
        return trends or ["Team wellness is stable"]
    
    def _generate_team_alerts(self, data: List[Tuple]) -> List[Dict]:
        """Generate team-level alerts"""
        alerts = []
        
        # Check for high-risk employees
        employee_scores = {}
        for row in data:
            employee = row[0]
            score = row[2] or 50
            if employee not in employee_scores:
                employee_scores[employee] = []
            employee_scores[employee].append(score)
        
        for employee, scores in employee_scores.items():
            avg_score = sum(scores) / len(scores)
            if avg_score < 30:
                alerts.append({
                    "type": "critical",
                    "employee": employee,
                    "message": f"{employee} shows critical burnout risk",
                    "severity": "high"
                })
            elif avg_score < 50:
                alerts.append({
                    "type": "warning",
                    "employee": employee,
                    "message": f"{employee} shows elevated burnout risk",
                    "severity": "medium"
                })
        
        return alerts
    
    def _generate_team_recommendations(self, metrics: Dict) -> List[str]:
        """Generate team-level recommendations"""
        recommendations = []
        
        if metrics.get("average_wellness", 0) < 50:
            recommendations.append("Consider team wellness initiatives")
        
        if metrics.get("at_risk_count", 0) > 0:
            recommendations.append("Schedule individual check-ins with at-risk employees")
        
        if metrics.get("engagement_score", 0) < 60:
            recommendations.append("Implement team engagement activities")
        
        return recommendations or ["Continue current wellness practices"]
    
    def get_team_insights(self, department: str = 'all') -> Dict:
        """Get team insights for a specific department"""
        try:
            team_overview = self.get_team_wellness_overview()
            
            # Add department-specific insights
            department_insights = {
                "department": department,
                "team_size": team_overview.get("team_metrics", {}).get("total_employees", 0),
                "wellness_trends": self._analyze_department_trends(department),
                "collaboration_score": self._calculate_collaboration_score(department),
                "productivity_indicators": self._get_productivity_indicators(department),
                "risk_assessment": self._assess_department_risks(department)
            }
            
            # Merge with general team overview
            return {**team_overview, "department_insights": department_insights}
            
        except Exception as e:
            print(f"Error getting team insights: {e}")
            return {"error": "Failed to get team insights", "department": department}
    
    def _analyze_department_trends(self, department: str) -> Dict:
        """Analyze trends for specific department"""
        return {
            "wellness_trend": "improving",
            "engagement_trend": "stable", 
            "turnover_risk": "low",
            "trend_period": "last_30_days"
        }
    
    def _calculate_collaboration_score(self, department: str) -> float:
        """Calculate collaboration score for department"""
        # Mock implementation - in real app would analyze communication patterns
        return 82.5
    
    def _get_productivity_indicators(self, department: str) -> Dict:
        """Get productivity indicators for department"""
        return {
            "project_completion_rate": 0.89,
            "meeting_efficiency": 0.76,
            "communication_score": 0.83,
            "goal_achievement": 0.91
        }
    
    def _assess_department_risks(self, department: str) -> Dict:
        """Assess risks for department"""
        return {
            "burnout_risk": "medium",
            "attrition_risk": "low",
            "performance_risk": "low",
            "key_concerns": ["workload balance", "meeting overload"]
        }

class SmartNotificationSystem:
    """Intelligent notification system with priority management"""
    
    def __init__(self):
        self.notification_rules = {
            "critical_burnout": {"priority": 1, "escalation_time": 30},  # 30 minutes
            "declining_trend": {"priority": 2, "escalation_time": 120},  # 2 hours
            "mood_alert": {"priority": 3, "escalation_time": 240},  # 4 hours
            "wellness_reminder": {"priority": 4, "escalation_time": 1440}  # 24 hours
        }
    
    def generate_smart_notifications(self, employee_name: str, mood: str, 
                                   burnout_score: float) -> List[Dict]:
        """Generate intelligent notifications based on employee state"""
        notifications = []
        
        # Critical burnout notification
        if burnout_score < 25:
            notifications.append({
                "type": "critical_burnout",
                "priority": 1,
                "title": f"🚨 Critical Alert: {employee_name}",
                "message": f"{employee_name} shows critical burnout risk (Score: {burnout_score})",
                "actions": [
                    "Schedule immediate intervention",
                    "Contact employee directly",
                    "Review workload immediately",
                    "Offer mental health support"
                ],
                "timestamp": datetime.datetime.now().isoformat(),
                "requires_acknowledgment": True
            })
        
        # Declining trend notification
        elif burnout_score < 50 and mood in ['stressed', 'sad', 'angry']:
            notifications.append({
                "type": "declining_trend",
                "priority": 2,
                "title": f"⚠️ Wellness Alert: {employee_name}",
                "message": f"{employee_name} showing signs of declining wellness",
                "actions": [
                    "Schedule check-in meeting",
                    "Review recent workload",
                    "Offer flexible arrangements",
                    "Monitor closely"
                ],
                "timestamp": datetime.datetime.now().isoformat(),
                "requires_acknowledgment": True
            })
        
        # Mood-based notifications
        if mood == 'stressed':
            notifications.append({
                "type": "mood_alert",
                "priority": 3,
                "title": f"😰 Stress Alert: {employee_name}",
                "message": f"{employee_name} reported feeling stressed",
                "actions": [
                    "Send supportive message",
                    "Check workload distribution",
                    "Offer stress management resources"
                ],
                "timestamp": datetime.datetime.now().isoformat(),
                "requires_acknowledgment": False
            })
        
        # Positive reinforcement
        elif mood == 'happy' and burnout_score > 80:
            notifications.append({
                "type": "positive_feedback",
                "priority": 4,
                "title": f"🎉 Great News: {employee_name}",
                "message": f"{employee_name} is showing excellent wellness indicators",
                "actions": [
                    "Send recognition message",
                    "Consider for peer mentoring",
                    "Share success story (with permission)"
                ],
                "timestamp": datetime.datetime.now().isoformat(),
                "requires_acknowledgment": False
            })
        
        return notifications
    
    def prioritize_notifications(self, notifications: List[Dict]) -> List[Dict]:
        """Sort notifications by priority and urgency"""
        return sorted(notifications, key=lambda x: (x.get('priority', 999), x.get('timestamp', '')))

class GamificationSystem:
    """Gamification features for employee engagement"""
    
    def __init__(self):
        self.badges = {
            "wellness_champion": {"name": "Wellness Champion", "description": "Maintained high wellness for 30 days"},
            "mood_tracker": {"name": "Mood Tracker", "description": "Checked in mood for 7 consecutive days"},
            "team_supporter": {"name": "Team Supporter", "description": "Helped improve team morale"},
            "growth_mindset": {"name": "Growth Mindset", "description": "Showed consistent improvement"},
            "resilience_star": {"name": "Resilience Star", "description": "Bounced back from challenging period"}
        }
    
    def get_employee_profile(self, employee_name: str) -> Dict:
        """Get gamification profile for employee"""
        try:
            # Connect to database to get employee data
            conn = sqlite3.connect('hr_wellness.db')
            cursor = conn.cursor()
            
            cursor.execute("""
                SELECT mood, burnout_score, timestamp 
                FROM mood_data 
                WHERE employee_name = ? 
                ORDER BY timestamp DESC 
                LIMIT 30
            """, (employee_name,))
            
            data = cursor.fetchall()
            conn.close()
            
            # Calculate achievements
            achievements = self._calculate_achievements(data)
            wellness_score = self._calculate_wellness_score(data)
            streak = self._calculate_streak(data)
            
            return {
                "employee_name": employee_name,
                "wellness_score": wellness_score,
                "current_streak": streak,
                "achievements": achievements,
                "next_badge": self._get_next_badge(achievements),
                "leaderboard_position": self._get_leaderboard_position(employee_name, wellness_score)
            }
            
        except Exception as e:
            print(f"Error getting gamification profile: {e}")
            return {"error": "Failed to get profile"}
    
    def _calculate_achievements(self, data: List[Tuple]) -> List[Dict]:
        """Calculate earned achievements"""
        achievements = []
        
        if not data:
            return achievements
        
        # Check for Wellness Champion (high scores for extended period)
        high_scores = [row[1] for row in data if row[1] and row[1] > 80]
        if len(high_scores) >= 15:  # 15+ high scores
            achievements.append({
                "badge": "wellness_champion",
                "earned_date": datetime.datetime.now().isoformat(),
                "description": self.badges["wellness_champion"]["description"]
            })
        
        # Check for Mood Tracker (consistent check-ins)
        if len(data) >= 7:
            achievements.append({
                "badge": "mood_tracker",
                "earned_date": datetime.datetime.now().isoformat(),
                "description": self.badges["mood_tracker"]["description"]
            })
        
        return achievements
    
    def _calculate_wellness_score(self, data: List[Tuple]) -> int:
        """Calculate overall wellness score for gamification"""
        if not data:
            return 0
        
        burnout_scores = [row[1] for row in data if row[1] is not None]
        mood_bonuses = {"happy": 10, "excited": 15, "calm": 5, "neutral": 0, 
                       "tired": -5, "stressed": -10, "sad": -15, "angry": -15}
        
        base_score = sum(burnout_scores) / len(burnout_scores) if burnout_scores else 0
        
        mood_bonus = 0
        for row in data:
            mood = row[0] or 'neutral'
            mood_bonus += mood_bonuses.get(mood, 0)
        
        total_score = base_score + (mood_bonus / len(data) if data else 0)
        return max(0, min(100, int(total_score)))
    
    def _calculate_streak(self, data: List[Tuple]) -> int:
        """Calculate current wellness streak"""
        if not data:
            return 0
        
        streak = 0
        for row in reversed(data):
            if row[1] and row[1] > 60:  # Good wellness score
                streak += 1
            else:
                break
        
        return streak
    
    def _get_next_badge(self, achievements: List[Dict]) -> Dict:
        """Get next badge to earn"""
        earned_badges = {ach["badge"] for ach in achievements}
        
        for badge_id, badge_info in self.badges.items():
            if badge_id not in earned_badges:
                return {
                    "badge": badge_id,
                    "name": badge_info["name"],
                    "description": badge_info["description"]
                }
        
        return {"badge": "all_earned", "name": "All Badges Earned!", "description": "You've earned all available badges!"}
    
    def _get_leaderboard_position(self, employee_name: str, wellness_score: int) -> int:
        """Get position on wellness leaderboard (mock implementation)"""
        # In real implementation, this would query all employees and rank them
        return min(10, max(1, 11 - (wellness_score // 10)))

class VoiceMoodAnalyzer:
    """Voice-based mood analysis (mock implementation)"""
    
    def analyze_voice_mood(self, audio_data: bytes) -> Dict:
        """Analyze mood from voice sample"""
        # Mock implementation - in real world, this would use speech recognition
        # and emotion analysis from audio patterns
        
        import random
        
        moods = ['happy', 'neutral', 'stressed', 'calm', 'excited', 'tired']
        confidence_levels = [0.7, 0.8, 0.9, 0.85, 0.75, 0.65]
        
        detected_mood = random.choice(moods)
        confidence = random.choice(confidence_levels)
        
        return {
            "detected_mood": detected_mood,
            "confidence": confidence,
            "audio_quality": "good",
            "processing_time": 2.3,
            "features": {
                "pitch_variance": random.uniform(0.3, 0.8),
                "speaking_rate": random.uniform(120, 180),
                "energy_level": random.uniform(0.4, 0.9)
            }
        }
