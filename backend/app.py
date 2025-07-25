# Import necessary libraries
import os
from datetime import datetime
from flask import Flask, request, jsonify  # Flask for building the API
from flask_cors import CORS  # CORS to allow cross-origin requests from the frontend
# Flask-SocketIO temporarily disabled due to version conflicts
# from flask_socketio import SocketIO, emit, send
from burnout_analysis import analyze_work_patterns  # Function to calculate burnout scores
from mood_analysis import detect_mood  # Function to detect mood
from database import init_database, save_mood_data, save_suggestion, get_trends_data, get_daily_aggregates  # Database functions

# Import new advanced modules (temporarily disabled for debugging)
ADVANCED_FEATURES = False
# Temporarily disabling advanced features to fix SocketIO issues
print("Advanced features disabled for SocketIO compatibility")

# Advanced imports completely disabled
# try:
#     from advanced_analytics import PredictiveBurnoutAnalysis, SentimentAnalysis as SentimentAnalyzer, TeamAnalytics
#     from smart_notifications import SmartNotificationSystem
#     from gamification import WellnessGamification as GamificationSystem
#     from voice_mood_detection import VoiceMoodDetector, VoiceWellnessAnalyzer
#     # Create alias for backward compatibility
#     VoiceMoodAnalyzer = VoiceWellnessAnalyzer
#     ADVANCED_FEATURES = True
# except ImportError as e:
#     print(f"Advanced features not available: {e}")
#     ADVANCED_FEATURES = False

# Initialize the Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes to allow frontend communication

# Initialize SocketIO - temporarily disabled
# socketio = SocketIO(app, cors_allowed_origins="*")

# Real-time features temporarily disabled due to SocketIO version conflicts

# Initialize advanced systems (temporarily disabled for debugging)
if ADVANCED_FEATURES:
    predictive_analytics = PredictiveBurnoutAnalysis()
    sentiment_analyzer = SentimentAnalyzer()
    team_analytics = TeamAnalytics()
    notification_system = SmartNotificationSystem()
    gamification = GamificationSystem()
    voice_analyzer = VoiceWellnessAnalyzer()
    voice_detector = VoiceMoodDetector()

# Initialize the database when the app starts
init_database()

# Endpoint to calculate and return burnout scores
@app.route('/api/burnout', methods=['GET'])
def burnout_api():
    try:
        # Construct the absolute path to the CSV file
        dir_path = os.path.dirname(os.path.realpath(__file__))
        csv_path = os.path.join(dir_path, 'employee_logs.csv')
        
        # Analyze work patterns from the CSV file
        scores_dict = analyze_work_patterns(csv_path)
        scores = [{'name': name, 'score': score} for name, score in scores_dict.items()]
        return jsonify(scores)  # Return the scores as a JSON response
    except FileNotFoundError:
        error_message = "Error: employee_logs.csv file not found."
        print(error_message)
        return jsonify({"error": error_message}), 500
    except KeyError as e:
        error_message = f"Error: Missing column in CSV file - {e}"
        print(error_message)
        return jsonify({"error": error_message}), 500
    except Exception as e:
        error_message = f"Unexpected error in burnout analysis: {e}"
        print(error_message)
        return jsonify({"error": error_message}), 500

# Endpoint to detect and return an employee's mood
@app.route('/api/mood', methods=['POST'])
def mood_api():
    # Get the employee name from the request JSON
    data = request.json
    name = data.get('name')
    
    # Get current burnout score for this employee
    dir_path = os.path.dirname(os.path.realpath(__file__))
    csv_path = os.path.join(dir_path, 'employee_logs.csv')
    scores_dict = analyze_work_patterns(csv_path)
    burnout_score = scores_dict.get(name, 50)  # Default to 50 if not found
      # Detect the mood (mock implementation)
    mood = detect_mood(name)
    # Save mood and burnout data to database
    save_mood_data(name, burnout_score, mood)
    # Real-time updates temporarily disabled due to SocketIO issues
    print(f"Mood update for {name}: {mood} (burnout: {burnout_score})")
    
    return jsonify({"name": name, "mood": mood, "burnout_score": burnout_score})

