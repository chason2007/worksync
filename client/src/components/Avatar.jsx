function Avatar({ user, size = 'md', className = '' }) {
    const sizeClasses = {
        sm: 'avatar-sm',
        md: '',
        lg: 'avatar-lg'
    };

    const getInitials = (name) => {
        if (!name) return '?';
        const parts = name.split(' ');
        if (parts.length >= 2) {
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        }
        return name.charAt(0).toUpperCase();
    };

    const handleImageError = (e) => {
        e.target.style.display = 'none';
        e.target.nextSibling.style.display = 'flex';
    };

    const imageUrl = user?.profileImage
        ? (user.profileImage.startsWith('data:')
            ? user.profileImage
            : `${import.meta.env.VITE_API_URL}/uploads/profiles/${user.profileImage}`)
        : null;

    // Super Admin Gear Icon
    if (user?.email === 'admin@worksync.com') {
        return (
            <div className={`avatar ${sizeClasses[size]} ${className} bg-slate-800 text-white`} title="Super Admin">
                <svg xmlns="http://www.w3.org/2000/svg" width="60%" height="60%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.74v-.47a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                </svg>
            </div>
        );
    }

    return (
        <div className={`avatar ${sizeClasses[size]} ${className}`} style={{ position: 'relative', overflow: 'hidden' }}>
            {imageUrl ? (
                <>
                    <img
                        src={imageUrl}
                        alt={user?.name || 'User'}
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            position: 'absolute',
                            top: 0,
                            left: 0
                        }}
                        onError={handleImageError}
                    />
                    <div style={{ display: 'none' }}>
                        {getInitials(user?.name)}
                    </div>
                </>
            ) : (
                <div>{getInitials(user?.name)}</div>
            )}
        </div>
    );
}

import PropTypes from 'prop-types';

Avatar.propTypes = {
    user: PropTypes.shape({
        name: PropTypes.string,
        profileImage: PropTypes.string,
    }),
    size: PropTypes.string,
    className: PropTypes.string,
};

export default Avatar;
