import React from 'react';

const STATUS_CONFIG = {
    // Attendance
    'Present': { color: 'success', icon: '✅' },
    'Absent': { color: 'danger', icon: '❌' },
    'Late': { color: 'warning', icon: '⏰' },
    'Half-day': { color: 'warning', icon: '🌓' },

    // Leaves
    'Approved': { color: 'success', icon: '👍' },
    'Rejected': { color: 'danger', icon: '👎' },
    'Pending': { color: 'warning', icon: '⏳' },

    // Roles
    'Admin': { color: 'primary', icon: '🛡️' },
    'Employee': { color: 'neutral', icon: '👤' },

    // General
    'Completed': { color: 'success', icon: '🏁' },
    'Active': { color: 'success', icon: '🟢' },
    'Inactive': { color: 'neutral', icon: '⚫' }
};

const StatusBadge = ({ status, className = '' }) => {
    const config = STATUS_CONFIG[status] || { color: 'neutral', icon: '•' };

    return (
        <span className={`status-badge status-${config.color} ${className}`}>
            <span className="status-icon">{config.icon}</span>
            <span className="status-text">{status}</span>
        </span>
    );
};

export default StatusBadge;
