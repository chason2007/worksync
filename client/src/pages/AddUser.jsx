import { useState } from 'react';
import axios from 'axios';
import { useToast } from '../context/ToastContext';

function AddUser() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('Employee');
    const [position, setPosition] = useState('');
    const [employeeId, setEmployeeId] = useState('');

    useEffect(() => {
        const fetchNextId = async () => {
            try {
                const token = localStorage.getItem('auth-token');
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/next-employee-id`, {
                    headers: { 'auth-token': token }
                });
                setEmployeeId(res.data.nextEmployeeId);
            } catch (err) {
                console.error("Failed to fetch next Employee ID", err);
            }
        };
        fetchNextId();
    }, []);

    const [loading, setLoading] = useState(false);
    const [profileImage, setProfileImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
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

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                showToast('Please select an image file', 'error');
                return;
            }
            // Validate file size (5MB)
            if (file.size > 5 * 1024 * 1024) {
                showToast('Image size must be less than 5MB', 'error');
                return;
            }
            setProfileImage(file);
            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const uploadProfileImage = async (userId) => {
        if (!profileImage) {
            console.log('No profile image to upload');
            return;
        }

        console.log('Starting image upload for user:', userId);
        const formData = new FormData();
        formData.append('profileImage', profileImage);

        try {
            const token = localStorage.getItem('auth-token');
            console.log('Auth token exists?', !!token);

            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/admin/users/${userId}/upload-image`,
                formData,
                {
                    headers: {
                        'auth-token': token,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );
            console.log('Image upload response:', response.data);
            showToast('Profile image uploaded successfully!', 'success');
        } catch (err) {
            console.error('Image upload error:', err);
            console.error('Error response:', err.response?.data);
            showToast(err.response?.data?.error || 'User created but image upload failed', 'error');
        }
    };

    const passwordStrength = getPasswordStrength(password);

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
                name,
                email,
                password,
                role,
                position,
                employeeId

            });

            console.log('User created:', res.data);
            console.log('Has profile image?', !!profileImage);
            console.log('User ID:', res.data._id);

            // Upload profile image if selected
            if (profileImage && res.data._id) {
                console.log('Uploading profile image for user:', res.data._id);
                await uploadProfileImage(res.data._id);
            }

            showToast(`User ${name} created successfully!`, 'success');

            // Reset Form
            setName('');
            setEmail('');
            setPassword('');
            setRole('Employee');
            setPosition('');
            // Refetch next ID after successful creation
            const token = localStorage.getItem('auth-token');
            axios.get(`${import.meta.env.VITE_API_URL}/api/admin/next-employee-id`, {
                headers: { 'auth-token': token }
            }).then(res => setEmployeeId(res.data.nextEmployeeId)).catch(console.error);

            setProfileImage(null);
            setImagePreview(null);
        } catch (err) {
            console.error('Registration error:', err);
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

                    {/* Employee ID */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                            Employee ID
                        </label>
                        <div className="input-group">
                            <span className="input-icon">🆔</span>
                            <input
                                type="text"
                                placeholder="EMP001"
                                value={employeeId}
                                onChange={(e) => setEmployeeId(e.target.value)}
                                disabled={loading}
                            />
                        </div>
                    </div>

                    {/* Profile Image */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                            Profile Image
                        </label>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            {imagePreview && (
                                <div style={{
                                    width: '80px',
                                    height: '80px',
                                    borderRadius: '50%',
                                    overflow: 'hidden',
                                    border: '3px solid var(--pk-primary)'
                                }}>
                                    <img
                                        src={imagePreview}
                                        alt="Preview"
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                </div>
                            )}
                            <div style={{ flex: 1 }}>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    disabled={loading}
                                    style={{ display: 'none' }}
                                    id="profile-image-input"
                                />
                                <label
                                    htmlFor="profile-image-input"
                                    className="btn btn-ghost"
                                    style={{ cursor: 'pointer', display: 'inline-block' }}
                                >
                                    📷 {imagePreview ? 'Change Image' : 'Upload Image'}
                                </label>
                                {imagePreview && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setProfileImage(null);
                                            setImagePreview(null);
                                        }}
                                        className="btn btn-ghost"
                                        style={{ marginLeft: '0.5rem', color: 'var(--pk-danger)' }}
                                    >
                                        ✕ Remove
                                    </button>
                                )}
                                <div style={{ fontSize: '0.8rem', color: 'var(--pk-text-muted)', marginTop: '0.5rem' }}>
                                    Max size: 5MB. Formats: JPG, PNG, GIF
                                </div>
                            </div>
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
