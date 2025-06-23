#!/usr/bin/env python3
"""
Simple test server to isolate the burnout endpoint issue
"""
import os
from flask import Flask, jsonify
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

@app.route('/api/test', methods=['GET'])
def test():
    return jsonify({"message": "Test endpoint working"})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)
