import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

function CommandPalette({ isOpen, onClose }) {
    const navigate = useNavigate();
    const { logout, user } = useAuth();
    const { toggleTheme } = useTheme();
    const [query, setQuery] = useState('');
    const inputRef = useRef(null);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            setTimeout(() => inputRef.current.focus(), 50);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const commands = [
        {
            id: 'home',
            label: 'Go to Dashboard',
            icon: '🏠',
            action: () => navigate('/')
        },
        {
            id: 'attendance',
            label: 'Mark Attendance',
            icon: '📅',
            action: () => navigate('/attendance')
        },
        {
            id: 'profile',
            label: 'My Profile',
            icon: '👤',
            action: () => navigate('/profile')
        },
        {
            id: 'theme',
            label: 'Toggle Theme',
            icon: '🌓',
            action: () => toggleTheme()
        },
        {
            id: 'logout',
            label: 'Logout',
            icon: '🚪',
            action: () => logout()
        },
    ];

    // Admin specific commands
    if (user?.role === 'Admin') {
        commands.push(
            {
                id: 'settings',
                label: 'Settings',
                icon: '⚙️',
                action: () => navigate('/settings')
            },
            {
                id: 'add-user',
                label: 'Add User',
                icon: '➕',
                action: () => navigate('/add-user')
            }
        );
    }

    const filteredCommands = commands.filter(cmd =>
        cmd.label.toLowerCase().includes(query.toLowerCase())
    );

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]" onClick={onClose}>
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>

            <div
                className="relative bg-white dark:bg-gray-800 w-full max-w-lg rounded-xl shadow-2xl overflow-hidden animate-fade-in-up border border-gray-200 dark:border-gray-700"
                onClick={e => e.stopPropagation()}
            >
                <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-3">
                    <span className="text-gray-400">🔍</span>
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Type a command or search..."
                        className="w-full bg-transparent border-none outline-none text-lg text-gray-800 dark:text-gray-100 placeholder-gray-400"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        onKeyDown={e => {
                            if (e.key === 'Escape') onClose();
                            if (e.key === 'Enter' && filteredCommands.length > 0) {
                                filteredCommands[0].action();
                                onClose();
                            }
                        }}
                    />
                    <div className="text-xs font-mono text-gray-400 border border-gray-200 rounded px-2 py-0.5">ESC</div>
                </div>

                <div className="max-h-[60vh] overflow-y-auto py-2">
                    {filteredCommands.length > 0 ? (
                        filteredCommands.map((cmd, index) => (
                            <button
                                key={cmd.id}
                                className={`w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${index === 0 ? 'bg-gray-50/50 dark:bg-gray-700/50' : ''}`}
                                onClick={() => {
                                    cmd.action();
                                    onClose();
                                }}
                            >
                                <span className="text-xl">{cmd.icon}</span>
                                <span className="font-medium text-gray-700 dark:text-gray-200">{cmd.label}</span>
                            </button>
                        ))
                    ) : (
                        <div className="p-8 text-center text-gray-500">
                            No commands found
                        </div>
                    )}
                </div>

                <div className="bg-gray-50 dark:bg-gray-900/50 px-4 py-2 border-t border-gray-100 dark:border-gray-700 text-xs text-gray-400 flex justify-between">
                    <span>Use arrow keys to navigate</span>
                    <span>ProTip: Press Ctrl+K to open this anytime</span>
                </div>
            </div>
        </div>
    );
}

export default CommandPalette;
