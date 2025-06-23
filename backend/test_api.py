#!/usr/bin/env python3
"""Simple test script to test API endpoints without SocketIO"""

from flask import Flask, jsonify
from flask_cors import CORS
import os
from burnout_analysis import analyze_work_patterns

app = Flask(__name__)
CORS(app)

@app.route('/api/test', methods=['GET'])
def test_api():
    return jsonify({"status": "OK", "message": "Test endpoint working"})

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
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)
