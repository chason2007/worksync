import { useEffect } from 'react';

export const useKeyboardShortcuts = (shortcuts) => {
    useEffect(() => {
        const handleKeyDown = (event) => {
            // Check if input or textarea is focused to avoid triggering shortcuts while typing
            if (['INPUT', 'TEXTAREA'].includes(event.target.tagName)) {
                return;
            }

            for (const { key, ctrl, shift, alt, meta, action } of shortcuts) {
                const keyMatch = event.key.toLowerCase() === key.toLowerCase();
                const ctrlMatch = !!ctrl === event.ctrlKey;
                const shiftMatch = !!shift === event.shiftKey;
                const altMatch = !!alt === event.altKey;
                const metaMatch = !!meta === event.metaKey;

                if (keyMatch && ctrlMatch && shiftMatch && altMatch && metaMatch) {
                    event.preventDefault();
                    action();
                    return;
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [shortcuts]);
};
