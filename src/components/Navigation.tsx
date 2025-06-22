import React from 'react';
import { User, Bell, LogOut } from 'lucide-react';
import { User as UserType } from '../types';

interface NavigationProps {
  user: UserType;
  onLogout: () => void;
  onOpenCheckIn: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({ user, onLogout, onOpenCheckIn }) => {
  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">M</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">MoodManager HR+</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={onOpenCheckIn}
              className="bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-2 rounded-lg transition-colors duration-200 font-medium"
            >
              Quick Check-In
            </button>
            
            <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200">
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
            </button>
            
            <div className="flex items-center space-x-3 pl-4 border-l border-gray-200">
              <div>
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500">{user.role}</p>
              </div>
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <User size={16} className="text-white" />
              </div>
              <button
                onClick={onLogout}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};