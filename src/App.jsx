import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Dashboard from './Dashboard'
import Login from './pages/Login'

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in from localStorage
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!user) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard user={user} onLogout={handleLogout} />} />
        <Route path="/servers" element={<Dashboard user={user} onLogout={handleLogout} />} />
        <Route path="/analytics" element={<Dashboard user={user} onLogout={handleLogout} />} />
        <Route path="/sales-analytics" element={<Dashboard user={user} onLogout={handleLogout} />} />
        <Route path="/monitoring" element={<Dashboard user={user} onLogout={handleLogout} />} />
        <Route path="/reports" element={<Dashboard user={user} onLogout={handleLogout} />} />
        <Route path="/pos-admins" element={<Dashboard user={user} onLogout={handleLogout} />} />
        <Route path="/customers" element={<Dashboard user={user} onLogout={handleLogout} />} />
        <Route path="/inventory" element={<Dashboard user={user} onLogout={handleLogout} />} />
        <Route path="/suppliers" element={<Dashboard user={user} onLogout={handleLogout} />} />
      </Routes>
    </Router>
  )
}