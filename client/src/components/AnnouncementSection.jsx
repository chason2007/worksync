import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { formatDateTime } from '../utils/dateUtils';
import Avatar from './Avatar';
import Skeleton from './Skeleton';

function AnnouncementSection() {
    const { user } = useAuth();
    const { showToast } = useToast();
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isPosting, setIsPosting] = useState(false);

    // Form State
    const [showForm, setShowForm] = useState(false);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');

    const fetchAnnouncements = async () => {
        try {
            const res = await api.get('/api/announcements');
            setAnnouncements(res.data);
        } catch (err) {
            console.error("Failed to fetch announcements", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const handlePost = async (e) => {
        e.preventDefault();
        setIsPosting(true);
        try {
            await api.post('/api/announcements', { title, content });
            showToast('Announcement posted successfully', 'success');
            setTitle('');
            setContent('');
            setShowForm(false);
            fetchAnnouncements();
        } catch (err) {
            showToast(err.response?.data?.error || 'Failed to post announcement', 'error');
        } finally {
            setIsPosting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this announcement?')) return;
        try {
            await api.delete(`/api/announcements/${id}`);
            showToast('Announcement deleted', 'success');
            setAnnouncements(announcements.filter(a => a._id !== id));
        } catch (err) {
            showToast('Failed to delete announcement', 'error');
        }
    };

    return (
        <div className="card mb-8">
            <div className="flex justify-between items-center mb-4">
                <h3 className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary-500">
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                        <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                    </svg>
                    Company News
                </h3>
                {user.role === 'Admin' && (
                    <button
                        className="btn btn-primary btn-sm"
                        onClick={() => setShowForm(!showForm)}
                    >
                        {showForm ? 'Cancel' : '+ New Post'}
                    </button>
                )}
            </div>

            {/* Post Form (Admin Only) */}
            {showForm && (
                <form onSubmit={handlePost} className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="mb-3">
                        <label className="block text-sm font-bold text-muted mb-1">Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full p-2 border rounded"
                            placeholder="Announcement Title"
                            required
                            maxLength={100}
                        />
                    </div>
                    <div className="mb-3">
                        <label className="block text-sm font-bold text-muted mb-1">Content</label>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="w-full p-2 border rounded h-24"
                            placeholder="Write your update here..."
                            required
                        />
                    </div>
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={isPosting}
                        >
                            {isPosting ? 'Posting...' : 'Post Announcement'}
                        </button>
                    </div>
                </form>
            )}

            {/* Announcements List */}
            <div className="flex flex-col gap-4">
                {loading ? (
                    <>
                        <Skeleton height="80px" />
                        <Skeleton height="80px" />
                    </>
                ) : announcements.length === 0 ? (
                    <div className="text-center py-8 text-muted bg-slate-50 rounded-lg border border-dashed border-slate-200">
                        No announcements yet.
                    </div>
                ) : (
                    announcements.map(announcement => (
                        <div key={announcement._id} className="p-4 border rounded-lg hover:border-primary-200 transition-colors bg-white shadow-sm">
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="text-lg font-bold text-slate-800">{announcement.title}</h4>
                                {user.role === 'Admin' && (
                                    <button
                                        onClick={() => handleDelete(announcement._id)}
                                        className="text-red-500 hover:text-red-700 p-1 opacity-50 hover:opacity-100 transition-opacity"
                                        title="Delete Announcement"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                    </button>
                                )}
                            </div>
                            <p className="text-slate-600 mb-3 whitespace-pre-wrap leading-relaxed">{announcement.content}</p>
                            <div className="flex items-center justify-between text-xs text-muted pt-3 border-t border-slate-100">
                                <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center">
                                        <span className="font-bold text-xs">{announcement.postedBy?.name?.[0] || '?'}</span>
                                    </div>
                                    <span>Posted by {announcement.postedBy?.name || 'Unknown User'}</span>
                                </div>
                                <time>{formatDateTime(announcement.createdAt)}</time>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default AnnouncementSection;
