import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

function Header() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <header style={{
            background: 'var(--pk-surface)',
            borderBottom: '1px solid var(--pk-border)',
            boxShadow: 'var(--pk-shadow)',
            padding: '1rem 2rem',
            position: 'sticky',
            top: 0,
            zIndex: 40
        }}>
            <div style={{
                maxWidth: '1200px',
                margin: '0 auto',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                            width: '32px',
                            height: '32px',
                            background: 'var(--pk-primary)',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: 'bold'
                        }}>
                            EP
                        </div>
                        <h2 style={{ fontSize: '1.25rem', margin: 0, color: 'var(--pk-text-main)' }}>Employee Portal</h2>
                    </div>

                    {/* Navigation - Middle */}
                    {user && (
                        <nav style={{ display: 'flex', gap: '1.5rem' }}>
                            <Link to="/" style={{ fontWeight: '500', color: 'var(--pk-text-main)' }}>Dashboard</Link>
                            <Link to="/attendance" style={{ fontWeight: '500', color: 'var(--pk-text-main)' }}>Attendance</Link>
                            {user.role === 'Admin' && (
                                <Link to="/settings" style={{ fontWeight: '500', color: 'var(--pk-text-main)' }}>Settings</Link>
                            )}
                        </nav>
                    )}
                </div>

                {/* Right Side - User / Auth Buttons */}
                <div>
                    {user ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                            <div style={{ textAlign: 'right', display: 'none', '@media (min-width: 600px)': { display: 'block' } }}>
                                <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{user.name}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--pk-text-muted)' }}>{user.role}</div>
                            </div>
                            <button onClick={handleLogout} className="btn btn-ghost" style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}>
                                Sign Out
                            </button>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <Link to="/login" className="btn btn-ghost" style={{ textDecoration: 'none' }}>Login</Link>
                            <Link to="/register" className="btn btn-primary" style={{ textDecoration: 'none' }}>Register</Link>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}

export default Header;
