import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import ConfirmModal from '../components/ConfirmModal';
import ThemeToggle from '../components/ThemeToggle';

function Settings() {
    const { user } = useAuth();
    const { showToast } = useToast();
    const [modalConfig, setModalConfig] = useState({ isOpen: false, title: '', message: '', onConfirm: null });

    const openModal = (title, message, onConfirm) => setModalConfig({ isOpen: true, title, message, onConfirm });
    const closeModal = () => setModalConfig({ isOpen: false, title: '', message: '', onConfirm: null });

    const getToken = () => localStorage.getItem('auth-token') || sessionStorage.getItem('auth-token');

    const handleDeleteUsers = async () => {
        try {
            const res = await axios.delete(`${import.meta.env.VITE_API_URL}/api/admin/users`, { headers: { 'auth-token': getToken() } });
            showToast(res.data.message, 'success');
        } catch (err) { showToast('Failed to delete users: ' + (err.response?.data?.error || err.message), 'error'); }
    };

    const handleDeleteAttendance = async () => {
        try {
            const res = await axios.delete(`${import.meta.env.VITE_API_URL}/api/admin/attendance`, { headers: { 'auth-token': getToken() } });
            showToast(res.data.message, 'success');
        } catch (err) { showToast('Failed to delete attendance: ' + (err.response?.data?.error || err.message), 'error'); }
    };

    const handleDeleteLeaves = async () => {
        try {
            const res = await axios.delete(`${import.meta.env.VITE_API_URL}/api/admin/leaves`, { headers: { 'auth-token': getToken() } });
            showToast(res.data.message, 'success');
        } catch (err) { showToast('Failed to delete leaves: ' + (err.response?.data?.error || err.message), 'error'); }
    };

    const handleSystemReset = async () => {
        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/api/admin/reset-system`, {}, { headers: { 'auth-token': getToken() } });
            showToast('System Reset Complete', 'success');
            setTimeout(() => globalThis.location.reload(), 1000);
        } catch (err) { showToast('Reset Failed: ' + (err.response?.data?.error || err.message), 'error'); }
    };

    const dangerActions = [
        { label: 'Delete All Users', desc: 'Removes all employee accounts. Admin remains.', handler: handleDeleteUsers, btnText: 'Delete Users' },
        { label: 'Delete All Attendance', desc: 'Clears the entire attendance history log.', handler: handleDeleteAttendance, btnText: 'Delete Attendance' },
        { label: 'Delete All Leaves', desc: 'Removes all leave requests (Pending/Approved/Rejected).', handler: handleDeleteLeaves, btnText: 'Delete Leaves' },
        {
            label: 'Delete All Announcements', desc: 'Removes all announcements and their notifications.',
            handler: async () => {
                try {
                    await axios.delete(`${import.meta.env.VITE_API_URL}/api/announcements`, { headers: { 'auth-token': getToken() } });
                    showToast('All announcements deleted', 'success');
                } catch { showToast('Failed to delete announcements', 'error'); }
            },
            btnText: 'Delete Announcements'
        },
    ];

    return (
        <div className="fade-in max-w-screen-xl mx-auto p-4 md:p-8">

            {/* Hero Banner */}
            <div style={{
                background: 'linear-gradient(135deg, #475569 0%, #64748b 100%)',
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
                <div style={{ position: 'absolute', right: '-40px', top: '-40px', width: '180px', height: '180px', borderRadius: '50%', background: 'rgba(255,255,255,0.07)', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', right: '60px', bottom: '-60px', width: '140px', height: '140px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', pointerEvents: 'none' }} />

                <div style={{ position: 'relative' }}>
                    <p style={{ margin: 0, opacity: 0.8, fontSize: '0.85rem', fontWeight: 500 }}>Configuration</p>
                    <h1 style={{ margin: '0.2rem 0 0.4rem', color: '#fff', fontSize: '1.75rem' }}>
                        {user?.email === 'admin@worksync.com' ? 'Admin Settings' : 'Settings'}
                    </h1>
                    <p style={{ margin: 0, opacity: 0.75, fontSize: '0.875rem' }}>Manage your preferences and system configuration</p>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(6px)', borderRadius: 'var(--pk-radius-sm)', padding: '0.75rem', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', position: 'relative' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="3" />
                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                    </svg>
                </div>
            </div>

            {/* Appearance */}
            <div className="card" style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '1.25rem' }}>Appearance</h2>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Theme Preference</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--pk-text-muted)', marginTop: '0.2rem' }}>Choose your preferred appearance mode.</div>
                    </div>
                    <ThemeToggle />
                </div>
            </div>

            {/* Danger Zone — admin only */}
            {user?.role === 'Admin' && (
                <div className="card" style={{ border: '1px solid var(--pk-danger, #ef4444)' }}>
                    <h2 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--pk-danger, #ef4444)' }}>⚠ Danger Zone</h2>
                    <p style={{ color: 'var(--pk-text-muted)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
                        These actions are destructive and cannot be undone. Please be certain before proceeding.
                    </p>
                    <div className="flex flex-col gap-3">
                        {dangerActions.map(action => (
                            <div key={action.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(239,68,68,0.05)', borderRadius: 'var(--pk-radius-sm)', border: '1px solid rgba(239,68,68,0.15)', gap: '1rem', flexWrap: 'wrap' }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--pk-danger, #ef4444)', marginBottom: '0.2rem' }}>{action.label}</div>
                                    <div style={{ fontSize: '0.82rem', color: 'var(--pk-text-muted)' }}>{action.desc}</div>
                                </div>
                                <button
                                    onClick={() => openModal(action.label, `This action cannot be undone. Are you sure you want to ${action.label.toLowerCase()}?`, action.handler)}
                                    className="btn btn-danger"
                                    style={{ flexShrink: 0 }}
                                >
                                    {action.btnText}
                                </button>
                            </div>
                        ))}

                        {/* Super admin only: full reset */}
                        {user?.email === 'admin@worksync.com' && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(239,68,68,0.1)', borderRadius: 'var(--pk-radius-sm)', border: '2px solid rgba(239,68,68,0.4)', gap: '1rem', flexWrap: 'wrap' }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--pk-danger, #ef4444)', marginBottom: '0.2rem' }}>RESET SYSTEM</div>
                                    <div style={{ fontSize: '0.82rem', color: 'var(--pk-text-muted)' }}>Deletes ALL data (Users, Attendance, Leaves). Only Super Admin remains.</div>
                                </div>
                                <button
                                    onClick={() => openModal('RESET ENTIRE SYSTEM', 'WARNING: This will delete ALL attendance records, ALL leaves, and ALL users (except you). This cannot be undone. Are you absolutely sure?', handleSystemReset)}
                                    className="btn btn-danger"
                                    style={{ fontWeight: 700, flexShrink: 0 }}
                                >
                                    RESET SYSTEM
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <ConfirmModal isOpen={modalConfig.isOpen} onClose={closeModal} onConfirm={modalConfig.onConfirm} title={modalConfig.title} message={modalConfig.message} confirmText="Yes, Delete" cancelText="Cancel" danger={true} />
        </div>
    );
}

export default Settings;