# Endpoint to get HR suggestions based on burnout score and mood
@app.route('/api/hr-suggestion', methods=['POST'])
def hr_suggestion_api():
    # Get the burnout score and mood from the request JSON
    data = request.json
    burnout_score = data.get('burnout_score', 0)  # Changed from burnoutScore to burnout_score
    mood = data.get('mood', 'neutral')
    name = data.get('name', 'Employee')
    
    # Generate HR suggestion based on burnout score and mood
    if burnout_score < 60:
        if mood in ['sad', 'angry', 'stressed']:
            suggestion = "Immediate intervention needed - Schedule wellness meeting and consider mental health support"
        else:
            suggestion = "High burnout detected - Recommend time off and workload review"
    elif burnout_score < 80:
        if mood in ['sad', 'stressed']:
            suggestion = "Monitor closely - Consider flexible work arrangements"
        else:
            suggestion = "Moderate risk - Schedule check-in and review workload"
    else:
        if mood == 'happy':
            suggestion = "Great performance - Consider for recognition program"
        else:
            suggestion = "Good performer - Continue regular check-ins"
    
    # Save suggestion to database
    save_suggestion(name, burnout_score, mood, suggestion)
    
    return jsonify({"name": name, "suggestion": suggestion})

# Endpoint to get trends data for the last 7 entries per employee
@app.route('/api/trends', methods=['GET'])
def trends_api():
    try:
        trends_data = get_trends_data()
        daily_aggregates = get_daily_aggregates()
        
        return jsonify({
            "employee_trends": trends_data,
            "daily_aggregates": daily_aggregates
        })
    except Exception as e:
        print(f"Error fetching trends: {e}")
        return jsonify({"error": "Failed to fetch trends data"}), 500

# 🚀 NEW ADVANCED ENDPOINTS

# Real-time dashboard data
@app.route('/api/realtime/dashboard', methods=['GET'])
def realtime_dashboard():
    try:
        if not ADVANCED_FEATURES:
            return jsonify({"error": "Advanced features not available"}), 503
            
        # Get comprehensive dashboard data
        dashboard_data = {
            "active_employees": 25,
            "mood_distribution": {
                "happy": 12,
                "neutral": 8,
                "stressed": 3,
                "tired": 2
            },
            "burnout_alerts": 3,
            "team_wellness_score": 78,
            "trending_concerns": ["workload", "deadlines", "meetings"],
            "recent_activities": [
                {"type": "mood_checkin", "employee": "John D.", "time": "2 min ago"},
                {"type": "wellness_alert", "employee": "Sarah M.", "time": "5 min ago"},
                {"type": "achievement", "employee": "Mike R.", "time": "10 min ago"}
            ]
        }
        
        return jsonify(dashboard_data)
    except Exception as e:
        print(f"Error fetching realtime dashboard: {e}")
        return jsonify({"error": "Failed to fetch dashboard data"}), 500

# Predictive analytics endpoint
@app.route('/api/analytics/predict', methods=['POST'])
def predict_burnout():
    try:
        if not ADVANCED_FEATURES:
            return jsonify({"error": "Advanced features not available"}), 503
            
        data = request.json
        employee_name = data.get('employee_name')
        
        # Get employee data for prediction
        employee_data = {
            'idle_time': data.get('idle_time', 2),
            'meetings_attended': data.get('meetings', 5),
            'login_count': data.get('logins', 3),
            'mood_history': data.get('mood_history', ['neutral']),
            'work_hours': data.get('work_hours', 8),
            'weekend_activity': data.get('weekend_activity', 0)
        }
        
        result = predictive_analytics.calculate_advanced_burnout_score(employee_data)
        
        return jsonify({
            "employee_name": employee_name,
            "prediction": result,
            "risk_level": "high" if result.get('burnout_score', 50) < 40 else "moderate" if result.get('burnout_score', 50) < 70 else "low",
            "recommendations": result.get('recommendations', [])
        })
        
    except Exception as e:
        print(f"Error in predictive analytics: {e}")
        return jsonify({"error": "Failed to generate predictions"}), 500

