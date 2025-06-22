import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:5000/api';

export const getBurnoutScores = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/burnout`);
    return response.data;
  } catch (error) {
    console.error('Error fetching burnout scores:', error);
    throw error;
  }
};

export const getMood = async (name: string) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/mood`, { name });
    return response.data;
  } catch (error) {
    console.error('Error fetching mood:', error);
    throw error;
  }
};

export const getHRSuggestion = async (name: string, burnout_score: number, mood: string) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/hr-suggestion`, { 
      name, 
      burnout_score, 
      mood 
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching HR suggestion:', error);
    throw error;
  }
};

export const getTrends = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/trends`);
    return response.data;
  } catch (error) {
    console.error('Error fetching trends:', error);
    throw error;
  }
};