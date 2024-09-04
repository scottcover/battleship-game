import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainPage from './MainPage';
import Chatroom from './Chatroom';
import BattleshipGame from './BattleshipGame';
import RegisterPage from './RegisterPage';
import LoginPage from './LoginPage';
import Navbar from './Navbar';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <Router>
      <Navbar user={user} onLogout={handleLogout} />
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/game" element={<BattleshipGame user={user} />} />
        {/* Pass the username to the Chatroom component */}
        <Route path="/chatroom" element={<Chatroom username={user?.username} />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage onLogin={setUser} />} />
      </Routes>
    </Router>
  );
}

export default App;
