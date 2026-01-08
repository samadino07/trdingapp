import React, { useState, useEffect } from 'react';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import { User } from './types';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);

  // Check for active session on load
  useEffect(() => {
    const savedUser = localStorage.getItem('app_session');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = (user: User) => {
    setUser(user);
    localStorage.setItem('app_session', JSON.stringify(user));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('app_session');
  };

  if (!user) {
    return <Auth onLogin={handleLogin} />;
  }

  // key={user.id} forces React to remount the Dashboard when user changes,
  // ensuring all state hooks inside Dashboard are re-initialized for the new user.
  return <Dashboard key={user.id} user={user} onLogout={handleLogout} />;
};

export default App;