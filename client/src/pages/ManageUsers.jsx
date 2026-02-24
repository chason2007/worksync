import { useState, useEffect } from 'react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import ConfirmModal from '../components/ConfirmModal';
import Avatar from '../components/Avatar';
import Skeleton from '../components/Skeleton';
import StatusBadge from '../components/StatusBadge';

function ManageUsers() {
    const { user: currentUser } = useAuth();
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
            showToast("Failed to load users: " + (err.response?.data?.error || err.message), 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        if (searchTerm) {
            const filtered = users.filter(u =>
                u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                u.position?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                u.employeeId?.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredUsers(filtered);
        } else {
            setFilteredUsers(users);
        }
    }, [searchTerm, users]);

    const handleEditClick = (user) => {
        setEditingUser(user._id);
        setEditForm({
            name: user.name,
            email: user.email,
            role: user.role,
            position: user.position || '',
            employeeId: user.employeeId || ''
        });
    };

    const handleUpdateUser = async () => {
        try {
            const res = await api.put(`/api/admin/users/${editingUser}`, editForm);
            setUsers(users.map(u => u._id === editingUser ? res.data : u));
            setEditingUser(null);
            showToast("User updated successfully", 'success');
        } catch (err) {
            showToast("Failed to update user: " + (err.response?.data?.error || err.message), 'error');
        }
    };

    const handleDeleteUser = async (id) => {
        try {
            await api.delete(`/api/admin/users/${id}`);
            setUsers(users.filter(u => u._id !== id));
            showToast("User deleted successfully", 'success');
        } catch (err) {
            showToast("Failed to delete user: " + (err.response?.data?.error || err.message), 'error');
        }
    };

    const openModal = (title, message, onConfirm) => {
        setModalConfig({ isOpen: true, title, message, onConfirm });
    };

    const closeModal = () => {
        setModalConfig({ isOpen: false, title: '', message: '', onConfirm: null });
    };

    return (
        <div className="fade-in max-w-screen-xl mx-auto p-4 md:p-8">
            <div className="mb-6">
                <h1>User Management</h1>
                <p className="text-muted">View, edit, and manage application users</p>
            </div>

            <div className="card">
                <div className="flex justify-between items-center mb-6">
                    <h3>All Users ({filteredUsers.length})</h3>
                    <div className="input-group w-64">
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            aria-label="Search users"
                            className="form-control"
                        />
                    </div>
                </div>

                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Role</th>
                                <th>Action</th>
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
                                                            <input
                                                                type="text"
                                                                value={editForm.name}
                                                                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                                                placeholder="Name"
                                                                className="form-control"
                                                            />
                                                            <input
                                                                type="email"
                                                                value={editForm.email}
                                                                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                                                placeholder="Email"
                                                                className="form-control"
                                                            />
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
                                                                    onClick={() => openModal(
                                                                        'Delete User',
                                                                        `Are you sure you want to delete ${u.name}?`,
                                                                        () => handleDeleteUser(u._id)
                                                                    )}
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
                                        <tr>
                                            <td colSpan="3" className="text-center p-8">
                                                No users found.
                                            </td>
                                        </tr>
                                    )}
                                </>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <ConfirmModal
                isOpen={modalConfig.isOpen}
                onClose={closeModal}
                onConfirm={modalConfig.onConfirm}
                title={modalConfig.title}
                message={modalConfig.message}
                danger={true}
            />
        </div>
    );
}

export default ManageUsers;
