import { useState } from 'react';
import PropTypes from 'prop-types';

function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', cancelText = 'Cancel', danger = false }) {
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleConfirm = async () => {
        setLoading(true);
        await onConfirm();
        setLoading(false);
        onClose();
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            animation: 'fadeIn 0.2s ease-out'
        }}>
            <button
                type="button"
                onClick={onClose}
                aria-label="Close modal"
                style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    border: 'none',
                    padding: 0,
                    margin: 0,
                    cursor: 'pointer'
                }}
            />
            <div className="card" style={{
                maxWidth: '500px',
                width: '90%',
                margin: 0,
                position: 'relative',
                zIndex: 1,
                animation: 'slideUp 0.3s ease-out'
            }}>
                <h3 style={{
                    marginBottom: '1rem',
                    color: danger ? 'var(--pk-danger)' : 'var(--pk-text-main)'
                }}>
                    {title}
                </h3>
                <p style={{
                    color: 'var(--pk-text-muted)',
                    marginBottom: '2rem',
                    lineHeight: '1.6'
                }}>
                    {message}
                </p>
                <div style={{
                    display: 'flex',
                    gap: '1rem',
                    justifyContent: 'flex-end'
                }}>
                    <button
                        onClick={onClose}
                        className="btn btn-ghost"
                        disabled={loading}
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={handleConfirm}
                        className={`btn ${danger ? 'btn-danger-solid' : 'btn-primary'} ${loading ? 'loading' : ''}`}
                        disabled={loading}
                    >
                        {loading ? 'Processing...' : confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ConfirmModal;

ConfirmModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onConfirm: PropTypes.func.isRequired,
    title: PropTypes.string.isRequired,
    message: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.node,
        PropTypes.element
    ]).isRequired,
    confirmText: PropTypes.string,
    cancelText: PropTypes.string,
    danger: PropTypes.bool
};
