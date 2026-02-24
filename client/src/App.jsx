import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import AttendanceForm from './pages/AttendanceForm';
import Login from './pages/Login';
import AddUser from './pages/AddUser';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import ManageUsers from './pages/ManageUsers';
import Announcements from './pages/Announcements';
import Leaves from './pages/Leaves';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider, useThemeSync } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import './App.css';
import './mobile.css';

import Header from './components/Header';
import Footer from './components/Footer';
import GlobalAnnouncementListener from './components/GlobalAnnouncementListener';

function AppRoutes() {
  const { user } = useAuth();

  useThemeSync(user);

  return (
    <div className="app-container">
      <Header />
      <GlobalAnnouncementListener />
      <main className="fade-in">
        <Routes>
          <Route path="/" element={user ? <Dashboard /> : <Navigate to="/login" />} />
          <Route path="/users" element={user?.role === 'Admin' ? <ManageUsers /> : <Navigate to="/" />} />
          <Route path="/attendance" element={user ? <AttendanceForm /> : <Navigate to="/login" />} />
          <Route path="/settings" element={user ? <Settings /> : <Navigate to="/login" />} />
          <Route path="/add-user" element={user?.role === 'Admin' ? <AddUser /> : <Navigate to="/" />} />
          <Route path="/leaves" element={user ? <Leaves /> : <Navigate to="/login" />} />
          <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" />} /> {/* Added Profile route */}
          <Route path="/announcements" element={user ? <Announcements /> : <Navigate to="/login" />} />
          <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      <Footer />
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

