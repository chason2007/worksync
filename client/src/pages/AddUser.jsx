import { useState } from 'react';
import axios from 'axios';
import { useToast } from '../context/ToastContext';

function AddUser() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('Employee');
    const [position, setPosition] = useState('');
    const [loading, setLoading] = useState(false);
    const { showToast } = useToast();

    const generatePassword = () => {
        const length = 12;
        const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
        let newPassword = '';
        for (let i = 0; i < length; i++) {
            newPassword += charset.charAt(Math.floor(Math.random() * charset.length));
        }
        setPassword(newPassword);
        showToast('Strong password generated!', 'success');
    };

    const getPasswordStrength = (pwd) => {
        if (!pwd) return null;
        let strength = 0;
        if (pwd.length >= 8) strength++;
        if (pwd.length >= 12) strength++;
        if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength++;
        if (/\d/.test(pwd)) strength++;
        if (/[!@#$%^&*]/.test(pwd)) strength++;

        if (strength <= 2) return 'weak';
        if (strength <= 4) return 'medium';
        return 'strong';
    };

    const passwordStrength = getPasswordStrength(password);

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await axios.post('http://localhost:5001/api/auth/register', {
                name,
                email,
                password,
                role,
                position
            });

            showToast(`User ${name} created successfully!`, 'success');

            // Reset Form
            setName('');
            setEmail('');
            setPassword('');
            setRole('Employee');
            setPosition('');
        } catch (err) {
            console.error(err);
            showToast(err.response?.data || 'Failed to create user', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fade-in" style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem' }}>
            <h1 className="mb-8">Add Employee</h1>
            <div className="card">
                <h3 className="mb-4">New User Details</h3>
                <form onSubmit={handleRegister} className="flex flex-col gap-4">
                    {/* Full Name */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                            Full Name *
                        </label>
                        <div className="input-group">
                            <span className="input-icon">👤</span>
                            <input
                                type="text"
                                placeholder="John Doe"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </div>
                    </div>

                    {/* Email */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                            Email Address *
                        </label>
                        <div className="input-group">
                            <span className="input-icon">📧</span>
                            <input
                                type="email"
                                placeholder="john@company.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </div>
                    </div>

                    {/* Position and Role */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                                Position
                            </label>
                            <div className="input-group">
                                <span className="input-icon">💼</span>
                                <input
                                    type="text"
                                    placeholder="Manager, Lead..."
                                    value={position}
                                    onChange={(e) => setPosition(e.target.value)}
                                    disabled={loading}
                                />
                            </div>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                                Role *
                            </label>
                            <div style={{ display: 'flex', gap: '1rem', height: '46px', alignItems: 'center' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                    <input
                                        type="radio"
                                        name="role"
                                        value="Employee"
                                        checked={role === 'Employee'}
                                        onChange={(e) => setRole(e.target.value)}
                                        disabled={loading}
                                        style={{ width: '1.2rem', height: '1.2rem', margin: 0 }}
                                    />
                                    Employee
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                    <input
                                        type="radio"
                                        name="role"
                                        value="Admin"
                                        checked={role === 'Admin'}
                                        onChange={(e) => setRole(e.target.value)}
                                        disabled={loading}
                                        style={{ width: '1.2rem', height: '1.2rem', margin: 0 }}
                                    />
                                    <span style={{ color: 'var(--pk-primary)', fontWeight: '500' }}>Admin</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Password */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                            Default Password *
                        </label>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <div className="input-group" style={{ flex: 1 }}>
                                <span className="input-icon">🔒</span>
                                <input
                                    type="text"
                                    placeholder="Secret123"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    disabled={loading}
                                />
                            </div>
                            <button
                                type="button"
                                onClick={generatePassword}
                                className="btn btn-ghost"
                                disabled={loading}
                                style={{ whiteSpace: 'nowrap' }}
                            >
                                🎲 Generate
                            </button>
                        </div>

                        {/* Password Strength Indicator */}
                        {password && (
                            <div>
                                <div className="password-strength">
                                    <div className={`password-strength-bar password-strength-${passwordStrength}`}></div>
                                </div>
                                <p className="password-strength-text" style={{
                                    color: passwordStrength === 'weak' ? 'var(--pk-danger)' :
                                        passwordStrength === 'medium' ? 'var(--pk-warning)' :
                                            'var(--pk-success)'
                                }}>
                                    Password strength: {passwordStrength?.toUpperCase()}
                                </p>
                            </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        className={`btn btn-primary ${loading ? 'loading' : ''}`}
                        disabled={loading}
                        style={{ marginTop: '1rem', width: '100%' }}
                    >
                        {loading ? 'Creating Account...' : '✓ Create Account'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default AddUser;
