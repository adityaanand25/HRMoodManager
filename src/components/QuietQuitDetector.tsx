import React from 'react';
import { MessageSquare, Coffee, Calendar } from 'lucide-react';

export const QuietQuitDetector: React.FC = () => {
  const suggestions = [
    {
      icon: MessageSquare,
      title: 'Schedule 1-on-1',
      description: 'Have a conversation with at-risk employees',
      color: 'blue'
    },
    {
      icon: Coffee,
      title: 'Team Building',
      description: 'Organize informal team activities',
      color: 'green'
    },
    {
      icon: Calendar,
      title: 'Time Off',
      description: 'Encourage taking mental health days',
      color: 'purple'
    }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center space-x-2 mb-6">
        <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg flex items-center justify-center">
          <span className="text-white text-sm">🔍</span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900">Quiet Quit Detector</h3>
      </div>
      
      <div className="space-y-4">
        <p className="text-sm text-gray-600 mb-4">
          AI-powered recommendations for employee engagement
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200 cursor-pointer"
            >
              <div className="flex items-center space-x-3 mb-2">
                <div className={`w-8 h-8 bg-${suggestion.color}-100 rounded-lg flex items-center justify-center`}>
                  <suggestion.icon size={16} className={`text-${suggestion.color}-600`} />
                </div>
                <h4 className="font-medium text-gray-900 text-sm">{suggestion.title}</h4>
              </div>
              <p className="text-xs text-gray-600">{suggestion.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};