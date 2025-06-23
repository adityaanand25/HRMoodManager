# Advanced AI Analytics for Predictive Burnout and Sentiment Analysis
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List, Tuple, Optional
import sqlite3
from textblob import TextBlob
import warnings
warnings.filterwarnings('ignore')

class PredictiveBurnoutAnalysis:
    """Advanced AI-powered burnout prediction and analysis"""
    
    def __init__(self):
        self.mood_weights = {
            'happy': 1.0,
            'content': 0.8,
            'calm': 0.7,
            'focused': 0.6,
            'neutral': 0.5,
            'tired': 0.3,
            'stressed': 0.2,
            'anxious': 0.1,
            'angry': 0.05,
            'sad': 0.0
        }
        
    def calculate_advanced_burnout_score(self, employee_data: Dict) -> Dict:
        """Calculate advanced burnout score with multiple factors"""
        try:
            # Base factors
            idle_time = employee_data.get('idle_time', 0)
            meetings = employee_data.get('meetings_attended', 5)
            logins = employee_data.get('login_count', 3)
            
            # New advanced factors
            mood_history = employee_data.get('mood_history', [])
            work_hours = employee_data.get('work_hours', 8)
            weekend_activity = employee_data.get('weekend_activity', 0)
            response_time = employee_data.get('avg_response_time', 2)  # hours
            
            # Calculate mood trend
            mood_trend = self._calculate_mood_trend(mood_history)
            
            # Advanced scoring algorithm
            base_score = 100 - (idle_time * 2 + (5 - meetings) * 3 + (3 - logins) * 4)
            
            # Mood impact (30% weight)
            mood_impact = mood_trend * 30
            
            # Work-life balance impact (20% weight)
            work_life_balance = self._calculate_work_life_balance(work_hours, weekend_activity) * 20
            
            # Communication responsiveness (15% weight)
            communication_score = max(0, (4 - response_time) / 4) * 15
            
            # Calculate final score
            final_score = base_score + mood_impact + work_life_balance + communication_score
            final_score = max(0, min(100, final_score))
            
            # Predict burnout risk
            risk_level, risk_factors = self._analyze_risk_factors(employee_data, final_score)
            
            return {
                'burnout_score': round(final_score, 1),
                'risk_level': risk_level,
                'risk_factors': risk_factors,
                'mood_trend': mood_trend,
                'work_life_balance': work_life_balance / 20,
                'communication_score': communication_score / 15,
                'prediction_confidence': self._calculate_confidence(employee_data)
            }
            
        except Exception as e:
            print(f"Error calculating burnout score: {e}")
            return {'burnout_score': 50, 'risk_level': 'Medium', 'risk_factors': []}
    
    def _calculate_mood_trend(self, mood_history: List[str]) -> float:
        """Calculate mood trend over time"""
        if not mood_history:
            return 0.5
            
        mood_scores = [self.mood_weights.get(mood.lower(), 0.5) for mood in mood_history[-10:]]
        
        if len(mood_scores) > 1:
            # Calculate trend (positive = improving, negative = declining)
            trend = np.polyfit(range(len(mood_scores)), mood_scores, 1)[0]
            return max(0, min(1, 0.5 + trend * 2))
        
        return np.mean(mood_scores)
    
    def _calculate_work_life_balance(self, work_hours: float, weekend_activity: float) -> float:
        """Calculate work-life balance score"""
        # Ideal work hours: 8, penalize overtime and underwork
        work_hours_score = max(0, 1 - abs(work_hours - 8) / 8)
        
        # Weekend activity should be minimal (0-2 hours acceptable)
        weekend_score = max(0, 1 - max(0, weekend_activity - 2) / 8)
        
        return (work_hours_score + weekend_score) / 2
    
    def _analyze_risk_factors(self, employee_data: Dict, burnout_score: float) -> Tuple[str, List[str]]:
        """Analyze and identify specific risk factors"""
        risk_factors = []
        
        # Score-based risk level
        if burnout_score < 40:
            risk_level = "Critical"
        elif burnout_score < 60:
            risk_level = "High"
        elif burnout_score < 75:
            risk_level = "Medium"
        else:
            risk_level = "Low"
        
        # Identify specific risk factors
        if employee_data.get('work_hours', 8) > 10:
            risk_factors.append("Excessive overtime hours")
            
        if employee_data.get('weekend_activity', 0) > 4:
            risk_factors.append("Working on weekends")
            
        if employee_data.get('avg_response_time', 2) > 6:
            risk_factors.append("Delayed communication response")
            
        mood_history = employee_data.get('mood_history', [])
        if mood_history:
            negative_moods = sum(1 for mood in mood_history[-5:] if mood.lower() in ['sad', 'angry', 'stressed'])
            if negative_moods >= 3:
                risk_factors.append("Persistent negative mood patterns")
        
        if employee_data.get('meetings_attended', 5) < 2:
            risk_factors.append("Low meeting attendance")
            
        if employee_data.get('idle_time', 0) > 4:
            risk_factors.append("High idle time indicating disengagement")
        
        return risk_level, risk_factors
    
    def _calculate_confidence(self, employee_data: Dict) -> float:
        """Calculate prediction confidence based on data completeness"""
        data_points = 0
        total_points = 8
        
        if 'idle_time' in employee_data: data_points += 1
        if 'meetings_attended' in employee_data: data_points += 1
        if 'login_count' in employee_data: data_points += 1
        if 'mood_history' in employee_data and employee_data['mood_history']: data_points += 1
        if 'work_hours' in employee_data: data_points += 1
        if 'weekend_activity' in employee_data: data_points += 1
        if 'avg_response_time' in employee_data: data_points += 1
        if len(employee_data.get('mood_history', [])) >= 5: data_points += 1
        
        return round(data_points / total_points, 2)

