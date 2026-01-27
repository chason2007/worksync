import { useState } from 'react';
import axios from 'axios';
import { useToast } from '../context/ToastContext';
import ConfirmModal from '../components/ConfirmModal';

function Settings() {
    const { showToast } = useToast();
    const [modalConfig, setModalConfig] = useState({ isOpen: false, title: '', message: '', onConfirm: null });

    const openModal = (title, message, onConfirm) => {
        setModalConfig({ isOpen: true, title, message, onConfirm });
    };

    const closeModal = () => {
        setModalConfig({ isOpen: false, title: '', message: '', onConfirm: null });
    };

    const handleDeleteUsers = async () => {
        try {
            const token = localStorage.getItem('auth-token');
            const res = await axios.delete('http://localhost:5001/api/admin/users', {
                headers: { 'auth-token': token }
            });
            showToast(res.data.message, 'success');
        } catch (err) {
            showToast("Failed to delete users: " + (err.response?.data?.error || err.message), 'error');
        }
    };

    const handleDeleteAttendance = async () => {
        try {
            const token = localStorage.getItem('auth-token');
            const res = await axios.delete('http://localhost:5001/api/admin/attendance', {
                headers: { 'auth-token': token }
            });
            showToast(res.data.message, 'success');
        } catch (err) {
            showToast("Failed to delete attendance: " + (err.response?.data?.error || err.message), 'error');
        }
    };

    const handleDeleteLeaves = async () => {
        try {
            const token = localStorage.getItem('auth-token');
            const res = await axios.delete('http://localhost:5001/api/admin/leaves', {
                headers: { 'auth-token': token }
            });
            showToast(res.data.message, 'success');
        } catch (err) {
            showToast("Failed to delete leaves: " + (err.response?.data?.error || err.message), 'error');
        }
    };

    return (
        <div className="fade-in" style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
            <h1 className="mb-8">Admin Settings</h1>

            <div className="card" style={{ borderColor: 'var(--pk-danger)' }}>
                <h3 style={{ color: 'var(--pk-danger)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    ⚠️ Danger Zone
                </h3>
                <p style={{ color: 'var(--pk-text-muted)', marginBottom: '1.5rem' }}>
                    These actions are destructive and cannot be undone. Please be certain.
                </p>
                <div className="flex flex-col gap-4">
                    {/* Delete Users */}
                    <div className="flex justify-between items-center" style={{
                        padding: '1rem',
                        background: '#fff5f5',
                        borderRadius: '8px',
                        border: '1px solid #fed7d7'
                    }}>
                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                <span>👥</span>
                                <strong style={{ color: 'var(--pk-danger)' }}>Delete All Users</strong>
                            </div>
                            <div style={{ fontSize: '0.9rem', color: '#718096' }}>
                                Removes all employee accounts. Admin remains.
                            </div>
                        </div>
                        <button
                            onClick={() => openModal(
                                'Delete All Users',
                                'This will permanently delete all employee accounts. Admin accounts will remain. This action cannot be undone.',
                                handleDeleteUsers
                            )}
                            className="btn btn-danger"
                        >
                            Delete Users
                        </button>
                    </div>

                    {/* Delete Attendance */}
                    <div className="flex justify-between items-center" style={{
                        padding: '1rem',
                        background: '#fff5f5',
                        borderRadius: '8px',
                        border: '1px solid #fed7d7'
                    }}>
                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                <span>📊</span>
                                <strong style={{ color: 'var(--pk-danger)' }}>Delete All Attendance</strong>
                            </div>
                            <div style={{ fontSize: '0.9rem', color: '#718096' }}>
                                Clears the entire attendance history log.
                            </div>
                        </div>
                        <button
                            onClick={() => openModal(
                                'Delete All Attendance',
                                'This will permanently delete all attendance records from the system. This action cannot be undone.',
                                handleDeleteAttendance
                            )}
                            className="btn btn-danger"
                        >
                            Delete Attendance
                        </button>
                    </div>

                    {/* Delete Leaves */}
                    <div className="flex justify-between items-center" style={{
                        padding: '1rem',
                        background: '#fff5f5',
                        borderRadius: '8px',
                        border: '1px solid #fed7d7'
                    }}>
                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                <span>🏖️</span>
                                <strong style={{ color: 'var(--pk-danger)' }}>Delete All Leaves</strong>
                            </div>
                            <div style={{ fontSize: '0.9rem', color: '#718096' }}>
                                Removes all leave requests (Pending/Approved/Rejected).
                            </div>
                        </div>
                        <button
                            onClick={() => openModal(
                                'Delete All Leaves',
                                'This will permanently delete all leave requests regardless of status. This action cannot be undone.',
                                handleDeleteLeaves
                            )}
                            className="btn btn-danger"
                        >
                            Delete Leaves
                        </button>
                    </div>
                </div>
            </div>

            <ConfirmModal
                isOpen={modalConfig.isOpen}
                onClose={closeModal}
                onConfirm={modalConfig.onConfirm}
                title={modalConfig.title}
                message={modalConfig.message}
                confirmText="Yes, Delete"
                cancelText="Cancel"
                danger={true}
            />
        </div>
    );
}

export default Settings;
