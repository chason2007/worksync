import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import AttendanceForm from './pages/AttendanceForm';
import Login from './pages/Login';
import AddUser from './pages/AddUser';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import './App.css';
import './mobile.css';

import Header from './components/Header';

// Theme Sync Helper
import { useThemeSync } from './context/ThemeContext';
// Keyboard Shortcuts
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import CommandPalette from './components/CommandPalette';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function AppRoutes() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  useThemeSync(user);

  const [isPaletteOpen, setIsPaletteOpen] = useState(false);

  useKeyboardShortcuts([
    { key: 'k', ctrl: true, action: () => setIsPaletteOpen(prev => !prev) },
    { key: 'h', ctrl: true, action: () => navigate('/') },
    { key: 'p', ctrl: true, action: () => navigate('/profile') }, // Ctrl+P usually print, but we override
    { key: 'l', ctrl: true, shift: true, action: () => logout() }
  ]);

  return (
    <div className="app-container">
      <Header />
      <CommandPalette isOpen={isPaletteOpen} onClose={() => setIsPaletteOpen(false)} />
      <main>
        <Routes>
          <Route path="/" element={user ? <Dashboard /> : <Navigate to="/login" />} />
          <Route path="/attendance" element={user ? <AttendanceForm /> : <Navigate to="/login" />} />
          <Route path="/settings" element={user?.role === 'Admin' ? <Settings /> : <Navigate to="/" />} />
          <Route path="/add-user" element={user?.role === 'Admin' ? <AddUser /> : <Navigate to="/" />} />
          <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" />} /> {/* Added Profile route */}
          <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <ToastProvider>
            <Router>
              <AppRoutes />
            </Router>
          </ToastProvider>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