class SentimentAnalysis:
    """Advanced sentiment analysis for employee feedback"""
    
    def analyze_text_sentiment(self, text: str) -> Dict:
        """Analyze sentiment of text input"""
        try:
            blob = TextBlob(text)
            sentiment_score = blob.sentiment.polarity
            subjectivity = blob.sentiment.subjectivity
            
            # Convert to our mood categories
            if sentiment_score > 0.5:
                mood = "happy"
            elif sentiment_score > 0.1:
                mood = "content"
            elif sentiment_score > -0.1:
                mood = "neutral"
            elif sentiment_score > -0.5:
                mood = "stressed"
            else:
                mood = "sad"
            
            return {
                'sentiment_score': round(sentiment_score, 3),
                'subjectivity': round(subjectivity, 3),
                'predicted_mood': mood,
                'confidence': min(1.0, abs(sentiment_score) + 0.3),
                'text_length': len(text),
                'analysis_timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            print(f"Error analyzing sentiment: {e}")
            return {
                'sentiment_score': 0,
                'subjectivity': 0.5,
                'predicted_mood': 'neutral',
                'confidence': 0.3
            }
    
    def analyze_mood_patterns(self, mood_history: List[Dict]) -> Dict:
        """Analyze patterns in mood history"""
        if not mood_history:
            return {'pattern': 'insufficient_data'}
        
        moods = [entry.get('mood', 'neutral') for entry in mood_history]
        timestamps = [entry.get('timestamp') for entry in mood_history]
        
        # Analyze patterns
        patterns = {
            'most_common_mood': max(set(moods), key=moods.count),
            'mood_frequency': {mood: moods.count(mood) for mood in set(moods)},
            'recent_trend': self._analyze_recent_trend(moods[-7:]),
            'volatility': self._calculate_mood_volatility(moods),
            'time_patterns': self._analyze_time_patterns(mood_history)
        }
        
        return patterns
    
    def _analyze_recent_trend(self, recent_moods: List[str]) -> str:
        """Analyze trend in recent moods"""
        if len(recent_moods) < 3:
            return "insufficient_data"
        
        mood_scores = [self._mood_to_score(mood) for mood in recent_moods]
        
        # Calculate trend
        x = list(range(len(mood_scores)))
        trend = np.polyfit(x, mood_scores, 1)[0]
        
        if trend > 0.1:
            return "improving"
        elif trend < -0.1:
            return "declining"
        else:
            return "stable"
    
    def _mood_to_score(self, mood: str) -> float:
        """Convert mood to numerical score"""
        mood_scores = {
            'happy': 1.0,
            'content': 0.8,
            'calm': 0.7,
            'focused': 0.6,
            'neutral': 0.5,
            'tired': 0.3,
            'stressed': 0.2,
            'anxious': 0.1,
            'angry': 0.05,
            'sad': 0.0
        }
        return mood_scores.get(mood.lower(), 0.5)
    
    def _calculate_mood_volatility(self, moods: List[str]) -> float:
        """Calculate mood volatility (how much moods change)"""
        if len(moods) < 2:
            return 0.0
        
        scores = [self._mood_to_score(mood) for mood in moods]
        return round(np.std(scores), 3)
    
    def _analyze_time_patterns(self, mood_history: List[Dict]) -> Dict:
        """Analyze patterns based on time of day/week"""
        if not mood_history:
            return {}
        
        # This is a simplified version - you can expand with more sophisticated time analysis
        return {
            'data_points': len(mood_history),
            'analysis_note': 'Time pattern analysis requires more historical data'
        }

class TeamAnalytics:
    """Team-level analytics and insights"""
    
    def analyze_team_health(self, team_data: List[Dict]) -> Dict:
        """Analyze overall team health metrics"""
        if not team_data:
            return {'status': 'no_data'}
        
        burnout_scores = [member.get('burnout_score', 50) for member in team_data]
        moods = [member.get('current_mood', 'neutral') for member in team_data if member.get('current_mood')]
        
        # Calculate team metrics
        team_metrics = {
            'team_size': len(team_data),
            'avg_burnout_score': round(np.mean(burnout_scores), 1),
            'burnout_distribution': self._calculate_burnout_distribution(burnout_scores),
            'at_risk_members': len([score for score in burnout_scores if score < 60]),
            'team_mood_distribution': {mood: moods.count(mood) for mood in set(moods)},
            'team_health_status': self._determine_team_health_status(burnout_scores),
            'recommendations': self._generate_team_recommendations(burnout_scores, moods)
        }
        
        return team_metrics
    
    def _calculate_burnout_distribution(self, scores: List[float]) -> Dict:
        """Calculate distribution of burnout scores"""
        distribution = {
            'critical': len([s for s in scores if s < 40]),
            'high_risk': len([s for s in scores if 40 <= s < 60]),
            'medium_risk': len([s for s in scores if 60 <= s < 75]),
            'low_risk': len([s for s in scores if s >= 75])
        }
        return distribution
    
    def _determine_team_health_status(self, scores: List[float]) -> str:
        """Determine overall team health status"""
        avg_score = np.mean(scores)
        critical_count = len([s for s in scores if s < 40])
        
        if avg_score < 50 or critical_count > len(scores) * 0.3:
            return "critical"
        elif avg_score < 65 or critical_count > 0:
            return "needs_attention"
        elif avg_score < 75:
            return "good"
        else:
            return "excellent"
    
    def _generate_team_recommendations(self, scores: List[float], moods: List[str]) -> List[str]:
        """Generate team-level recommendations"""
        recommendations = []
        
        avg_score = np.mean(scores)
        critical_members = len([s for s in scores if s < 40])
        
        if critical_members > 0:
            recommendations.append(f"Immediate intervention needed for {critical_members} team members")
        
        if avg_score < 60:
            recommendations.append("Consider team-wide wellness initiatives")
            recommendations.append("Review workload distribution across team")
        
        negative_moods = len([m for m in moods if m in ['sad', 'angry', 'stressed']])
        if negative_moods > len(moods) * 0.4:
            recommendations.append("Address team morale and communication issues")
        
        if len(set(moods)) <= 2:
            recommendations.append("Monitor team for signs of groupthink or suppressed communication")
        
        return recommendations

# Factory function to create analyzer instances
def create_burnout_analyzer():
    """Factory function to create burnout analyzer"""
    return PredictiveBurnoutAnalysis()

def create_sentiment_analyzer():
    """Factory function to create sentiment analyzer"""
    return SentimentAnalysis()

def create_team_analyzer():
    """Factory function to create team analyzer"""
    return TeamAnalytics()

# Example usage and testing functions
if __name__ == "__main__":
    # Test the analytics
    analyzer = PredictiveBurnoutAnalysis()
    
    sample_data = {
        'idle_time': 3,
        'meetings_attended': 4,
        'login_count': 5,
        'mood_history': ['happy', 'content', 'stressed', 'happy', 'neutral'],
        'work_hours': 9.5,
        'weekend_activity': 2,
        'avg_response_time': 1.5
    }
    
    result = analyzer.calculate_advanced_burnout_score(sample_data)
    print("Advanced Burnout Analysis Result:")
    print(result)
