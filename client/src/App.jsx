import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import AttendanceForm from './pages/AttendanceForm';
import Login from './pages/Login';
import Register from './pages/Register';
import './App.css';

function App() {
  const user = JSON.parse(localStorage.getItem('user'));

  const handleLogout = () => {
    localStorage.removeItem('auth-token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <Router>
      <div className="app-container">
        <nav>
          {user ? (
            <>
              <Link to="/">Home</Link> | <Link to="/attendance">Attendance</Link> |
              <button onClick={handleLogout} style={{ marginLeft: '10px' }}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link> | <Link to="/register">Register</Link>
            </>
          )}
        </nav>
        <Routes>
          <Route path="/" element={user ? <Dashboard /> : <Navigate to="/login" />} />
          <Route path="/attendance" element={user ? <AttendanceForm /> : <Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

