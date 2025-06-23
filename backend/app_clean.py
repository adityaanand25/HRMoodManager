# Clean Flask App without SocketIO issues
import os
from datetime import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS
from burnout_analysis import analyze_work_patterns
from mood_analysis import detect_mood
from database import init_database, save_mood_data, save_suggestion, get_trends_data, get_daily_aggregates

# Initialize the Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes to allow frontend communication

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
    
    print(f"Mood update for {name}: {mood} (burnout: {burnout_score})")
    
    return jsonify({"name": name, "mood": mood, "burnout_score": burnout_score})

# Endpoint to get HR suggestions based on burnout score and mood
@app.route('/api/hr-suggestion', methods=['POST'])
def hr_suggestion_api():
    # Get the burnout score and mood from the request JSON
    data = request.json
    burnout_score = data.get('burnout_score', 0)
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
    
    return jsonify({"suggestion": suggestion})

# Endpoint to get mood trends
@app.route('/api/trends', methods=['GET'])
def trends_api():
    try:
        trends = get_trends_data()
        return jsonify(trends)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Endpoint to get daily aggregates
@app.route('/api/daily-aggregates', methods=['GET'])
def daily_aggregates_api():
    try:
        aggregates = get_daily_aggregates()
        return jsonify(aggregates)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Run the Flask application
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
