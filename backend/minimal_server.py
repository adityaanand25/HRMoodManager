from flask import Flask, jsonify, request
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)

@app.route('/api/burnout', methods=['GET'])
def burnout_api():
    # Simple mock data for testing
    scores = [
        {'name': 'Alice', 'score': 81.0},
        {'name': 'Bob', 'score': 75.0},
        {'name': 'Charlie', 'score': 98.0},
        {'name': 'Diana', 'score': 86.6},
        {'name': 'Eve', 'score': 96.4}
    ]
    return jsonify(scores)

@app.route('/api/mood', methods=['POST'])
def mood_api():
    return jsonify({"name": "Test", "mood": "happy", "burnout_score": 75})

@app.route('/api/hr-suggestion', methods=['POST'])
def hr_suggestion_api():
    return jsonify({"suggestion": "Great performance - Continue current work patterns"})

@app.route('/api/gamification/profile', methods=['GET'])
def gamification_profile_api():
    employee_name = request.args.get('employee_name', 'Unknown')
    mock_data = {
        "employee_name": employee_name,
        "wellness_score": 88,
        "current_streak": 14,
        "achievements": [
            {"badge": "mood_tracker", "earned_date": "2025-06-15", "description": "Tracked mood for 7 consecutive days."},
            {"badge": "team_supporter", "earned_date": "2025-06-20", "description": "Provided positive feedback to 3 colleagues."}
        ],
        "next_badge": {
            "badge": "consistency_champion",
            "name": "Consistency Champion",
            "description": "Maintain a wellness score above 80 for 30 days."
        },
        "leaderboard_position": 5
    }
    return jsonify(mock_data)

if __name__ == '__main__':
    print("Starting minimal Flask server...")
    app.run(debug=True, host='0.0.0.0', port=5002)
