import { useTheme } from '../context/ThemeContext';

function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();

    const getIcon = () => {
        switch (theme) {
            case 'light': return '☀️';
            case 'dark': return '🌙';
            case 'system': return '⚙️';
            default: return '☀️';
        }
    };

    const getLabel = () => {
        switch (theme) {
            case 'light': return 'Light';
            case 'dark': return 'Dark';
            case 'system': return 'System';
            default: return 'Light';
        }
    };

    return (
        <button
            onClick={toggleTheme}
            className="btn btn-ghost"
            title={`Current theme: ${getLabel()}`}
            style={{
                fontSize: '1.2rem',
                padding: '0.4rem 0.8rem',
                border: '1px solid var(--pk-border)',
                background: 'var(--pk-surface)'
            }}
        >
            <span key={theme} style={{ display: 'inline-block', animation: 'rotate-in 0.5s cubic-bezier(0.25, 1, 0.5, 1)' }}>
                {getIcon()}
            </span>
        </button>
    );
}

export default ThemeToggle;
