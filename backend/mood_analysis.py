import random  # Library for generating random choices

def detect_mood(name):
    """
    Randomly selects a mood for the given employee name.

    Parameters:
        name (str): The name of the employee.

    Returns:
        str: A randomly selected mood (happy, sad, stressed, angry).
    """
    moods = ['happy', 'sad', 'stressed', 'angry']  # List of possible moods
    return random.choice(moods)  # Randomly select and return a mood
