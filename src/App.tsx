import React, { useState } from 'react';
import { LoginPage } from './components/LoginPage';
import { DashboardPage } from './components/DashboardPage';
import { EnhancedDashboardPage } from './components/EnhancedDashboardPage';
import { ConsentMoodModal } from './components/ConsentMoodModal';
import { User } from './types';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isCheckInModalOpen, setIsCheckInModalOpen] = useState(false);
  const [useEnhancedDashboard, setUseEnhancedDashboard] = useState(true); // Toggle for enhanced features

  const handleLogin = (userData: User) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
  };

  const handleOpenCheckIn = () => {
    setIsCheckInModalOpen(true);
  };

  const handleCloseCheckIn = () => {
    setIsCheckInModalOpen(false);
  };

  const handleMoodDetected = (mood: string) => {
    console.log('🎯 Detected mood:', mood);
    setIsCheckInModalOpen(false);
    // In real app, this would update the employee's current mood state
  };

  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <>
      {useEnhancedDashboard ? (
        <EnhancedDashboardPage 
          user={user} 
          onLogout={handleLogout} 
          onOpenCheckIn={handleOpenCheckIn} 
        />
      ) : (
        <DashboardPage 
          user={user} 
          onLogout={handleLogout} 
          onOpenCheckIn={handleOpenCheckIn} 
        />
      )}
      
      <ConsentMoodModal 
        isOpen={isCheckInModalOpen} 
        onClose={handleCloseCheckIn}
        onMoodDetected={handleMoodDetected}
        employeeName={user.name}
      />

      {/* Dashboard Toggle (for development/demo) */}
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={() => setUseEnhancedDashboard(!useEnhancedDashboard)}
          className="bg-gray-800 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
          title="Toggle Enhanced Dashboard"
        >
          {useEnhancedDashboard ? '🚀 Enhanced' : '📊 Classic'}
        </button>
      </div>
    </>
  );
}

export default App;