import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';
import AnnouncementModal from './AnnouncementModal';
import { useToast } from '../context/ToastContext';

function GlobalAnnouncementListener() {
    const location = useLocation();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const announcementId = params.get('announcementId');

        if (announcementId) {
            fetchAnnouncement(announcementId);
        }
    }, [location.search]);

    const fetchAnnouncement = async (id) => {
        setLoading(true);
        try {
            const res = await api.get(`/api/announcements/${id}`);
            setSelectedAnnouncement(res.data);
        } catch (err) {
            console.error(err);
            showToast('Failed to load announcement details', 'error');
            // Remove the ID from URL if invalid to prevent loop/error state
            closeModal();
        } finally {
            setLoading(false);
        }
    };

    const closeModal = () => {
        setSelectedAnnouncement(null);
        // Remove query param without refreshing page
        const params = new URLSearchParams(location.search);
        params.delete('announcementId');

        const newSearch = params.toString();
        const newPath = location.pathname + (newSearch ? `?${newSearch}` : '');

        navigate(newPath, { replace: true });
    };

    if (loading && !selectedAnnouncement) {
        // Optional: Show a loading spinner/overlay if desired
        return null;
    }

    return (
        <AnnouncementModal
            announcement={selectedAnnouncement}
            onClose={closeModal}
        />
    );
}

export default GlobalAnnouncementListener;
