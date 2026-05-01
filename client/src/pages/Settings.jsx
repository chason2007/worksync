import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { adminService } from '../services/adminService';
import { announcementService } from '../services/announcementService';
import ConfirmModal from '../components/ConfirmModal';
import ThemeToggle from '../components/ThemeToggle';
import styles from './Settings.module.css';

function Settings() {
    const { user } = useAuth();
    const { showToast } = useToast();
    const [modalConfig, setModalConfig] = useState({ isOpen: false, title: '', message: '', onConfirm: null });

    const openModal = (title, message, onConfirm) => setModalConfig({ isOpen: true, title, message, onConfirm });
    const closeModal = () => setModalConfig({ isOpen: false, title: '', message: '', onConfirm: null });

    const handleDeleteUsers = async () => {
        try {
            const res = await adminService.deleteAllUsers();
            showToast(res.message, 'success');
        } catch (err) { showToast('Failed to delete users: ' + (err.response?.data?.error || err.message), 'error'); }
    };

    const handleDeleteAttendance = async () => {
        try {
            const res = await adminService.deleteAllAttendance();
            showToast(res.message, 'success');
        } catch (err) { showToast('Failed to delete attendance: ' + (err.response?.data?.error || err.message), 'error'); }
    };

    const handleDeleteLeaves = async () => {
        try {
            const res = await adminService.deleteAllLeaves();
            showToast(res.message, 'success');
        } catch (err) { showToast('Failed to delete leaves: ' + (err.response?.data?.error || err.message), 'error'); }
    };

    const handleSystemReset = async () => {
        try {
            await adminService.resetSystem();
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
                    await announcementService.deleteAll();
                    showToast('All announcements deleted', 'success');
                } catch { showToast('Failed to delete announcements', 'error'); }
            },
            btnText: 'Delete Announcements'
        },
    ];

    return (
        <div className="fade-in max-w-screen-xl mx-auto p-4 md:p-8">

            {/* Hero Banner */}
            <div className={styles.heroBanner}>
                <div className={styles.heroDecoTop} />
                <div className={styles.heroDecoBottom} />

                <div style={{ position: 'relative' }}>
                    <p className={styles.heroCategory}>Configuration</p>
                    <h1 className={styles.heroTitle}>
                        {user?.email === 'admin@worksync.com' ? 'Admin Settings' : 'Settings'}
                    </h1>
                    <p className={styles.heroSubtitle}>Manage your preferences and system configuration</p>
                </div>

                <div className={styles.heroIconContainer}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="3" />
                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                    </svg>
                </div>
            </div>

            {/* Appearance */}
            <div className={`card ${styles.sectionCard}`}>
                <h2 className={styles.sectionTitle}>Appearance</h2>
                <div className={styles.themeRow}>
                    <div>
                        <div className={styles.themeLabel}>Theme Preference</div>
                        <div className={styles.themeDesc}>Choose your preferred appearance mode.</div>
                    </div>
                    <ThemeToggle />
                </div>
            </div>

            {/* Danger Zone — admin only */}
            {user?.role === 'Admin' && (
                <div className={`card ${styles.dangerCard}`}>
                    <h2 className={styles.dangerTitle}>⚠ Danger Zone</h2>
                    <p className={styles.dangerSubtitle}>
                        These actions are destructive and cannot be undone. Please be certain before proceeding.
                    </p>
                    <div className="flex flex-col gap-3">
                        {dangerActions.map(action => (
                            <div key={action.label} className={styles.dangerActionRow}>
                                <div style={{ flex: 1 }}>
                                    <div className={styles.dangerActionLabel}>{action.label}</div>
                                    <div className={styles.dangerActionDesc}>{action.desc}</div>
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
                            <div className={styles.systemResetRow}>
                                <div style={{ flex: 1 }}>
                                    <div className={styles.systemResetLabel}>RESET SYSTEM</div>
                                    <div className={styles.dangerActionDesc}>Deletes ALL data (Users, Attendance, Leaves). Only Super Admin remains.</div>
                                </div>
                                <button
                                    onClick={() => openModal('RESET ENTIRE SYSTEM', 'WARNING: This will delete ALL attendance records, ALL leaves, and ALL users (except you). This cannot be undone. Are you absolutely sure?', handleSystemReset)}
                                    className={`btn btn-danger ${styles.systemResetBtn}`}
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
