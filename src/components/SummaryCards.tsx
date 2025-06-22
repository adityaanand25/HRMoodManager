import React from 'react';
import { Users, AlertTriangle, Heart, TrendingUp } from 'lucide-react';
import { DashboardStats } from '../types';

interface SummaryCardsProps {
  stats: DashboardStats;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ stats }) => {
  const cards = [
    {
      title: 'Total Employees',
      value: stats.totalEmployees,
      icon: Users,
      color: 'blue',
      gradient: 'from-blue-500 to-blue-600'
    },
    {
      title: 'At-Risk Employees',
      value: stats.atRiskEmployees,
      icon: AlertTriangle,
      color: 'orange',
      gradient: 'from-orange-500 to-red-500'
    },
    {
      title: 'Average Mood Score',
      value: `${stats.averageMoodScore}%`,
      icon: Heart,
      color: 'green',
      gradient: 'from-green-500 to-emerald-600'
    },
    {
      title: 'Burnout Alerts',
      value: stats.burnoutAlerts,
      icon: TrendingUp,
      color: 'purple',
      gradient: 'from-purple-500 to-purple-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card, index) => (
        <div
          key={index}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">{card.title}</p>
              <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            </div>
            <div className={`w-12 h-12 bg-gradient-to-br ${card.gradient} rounded-lg flex items-center justify-center`}>
              <card.icon size={24} className="text-white" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};