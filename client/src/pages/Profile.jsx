import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { userService } from '../services/userService';
import { resizeImage } from '../utils/imageUtils';
import Avatar from '../components/Avatar';
import styles from './Profile.module.css';

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
            await userService.uploadProfileImage(fd);
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
            await userService.updateProfile(formData);
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
            <div className={styles.heroBanner}>
                <div className={styles.heroDecoTop} />
                <div className={styles.heroDecoBottom} />

                {/* Avatar + info */}
                <div className={styles.userInfo}>
                    {/* Clickable avatar */}
                    <button
                        type="button"
                        onClick={() => fileInputRef.current.click()}
                        title="Change profile photo"
                        className={styles.avatarBtn}
                    >
                        <Avatar user={user} size="lg" />
                        <div className={styles.avatarOverlay}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" />
                            </svg>
                        </div>
                        <input type="file" ref={fileInputRef} onChange={handleImageChange} style={{ display: 'none' }} accept="image/*" />
                    </button>

                    <div>
                        <p className={styles.category}>My Account</p>
                        <h1 className={styles.name}>{user.name}</h1>
                        <p className={styles.role}>{user.position || user.role}</p>
                    </div>
                </div>

                {/* Employee ID pill */}
                <div className={styles.idBadge}>
                    <div className={styles.idLabel}>EMPLOYEE ID</div>
                    <div>{user.employeeId || 'N/A'}</div>
                </div>
            </div>

            {/* Profile Form Card */}
            <div className="card" style={{ maxWidth: '800px' }}>
                <div className={styles.cardHeader}>
                    <h2 className={styles.cardTitle}>Personal Information</h2>
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
