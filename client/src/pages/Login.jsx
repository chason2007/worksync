import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(true);
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();
    const { showToast } = useToast();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
                email,
                password,
                rememberMe
            });

            login(res.data.token, res.data.user, rememberMe);
            showToast('Login successful! Welcome back.', 'success');
            navigate('/');
        } catch (err) {
            console.error(err);
            showToast(err.response?.data || 'Login failed. Please check your credentials.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            display: 'flex',
            minHeight: '100vh',
            background: 'var(--pk-bg)',
            fontFamily: 'inherit',
        }}>
            {/* ── Left: branding panel ── */}
            <div style={{
                flex: '0 0 45%',
                background: 'linear-gradient(145deg, var(--pk-primary) 0%, #818cf8 60%, #a78bfa 100%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '3rem',
                position: 'relative',
                overflow: 'hidden',
            }} className="login-hero">
                {/* Decorative blobs */}
                <div style={{
                    position: 'absolute', width: '320px', height: '320px', borderRadius: '50%',
                    background: 'rgba(255,255,255,0.07)', top: '-80px', left: '-80px', pointerEvents: 'none',
                }} />
                <div style={{
                    position: 'absolute', width: '200px', height: '200px', borderRadius: '50%',
                    background: 'rgba(255,255,255,0.06)', bottom: '-60px', right: '-60px', pointerEvents: 'none',
                }} />
                <div style={{
                    position: 'absolute', width: '120px', height: '120px', borderRadius: '50%',
                    background: 'rgba(255,255,255,0.05)', bottom: '120px', left: '40px', pointerEvents: 'none',
                }} />

                {/* Logo */}
                <div style={{
                    background: 'rgba(255,255,255,0.18)',
                    backdropFilter: 'blur(8px)',
                    borderRadius: '20px',
                    padding: '1.25rem',
                    marginBottom: '2rem',
                    border: '1px solid rgba(255,255,255,0.25)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                    position: 'relative',
                }}>
                    <img
                        src="/worksync-logo.png"
                        alt="WorkSync Logo"
                        style={{ width: '64px', height: '64px', objectFit: 'contain', display: 'block' }}
                    />
                </div>

                <div style={{ textAlign: 'center', position: 'relative', maxWidth: '320px' }}>
                    <h1 style={{
                        color: '#fff',
                        fontSize: '2.5rem',
                        fontWeight: 800,
                        margin: '0 0 1rem',
                        letterSpacing: '-0.02em',
                    }}>WorkSync</h1>
                    <p style={{
                        color: 'rgba(255,255,255,0.82)',
                        fontSize: '1rem',
                        lineHeight: 1.7,
                        margin: 0,
                    }}>
                        Manage your workforce, track attendance, and handle leaves — all in one unified platform.
                    </p>

                    {/* Feature pills */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center', marginTop: '2rem' }}>
                        {['Attendance Tracking', 'Leave Management', 'Announcements'].map(feat => (
                            <span key={feat} style={{
                                background: 'rgba(255,255,255,0.14)',
                                border: '1px solid rgba(255,255,255,0.22)',
                                borderRadius: '999px',
                                padding: '0.3rem 0.9rem',
                                fontSize: '0.78rem',
                                color: '#fff',
                                fontWeight: 500,
                                backdropFilter: 'blur(4px)',
                            }}>{feat}</span>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Right: form panel ── */}
            <div style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2rem',
                background: 'var(--pk-bg)',
            }}>
                <div style={{ width: '100%', maxWidth: '400px' }}>

                    {/* Mobile logo */}
                    <div className="login-hero-mobile" style={{ display: 'none', textAlign: 'center', marginBottom: '2rem' }}>
                        <img src="/worksync-logo.png" alt="WorkSync" style={{ width: '48px', height: '48px', objectFit: 'contain', margin: '0 auto 0.75rem' }} />
                        <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>WorkSync</h2>
                    </div>

                    <div style={{ marginBottom: '2.25rem' }}>
                        <h2 style={{ margin: '0 0 0.4rem', fontSize: '1.75rem', fontWeight: 800, color: 'var(--pk-text-main)', letterSpacing: '-0.02em' }}>
                            Welcome back 👋
                        </h2>
                        <p style={{ margin: 0, color: 'var(--pk-text-muted)', fontSize: '0.9rem' }}>
                            Sign in to your WorkSync account
                        </p>
                    </div>

                    <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        {/* Email */}
                        <div>
                            <label htmlFor="email" style={{
                                display: 'block', marginBottom: '0.5rem',
                                fontSize: '0.85rem', fontWeight: 600, color: 'var(--pk-text-main)',
                            }}>
                                Email address
                            </label>
                            <div style={{ position: 'relative' }}>
                                <span style={{
                                    position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)',
                                    color: 'var(--pk-text-muted)', display: 'flex', pointerEvents: 'none',
                                }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                        <polyline points="22,6 12,13 2,6" />
                                    </svg>
                                </span>
                                <input
                                    id="email"
                                    type="email"
                                    placeholder="you@company.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    disabled={loading}
                                    style={{ paddingLeft: '2.5rem', width: '100%', boxSizing: 'border-box' }}
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label htmlFor="password" style={{
                                display: 'block', marginBottom: '0.5rem',
                                fontSize: '0.85rem', fontWeight: 600, color: 'var(--pk-text-main)',
                            }}>
                                Password
                            </label>
                            <div style={{ position: 'relative' }}>
                                <span style={{
                                    position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)',
                                    color: 'var(--pk-text-muted)', display: 'flex', pointerEvents: 'none',
                                }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                    </svg>
                                </span>
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    disabled={loading}
                                    style={{ paddingLeft: '2.5rem', paddingRight: '2.75rem', width: '100%', boxSizing: 'border-box' }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    title={showPassword ? 'Hide password' : 'Show password'}
                                    style={{
                                        position: 'absolute', right: '0.9rem', top: '50%', transform: 'translateY(-50%)',
                                        background: 'none', border: 'none', padding: 0, cursor: 'pointer',
                                        color: 'var(--pk-text-muted)', display: 'flex',
                                    }}
                                >
                                    {showPassword ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                            <circle cx="12" cy="12" r="3" />
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                                            <line x1="1" y1="1" x2="23" y2="23" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Remember me */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <input
                                type="checkbox"
                                id="remember"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: 'var(--pk-primary)' }}
                            />
                            <label htmlFor="remember" style={{ fontSize: '0.85rem', color: 'var(--pk-text-muted)', cursor: 'pointer', userSelect: 'none' }}>
                                Keep me signed in
                            </label>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading}
                            style={{
                                width: '100%',
                                height: '48px',
                                fontSize: '0.95rem',
                                fontWeight: 700,
                                marginTop: '0.25rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
                                boxShadow: '0 4px 14px rgba(99,102,241,0.35)',
                                transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                            }}
                            onMouseEnter={e => {
                                if (!loading) {
                                    e.currentTarget.style.transform = 'translateY(-1px)';
                                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(99,102,241,0.45)';
                                }
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 4px 14px rgba(99,102,241,0.35)';
                            }}
                        >
                            {loading ? (
                                <>
                                    <svg style={{ animation: 'spin 0.8s linear infinite' }} xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                                    </svg>
                                    Signing in…
                                </>
                            ) : (
                                <>
                                    Sign In
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="9 18 15 12 9 6" />
                                    </svg>
                                </>
                            )}
                        </button>
                    </form>

                    <p style={{
                        marginTop: '2rem',
                        textAlign: 'center',
                        fontSize: '0.8rem',
                        color: 'var(--pk-text-muted)',
                    }}>
                        © {new Date().getFullYear()} WorkSync. All rights reserved.
                    </p>
                </div>
            </div>

            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                @media (max-width: 768px) {
                    .login-hero { display: none !important; }
                    .login-hero-mobile { display: block !important; }
                }
            `}</style>
        </div>
    );
}

export default Login;
