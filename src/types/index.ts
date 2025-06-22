export interface Employee {
  id: string;
  name: string;
  department: string;
  email: string;
  moodScore: number;
  burnoutRisk: 'Low' | 'Medium' | 'High';
  lastCheckIn: string;
  emotion: string;
  emoji: string;
}

export interface DashboardStats {
  totalEmployees: number;
  atRiskEmployees: number;
  averageMoodScore: number;
  burnoutAlerts: number;
}

export interface User {
  name: string;
  role: 'HR' | 'Admin';
  email: string;
}

export interface MoodData {
  date: string;
  score: number;
}