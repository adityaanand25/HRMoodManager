import React, { useState, useEffect } from 'react';
import { getBurnoutScores, getMood, getHRSuggestion } from '../services/api';

interface EmployeeData {
  name: string;
  score: number;
  mood?: string;
  suggestion?: string;
  isCheckingMood?: boolean;
  isGettingSuggestion?: boolean;
}

interface EmployeeDashboardTableProps {
  onOpenMoodModal?: (employeeName: string, onMoodDetected: (mood: string) => void) => void;
}

export const EmployeeDashboardTable: React.FC<EmployeeDashboardTableProps> = ({ onOpenMoodModal }) => {
  const [employees, setEmployees] = useState<EmployeeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEmployeeData();
  }, []);

  const fetchEmployeeData = async () => {
    try {
      setLoading(true);
      setError(null);
      const scores = await getBurnoutScores();
      
      // Handle case where scores might be an object or array
      const scoresArray = Array.isArray(scores) ? scores : Object.values(scores);
      setEmployees(scoresArray.map((emp: any) => ({
        name: emp.name,
        score: emp.score || 0,
        mood: undefined,
        suggestion: undefined,
        isCheckingMood: false,
        isGettingSuggestion: false,
      })));
    } catch (err) {
      setError('Failed to fetch employee data');
      console.error('Error fetching employee data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckMood = async (employeeName: string, index: number) => {
    try {
      // Update state to show loading
      setEmployees(prev => prev.map((emp, i) => 
        i === index ? { ...emp, isCheckingMood: true } : emp
      ));

      const moodResult = await getMood(employeeName);
      
      // Update employee with mood
      setEmployees(prev => prev.map((emp, i) => 
        i === index ? { 
          ...emp, 
          mood: moodResult.mood, 
          isCheckingMood: false 
        } : emp
      ));

      // Automatically get HR suggestion after mood is detected
      await getHRSuggestionForEmployee(employeeName, index, moodResult.mood);
      
    } catch (error) {
      console.error('Error checking mood:', error);
      setEmployees(prev => prev.map((emp, i) => 
        i === index ? { ...emp, isCheckingMood: false } : emp
      ));
    }
  };

  const getHRSuggestionForEmployee = async (employeeName: string, index: number, mood: string) => {
    try {
      const employee = employees[index];
      
      // Update state to show loading
      setEmployees(prev => prev.map((emp, i) => 
        i === index ? { ...emp, isGettingSuggestion: true } : emp
      ));

      const suggestionResult = await getHRSuggestion(employeeName, employee.score, mood);
      
      // Update employee with suggestion
      setEmployees(prev => prev.map((emp, i) => 
        i === index ? { 
          ...emp, 
          suggestion: suggestionResult.suggestion, 
          isGettingSuggestion: false 
        } : emp
      ));
      
    } catch (error) {
      console.error('Error getting HR suggestion:', error);
      setEmployees(prev => prev.map((emp, i) => 
        i === index ? { ...emp, isGettingSuggestion: false } : emp
      ));
    }
  };

  const getBurnoutScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800 border-green-200';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  const getBurnoutScoreEmoji = (score: number) => {
    if (score >= 80) return '🟢';
    if (score >= 60) return '🟡';
    return '🔴';
  };

  const getMoodEmoji = (mood: string) => {
    switch (mood) {
      case 'happy': return '😊';
      case 'sad': return '😢';
      case 'stressed': return '😰';
      case 'angry': return '😠';
      default: return '😐';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex space-x-4">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/6"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="text-center">
          <div className="text-red-500 text-lg mb-2">⚠️ Error</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={fetchEmployeeData}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Employee Dashboard</h3>
        <p className="text-sm text-gray-500 mt-1">Monitor burnout scores, mood, and get HR recommendations</p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Employee Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Burnout Score
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Current Mood
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Suggested HR Action
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {employees.map((employee, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-medium text-sm">
                      {employee.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                    </div>
                  </div>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{getBurnoutScoreEmoji(employee.score)}</span>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getBurnoutScoreColor(employee.score)}`}>
                      {employee.score}%
                    </span>
                  </div>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  {employee.mood ? (
                    <div className="flex items-center space-x-2">
                      <span className="text-xl">{getMoodEmoji(employee.mood)}</span>
                      <span className="text-sm font-medium text-gray-900 capitalize">{employee.mood}</span>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400">Not checked</span>
                  )}
                </td>
                
                <td className="px-6 py-4">
                  {employee.isGettingSuggestion ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      <span className="text-sm text-gray-500">Getting suggestion...</span>
                    </div>
                  ) : employee.suggestion ? (
                    <div className="max-w-xs">
                      <p className="text-sm text-gray-900">{employee.suggestion}</p>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400">Check mood first</span>
                  )}
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleCheckMood(employee.name, index)}
                    disabled={employee.isCheckingMood}
                    className={`inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg transition-colors duration-200 ${
                      employee.isCheckingMood
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    {employee.isCheckingMood ? (
                      <>
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                        Checking...
                      </>
                    ) : (
                      'Check Mood'
                    )}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {employees.length === 0 && !loading && (
        <div className="p-6 text-center">
          <p className="text-gray-500">No employee data available</p>
        </div>
      )}
    </div>
  );
};
