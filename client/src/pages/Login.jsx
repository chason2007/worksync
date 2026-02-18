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
        <div className="flex min-h-screen bg-surface font-sans fade-in">
            {/* Left Side - Hero / Branding (Desktop Only) */}
            <div className="hidden md-flex md-w-half bg-gradient-primary relative flex-col items-center justify-center p-8 overflow-hidden text-center text-white">
                {/* Decorative Pattern / Circles */}
                <div className="absolute inset-0 bg-white-20 opacity-10"
                    style={{ backgroundImage: 'radial-gradient(circle at 25% 25%, white 2%, transparent 2.5%), radial-gradient(circle at 75% 75%, white 2%, transparent 2.5%)', backgroundSize: '60px 60px' }}>
                </div>

                {/* Glassmorphism Logo Container */}
                <div className="z-10 bg-white-20 backdrop-blur-sm p-6 rounded-2xl mb-6 flex items-center justify-center shadow-lg mx-auto">
                    <img src="/worksync-logo.png" alt="WorkSync Logo" className="w-20 h-20 object-contain" />
                </div>

                <div className="z-10 max-w-md">
                    <h1 className="text-4xl font-extrabold mb-4 text-white drop-shadow-md">WorkSync</h1>
                    <p className="text-lg opacity-95 leading-relaxed font-medium text-blue-50">
                        Seamlessly manage your workforce, track attendance, and handle leaves in one unified platform.
                    </p>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="w-full md-w-half flex items-center justify-center p-8 bg-surface">
                <div className="w-full max-w-md">
                    {/* Mobile Logo removed as per request "remove the flash icon from right above the login form" */}
                    <div className="text-center mb-8 md:hidden block">
                        <h2 className="text-2xl font-bold text-slate-800">Welcome Back</h2>
                    </div>

                    <div className="text-left mb-8 hidden md-block">
                        <h2 className="text-3xl font-bold text-main mb-2">Welcome Back!</h2>
                        <p className="text-muted">Please enter your details to sign in.</p>
                    </div>

                    <form onSubmit={handleLogin} className="flex flex-col gap-5">
                        {/* Email Field */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-semibold text-color-main mb-2">
                                Email Address
                            </label>
                            <div className="input-group">
                                <span className="input-icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-tertiary"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                                </span>
                                <input
                                    id="email"
                                    type="email"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    disabled={loading}
                                    className="w-full p-3 pl-10 border rounded-lg focus:ring-2 focus:ring-primary-500 transition-all font-medium"
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-semibold text-color-main mb-2">
                                Password
                            </label>
                            <div className="input-group">
                                <span className="input-icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-tertiary"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                                </span>
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    disabled={loading}
                                    className="w-full p-3 pl-10 pr-10 border rounded-lg focus:ring-2 focus:ring-primary-500 transition-all font-medium"
                                />
                                <span
                                    className="input-icon-right cursor-pointer hover:text-primary transition-colors"
                                    onClick={() => setShowPassword(!showPassword)}
                                    title={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showPassword ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                                    )}
                                </span>
                            </div>
                        </div>

                        {/* Extras */}
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                id="remember"
                                className="w-4 h-4 rounded text-primary focus:ring-primary-500 border-gray-300"
                            />
                            <label htmlFor="remember" className="text-sm cursor-pointer text-muted select-none">
                                Remember me
                            </label>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary w-full h-12 text-base font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 mt-2"
                            disabled={loading}
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Signing in...
                                </span>
                            ) : 'Sign In'}
                        </button>
                    </form>


                </div>
            </div>
        </div>
    );
}

export default Login;
