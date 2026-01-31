import { useEffect } from 'react';
import { useNavigate } from 'react-router';

interface ShortcutConfig {
  onCommandPalette: () => void;
}

export const useKeyboardShortcuts = (config: ShortcutConfig) => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Command Palette - Ctrl+K or Cmd+K
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        config.onCommandPalette();
        return;
      }

      // Prevent shortcuts when typing in input fields
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement).isContentEditable
      ) {
        return;
      }

      // Global shortcuts (require Ctrl/Cmd)
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 'b':
            e.preventDefault();
            navigate('/billing');
            break;
          case 'p':
            e.preventDefault();
            navigate('/products');
            break;
          case 'i':
            e.preventDefault();
            navigate('/inventory');
            break;
          case 'o':
            e.preventDefault();
            navigate('/orders');
            break;
          case 'r':
            e.preventDefault();
            navigate('/reports');
            break;
          case 'h':
            e.preventDefault();
            navigate('/');
            break;
          case ',':
            e.preventDefault();
            navigate('/settings');
            break;
        }
      }

      // Single key shortcuts (no modifier needed)
      if (!e.ctrlKey && !e.metaKey && !e.altKey && !e.shiftKey) {
        switch (e.key) {
          case '?':
            e.preventDefault();
            config.onCommandPalette();
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate, config]);
};

// Keyboard shortcut reference
export const KEYBOARD_SHORTCUTS = {
  global: [
    { keys: ['Ctrl', 'K'], description: 'Open Command Palette' },
    { keys: ['?'], description: 'Open Command Palette' },
    { keys: ['Ctrl', 'H'], description: 'Go to Dashboard' },
    { keys: ['Ctrl', 'B'], description: 'Go to Billing/POS' },
    { keys: ['Ctrl', 'P'], description: 'Go to Products' },
    { keys: ['Ctrl', 'I'], description: 'Go to Inventory' },
    { keys: ['Ctrl', 'O'], description: 'Go to Orders' },
    { keys: ['Ctrl', 'R'], description: 'Go to Reports' },
    { keys: ['Ctrl', ','], description: 'Go to Settings' },
  ],
  commandPalette: [
    { keys: ['↑', '↓'], description: 'Navigate commands' },
    { keys: ['Enter'], description: 'Execute command' },
    { keys: ['Esc'], description: 'Close palette' },
  ],
};
