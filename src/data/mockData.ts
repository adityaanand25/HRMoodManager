import { Employee, DashboardStats, MoodData } from '../types';

export const mockEmployees: Employee[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    department: 'Engineering',
    email: 'sarah.johnson@company.com',
    moodScore: 85,
    burnoutRisk: 'Low',
    lastCheckIn: '2 hours ago',
    emotion: 'Happy',
    emoji: '😊'
  },
  {
    id: '2',
    name: 'Michael Chen',
    department: 'Marketing',
    email: 'michael.chen@company.com',
    moodScore: 45,
    burnoutRisk: 'High',
    lastCheckIn: '1 day ago',
    emotion: 'Stressed',
    emoji: '😰'
  },
  {
    id: '3',
    name: 'Emily Rodriguez',
    department: 'Design',
    email: 'emily.rodriguez@company.com',
    moodScore: 72,
    burnoutRisk: 'Medium',
    lastCheckIn: '30 minutes ago',
    emotion: 'Neutral',
    emoji: '😐'
  },
  {
    id: '4',
    name: 'David Kim',
    department: 'Sales',
    email: 'david.kim@company.com',
    moodScore: 91,
    burnoutRisk: 'Low',
    lastCheckIn: '1 hour ago',
    emotion: 'Excited',
    emoji: '🤗'
  },
  {
    id: '5',
    name: 'Lisa Thompson',
    department: 'HR',
    email: 'lisa.thompson@company.com',
    moodScore: 38,
    burnoutRisk: 'High',
    lastCheckIn: '3 hours ago',
    emotion: 'Tired',
    emoji: '😴'
  },
  {
    id: '6',
    name: 'James Wilson',
    department: 'Engineering',
    email: 'james.wilson@company.com',
    moodScore: 67,
    burnoutRisk: 'Medium',
    lastCheckIn: '45 minutes ago',
    emotion: 'Focused',
    emoji: '🤔'
  }
];

export const dashboardStats: DashboardStats = {
  totalEmployees: 156,
  atRiskEmployees: 23,
  averageMoodScore: 73,
  burnoutAlerts: 8
};

export const moodTrendData: MoodData[] = [
  { date: 'Mon', score: 78 },
  { date: 'Tue', score: 82 },
  { date: 'Wed', score: 75 },
  { date: 'Thu', score: 71 },
  { date: 'Fri', score: 85 },
  { date: 'Sat', score: 88 },
  { date: 'Sun', score: 79 }
];