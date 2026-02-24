import React from 'react';

function Footer() {
    return (
        <footer style={{
            padding: '1rem 2rem',
            marginTop: 'auto',
            borderTop: '1px solid var(--border-color)',
            background: 'var(--bg-surface)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
        }}>
            <span style={{ color: 'var(--pk-text-muted)', fontSize: '0.9rem' }}>
                WorkSync • v1.5.0
            </span>
            <a
                href="https://github.com/chason2007/worksync"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'var(--pk-text-muted)', display: 'flex', alignItems: 'center', transition: 'color 0.2s', gap: '0.5rem', textDecoration: 'none' }}
                onMouseOver={(e) => e.currentTarget.style.color = 'var(--pk-text-main)'}
                onFocus={(e) => e.currentTarget.style.color = 'var(--pk-text-main)'}
                onMouseOut={(e) => e.currentTarget.style.color = 'var(--pk-text-muted)'}
                onBlur={(e) => e.currentTarget.style.color = 'var(--pk-text-muted)'}
                title="View Source on GitHub"
            >
                <span style={{ fontSize: '0.9rem' }}>Open Source</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
                </svg>
            </a>
        </footer>
    );
}

export default Footer;
