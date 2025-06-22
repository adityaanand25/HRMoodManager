# Import necessary libraries
from flask import Flask, request, jsonify  # Flask for building the API
from flask_cors import CORS  # CORS to allow cross-origin requests from the frontend
from burnout_analysis import analyze_work_patterns  # Function to calculate burnout scores
from mood_analysis import detect_mood  # Function to detect mood
from database import init_database, save_mood_data, save_suggestion, get_trends_data, get_daily_aggregates  # Database functions

# Initialize the Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes to allow frontend communication

# Initialize the database when the app starts
init_database()

# Endpoint to calculate and return burnout scores
@app.route('/api/burnout', methods=['GET'])
def burnout_api():
    # Analyze work patterns from the CSV file
    scores_dict = analyze_work_patterns('employee_logs.csv')
    scores = [{'name': name, 'score': score} for name, score in scores_dict.items()]
    return jsonify(scores)  # Return the scores as a JSON response

# Endpoint to detect and return an employee's mood
@app.route('/api/mood', methods=['POST'])
def mood_api():
    # Get the employee name from the request JSON
    data = request.json
    name = data.get('name')
    
    # Get current burnout score for this employee
    scores_dict = analyze_work_patterns('employee_logs.csv')
    burnout_score = scores_dict.get(name, 50)  # Default to 50 if not found
    
    # Detect the mood (mock implementation)
    mood = detect_mood(name)
    
    # Save mood and burnout data to database
    save_mood_data(name, burnout_score, mood)
    
    return jsonify({"name": name, "mood": mood, "burnout_score": burnout_score})  # Return the name, mood, and burnout score

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

# Run the Flask app in debug mode for development
if __name__ == '__main__':
    app.run(debug=True)
