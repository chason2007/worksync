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

            // Update context state
            login(res.data.token, res.data.user, rememberMe);
            showToast('Login successful! Welcome back.', 'success');

            // Redirect to dashboard
            navigate('/');
        } catch (err) {
            console.error(err);
            showToast(err.response?.data || 'Login failed. Please check your credentials.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fade-in" style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #4f46e5 0%, #0f172a 100%)',
            padding: '1rem'
        }}>
            <div className="card" style={{
                maxWidth: '400px',
                width: '100%',
                padding: '2.5rem',
                border: 'none',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            }}>
                <div className="text-center mb-8">
                    <div style={{
                        width: '64px',
                        height: '64px',
                        background: 'linear-gradient(135deg, #4f46e5, #818cf8)',
                        borderRadius: '16px',
                        margin: '0 auto 1.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '32px',
                        boxShadow: '0 10px 15px -3px rgba(79, 70, 229, 0.3)'
                    }}>
                        ⚡
                    </div>
                    <h2 className="mb-2" style={{ fontSize: '1.75rem', fontWeight: '800' }}>Welcome Back</h2>
                    <p className="text-muted">Sign in to your WorkSync account</p>
                </div>

                <form onSubmit={handleLogin} className="flex flex-col gap-4">
                    <div>
                        <label className="mb-2" style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: 'var(--slate-700)' }}>
                            Email Address
                        </label>
                        <div className="input-group">
                            <span className="input-icon">✉️</span>
                            <input
                                type="email"
                                placeholder="name@company.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--slate-700)' }}>
                                Password
                            </label>
                            <a href="#" style={{ fontSize: '0.8rem' }}>Forgot password?</a>
                        </div>
                        <div className="input-group">
                            <span className="input-icon">🔒</span>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={loading}
                            />
                            <span
                                className="input-icon-right"
                                onClick={() => setShowPassword(!showPassword)}
                                title={showPassword ? 'Hide password' : 'Show password'}
                            >
                                {showPassword ? '👁️' : '👁️‍🗨️'}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 mt-2">
                        <input
                            type="checkbox"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            id="remember"
                            style={{ width: '1rem', height: '1rem' }}
                        />
                        <label htmlFor="remember" style={{ fontSize: '0.9rem', color: 'var(--slate-600)', cursor: 'pointer' }}>
                            Remember me for 30 days
                        </label>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary w-full mt-4"
                        disabled={loading}
                        style={{ height: '48px', fontSize: '1rem' }}
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <div className="mt-8 text-center text-sm text-muted">
                    Don't have an account? <a href="#" className="font-bold">Contact Admin</a>
                </div>
            </div>
        </div>
    );
}

export default Login;
