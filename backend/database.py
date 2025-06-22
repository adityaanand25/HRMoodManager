import sqlite3
from datetime import datetime
import os

# Database file path
DB_PATH = 'employee_data.db'

def init_database():
    """Initialize the SQLite database with required tables."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Create employee_moods table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS employee_moods (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            burnout_score INTEGER NOT NULL,
            mood TEXT NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Create suggestions table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS suggestions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            burnout_score INTEGER NOT NULL,
            mood TEXT NOT NULL,
            suggestion TEXT NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    conn.commit()
    conn.close()
    print("Database initialized successfully!")

def save_mood_data(name, burnout_score, mood):
    """Save mood and burnout data to the database."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute('''
        INSERT INTO employee_moods (name, burnout_score, mood, timestamp)
        VALUES (?, ?, ?, ?)
    ''', (name, burnout_score, mood, datetime.now()))
    
    conn.commit()
    conn.close()

def save_suggestion(name, burnout_score, mood, suggestion):
    """Save HR suggestion to the database."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute('''
        INSERT INTO suggestions (name, burnout_score, mood, suggestion, timestamp)
        VALUES (?, ?, ?, ?, ?)
    ''', (name, burnout_score, mood, suggestion, datetime.now()))
    
    conn.commit()
    conn.close()

def get_trends_data():
    """Get the last 7 entries per employee for trends analysis."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Get last 7 entries per employee
    cursor.execute('''
        SELECT name, burnout_score, mood, timestamp 
        FROM employee_moods 
        WHERE id IN (
            SELECT id FROM employee_moods em1
            WHERE (
                SELECT COUNT(*) FROM employee_moods em2
                WHERE em2.name = em1.name AND em2.timestamp >= em1.timestamp
            ) <= 7
        )
        ORDER BY name, timestamp DESC
    ''')
    
    results = cursor.fetchall()
    conn.close()
    
    # Format the results
    trends_data = {}
    for row in results:
        name, burnout_score, mood, timestamp = row
        if name not in trends_data:
            trends_data[name] = []
        trends_data[name].append({
            'burnout_score': burnout_score,
            'mood': mood,
            'timestamp': timestamp
        })
    
    return trends_data

def get_daily_aggregates():
    """Get aggregated average burnout & mood per day."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT DATE(timestamp) as date, 
               AVG(burnout_score) as avg_burnout,
               COUNT(*) as total_entries,
               GROUP_CONCAT(mood) as moods
        FROM employee_moods 
        WHERE DATE(timestamp) >= DATE('now', '-7 days')
        GROUP BY DATE(timestamp)
        ORDER BY date DESC
    ''')
    
    results = cursor.fetchall()
    conn.close()
    
    daily_data = []
    for row in results:
        date, avg_burnout, total_entries, moods = row
        mood_list = moods.split(',') if moods else []
        mood_counts = {}
        for mood in mood_list:
            mood_counts[mood] = mood_counts.get(mood, 0) + 1
        
        # Find most common mood
        most_common_mood = max(mood_counts, key=mood_counts.get) if mood_counts else 'neutral'
        
        daily_data.append({
            'date': date,
            'avg_burnout': round(avg_burnout, 1),
            'total_entries': total_entries,
            'most_common_mood': most_common_mood,
            'mood_distribution': mood_counts
        })
    
    return daily_data

# Initialize database when module is imported
if __name__ == '__main__':
    init_database()
