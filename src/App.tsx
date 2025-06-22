import React, { useState } from 'react';
import { LoginPage } from './components/LoginPage';
import { DashboardPage } from './components/DashboardPage';
import { ConsentMoodModal } from './components/ConsentMoodModal';
import { User } from './types';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isCheckInModalOpen, setIsCheckInModalOpen] = useState(false);

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

  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <>
      <DashboardPage 
        user={user} 
        onLogout={handleLogout} 
        onOpenCheckIn={handleOpenCheckIn} 
      />
      <ConsentMoodModal 
        isOpen={isCheckInModalOpen} 
        onClose={handleCloseCheckIn}
        onMoodDetected={(mood: string) => console.log('Detected mood:', mood)}
      />
    </>
  );
}

export default App;