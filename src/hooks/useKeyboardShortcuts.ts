import { useEffect } from 'react';

interface KeyboardShortcutsProps {
  onStart: () => void;
  onStop: () => void;
  isRecording: boolean;
  enabled?: boolean;
}

export function useKeyboardShortcuts({
  onStart,
  onStop,
  isRecording,
  enabled = true,
}: KeyboardShortcutsProps) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger if user is editing inside a standard form input or textarea unless it has altKey
      const target = event.target as HTMLElement | null;
      const isInput =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable);

      // Check Alt key (Windows/Linux Alt or macOS Option)
      const hasAlt = event.altKey;
      const key = event.key.toLowerCase();

      // Alt + R : Start recording
      if (hasAlt && (key === 'r' || event.code === 'KeyR')) {
        event.preventDefault();
        event.stopPropagation();
        if (!isRecording) {
          onStart();
        }
        return;
      }

      // Alt + X : Stop recording and copy
      if (hasAlt && (key === 'x' || event.code === 'KeyX')) {
        event.preventDefault();
        event.stopPropagation();
        if (isRecording) {
          onStop();
        }
        return;
      }

      // Spacebar quick toggle when NOT typing in an input
      if (!isInput && event.code === 'Space' && !hasAlt && !event.ctrlKey && !event.metaKey) {
        event.preventDefault();
        if (isRecording) {
          onStop();
        } else {
          onStart();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown, { capture: true });
    return () => {
      window.removeEventListener('keydown', handleKeyDown, { capture: true });
    };
  }, [onStart, onStop, isRecording, enabled]);
}
