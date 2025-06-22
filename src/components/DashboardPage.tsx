import React, { useState } from 'react';
import { Navigation } from './Navigation';
import { SummaryCards } from './SummaryCards';
import { MoodChart } from './MoodChart';
import { QuietQuitDetector } from './QuietQuitDetector';
import { EmployeeDashboardTable } from './EmployeeDashboardTableNew';
import { User } from '../types';
import { dashboardStats, moodTrendData } from '../data/mockData';

interface DashboardPageProps {
  user: User;
  onLogout: () => void;
  onOpenCheckIn: () => void;
}

interface EmployeeData {
  name: string;
  score: number;
  mood?: string;
  suggestion?: string;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ user, onLogout, onOpenCheckIn }) => {
  const [employeeData, setEmployeeData] = useState<EmployeeData[]>([]);

  // Calculate dynamic stats from real employee data
  const getDynamicStats = () => {
    if (employeeData.length === 0) return dashboardStats;

    const totalEmployees = employeeData.length;
    const atRiskEmployees = employeeData.filter(emp => emp.score < 60).length;
    const averageBurnoutScore = Math.round(
      employeeData.reduce((sum, emp) => sum + emp.score, 0) / totalEmployees
    );
    const burnoutAlerts = employeeData.filter(emp => emp.score < 40).length;

    return {
      totalEmployees,
      atRiskEmployees,
      averageMoodScore: averageBurnoutScore, // Using burnout score as mood score for now
      burnoutAlerts
    };
  };

  const handleEmployeeDataUpdate = (employees: EmployeeData[]) => {
    setEmployeeData(employees);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation user={user} onLogout={onLogout} onOpenCheckIn={onOpenCheckIn} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome back, {user.name}
          </h2>
          <p className="text-gray-600">
            Here's what's happening with your team's wellness today.
          </p>
        </div>

        <SummaryCards stats={getDynamicStats()} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <MoodChart data={moodTrendData} title="Team Mood Trends (7 Days)" />
          <QuietQuitDetector />
        </div>

        <div className="mb-8">
          <EmployeeDashboardTable onDataUpdate={handleEmployeeDataUpdate} />
        </div>
      </main>
    </div>
  );
};