#!/usr/bin/env python3

import os
import sys

# Add the backend directory to Python path
backend_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, backend_dir)

try:
    from burnout_analysis import analyze_work_patterns
    
    # Test the burnout analysis function
    csv_path = os.path.join(backend_dir, 'employee_logs.csv')
    print(f"Testing burnout analysis with CSV: {csv_path}")
    
    if not os.path.exists(csv_path):
        print(f"ERROR: CSV file not found at {csv_path}")
        sys.exit(1)
    
    print("Calling analyze_work_patterns...")
    scores_dict = analyze_work_patterns(csv_path)
    print(f"Success! Got scores: {scores_dict}")
    
    # Convert to list format like the API does
    scores = [{'name': name, 'score': score} for name, score in scores_dict.items()]
    print(f"API format: {scores}")
    
except Exception as e:
    print(f"ERROR: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
