import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import AnnouncementSection from './AnnouncementSection';

function AdminDashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();

    return (
        <div className="fade-in max-w-screen-xl mx-auto p-4 md:p-8">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="mb-2">Welcome, {user?.name || 'Admin'}</h1>
                    <p className="text-muted">Manage your organization from one place</p>
                </div>
            </div>

            <div className="flex flex-col gap-8">
                {/* Announcements */}
                <AnnouncementSection />

                {/* Quick Actions */}
                <div>
                    <h3 className="mb-4">Management</h3>
                    <div className="stats-grid">
                        <button
                            className="stat-card cursor-pointer"
                            onClick={() => navigate('/users')}
                            style={{ textAlign: 'left', border: 'none', background: 'var(--pk-surface)', cursor: 'pointer' }}
                        >
                            <div style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>👥</div>
                            <h4 className="stat-label">Manage Users</h4>
                            <p style={{ fontSize: '0.875rem', color: 'var(--pk-text-muted)', marginTop: '0.25rem' }}>
                                Add, edit or remove users
                            </p>
                        </button>

                        <button
                            className="stat-card cursor-pointer"
                            onClick={() => navigate('/settings')}
                            style={{ textAlign: 'left', border: 'none', background: 'var(--pk-surface)', cursor: 'pointer' }}
                        >
                            <div style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>⚙️</div>
                            <h4 className="stat-label">Settings</h4>
                            <p style={{ fontSize: '0.875rem', color: 'var(--pk-text-muted)', marginTop: '0.25rem' }}>
                                Configure application settings
                            </p>
                        </button>

                        <button
                            className="stat-card cursor-pointer"
                            onClick={() => navigate('/announcements')}
                            style={{ textAlign: 'left', border: 'none', background: 'var(--pk-surface)', cursor: 'pointer' }}
                        >
                            <div style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>📢</div>
                            <h4 className="stat-label">Announcements</h4>
                            <p style={{ fontSize: '0.875rem', color: 'var(--pk-text-muted)', marginTop: '0.25rem' }}>
                                Post and manage announcements
                            </p>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminDashboard;
