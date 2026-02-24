import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import axios from 'axios';
import { resizeImage } from '../utils/imageUtils';
import Avatar from '../components/Avatar';

function Profile() {
    const { user } = useAuth();
    const { showToast } = useToast();

    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef(null);

    const [formData, setFormData] = useState({ name: '', phone: '', address: '', preferences: {} });

    useEffect(() => {
        if (user) setFormData({ name: user.name || '', phone: user.phone || '', address: user.address || '', preferences: user.preferences || {} });
    }, [user]);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        try {
            setLoading(true);
            const resizedFile = await resizeImage(file, 500, 500);
            const fd = new FormData();
            fd.append('profileImage', resizedFile);
            const token = localStorage.getItem('auth-token') || sessionStorage.getItem('auth-token');
            await axios.post(`${import.meta.env.VITE_API_URL}/api/users/profile/image`, fd, { headers: { 'auth-token': token, 'Content-Type': 'multipart/form-data' } });
            showToast('Profile image updated!', 'success');
            setTimeout(() => globalThis.location.reload(), 1000);
        } catch (err) {
            showToast(err.response?.data?.error || 'Failed to upload image', 'error');
        } finally { setLoading(false); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const token = localStorage.getItem('auth-token') || sessionStorage.getItem('auth-token');
            await axios.put(`${import.meta.env.VITE_API_URL}/api/users/profile`, formData, { headers: { 'auth-token': token } });
            showToast('Profile updated successfully', 'success');
            setIsEditing(false);
            setTimeout(() => globalThis.location.reload(), 500);
        } catch (err) {
            showToast(err.response?.data?.error || 'Failed to update profile', 'error');
        } finally { setLoading(false); }
    };

    if (!user) return <div className="p-4">Loading...</div>;

    return (
        <div className="fade-in max-w-screen-xl mx-auto p-4 md:p-8">

            {/* Hero Banner */}
            <div style={{
                background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
                borderRadius: 'var(--pk-radius)',
                padding: '2rem 2.5rem',
                marginBottom: '2rem',
                color: '#fff',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '1.5rem',
                flexWrap: 'wrap',
                position: 'relative',
                overflow: 'hidden',
            }}>
                <div style={{ position: 'absolute', right: '-40px', top: '-40px', width: '180px', height: '180px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', right: '60px', bottom: '-60px', width: '140px', height: '140px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)', pointerEvents: 'none' }} />

                {/* Avatar + info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', position: 'relative' }}>
                    {/* Clickable avatar */}
                    <button
                        type="button"
                        onClick={() => fileInputRef.current.click()}
                        title="Change profile photo"
                        style={{ position: 'relative', background: 'none', border: '3px solid rgba(255,255,255,0.4)', borderRadius: '50%', padding: 0, cursor: 'pointer', flexShrink: 0 }}
                    >
                        <Avatar user={user} size="lg" />
                        <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s' }}
                            onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                            onMouseLeave={e => e.currentTarget.style.opacity = '0'}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" />
                            </svg>
                        </div>
                        <input type="file" ref={fileInputRef} onChange={handleImageChange} style={{ display: 'none' }} accept="image/*" />
                    </button>

                    <div>
                        <p style={{ margin: 0, opacity: 0.8, fontSize: '0.85rem', fontWeight: 500 }}>My Account</p>
                        <h1 style={{ margin: '0.2rem 0 0.35rem', color: '#fff', fontSize: '1.75rem' }}>{user.name}</h1>
                        <p style={{ margin: 0, opacity: 0.75, fontSize: '0.875rem' }}>{user.position || user.role}</p>
                    </div>
                </div>

                {/* Employee ID pill */}
                <div style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(6px)', borderRadius: 'var(--pk-radius-sm)', padding: '0.6rem 1.1rem', fontSize: '0.82rem', fontWeight: 600, color: '#fff', border: '1px solid rgba(255,255,255,0.2)', position: 'relative', textAlign: 'center' }}>
                    <div style={{ opacity: 0.8, fontSize: '0.72rem', marginBottom: '0.15rem', letterSpacing: '0.05em' }}>EMPLOYEE ID</div>
                    <div>{user.employeeId || 'N/A'}</div>
                </div>
            </div>

            {/* Profile Form Card */}
            <div className="card" style={{ maxWidth: '800px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                    <h2 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>Personal Information</h2>
                    {!isEditing && (
                        <button className="btn btn-secondary btn-sm" onClick={() => setIsEditing(true)}>Edit Profile</button>
                    )}
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="form-group">
                            <label htmlFor="profile-name">Full Name</label>
                            <input id="profile-name" type="text" name="name" value={formData.name} onChange={handleChange} disabled={!isEditing} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="profile-email">Email</label>
                            <input id="profile-email" type="email" value={user.email} disabled />
                        </div>
                        <div className="form-group">
                            <label htmlFor="profile-phone">Phone</label>
                            <input id="profile-phone" type="text" name="phone" value={formData.phone} onChange={handleChange} disabled={!isEditing} placeholder="+1 234 567 890" />
                        </div>
                        <div className="form-group md:col-span-2">
                            <label htmlFor="profile-address">Address</label>
                            <textarea id="profile-address" name="address" value={formData.address} onChange={handleChange} disabled={!isEditing} rows="3" placeholder="Enter your address..." />
                        </div>
                    </div>

                    {isEditing && (
                        <div className="flex justify-end gap-2 mt-4">
                            <button type="button" className="btn btn-secondary" onClick={() => { setIsEditing(false); setFormData({ name: user.name || '', phone: user.phone || '', address: user.address || '' }); }}>
                                Cancel
                            </button>
                            <button type="submit" className="btn btn-primary" disabled={loading}>
                                {loading ? 'Saving…' : 'Save Changes'}
                            </button>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}

export default Profile;
