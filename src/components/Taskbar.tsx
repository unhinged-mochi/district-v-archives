import { useState, useEffect } from 'react';
import type { WindowData } from '../types';

interface TaskbarProps {
  windows: WindowData[];
  activeWindowId: string | null;
  onFocusWindow: (id: string) => void;
  onSearch?: () => void;
  onSettings?: () => void;
}

const STATUS_MESSAGES = [
  'LSPD // CLASSIFIED',
  'LSPD // SECURE CHANNEL',
  'SYSTEM NOMINAL',
  'UPLINK STABLE',
  'LSPD // CASE ACTIVE',
  'MONITORING...',
  'ENCRYPTED LINK OK',
  'LSPD // LEVEL 5',
];

export default function Taskbar({ windows, activeWindowId, onFocusWindow, onSearch, onSettings }: TaskbarProps) {
  const [time, setTime] = useState(new Date());
  const [statusIdx, setStatusIdx] = useState(0);
  const [statusVisible, setStatusVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Rotate status message every 8-15 seconds with fade transition
  useEffect(() => {
    const schedule = () => setTimeout(() => {
      setStatusVisible(false);
      setTimeout(() => {
        setStatusIdx((prev) => {
          let next = prev;
          while (next === prev) next = Math.floor(Math.random() * STATUS_MESSAGES.length);
          return next;
        });
        setStatusVisible(true);
      }, 300);
      id = schedule();
    }, 8000 + Math.random() * 7000);
    let id = schedule();
    return () => clearTimeout(id);
  }, []);

  const formattedTime = time.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const getShortTitle = (title: string) => {
    // On mobile, show only the last segment
    const parts = title.split(' // ');
    const last = parts[parts.length - 1];
    return last.length > 20 ? last.slice(0, 20) + '...' : last;
  };

  return (
    <nav className="taskbar" aria-label="Window taskbar">
      <span className="font-mono text-xs shrink-0 text-terminal-amber">
        {formattedTime}
      </span>

      {/* Search button */}
      {onSearch && (
        <button
          className="taskbar-action-btn text-terminal-amber"
          onClick={onSearch}
          title="Search (Ctrl+K)"
        >
          [/]
        </button>
      )}

      <div className="flex gap-1 flex-1 mx-2 overflow-x-auto">
        {windows.map((win) => (
          <button
            key={win.id}
            className={`taskbar-item ${win.id === activeWindowId ? 'active' : ''} ${win.minimized ? 'minimized' : ''}`}
            onClick={() => onFocusWindow(win.id)}
          >
            <span className="hidden sm:inline">
              {win.title.length > 30 ? win.title.slice(0, 30) + '...' : win.title}
            </span>
            <span className="sm:hidden">
              {getShortTitle(win.title)}
            </span>
          </button>
        ))}
      </div>

      {/* Settings button */}
      {onSettings && (
        <button
          className="taskbar-action-btn text-terminal-amber"
          onClick={onSettings}
          title="Settings"
        >
          [*]
        </button>
      )}

      <span
        className="font-mono text-xs whitespace-nowrap hidden sm:inline shrink-0 text-terminal-amber transition-opacity duration-300"
        style={{ opacity: statusVisible ? 1 : 0 }}
      >
        {STATUS_MESSAGES[statusIdx]}
      </span>
    </nav>
  );
}
