import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import Skeleton from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import StatusBadge from '../components/StatusBadge';
import ConfirmModal from '../components/ConfirmModal';
import { formatDate } from '../utils/dateUtils';

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
            const res = await api.get(`/api/leaves?page=${leavePage}&limit=10`);
            if (res.data.pagination) { setLeaves(res.data.data); setLeaveMeta(res.data.pagination); }
            else setLeaves(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            showToast('Failed to load leave history: ' + (err.response?.data?.error || err.message), 'error');
        } finally { setPageLoading(false); }
    }, [leavePage, showToast]);

    useEffect(() => { fetchLeaves(); }, [fetchLeaves]);

    const submitLeaveRequest = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.post('/api/leaves', { reason: leaveReason, startDate: leaveStartDate, endDate: leaveEndDate });
            showToast('Leave request submitted successfully!', 'success');
            setLeaveReason(''); setLeaveStartDate(''); setLeaveEndDate('');
            setLeavePage(1); fetchLeaves();
        } catch { showToast('Failed to submit leave request', 'error'); }
        finally { setSubmitting(false); }
    };

    const handleCancelLeave = async (leaveId) => {
        try {
            await api.delete(`/api/leaves/${leaveId}`);
            showToast('Leave request cancelled successfully', 'success');
            fetchLeaves();
        } catch (err) { showToast(err.response?.data?.error || 'Failed to cancel leave', 'error'); }
    };

    const pendingCount = leaves.filter(l => l.status === 'Pending').length;
    const approvedCount = leaves.filter(l => l.status === 'Approved').length;

    return (
        <div className="fade-in max-w-screen-xl mx-auto p-4 md:p-8">

            {/* Hero Banner */}
            <div style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
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
                    <p style={{ margin: 0, opacity: 0.8, fontSize: '0.85rem', fontWeight: 500 }}>Time Off</p>
                    <h1 style={{ margin: '0.2rem 0 0.4rem', color: '#fff', fontSize: '1.75rem' }}>Leave Management</h1>
                    <p style={{ margin: 0, opacity: 0.75, fontSize: '0.875rem' }}>Request time off and track your leave history</p>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', position: 'relative' }}>
                    <div style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(6px)', borderRadius: 'var(--pk-radius-sm)', padding: '0.6rem 1rem', fontSize: '0.82rem', fontWeight: 600, color: '#fff', border: '1px solid rgba(255,255,255,0.2)', textAlign: 'center' }}>
                        <div style={{ fontSize: '1.25rem', lineHeight: 1 }}>{pendingCount}</div>
                        <div style={{ opacity: 0.8, fontSize: '0.75rem', marginTop: '0.15rem' }}>Pending</div>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(6px)', borderRadius: 'var(--pk-radius-sm)', padding: '0.6rem 1rem', fontSize: '0.82rem', fontWeight: 600, color: '#fff', border: '1px solid rgba(255,255,255,0.2)', textAlign: 'center' }}>
                        <div style={{ fontSize: '1.25rem', lineHeight: 1 }}>{approvedCount}</div>
                        <div style={{ opacity: 0.8, fontSize: '0.75rem', marginTop: '0.15rem' }}>Approved</div>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(6px)', borderRadius: 'var(--pk-radius-sm)', padding: '0.6rem 1rem', fontSize: '0.82rem', fontWeight: 600, color: '#fff', border: '1px solid rgba(255,255,255,0.2)', textAlign: 'center' }}>
                        <div style={{ fontSize: '1.25rem', lineHeight: 1 }}>{leaveMeta.total}</div>
                        <div style={{ opacity: 0.8, fontSize: '0.75rem', marginTop: '0.15rem' }}>Total</div>
                    </div>
                </div>
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Request Form */}
                <div className="card h-fit md:col-span-1">
                    <h2 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '1.25rem' }}>Request Leave</h2>
                    <form onSubmit={submitLeaveRequest} className="flex flex-col gap-4">
                        <div>
                            <label htmlFor="leave-reason" className="block mb-2 font-medium" style={{ fontSize: '0.85rem' }}>Reason</label>
                            <input id="leave-reason" type="text" placeholder="Sick leave, Vacation..." value={leaveReason} onChange={e => setLeaveReason(e.target.value)} required disabled={submitting} />
                        </div>
                        <div>
                            <label htmlFor="leave-start" className="block mb-2 font-medium" style={{ fontSize: '0.85rem' }}>Start Date</label>
                            <input id="leave-start" type="date" value={leaveStartDate} onChange={e => setLeaveStartDate(e.target.value)} required disabled={submitting} />
                        </div>
                        <div>
                            <label htmlFor="leave-end" className="block mb-2 font-medium" style={{ fontSize: '0.85rem' }}>End Date</label>
                            <input id="leave-end" type="date" value={leaveEndDate} onChange={e => setLeaveEndDate(e.target.value)} required disabled={submitting} />
                        </div>
                        <button
                            type="submit"
                            className="btn btn-primary w-full mt-2"
                            disabled={submitting}
                            style={{ boxShadow: '0 4px 14px rgba(16,185,129,0.35)' }}
                        >
                            {submitting ? 'Submitting…' : 'Submit Request'}
                        </button>
                    </form>
                </div>

                {/* Leave History */}
                <div className="card md:col-span-2">
                    <h2 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '1.25rem' }}>My Leave History</h2>
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
