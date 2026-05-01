import { useState, useEffect, useCallback } from 'react';
import { leaveService } from '../services/leaveService';
import { useToast } from '../context/ToastContext';
import Skeleton from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import StatusBadge from '../components/StatusBadge';
import ConfirmModal from '../components/ConfirmModal';
import { formatDate } from '../utils/dateUtils';
import styles from './Leaves.module.css';

function Leaves() {
    const { showToast } = useToast();

    const [leaves, setLeaves] = useState([]);
    const [leavePage, setLeavePage] = useState(1);
    const [leaveMeta, setLeaveMeta] = useState({ pages: 1, total: 0 });
    const [pageLoading, setPageLoading] = useState(true);

    const [leaveReason, setLeaveReason] = useState('');
    const [leaveStartDate, setLeaveStartDate] = useState('');
    const [leaveEndDate, setLeaveEndDate] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalConfig, setModalConfig] = useState({ title: '', message: '', action: null });

    const openModal = (title, message, action) => { setModalConfig({ title, message, action }); setIsModalOpen(true); };

    const fetchLeaves = useCallback(async () => {
        setPageLoading(true);
        try {
            const data = await leaveService.getLeaves(leavePage, 10);
            if (data.pagination) { setLeaves(data.data); setLeaveMeta(data.pagination); }
            else setLeaves(Array.isArray(data) ? data : []);
        } catch (err) {
            showToast('Failed to load leave history: ' + (err.response?.data?.error || err.message), 'error');
        } finally { setPageLoading(false); }
    }, [leavePage, showToast]);

    useEffect(() => { fetchLeaves(); }, [fetchLeaves]);

    const submitLeaveRequest = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await leaveService.submitLeave(leaveReason, leaveStartDate, leaveEndDate);
            showToast('Leave request submitted successfully!', 'success');
            setLeaveReason(''); setLeaveStartDate(''); setLeaveEndDate('');
            setLeavePage(1); fetchLeaves();
        } catch (err) { showToast('Failed to submit leave request: ' + (err.response?.data?.error || err.message), 'error'); }
        finally { setSubmitting(false); }
    };

    const handleCancelLeave = async (leaveId) => {
        try {
            await leaveService.cancelLeave(leaveId);
            showToast('Leave request cancelled successfully', 'success');
            fetchLeaves();
        } catch (err) { showToast(err.response?.data?.error || 'Failed to cancel leave', 'error'); }
    };

    const pendingCount = leaves.filter(l => l.status === 'Pending').length;
    const approvedCount = leaves.filter(l => l.status === 'Approved').length;

    return (
        <div className="fade-in max-w-screen-xl mx-auto p-4 md:p-8">

            {/* Hero Banner */}
            <div className={styles.heroBanner}>
                <div className={styles.heroDecoTop} />
                <div className={styles.heroDecoBottom} />

                <div className={styles.heroContent}>
                    <p className={styles.heroCategory}>Time Off</p>
                    <h1 className={styles.heroTitle}>Leave Management</h1>
                    <p className={styles.heroSubtitle}>Request time off and track your leave history</p>
                </div>

                <div className={styles.statsContainer}>
                    <div className={styles.statCard}>
                        <div className={styles.statNumber}>{pendingCount}</div>
                        <div className={styles.statLabel}>Pending</div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statNumber}>{approvedCount}</div>
                        <div className={styles.statLabel}>Approved</div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statNumber}>{leaveMeta.total}</div>
                        <div className={styles.statLabel}>Total</div>
                    </div>
                </div>
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Request Form */}
                <div className="card h-fit md:col-span-1">
                    <h2 className={styles.sectionTitle}>Request Leave</h2>
                    <form onSubmit={submitLeaveRequest} className="flex flex-col gap-4">
                        <div>
                            <label htmlFor="leave-reason" className={styles.formLabel}>Reason</label>
                            <input id="leave-reason" type="text" placeholder="Sick leave, Vacation..." value={leaveReason} onChange={e => setLeaveReason(e.target.value)} required disabled={submitting} />
                        </div>
                        <div>
                            <label htmlFor="leave-start" className={styles.formLabel}>Start Date</label>
                            <input id="leave-start" type="date" value={leaveStartDate} onChange={e => setLeaveStartDate(e.target.value)} required disabled={submitting} />
                        </div>
                        <div>
                            <label htmlFor="leave-end" className={styles.formLabel}>End Date</label>
                            <input id="leave-end" type="date" value={leaveEndDate} onChange={e => setLeaveEndDate(e.target.value)} required disabled={submitting} />
                        </div>
                        <button
                            type="submit"
                            className={`btn btn-primary w-full mt-2 ${styles.submitBtn}`}
                            disabled={submitting}
                        >
                            {submitting ? 'Submitting…' : 'Submit Request'}
                        </button>
                    </form>
                </div>

                {/* Leave History */}
                <div className="card md:col-span-2">
                    <h2 className={styles.sectionTitle}>My Leave History</h2>
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Reason</th><th>Dates</th><th>Status</th><th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pageLoading ? (
                                    <><tr><td colSpan="4"><Skeleton /></td></tr><tr><td colSpan="4"><Skeleton /></td></tr><tr><td colSpan="4"><Skeleton /></td></tr></>
                                ) : (
                                    <>
                                        {leaves.map(l => (
                                            <tr key={l._id}>
                                                <td>{l.reason}</td>
                                                <td>{formatDate(l.startDate)} – {formatDate(l.endDate)}</td>
                                                <td><StatusBadge status={l.status} /></td>
                                                <td>
                                                    {l.status === 'Pending' && (
                                                        <button className="btn btn-ghost p-2 text-sm text-danger" onClick={() => openModal('Cancel Leave Request', 'Are you sure you want to cancel this pending leave request?', () => handleCancelLeave(l._id))}>
                                                            Cancel
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                        {leaves.length === 0 && (
                                            <tr><td colSpan="4"><EmptyState title="No Leave History" message="You haven't applied for any leaves yet." /></td></tr>
                                        )}
                                    </>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {leaveMeta.pages > 1 && (
                        <div className="flex justify-center gap-2 mt-4">
                            <button className="btn btn-ghost" disabled={leavePage === 1} onClick={() => setLeavePage(p => Math.max(1, p - 1))}>« Previous</button>
                            <span className="flex items-center text-sm text-muted">Page {leavePage} of {leaveMeta.pages}</span>
                            <button className="btn btn-ghost" disabled={leavePage === leaveMeta.pages} onClick={() => setLeavePage(p => Math.min(leaveMeta.pages, p + 1))}>Next »</button>
                        </div>
                    )}
                </div>
            </div>

            <ConfirmModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onConfirm={modalConfig.action} title={modalConfig.title} message={modalConfig.message} confirmText="Yes, Cancel" danger={true} />
        </div>
    );
}

export default Leaves;
