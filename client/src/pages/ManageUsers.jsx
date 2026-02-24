import { useState, useEffect } from 'react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import ConfirmModal from '../components/ConfirmModal';
import Avatar from '../components/Avatar';
import Skeleton from '../components/Skeleton';
import { useNavigate } from 'react-router-dom';
import StatusBadge from '../components/StatusBadge';

function ManageUsers() {
    const { user: currentUser } = useAuth();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [editingUser, setEditingUser] = useState(null);
    const [editForm, setEditForm] = useState({ name: '', email: '', role: 'Employee', position: '', employeeId: '' });
    const [modalConfig, setModalConfig] = useState({ isOpen: false, title: '', message: '', onConfirm: null });

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await api.get('/api/admin/users');
            const visibleUsers = (Array.isArray(res.data) ? res.data : []).filter(u => u.email !== 'admin@worksync.com');
            const sortedUsers = visibleUsers.sort((a, b) => {
                if (a.role === 'Admin' && b.role !== 'Admin') return -1;
                if (a.role !== 'Admin' && b.role === 'Admin') return 1;
                return 0;
            });
            setUsers(sortedUsers);
            setFilteredUsers(sortedUsers);
        } catch (err) {
            showToast('Failed to load users: ' + (err.response?.data?.error || err.message), 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchUsers(); }, []);

    useEffect(() => {
        if (searchTerm) {
            setFilteredUsers(users.filter(u =>
                u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                u.position?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                u.employeeId?.toLowerCase().includes(searchTerm.toLowerCase())
            ));
        } else {
            setFilteredUsers(users);
        }
    }, [searchTerm, users]);

    const handleEditClick = (u) => {
        setEditingUser(u._id);
        setEditForm({ name: u.name, email: u.email, role: u.role, position: u.position || '', employeeId: u.employeeId || '' });
    };

    const handleUpdateUser = async () => {
        try {
            const res = await api.put(`/api/admin/users/${editingUser}`, editForm);
            setUsers(users.map(u => u._id === editingUser ? res.data : u));
            setEditingUser(null);
            showToast('User updated successfully', 'success');
        } catch (err) {
            showToast('Failed to update user: ' + (err.response?.data?.error || err.message), 'error');
        }
    };

    const handleDeleteUser = async (id) => {
        try {
            await api.delete(`/api/admin/users/${id}`);
            setUsers(users.filter(u => u._id !== id));
            showToast('User deleted successfully', 'success');
        } catch (err) {
            showToast('Failed to delete user: ' + (err.response?.data?.error || err.message), 'error');
        }
    };

    const openModal = (title, message, onConfirm) => setModalConfig({ isOpen: true, title, message, onConfirm });
    const closeModal = () => setModalConfig({ isOpen: false, title: '', message: '', onConfirm: null });

    return (
        <div className="fade-in max-w-screen-xl mx-auto p-4 md:p-8">

            {/* Hero Banner */}
            <div style={{
                background: 'linear-gradient(135deg, var(--pk-primary) 0%, #818cf8 100%)',
                borderRadius: 'var(--pk-radius)',
                padding: '2rem 2.5rem',
                marginBottom: '2rem',
                color: '#fff',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '1rem',
                flexWrap: 'wrap',
                position: 'relative',
                overflow: 'hidden',
            }}>
                <div style={{ position: 'absolute', right: '-40px', top: '-40px', width: '180px', height: '180px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', right: '60px', bottom: '-60px', width: '140px', height: '140px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)', pointerEvents: 'none' }} />

                <div style={{ position: 'relative' }}>
                    <p style={{ margin: 0, opacity: 0.8, fontSize: '0.85rem', fontWeight: 500 }}>Management</p>
                    <h1 style={{ margin: '0.2rem 0 0.4rem', color: '#fff', fontSize: '1.75rem' }}>User Management</h1>
                    <p style={{ margin: 0, opacity: 0.75, fontSize: '0.875rem' }}>Add, edit and manage your team members</p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', position: 'relative', flexWrap: 'wrap' }}>
                    <div style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(6px)', borderRadius: 'var(--pk-radius-sm)', padding: '0.5rem 1rem', fontSize: '0.85rem', fontWeight: 600, color: '#fff', border: '1px solid rgba(255,255,255,0.2)' }}>
                        {filteredUsers.length} {filteredUsers.length === 1 ? 'User' : 'Users'}
                    </div>
                    <button
                        className="btn"
                        onClick={() => navigate('/add-user')}
                        style={{ background: '#fff', color: '#4f46e5', fontWeight: 700, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
                    >
                        + Add User
                    </button>
                </div>
            </div>

            {/* Users Table Card */}
            <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <h2 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>All Users</h2>
                    <div style={{ position: 'relative' }}>
                        <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--pk-text-muted)', display: 'flex', pointerEvents: 'none' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                        </span>
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            aria-label="Search users"
                            style={{ paddingLeft: '2.25rem', width: '220px' }}
                        />
                    </div>
                </div>

                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Role</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="3"><Skeleton height="300px" /></td></tr>
                            ) : (
                                <>
                                    {filteredUsers.map(u => (
                                        <tr key={u._id}>
                                            {editingUser === u._id ? (
                                                <>
                                                    <td colSpan="2">
                                                        <div className="flex flex-col gap-2 p-2">
                                                            <input type="text" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} placeholder="Name" />
                                                            <input type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} placeholder="Email" />
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className="flex gap-2">
                                                            <button onClick={handleUpdateUser} className="btn btn-primary btn-sm">Save</button>
                                                            <button onClick={() => setEditingUser(null)} className="btn btn-ghost btn-sm">Cancel</button>
                                                        </div>
                                                    </td>
                                                </>
                                            ) : (
                                                <>
                                                    <td>
                                                        <div className="flex items-center gap-3">
                                                            <Avatar user={u} size="sm" />
                                                            <div>
                                                                <div className="font-bold">{u.name}</div>
                                                                <div className="text-sm text-muted">{u.email}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td><StatusBadge status={u.role} /></td>
                                                    <td>
                                                        {(u.role !== 'Admin' || currentUser?.email === 'admin@worksync.com') && (
                                                            <div className="flex gap-2">
                                                                <button onClick={() => handleEditClick(u)} className="btn btn-ghost btn-sm">Edit</button>
                                                                <button
                                                                    onClick={() => openModal('Delete User', `Are you sure you want to delete ${u.name}?`, () => handleDeleteUser(u._id))}
                                                                    className="btn btn-ghost btn-sm text-danger"
                                                                >
                                                                    Delete
                                                                </button>
                                                            </div>
                                                        )}
                                                    </td>
                                                </>
                                            )}
                                        </tr>
                                    ))}
                                    {filteredUsers.length === 0 && !loading && (
                                        <tr><td colSpan="3" className="text-center p-8" style={{ color: 'var(--pk-text-muted)' }}>No users found.</td></tr>
                                    )}
                                </>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <ConfirmModal isOpen={modalConfig.isOpen} onClose={closeModal} onConfirm={modalConfig.onConfirm} title={modalConfig.title} message={modalConfig.message} danger={true} />
        </div>
    );
}

export default ManageUsers;
