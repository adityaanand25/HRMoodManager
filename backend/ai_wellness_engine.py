# AI-Powered Wellness Recommendations Engine
import datetime
import json
import random
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass

@dataclass
class WellnessRecommendation:
    id: str
    type: str  # 'intervention', 'activity', 'resource', 'support'
    title: str
    description: str
    priority: str  # 'low', 'medium', 'high', 'urgent'
    estimated_impact: float  # 0-1 scale
    time_required: str
    category: str
    personalization_score: float

class AIWellnessEngine:
    """Advanced AI engine for personalized wellness recommendations"""
    
    def __init__(self):
        self.intervention_library = {
            'stress_management': [
                {
                    'title': 'Mindful Breathing Session',
                    'description': 'Guided 10-minute breathing exercise to reduce cortisol levels',
                    'time_required': '10 minutes',
                    'impact': 0.7,
                    'category': 'immediate_relief'
                },
                {
                    'title': 'Progressive Muscle Relaxation',
                    'description': 'Systematic tension and release technique for physical stress',
                    'time_required': '15 minutes',
                    'impact': 0.8,
                    'category': 'physical_wellness'
                },
                {
                    'title': 'Stress Management Workshop',
                    'description': 'Learn long-term coping strategies and resilience building',
                    'time_required': '2 hours',
                    'impact': 0.9,
                    'category': 'skill_building'
                }
            ],
            'burnout_prevention': [
                {
                    'title': 'Workload Reassessment',
                    'description': 'Review and redistribute tasks to prevent overload',
                    'time_required': '1 hour',
                    'impact': 0.85,
                    'category': 'structural_change'
                },
                {
                    'title': 'Digital Detox Plan',
                    'description': 'Structured approach to reducing screen time and notifications',
                    'time_required': '30 minutes setup',
                    'impact': 0.6,
                    'category': 'lifestyle_change'
                }
            ],
            'team_building': [
                {
                    'title': 'Virtual Coffee Chat',
                    'description': 'Informal team connection session to strengthen relationships',
                    'time_required': '30 minutes',
                    'impact': 0.5,
                    'category': 'social_connection'
                },
                {
                    'title': 'Collaborative Problem Solving',
                    'description': 'Team exercise focused on shared challenges and solutions',
                    'time_required': '1 hour',
                    'impact': 0.7,
                    'category': 'team_dynamics'
                }
            ],
            'mental_health': [
                {
                    'title': 'EAP Counseling Session',
                    'description': 'Professional mental health support through Employee Assistance Program',
                    'time_required': '1 hour',
                    'impact': 0.9,
                    'category': 'professional_support'
                },
                {
                    'title': 'Mindfulness Meditation',
                    'description': 'Daily meditation practice to improve mental clarity and emotional regulation',
                    'time_required': '15 minutes daily',
                    'impact': 0.75,
                    'category': 'daily_practice'
                }
            ]
        }
        
        self.wellness_resources = [
            {
                'title': 'Mental Health First Aid Training',
                'description': 'Learn to recognize and respond to mental health challenges',
                'type': 'training',
                'impact': 0.8
            },
            {
                'title': 'Wellness App Subscription',
                'description': 'Access to guided meditations, sleep stories, and stress relief tools',
                'type': 'digital_tool',
                'impact': 0.6
            },
            {
                'title': 'Flexible Work Arrangement',
                'description': 'Adjust work schedule or location to improve work-life balance',
                'type': 'policy_change',
                'impact': 0.85
            }
        ]
    
    def generate_personalized_recommendations(self, employee_profile: Dict) -> List[WellnessRecommendation]:
        """Generate AI-powered personalized wellness recommendations"""
        recommendations = []
        
        # Extract key metrics
        stress_level = employee_profile.get('stress_level', 50)
        burnout_score = employee_profile.get('burnout_score', 50)
        mood_trend = employee_profile.get('mood_trend', 'stable')
        social_connection = employee_profile.get('social_connection', 50)
        work_satisfaction = employee_profile.get('work_satisfaction', 50)
        
        # Stress-based recommendations
        if stress_level > 70:
            for intervention in self.intervention_library['stress_management']:
                rec = WellnessRecommendation(
                    id=f"stress_{random.randint(1000, 9999)}",
                    type='intervention',
                    title=intervention['title'],
                    description=intervention['description'],
                    priority='high' if stress_level > 85 else 'medium',
                    estimated_impact=intervention['impact'] * (stress_level / 100),
                    time_required=intervention['time_required'],
                    category=intervention['category'],
                    personalization_score=self._calculate_personalization_score(employee_profile, intervention)
                )
                recommendations.append(rec)
        
        # Burnout prevention
        if burnout_score > 60:
            for intervention in self.intervention_library['burnout_prevention']:
                rec = WellnessRecommendation(
                    id=f"burnout_{random.randint(1000, 9999)}",
                    type='intervention',
                    title=intervention['title'],
                    description=intervention['description'],
                    priority='high' if burnout_score > 80 else 'medium',
                    estimated_impact=intervention['impact'] * (burnout_score / 100),
                    time_required=intervention['time_required'],
                    category=intervention['category'],
                    personalization_score=self._calculate_personalization_score(employee_profile, intervention)
                )
                recommendations.append(rec)
        
        # Social connection recommendations
        if social_connection < 40:
            for intervention in self.intervention_library['team_building']:
                rec = WellnessRecommendation(
                    id=f"social_{random.randint(1000, 9999)}",
                    type='activity',
                    title=intervention['title'],
                    description=intervention['description'],
                    priority='medium',
                    estimated_impact=intervention['impact'] * ((100 - social_connection) / 100),
                    time_required=intervention['time_required'],
                    category=intervention['category'],
                    personalization_score=self._calculate_personalization_score(employee_profile, intervention)
                )
                recommendations.append(rec)
        
        # Mental health resources
        if mood_trend == 'declining' or stress_level > 80:
            for intervention in self.intervention_library['mental_health']:
                rec = WellnessRecommendation(
                    id=f"mental_{random.randint(1000, 9999)}",
                    type='resource',
                    title=intervention['title'],
                    description=intervention['description'],
                    priority='urgent' if stress_level > 90 else 'high',
                    estimated_impact=intervention['impact'],
                    time_required=intervention['time_required'],
                    category=intervention['category'],
                    personalization_score=self._calculate_personalization_score(employee_profile, intervention)
                )
                recommendations.append(rec)
        
        # Sort by personalization score and impact
        recommendations.sort(key=lambda x: (x.personalization_score * x.estimated_impact), reverse=True)
        
        # Return top 5 recommendations
        return recommendations[:5]
    
    def _calculate_personalization_score(self, profile: Dict, intervention: Dict) -> float:
        """Calculate how well an intervention fits the employee's profile"""
        base_score = 0.5
        
        # Adjust based on employee preferences (simulated)
        preferences = profile.get('preferences', {})
        
        if intervention['category'] in preferences.get('preferred_interventions', []):
            base_score += 0.3
        
        # Adjust based on time availability
        time_availability = profile.get('time_availability', 'medium')
        intervention_time = intervention.get('time_required', '')
        
        if 'minutes' in intervention_time and time_availability == 'low':
            time_minutes = int(intervention_time.split()[0]) if intervention_time.split()[0].isdigit() else 30
            if time_minutes <= 15:
                base_score += 0.2
            else:
                base_score -= 0.1
        
        # Adjust based on previous intervention success
        intervention_history = profile.get('intervention_history', {})
        if intervention['category'] in intervention_history:
            success_rate = intervention_history[intervention['category']].get('success_rate', 0.5)
            base_score += (success_rate - 0.5) * 0.4
        
        return min(1.0, max(0.0, base_score))
    
    def predict_intervention_outcome(self, employee_profile: Dict, intervention: WellnessRecommendation) -> Dict:
        """Predict the likely outcome of an intervention"""
        
        # Base prediction factors
        current_stress = employee_profile.get('stress_level', 50)
        engagement_level = employee_profile.get('engagement_level', 50)
        support_system = employee_profile.get('support_system_strength', 50)
        
        # Calculate success probability
        success_factors = [
            intervention.personalization_score,
            intervention.estimated_impact,
            (100 - current_stress) / 100,  # Lower stress = higher success chance
            engagement_level / 100,
            support_system / 100
        ]
        
        success_probability = sum(success_factors) / len(success_factors)
        
        # Estimate timeline for results
        if intervention.category in ['immediate_relief', 'physical_wellness']:
            timeline = '1-3 days'
        elif intervention.category in ['skill_building', 'daily_practice']:
            timeline = '1-2 weeks'
        elif intervention.category in ['structural_change', 'policy_change']:
            timeline = '2-4 weeks'
        else:
            timeline = '1-2 weeks'
        
        # Calculate potential impact range
        min_impact = intervention.estimated_impact * 0.6
        max_impact = intervention.estimated_impact * 1.2
        expected_impact = intervention.estimated_impact * success_probability
        
        return {
            'success_probability': round(success_probability * 100, 1),
            'expected_timeline': timeline,
            'impact_range': {
                'minimum': round(min_impact * 100, 1),
                'expected': round(expected_impact * 100, 1),
                'maximum': round(max_impact * 100, 1)
            },
            'confidence_level': round(intervention.personalization_score * 100, 1),
            'risk_factors': self._identify_risk_factors(employee_profile, intervention),
            'success_indicators': self._identify_success_indicators(intervention)
        }
    
    def _identify_risk_factors(self, profile: Dict, intervention: WellnessRecommendation) -> List[str]:
        """Identify potential risks or barriers to intervention success"""
        risk_factors = []
        
        if profile.get('time_availability', 'medium') == 'low' and 'hour' in intervention.time_required:
            risk_factors.append('Limited time availability may impact engagement')
        
        if profile.get('stress_level', 50) > 85:
            risk_factors.append('High stress levels may reduce initial receptiveness')
        
        if profile.get('support_system_strength', 50) < 30:
            risk_factors.append('Weak support system may limit intervention effectiveness')
        
        if intervention.category == 'social_connection' and profile.get('introversion_score', 50) > 70:
            risk_factors.append('High introversion may create resistance to social interventions')
        
        return risk_factors
    
    def _identify_success_indicators(self, intervention: WellnessRecommendation) -> List[str]:
        """Identify indicators that the intervention is working"""
        indicators_map = {
            'immediate_relief': [
                'Reduced reported stress levels within 24-48 hours',
                'Improved sleep quality metrics',
                'Decreased cortisol indicators'
            ],
            'skill_building': [
                'Increased confidence in stress management',
                'More frequent use of coping strategies',
                'Improved resilience scores'
            ],
            'social_connection': [
                'Increased team interaction frequency',
                'Improved collaboration scores',
                'Higher job satisfaction ratings'
            ],
            'professional_support': [
                'Regular attendance at sessions',
                'Improved mood stability',
                'Decreased crisis incidents'
            ]
        }
        
        return indicators_map.get(intervention.category, [
            'Improved overall wellness scores',
            'Positive feedback from employee',
            'Sustained behavior changes'
        ])

# Global instance
ai_wellness_engine = AIWellnessEngine()
