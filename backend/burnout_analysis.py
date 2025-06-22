import pandas as pd  # Library for data manipulation and analysis

def analyze_work_patterns(file_path):
    """
    Reads a CSV file and calculates burnout scores for employees.

    Parameters:
        file_path (str): Path to the CSV file containing employee logs.

    Returns:
        dict: A dictionary with employee names as keys and burnout scores as values.
    """
    # Read the CSV file into a DataFrame
    df = pd.read_csv(file_path)
    burnout_scores = {}

    # Calculate burnout scores based on idle time, meetings attended, and login count
    for _, row in df.iterrows():
        idle = row['idle_time']
        meetings = row['meetings_attended']
        logins = row['login_count']
        score = 100 - (idle * 2 + (5 - meetings) * 3 + (3 - logins) * 4)
        burnout_scores[row['name']] = max(0, min(100, score))  # Ensure score is between 0 and 100

    return burnout_scores
