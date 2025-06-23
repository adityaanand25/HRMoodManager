import React, { useState, useEffect } from 'react';
import { getBurnoutScores, getMood } from '../services/api';

interface Employee {
  name: string;
  score: number;
  mood?: string;
  suggestion?: string;
  isCheckingMood?: boolean;
}

export const EmployeeDashboard: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch burnout scores on component mount
  useEffect(() => {
    fetchEmployees();
    
    // Set up auto-refresh every 30 seconds
    const interval = setInterval(fetchEmployees, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const scores = await getBurnoutScores();
      
      // Transform API response to Employee array
      const employeeList = Array.isArray(scores) 
        ? scores.map((emp: any) => ({
            name: emp.name,
            score: emp.score,
            mood: undefined,
            suggestion: undefined,
            isCheckingMood: false
          }))
        : [];
      
      setEmployees(employeeList);
      setError(null);
    } catch (err) {
      console.error('Error fetching employees:', err);
      setError('Failed to fetch employee data');
    } finally {
      setLoading(false);
    }
  };

  const checkMood = async (employeeName: string) => {
    try {
      // Set loading state for this employee
      setEmployees(prev => 
        prev.map(emp => 
          emp.name === employeeName 
            ? { ...emp, isCheckingMood: true }
            : emp
        )
      );

      // Get mood from API
      const moodResult = await getMood(employeeName);
      
      // Get HR suggestion
      const employee = employees.find(emp => emp.name === employeeName);
      const suggestionResponse = await fetch('http://127.0.0.1:5000/api/hr-suggestion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: employeeName,
          burnout_score: employee?.score || 0,
          mood: moodResult.mood
        }),
      });
      
      const suggestionData = await suggestionResponse.json();

      // Update employee with mood and suggestion
      setEmployees(prev => 
        prev.map(emp => 
          emp.name === employeeName 
            ? { 
                ...emp, 
                mood: moodResult.mood,
                suggestion: suggestionData.suggestion,
                isCheckingMood: false 
              }
            : emp
        )
      );
    } catch (err) {
      console.error('Error checking mood:', err);
      // Reset loading state on error
      setEmployees(prev => 
        prev.map(emp => 
          emp.name === employeeName 
            ? { ...emp, isCheckingMood: false }
            : emp
        )
      );
    }
  };

  const getBurnoutBadgeColor = (score: number): string => {
    if (score >= 80) return 'bg-green-100 text-green-800';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getMoodEmoji = (mood: string | undefined): string => {
    if (!mood) return '';
    switch (mood.toLowerCase()) {
      case 'happy': return '😊';
      case 'sad': return '😟';
      case 'angry': return '😡';
      case 'stressed': return '😰';
      default: return '😐';
    }
  };

  const getSummaryStats = () => {
    const totalEmployees = employees.length;
    const atRisk = employees.filter(emp => emp.score < 60).length;
    const avgBurnout = employees.length > 0 
      ? Math.round(employees.reduce((sum, emp) => sum + emp.score, 0) / employees.length)
      : 0;
    
    return { totalEmployees, atRisk, avgBurnout };
  };

  if (loading && employees.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-64 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-xl p-6 shadow-sm border">
                <div className="h-4 bg-gray-300 rounded w-24 mb-2"></div>
                <div className="h-8 bg-gray-300 rounded w-16"></div>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="h-64 bg-gray-300 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-red-400 text-xl">⚠️</span>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
              <button 
                onClick={fetchEmployees}
                className="mt-2 px-3 py-1 bg-red-100 hover:bg-red-200 text-red-800 text-sm rounded transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { totalEmployees, atRisk, avgBurnout } = getSummaryStats();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Employee Wellness Dashboard
        </h1>
        <p className="text-gray-600">
          Monitor team burnout levels and mood in real-time
        </p>
      </div>      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <span className="text-blue-600 text-xl">👥</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Employees</p>
              <p className="text-2xl font-bold text-gray-900">{totalEmployees}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <span className="text-red-600 text-xl">⚠️</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">At Risk</p>
              <p className="text-2xl font-bold text-gray-900">{atRisk}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <span className="text-green-600 text-xl">📊</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Burnout Score</p>
              <p className="text-2xl font-bold text-gray-900">{avgBurnout}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Employee Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Employee Status</h2>
            <button
              onClick={fetchEmployees}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm rounded-lg transition-colors"
            >
              {loading ? 'Refreshing...' : 'Refresh Data'}
            </button>
          </div>
        </div>        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee
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
            </thead>            <tbody className="bg-white divide-y divide-gray-200">
              {employees.map((employee) => (
                <tr key={employee.name} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8">
                        <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-700">
                            {employee.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {employee.name}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getBurnoutBadgeColor(employee.score)}`}>
                      {employee.score}
                    </span>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    {employee.mood ? (
                      <div className="flex items-center">
                        <span className="text-lg mr-2">{getMoodEmoji(employee.mood)}</span>
                        <span className="text-sm text-gray-900 capitalize">{employee.mood}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">Not checked</span>
                    )}
                  </td>

                  <td className="px-6 py-4">
                    {employee.suggestion ? (
                      <div className="text-sm text-gray-900 max-w-xs">
                        {employee.suggestion}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">-</span>
                    )}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => checkMood(employee.name)}
                      disabled={employee.isCheckingMood}
                      className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-sm rounded transition-colors"
                    >
                      {employee.isCheckingMood ? 'Checking...' : 'Check Mood'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>        </div>

        {employees.length === 0 && !loading && (
          <div className="px-6 py-12 text-center">
            <div className="text-gray-500">
              <span className="text-4xl mb-4 block">📊</span>
              <p className="text-lg">No employee data available</p>
              <p className="text-sm mt-2">Check your backend connection and employee_logs.csv file</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