# Team analytics endpoint
@app.route('/api/analytics/team', methods=['GET'])
def team_analytics_api():
    try:
        print(f"Team analytics called. ADVANCED_FEATURES = {ADVANCED_FEATURES}")
        department = request.args.get('department', 'all')
        
        return jsonify({
            "team_metrics": {
                "average_wellness": 75,
                "at_risk_count": 3,
                "engagement_score": 82,
                "total_employees": 25
            },
            "mood_distribution": {
                "happy": 12,
                "neutral": 8,
                "stressed": 3,
                "tired": 2
            },
            "trends": [
                "Team wellness is stable",
                "Engagement scores trending up",
                "Stress levels within normal range"
            ],
            "alerts": [
                {
                    "type": "wellness_alert",
                    "employee": "Employee X",
                    "message": "Showing signs of burnout - recommend intervention",
                    "severity": "medium"
                }
            ],
            "recommendations": [
                "Schedule team building activities",
                "Review workload distribution",
                "Implement flexible hours"
            ]
        })
        
    except Exception as e:
        print(f"Error in team analytics: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": "Failed to generate team analytics"}), 500

# Smart notifications endpoint
@app.route('/api/notifications/smart', methods=['POST'])
def smart_notifications():
    try:
        if not ADVANCED_FEATURES:
            return jsonify({"error": "Advanced features not available"}), 503
            
        data = request.json
        employee_name = data.get('employee_name')
        mood = data.get('mood')
        burnout_score = data.get('burnout_score', 50)
        
        # Generate smart notifications (fallback implementation)
        notifications = []
        import datetime
        current_time = datetime.datetime.now().isoformat()
        
        if burnout_score < 30:
            notifications.append({
                "type": "critical_alert",
                "priority": 1,
                "title": "🚨 Critical Wellness Alert",
                "message": f"Critical burnout detected for {employee_name}. Immediate intervention required.",
                "actions": ["Schedule immediate meeting", "Contact EAP", "Assign wellness coach"],
                "timestamp": current_time,
                "requires_acknowledgment": True
            })
        elif burnout_score < 60:
            notifications.append({
                "type": "wellness_check",
                "priority": 2,
                "title": "⚠️ Wellness Check Recommended",
                "message": f"Wellness check recommended for {employee_name}. Consider support options.",
                "actions": ["Schedule check-in", "Review workload", "Offer flexible hours"],
                "timestamp": current_time,
                "requires_acknowledgment": False
            })
        elif mood in ['stressed', 'sad', 'angry']:
            notifications.append({
                "type": "mood_support",
                "priority": 3,
                "title": "💙 Mood Support Available",
                "message": f"{employee_name} is experiencing {mood} mood. Support resources available.",
                "actions": ["Send resources", "Offer counseling", "Team check-in"],
                "timestamp": current_time,
                "requires_acknowledgment": False
            })
        else:
            notifications.append({
                "type": "wellness_reminder",
                "priority": 4,
                "title": "🌟 Keep up the great work!",
                "message": f"{employee_name} is maintaining good wellness. Continue positive practices.",
                "actions": ["Send appreciation", "Share success"],
                "timestamp": current_time,
                "requires_acknowledgment": False
            })
        
        return jsonify({
            "notifications": notifications,
            "intervention_level": "immediate" if burnout_score < 30 else "moderate" if burnout_score < 60 else "none"
        })
        
    except Exception as e:
        print(f"Error generating smart notifications: {e}")
        return jsonify({"error": "Failed to generate notifications"}), 500

