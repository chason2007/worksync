import React from 'react';
import { formatDateTime } from '../utils/dateUtils';
import Avatar from './Avatar';

function AnnouncementModal({ announcement, onClose }) {
    if (!announcement) return null;

    return (
        <>
            <div className="modal-backdrop" onClick={onClose} />
            <div className="modal max-w-2xl w-full">
                <div className="modal-header">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        <span className="text-primary-500">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                        </span>
                        Announcement
                    </h3>
                    <button
                        className="btn btn-ghost p-2"
                        onClick={onClose}
                    >
                        ✕
                    </button>
                </div>
                <div className="modal-body">
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold mb-2 text-slate-800">{announcement.title}</h2>
                        <div className="flex items-center gap-3 text-sm text-muted border-b border-slate-100 pb-4">
                            <div className="flex items-center gap-2">
                                <Avatar user={announcement.postedBy || { name: 'Admin' }} size="sm" />
                                <span className="font-medium">{announcement.postedBy?.name || 'Shape Inc.'}</span>
                            </div>
                            <span>•</span>
                            <time>{formatDateTime(announcement.createdAt)}</time>
                        </div>
                    </div>

                    <div className="prose prose-slate max-w-none">
                        <p className="text-slate-600 whitespace-pre-wrap leading-relaxed text-lg">
                            {announcement.content}
                        </p>
                    </div>
                </div>
                <div className="modal-footer">
                    <button onClick={onClose} className="btn btn-primary">
                        Close
                    </button>
                </div>
            </div>
        </>
    );
}

export default AnnouncementModal;
