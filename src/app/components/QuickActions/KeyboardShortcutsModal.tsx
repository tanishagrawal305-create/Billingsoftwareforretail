import React from 'react';
import { X, Keyboard, Command, Zap } from 'lucide-react';
import { KEYBOARD_SHORTCUTS } from '../../hooks/useKeyboardShortcuts';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const modifierKey = isMac ? '⌘' : 'Ctrl';

  const renderKeys = (keys: string[]) => {
    return (
      <div className="flex items-center gap-1">
        {keys.map((key, idx) => (
          <div key={idx} className="flex items-center gap-1">
            <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-sm font-mono text-gray-700 shadow-sm">
              {key === 'Ctrl' ? modifierKey : key}
            </kbd>
            {idx < keys.length - 1 && <span className="text-gray-400">+</span>}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-3 rounded-lg">
              <Keyboard className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Keyboard Shortcuts</h2>
              <p className="text-indigo-100 text-sm">Power up your workflow</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Pro Tip */}
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-4 mb-6 flex items-start gap-3">
            <Zap className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-gray-800 mb-1">Pro Tip</h3>
              <p className="text-sm text-gray-700">
                Press <kbd className="px-2 py-1 bg-white border border-yellow-300 rounded text-xs font-mono">{modifierKey}+K</kbd> or <kbd className="px-2 py-1 bg-white border border-yellow-300 rounded text-xs font-mono">?</kbd> anytime to open the Command Palette for quick access to all features!
              </p>
            </div>
          </div>

          {/* Global Shortcuts */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Command className="w-5 h-5 text-indigo-600" />
              Global Shortcuts
            </h3>
            <div className="space-y-2">
              {KEYBOARD_SHORTCUTS.global.map((shortcut, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <span className="text-gray-700">{shortcut.description}</span>
                  {renderKeys(shortcut.keys)}
                </div>
              ))}
            </div>
          </div>

          {/* Command Palette Shortcuts */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Command className="w-5 h-5 text-purple-600" />
              Command Palette Navigation
            </h3>
            <div className="space-y-2">
              {KEYBOARD_SHORTCUTS.commandPalette.map((shortcut, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <span className="text-gray-700">{shortcut.description}</span>
                  {renderKeys(shortcut.keys)}
                </div>
              ))}
            </div>
          </div>

          {/* Additional Tips */}
          <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
            <h4 className="font-semibold text-indigo-900 mb-2">💡 Additional Tips</h4>
            <ul className="space-y-1 text-sm text-indigo-800">
              <li>• Shortcuts work from anywhere in the app</li>
              <li>• Use Command Palette to search for any action</li>
              <li>• Arrow keys to navigate, Enter to select</li>
              <li>• ESC closes any modal or dialog</li>
              <li>• Type in Command Palette to filter commands</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Press <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs font-mono">ESC</kbd> to close
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
};