# Gamification endpoint
@app.route('/api/gamification/profile', methods=['GET'])
def gamification_profile():
    try:
        if not ADVANCED_FEATURES:
            return jsonify({"error": "Advanced features not available"}), 503
            
        employee_name = request.args.get('employee_name', 'Unknown')
        
        # Generate realistic gamification data
        import random
        wellness_score = random.randint(60, 95)
        current_streak = random.randint(0, 15)
        leaderboard_position = random.randint(1, 25)
        
        # Sample achievements
        all_achievements = [
            {"badge": "mood_tracker", "earned_date": "2024-12-01", "description": "Completed 7 mood check-ins"},
            {"badge": "wellness_champion", "earned_date": "2024-12-05", "description": "Maintained high wellness for a week"},
            {"badge": "team_supporter", "earned_date": "2024-12-10", "description": "Helped team members with wellness tips"}
        ]
        
        # Randomly select some achievements
        num_achievements = random.randint(0, len(all_achievements))
        achievements = random.sample(all_achievements, num_achievements)
        
        return jsonify({
            "employee_name": employee_name,
            "wellness_score": wellness_score,
            "current_streak": current_streak,
            "achievements": achievements,
            "next_badge": {
                "badge": "resilience_star",
                "name": "Resilience Star", 
                "description": "Handle stress effectively for 2 weeks"
            },
            "leaderboard_position": leaderboard_position
        })
        
    except Exception as e:
        print(f"Error fetching gamification profile: {e}")
        return jsonify({"error": "Failed to fetch profile"}), 500

# Voice mood analysis endpoint
@app.route('/api/voice/analyze', methods=['POST'])
def analyze_voice_mood():
    try:
        if not ADVANCED_FEATURES:
            return jsonify({"error": "Advanced features not available"}), 503

        # Get audio file from request
        if 'audio' not in request.files:
            return jsonify({"error": "No audio file provided"}), 400

        audio_file = request.files['audio']
        employee_name = request.form.get('employee_name', 'unknown')

        if audio_file.filename == '':
            return jsonify({"error": "Empty audio file"}), 400        # Save the audio file temporarily
        import tempfile
        with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as temp_file:
            audio_file.save(temp_file.name)
            temp_path = temp_file.name
        
        try:
            # Analyze voice mood - fallback implementation since advanced features may not be available
            if ADVANCED_FEATURES and hasattr(voice_analyzer, 'analyze_wellness_indicators'):
                wellness_analysis = voice_analyzer.analyze_wellness_indicators(temp_path, employee_name)
                audio_features = voice_detector.analyze_audio_features(temp_path)
                mood_prediction = voice_detector.predict_mood_from_features(audio_features)
            else:
                # Fallback mock analysis
                wellness_analysis = {
                    "wellness_score": 75,
                    "stress_indicators": ["normal speech rate", "stable pitch"],
                    "recommendations": ["Continue current wellness practices"]
                }
                audio_features = {
                    "pitch_std": 25.0,
                    "estimated_speaking_rate": 4.2,
                    "avg_energy": 0.6
                }
                mood_prediction = {
                    "mood": "neutral",
                    "confidence": 0.7
                }
            
            # Combine results
            result = {
                "detected_mood": mood_prediction.get('mood', 'neutral'),
                "confidence": mood_prediction.get('confidence', 0.5),
                "audio_quality": "good",
                "processing_time": 2.3,
                "features": {
                    "pitch_variance": audio_features.get('pitch_std', 0) / 100,
                    "speaking_rate": audio_features.get('estimated_speaking_rate', 4.0),
                    "energy_level": audio_features.get('avg_energy', 0.5)
                },
                "wellness_analysis": wellness_analysis,
                "employee_name": employee_name
            }

            return jsonify(result)

        finally:
            # Clean up temporary file
            try:
                os.remove(temp_path)
            except:
                pass

    except Exception as e:
        print(f"Error analyzing voice mood: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": f"Failed to analyze voice mood: {str(e)}"}), 500

