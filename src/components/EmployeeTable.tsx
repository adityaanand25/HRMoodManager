import React from 'react';
import { MessageCircle, Calendar, Gift } from 'lucide-react';
import { Employee } from '../types';

interface EmployeeTableProps {
  employees: Employee[];
}

export const EmployeeTable: React.FC<EmployeeTableProps> = ({ employees }) => {
  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'High': return 'bg-red-100 text-red-800 border-red-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSuggestedAction = (risk: string) => {
    switch (risk) {
      case 'High': return { icon: MessageCircle, text: 'Schedule Talk', color: 'bg-red-600 hover:bg-red-700' };
      case 'Medium': return { icon: Calendar, text: 'Time Off', color: 'bg-yellow-600 hover:bg-yellow-700' };
      case 'Low': return { icon: Gift, text: 'Appreciation', color: 'bg-green-600 hover:bg-green-700' };
      default: return { icon: MessageCircle, text: 'Check In', color: 'bg-gray-600 hover:bg-gray-700' };
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Employee Wellness Overview</h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Employee
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Department
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Mood Score
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Burnout Risk
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Check-in
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {employees.map((employee) => {
              const action = getSuggestedAction(employee.burnoutRisk);
              const ActionIcon = action.icon;
              
              return (
                <tr key={employee.id} className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-medium text-sm">
                        {employee.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                        <div className="text-sm text-gray-500">{employee.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {employee.department}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{employee.emoji}</span>
                      <span className="text-sm font-medium text-gray-900">{employee.moodScore}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getRiskColor(employee.burnoutRisk)}`}>
                      {employee.burnoutRisk}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {employee.lastCheckIn}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button className={`inline-flex items-center px-3 py-1.5 text-xs font-medium text-white rounded-lg transition-colors duration-200 ${action.color}`}>
                      <ActionIcon size={14} className="mr-1" />
                      {action.text}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};