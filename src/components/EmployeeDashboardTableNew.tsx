import React, { useState, useEffect } from 'react';
import { RefreshCw, AlertCircle, Camera, CheckCircle } from 'lucide-react';
import { getBurnoutScores, getMood, getHRSuggestion } from '../services/api';
import { MoodCheckInModal } from './MoodCheckInModal';

interface EmployeeData {
  name: string;
  score: number;
  mood?: string;
  suggestion?: string;
  isCheckingMood?: boolean;
  isGettingSuggestion?: boolean;
}

interface EmployeeDashboardTableProps {
  onDataUpdate?: (employees: EmployeeData[]) => void;
}

export const EmployeeDashboardTable: React.FC<EmployeeDashboardTableProps> = ({ onDataUpdate }) => {
  const [employees, setEmployees] = useState<EmployeeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Auto-refresh data every 30 seconds
  useEffect(() => {
    fetchEmployeeData();
    const interval = setInterval(fetchEmployeeData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Update parent component when data changes
  useEffect(() => {
    if (onDataUpdate && employees.length > 0) {
      onDataUpdate(employees);
    }
  }, [employees, onDataUpdate]);

  const fetchEmployeeData = async () => {
    try {
      setLoading(true);
      setError(null);
      const scores = await getBurnoutScores();
      
      let scoresArray: {name: string, score: any}[] = [];

      if (Array.isArray(scores)) {
        scoresArray = scores;
      } else if (scores && typeof scores === 'object') {
        scoresArray = Object.entries(scores).map(([name, score]) => ({ name, score }));
      }
      
      setEmployees(prevEmployees => 
        scoresArray.map(emp => {
          const existing = prevEmployees.find(e => e.name === emp.name);
          return {
            name: emp.name,
            score: typeof emp.score === 'number' ? emp.score : 0,
            mood: existing?.mood,
            suggestion: existing?.suggestion,
            isCheckingMood: false,
            isGettingSuggestion: false,
          };
        })
      );
      setLastUpdated(new Date());
    } catch (err) {
      setError('Failed to fetch employee data. The backend server might be offline.');
      console.error('Error fetching employee data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckMood = (employeeName: string) => {
    setSelectedEmployee(employeeName);
  };

  const handleMoodDetected = async (mood: string) => {
    if (!selectedEmployee) return;

    const employeeIndex = employees.findIndex(emp => emp.name === selectedEmployee);
    if (employeeIndex === -1) return;

    // Update mood immediately
    setEmployees(prev => prev.map((emp, index) => 
      index === employeeIndex 
        ? { ...emp, mood, isCheckingMood: false, isGettingSuggestion: true }
        : emp
    ));

    // Get HR suggestion
    try {
      const employee = employees[employeeIndex];
      const suggestion = await getHRSuggestion(selectedEmployee, employee.score, mood);
      
      setEmployees(prev => prev.map((emp, index) => 
        index === employeeIndex 
          ? { ...emp, suggestion: suggestion.suggestion, isGettingSuggestion: false }
          : emp
      ));
    } catch (error) {
      console.error('Error getting HR suggestion:', error);
      setEmployees(prev => prev.map((emp, index) => 
        index === employeeIndex 
          ? { ...emp, isGettingSuggestion: false }
          : emp
      ));
    }

    setSelectedEmployee(null);
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
    switch (mood?.toLowerCase()) {
      case 'happy': return '😊';
      case 'sad': return '😢';
      case 'stressed': return '😰';
      case 'angry': return '😠';
      case 'focused': return '🤔';
      case 'tired': return '😴';
      case 'calm': return '😌';
      case 'excited': return '🤗';
      default: return '😐';
    }
  };

  if (loading && employees.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <div className="flex items-center justify-center space-x-3">
          <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full"></div>
          <p className="text-gray-600">Loading employee data...</p>
        </div>
      </div>
    );
  }

  if (error && employees.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <div className="text-center">
          <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Data</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchEmployeeData}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Employee Wellness Dashboard</h3>
            <p className="text-sm text-gray-500">
              Last updated: {lastUpdated.toLocaleTimeString()} • Auto-refresh every 30s
            </p>
          </div>
          <button
            onClick={fetchEmployeeData}
            disabled={loading}
            className="flex items-center space-x-2 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200 disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
        
        {/* Table */}
        <div className="overflow-x-auto">
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
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {employees.map((employee, index) => (
                <tr key={employee.name} className="hover:bg-gray-50 transition-colors duration-200">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium text-sm">
                          {employee.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{getBurnoutScoreEmoji(employee.score)}</span>
                      <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full border ${getBurnoutScoreColor(employee.score)}`}>
                        {employee.score}/100
                      </span>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    {employee.isCheckingMood ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                        <span className="text-sm text-gray-500">Checking...</span>
                      </div>
                    ) : employee.mood ? (
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{getMoodEmoji(employee.mood)}</span>
                        <span className="text-sm font-medium capitalize text-gray-900">{employee.mood}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">Not checked</span>
                    )}
                  </td>
                  
                  <td className="px-6 py-4">
                    {employee.isGettingSuggestion ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full"></div>
                        <span className="text-sm text-gray-500">Getting suggestion...</span>
                      </div>
                    ) : employee.suggestion ? (
                      <div className="max-w-xs">
                        <p className="text-sm text-gray-700 line-clamp-2">{employee.suggestion}</p>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">No suggestion yet</span>
                    )}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleCheckMood(employee.name)}
                      disabled={employee.isCheckingMood || employee.isGettingSuggestion}
                      className="flex items-center space-x-2 px-3 py-2 text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-lg transition-colors duration-200"
                    >
                      {employee.mood ? <CheckCircle size={16} /> : <Camera size={16} />}
                      <span>{employee.mood ? 'Recheck' : 'Check Mood'}</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {employees.length === 0 && !loading && (
          <div className="text-center py-12">
            <AlertCircle size={48} className="text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Employee Data</h3>
            <p className="text-gray-500">Unable to load employee burnout scores.</p>
          </div>
        )}
      </div>

      {/* Mood Check-In Modal */}
      <MoodCheckInModal
        isOpen={selectedEmployee !== null}
        onClose={() => setSelectedEmployee(null)}
        employeeName={selectedEmployee || ''}
        onMoodDetected={handleMoodDetected}
      />
    </>
  );
};
