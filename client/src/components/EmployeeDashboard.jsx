import { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import Avatar from './Avatar';
import Skeleton from './Skeleton';
import StatusBadge from './StatusBadge';
import { formatDate } from '../utils/dateUtils';
import AnnouncementSection from './AnnouncementSection';

function EmployeeDashboard({ user }) {
    const [pageLoading, setPageLoading] = useState(true);
    const [leaves, setLeaves] = useState([]);
    const [stats, setStats] = useState({ totalPresent: 0, totalHalfDays: 0, thisMonthPresent: 0 });

    const { showToast } = useToast();

    const fetchData = useCallback(async () => {
        const token = localStorage.getItem('auth-token') || sessionStorage.getItem('auth-token');
        try {
            const leavesRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/leaves?page=1&limit=5`, {
                headers: { 'auth-token': token }
            });
            if (leavesRes.data.pagination) {
                setLeaves(leavesRes.data.data);
            } else {
                setLeaves(Array.isArray(leavesRes.data) ? leavesRes.data : []);
            }

            if (user?._id || user?.id) {
                const userId = user._id || user.id;
                const statsRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/attendance/stats/${userId}`, {
                    headers: { 'auth-token': token }
                });
                setStats(statsRes.data);
            }
        } catch (err) {
            showToast('Failed to load dashboard data: ' + (err.response?.data?.error || err.message), 'error');
        } finally {
            setPageLoading(false);
        }
    }, [user, showToast]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return (
        <div className="fade-in max-w-screen-xl mx-auto p-4 md:p-8">
            {/* Welcome Card */}
            <div className="card flex justify-between items-center bg-gradient-primary text-white mb-8">
                <div className="flex items-center gap-4">
                    <Avatar user={user} size="lg" />
                    <div>
                        <h2 className="text-2xl font-bold mb-2">Welcome, {user?.name}!</h2>
                        <p className="opacity-90">Role: {user?.role} {user?.position && `• ${user.position}`}</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-sm opacity-80">{formatDate(new Date())}</p>
                </div>
            </div>

            {/* Announcements */}
            <div className="mb-8">
                <AnnouncementSection />
            </div>

            {/* Stats Cards */}
            <div className="stats-grid mb-8">
                {pageLoading ? (
                    <>
                        <Skeleton type="card" height="120px" />
                        <Skeleton type="card" height="120px" />
                        <Skeleton type="card" height="120px" />
                        <Skeleton type="card" height="120px" />
                    </>
                ) : (
                    <>
                        <div className="stat-card">
                            <h4>Pending Leaves</h4>
                            <p className="stat-value">{leaves.filter(l => l.status === 'Pending').length}</p>
                        </div>
                        <div className="stat-card bg-gradient-success">
                            <h4>Approved Leaves</h4>
                            <p className="stat-value">{leaves.filter(l => l.status === 'Approved').length}</p>
                        </div>
                        <div className="stat-card bg-gradient-warning">
                            <h4>This Month</h4>
                            <p className="stat-value">{stats.thisMonthPresent} days</p>
                        </div>
                        <div className="stat-card bg-gradient-violet">
                            <h4>Total Present</h4>
                            <p className="stat-value">{stats.totalPresent}</p>
                        </div>
                    </>
                )}
            </div>

            {/* Quick Links */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link to="/attendance" className="card text-center hover:shadow-lg" style={{ textDecoration: 'none', transition: 'box-shadow 0.2s' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📋</div>
                    <h4>Mark Attendance</h4>
                    <p className="text-muted text-sm">Track your daily attendance</p>
                </Link>
                <Link to="/leaves" className="card text-center hover:shadow-lg" style={{ textDecoration: 'none', transition: 'box-shadow 0.2s' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🗓️</div>
                    <h4>Leave Requests</h4>
                    <p className="text-muted text-sm">Request or track your leaves</p>
                </Link>
                <Link to="/profile" className="card text-center hover:shadow-lg" style={{ textDecoration: 'none', transition: 'box-shadow 0.2s' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>👤</div>
                    <h4>My Profile</h4>
                    <p className="text-muted text-sm">View and edit your profile</p>
                </Link>
            </div>
        </div>
    );
}

EmployeeDashboard.propTypes = {
    user: PropTypes.shape({
        _id: PropTypes.string,
        id: PropTypes.string,
        name: PropTypes.string,
        role: PropTypes.string,
        position: PropTypes.string,
    }),
};

export default EmployeeDashboard;
