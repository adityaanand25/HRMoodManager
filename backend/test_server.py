#!/usr/bin/env python3
"""
Simple test server to isolate the burnout endpoint issue
"""
import os
import random
from flask import Flask, jsonify, request
from flask_cors import CORS
from burnout_analysis import analyze_work_patterns

app = Flask(__name__)
CORS(app)

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

@app.route('/api/mood', methods=['POST'])
def mood_api():
    try:
        data = request.json
        name = data.get('name', 'Employee')
        
        # Simulate mood detection
        moods = ['happy', 'calm', 'focused', 'stressed', 'tired', 'excited', 'neutral']
        mood = random.choice(moods)
        
        # Get burnout score for this employee if available
        try:
            dir_path = os.path.dirname(os.path.realpath(__file__))
            csv_path = os.path.join(dir_path, 'employee_logs.csv')
            scores_dict = analyze_work_patterns(csv_path)
            burnout_score = scores_dict.get(name, random.randint(30, 90))
        except:
            burnout_score = random.randint(30, 90)
        
        return jsonify({
            "name": name,
            "mood": mood,
            "burnout_score": burnout_score
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/hr-suggestion', methods=['POST'])
def hr_suggestion_api():
    try:
        data = request.json
        name = data.get('name', 'Employee')
        burnout_score = data.get('burnout_score', 70)
        mood = data.get('mood', 'neutral')
        
        # Generate suggestion based on burnout score and mood
        if burnout_score < 60:
            if mood in ['sad', 'angry', 'stressed']:
                suggestion = "Immediate intervention needed - Schedule wellness meeting and mental health support"
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
        
        return jsonify({
            "name": name,
            "suggestion": suggestion,
            "burnout_score": burnout_score,
            "mood": mood
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/test', methods=['GET'])
def test():
    return jsonify({"message": "Test endpoint working"})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)