# Real-time analytics feed endpoint
@app.route('/api/analytics/realtime-feed', methods=['GET'])
def realtime_analytics_feed():
    try:
        import random
        from datetime import datetime, timedelta
        
        # Generate realistic real-time activities
        employees = ['Sarah M.', 'John D.', 'Mike R.', 'Lisa K.', 'Tom W.', 'Emma S.', 'David P.', 'Anna L.']
        activities = []
        
        # Generate activities for the last 2 hours
        now = datetime.now()
        for i in range(15):  # Generate 15 recent activities
            activity_time = now - timedelta(minutes=random.randint(1, 120))
            activity_types = [
                'mood_checkin', 'wellness_alert', 'achievement', 'stress_spike', 
                'team_collaboration', 'break_taken', 'overtime_detected', 'positive_feedback'
            ]
            
            activity = {
                'id': f'activity_{i}_{int(activity_time.timestamp())}',
                'type': random.choice(activity_types),
                'employee': random.choice(employees),
                'timestamp': activity_time.isoformat(),
                'time_ago': f"{random.randint(1, 120)} min ago",
                'details': generate_activity_details(random.choice(activity_types)),
                'severity': random.choice(['low', 'medium', 'high']),
                'actionable': random.choice([True, False])
            }
            activities.append(activity)
        
        # Sort by timestamp (most recent first)
        activities.sort(key=lambda x: x['timestamp'], reverse=True)
        
        # Generate current analytics summary
        analytics_summary = {
            'total_activities': len(activities),
            'alerts_count': len([a for a in activities if a['severity'] in ['high', 'critical']]),
            'positive_activities': len([a for a in activities if a['type'] in ['achievement', 'positive_feedback', 'team_collaboration']]),
            'trend_analysis': {
                'stress_trend': random.choice(['increasing', 'stable', 'decreasing']),
                'mood_trend': random.choice(['improving', 'stable', 'declining']),
                'engagement_trend': random.choice(['rising', 'steady', 'falling'])
            },
            'predictions': generate_real_time_predictions(),
            'timestamp': now.isoformat()
        }
        
        return jsonify({
            'activities': activities,
            'summary': analytics_summary,
            'last_updated': now.isoformat()
        })
        
    except Exception as e:
        print(f"Error in realtime analytics feed: {e}")
        return jsonify({"error": "Failed to fetch real-time analytics"}), 500

def generate_activity_details(activity_type):
    """Generate realistic activity details"""
    details_map = {
        'mood_checkin': 'Completed daily mood assessment',
        'wellness_alert': 'Stress levels exceeded threshold',
        'achievement': 'Completed wellness milestone',
        'stress_spike': 'Sudden stress increase detected',
        'team_collaboration': 'Participated in team wellness activity',
        'break_taken': 'Took recommended wellness break',
        'overtime_detected': 'Working beyond recommended hours',
        'positive_feedback': 'Received positive wellness feedback'
    }
    return details_map.get(activity_type, 'Unknown activity')

def generate_real_time_predictions():
    """Generate real-time AI predictions"""
    import random
    
    predictions = []
    
    # Risk predictions
    if random.random() > 0.3:
        predictions.append({
            'type': 'burnout_risk',
            'message': 'Elevated burnout risk detected in 2 employees',
            'confidence': random.randint(70, 95),
            'action_required': True
        })
    
    # Positive predictions
    if random.random() > 0.4:
        predictions.append({
            'type': 'engagement_boost',
            'message': 'Team engagement likely to improve this week',
            'confidence': random.randint(65, 85),
            'action_required': False
        })
    
    # Trend predictions
    predictions.append({
        'type': 'trend_analysis',
        'message': f'Wellness score trending {random.choice(["upward", "stable", "downward"])}',
        'confidence': random.randint(60, 90),
        'action_required': False
    })
    
    return predictions

