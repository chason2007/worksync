import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import axios from 'axios';
import Avatar from '../components/Avatar';
import { resizeImage } from '../utils/imageUtils';

function Profile() {
    const { user } = useAuth();
    const { showToast } = useToast();

    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef(null);

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        address: '',
        preferences: {}
    });

    // Populate form data from user context
    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                phone: user.phone || '',
                address: user.address || '',
                preferences: user.preferences || {}
            });
        }
    }, [user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageClick = () => {
        fileInputRef.current.click();
    };

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            setLoading(true);
            const resizedFile = await resizeImage(file, 500, 500);

            const formData = new FormData();
            formData.append('profileImage', resizedFile);
            const token = localStorage.getItem('auth-token') || sessionStorage.getItem('auth-token');
            await axios.post(`${import.meta.env.VITE_API_URL}/api/users/profile/image`, formData, {
                headers: {
                    'auth-token': token,
                    'Content-Type': 'multipart/form-data'
                }
            });

            // Re-fetch user profile to sync everything
            await axios.get(`${import.meta.env.VITE_API_URL}/api/users/profile`, {
                headers: { 'auth-token': token }
            });

            showToast('Profile image updated!', 'success');
            setTimeout(() => window.location.reload(), 1000);

        } catch (err) {
            showToast(err.response?.data?.error || 'Failed to upload image', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const token = localStorage.getItem('auth-token') || sessionStorage.getItem('auth-token');
            await axios.put(`${import.meta.env.VITE_API_URL}/api/users/profile`, formData, {
                headers: { 'auth-token': token }
            });

            showToast('Profile updated successfully', 'success');
            setIsEditing(false);
            // Reload to reflect changes in header/context
            setTimeout(() => window.location.reload(), 500);
        } catch (err) {
            showToast(err.response?.data?.error || 'Failed to update profile', 'error');
        } finally {
            setLoading(false);
        }
    };

    if (!user) return <div className="p-4">Loading...</div>;

    return (
        <div className="fade-in max-w-4xl mx-auto p-4 md:p-8">
            <h1 className="mb-6">My Profile</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Profile Card */}
                <div className="card md:col-span-1 flex flex-col items-center text-center">
                    <button type="button" className="relative group cursor-pointer appearance-none bg-transparent border-none p-0 outline-none" onClick={handleImageClick}>
                        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg mx-auto">
                            {user.profileImage ? (
                                <img
                                    src={user.profileImage.startsWith('data:')
                                        ? user.profileImage
                                        : `${import.meta.env.VITE_API_URL}/uploads/profiles/${user.profileImage}`}
                                    alt={user.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-primary text-white flex items-center justify-center text-4xl font-bold">
                                    {user.name?.charAt(0).toUpperCase()}
                                </div>
                            )}
                        </div>
                        <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity w-32 h-32 mx-auto">
                            <span className="text-white text-sm font-medium">Change</span>
                        </div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleImageChange}
                            style={{ display: 'none' }}
                            accept="image/*"
                        />
                    </button>

                    <h2 className="mt-4 mb-1">{user.name}</h2>
                    <p className="text-muted mb-2">{user.position || user.role}</p>
                    <div className="badge badge-primary">{user.employeeId || 'N/A'}</div>
                </div>

                {/* Details Form */}
                <div className="card md:col-span-2">
                    <div className="flex justify-between items-center mb-4">
                        <h3>Personal Information</h3>
                        {!isEditing && (
                            <button className="btn btn-secondary btn-sm" onClick={() => setIsEditing(true)}>
                                Edit Profile
                            </button>
                        )}
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="form-group">
                                <label htmlFor="profile-name">Full Name</label>
                                <input
                                    id="profile-name"
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    className="form-control"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="profile-email">Email</label>
                                <input
                                    id="profile-email"
                                    type="email"
                                    value={user.email}
                                    disabled={true} // Email cannot be changed
                                    className="form-control"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="profile-phone">Phone</label>
                                <input
                                    id="profile-phone"
                                    type="text"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    className="form-control"
                                    placeholder="+1 234 567 890"
                                />
                            </div>
                            <div className="form-group md:col-span-2">
                                <label htmlFor="profile-address">Address</label>
                                <textarea
                                    id="profile-address"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    className="form-control"
                                    rows="3"
                                    placeholder="Enter your address..."
                                ></textarea>
                            </div>
                        </div>

                        {isEditing && (
                            <div className="flex justify-end gap-2 mt-4">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => {
                                        setIsEditing(false);
                                        setFormData({
                                            name: user.name || '',
                                            phone: user.phone || '',
                                            address: user.address || ''
                                        });
                                    }}
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={loading}>
                                    {loading ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Profile;
