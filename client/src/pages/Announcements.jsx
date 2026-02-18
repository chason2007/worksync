import React from 'react';
import AnnouncementSection from '../components/AnnouncementSection';

function Announcements() {
    return (
        <div className="fade-in max-w-screen-xl mx-auto p-4 md:p-8">
            <h1 className="text-3xl font-bold mb-6">Announcements</h1>
            <p className="text-muted mb-8">Stay updated with the latest news and announcements.</p>

            <AnnouncementSection />
        </div>
    );
}

export default Announcements;