# Enhanced team analytics with real-time data
@app.route('/api/analytics/team-realtime', methods=['GET'])
def team_analytics_realtime():
    try:
        import random
        from datetime import datetime, timedelta
        
        # Generate comprehensive team analytics
        team_data = {
            'overview': {
                'total_employees': 25,
                'active_today': random.randint(20, 25),
                'wellness_score': random.randint(65, 85),
                'trend_direction': random.choice(['up', 'stable', 'down']),
                'last_updated': datetime.now().isoformat()
            },
            'mood_distribution': {
                'happy': random.randint(8, 15),
                'neutral': random.randint(5, 10),
                'stressed': random.randint(1, 5),
                'tired': random.randint(1, 4),
                'anxious': random.randint(0, 3)
            },
            'department_breakdown': {
                'Engineering': {'wellness': random.randint(70, 90), 'count': 8},
                'Marketing': {'wellness': random.randint(60, 85), 'count': 5},
                'Sales': {'wellness': random.randint(65, 80), 'count': 6},
                'HR': {'wellness': random.randint(75, 95), 'count': 3},
                'Design': {'wellness': random.randint(70, 85), 'count': 3}
            },
            'real_time_insights': [
                'Team collaboration scores increased by 12% this week',
                'Stress levels are 15% lower than last month',
                'Remote work satisfaction remains high at 87%',
                'Wellness program participation up 23%'
            ],
            'action_items': [
                'Schedule wellness workshop for Marketing team',
                'Implement flexible hours for Engineering team',
                'Recognize high performers in Sales team'
            ],
            'hourly_activity': generate_hourly_activity_data()
        }
        
        return jsonify(team_data)
        
    except Exception as e:
        print(f"Error in team analytics realtime: {e}")
        return jsonify({"error": "Failed to fetch team analytics"}), 500

def generate_hourly_activity_data():
    """Generate hourly activity data for the dashboard"""
    import random
    from datetime import datetime, timedelta
    
    hourly_data = []
    now = datetime.now()
    
    for i in range(24):  # Last 24 hours
        hour_time = now - timedelta(hours=i)
        hourly_data.append({
            'hour': hour_time.strftime('%H:00'),
            'timestamp': hour_time.isoformat(),
            'mood_checkins': random.randint(0, 8),
            'stress_level': random.randint(20, 80),
            'activity_count': random.randint(5, 25),
            'alerts': random.randint(0, 3)
        })
    
    return hourly_data[::-1]  # Reverse to show chronological order

# WebSocket events for real-time updates (temporarily disabled)
# Note: SocketIO handlers disabled due to version conflicts
"""
@socketio.on('connect')
def handle_connect():
    print('Client connected to real-time updates')

@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected from real-time updates')

@socketio.on('subscribe')
def handle_subscribe(data):
    employee_name = data.get('employee_name')
    print(f'Subscribed {employee_name} to real-time updates')

@socketio.on('realtime_mood_update')
def handle_realtime_mood_update(data):
    # Real-time broadcasting temporarily disabled
    print("Real-time mood update received but SocketIO disabled")
    
    # Check for alerts and notifications
    if ADVANCED_FEATURES:
        employee_name = data.get('employee_name')
        mood = data.get('mood')
        burnout_score = data.get('burnout_score', 50)
        
        # Generate basic notifications (fallback)
        notifications = []
        if burnout_score < 30:
            notifications.append({
                "type": "critical_alert",
                "message": f"Critical burnout alert for {employee_name}",
                "priority": "high"
            })
        
        print(f"Generated notifications for {employee_name}: {notifications}")
"""
if __name__ == '__main__':
    # SocketIO temporarily disabled, using regular Flask
    app.run(debug=True, host='0.0.0.0', port=5000)
