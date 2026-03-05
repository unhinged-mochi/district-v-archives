import { useEffect, useRef, useCallback } from 'react';
import gsap from 'gsap';

interface BootProps {
  onComplete: () => void;
}

const BOOT_LINES = [
  { text: 'LOS SANTOS POLICE DEPARTMENT', delay: 0 },
  { text: 'CLASSIFIED TERMINAL v5.0.2', delay: 0.1 },
  { text: '================================', delay: 0.05 },
  { text: 'SYSTEM CHECK................', delay: 0.3, status: 'OK' },
  { text: 'LOADING DATABASE............', delay: 0.5, status: 'OK' },
  { text: 'CASE #DV-2026-0221..........', delay: 0.2, status: 'OK' },
  { text: 'CLEARANCE: LEVEL 5..........', delay: 0.4, status: 'OK' },
  { text: '================================', delay: 0.05 },
  { text: '', delay: 0.2 },
  { text: '> ACCESSING DISTRICT V CASE FILES...', delay: 0.3 },
  { text: '> ACCESS GRANTED', delay: 0.5, isAccessGranted: true },
];

export default function Boot({ onComplete }: BootProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const linesRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  const skip = useCallback(() => {
    if (timelineRef.current) {
      timelineRef.current.kill();
    }
    onComplete();
  }, [onComplete]);

  // Allow keyboard skip — any key dismisses boot
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip on any key press
      e.preventDefault();
      skip();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [skip]);

  useEffect(() => {
    const container = containerRef.current;
    const linesContainer = linesRef.current;
    if (!container || !linesContainer) return;

    const tl = gsap.timeline({ onComplete });
    timelineRef.current = tl;

    // Initial screen flicker
    tl.fromTo(container, { opacity: 0 }, { opacity: 1, duration: 0.1 });
    tl.to(container, { opacity: 0, duration: 0.05 });
    tl.to(container, { opacity: 1, duration: 0.1 });

    // Process each line
    BOOT_LINES.forEach((lineData, lineIndex) => {
      const lineEl = linesContainer.children[lineIndex] as HTMLElement;
      if (!lineEl) return;

      // Show the line container
      tl.set(lineEl, { display: 'block' });

      if (lineData.text === '') {
        tl.to({}, { duration: lineData.delay });
        return;
      }

      // Get character spans
      const charSpans = lineEl.querySelectorAll('.boot-char');
      const statusSpan = lineEl.querySelector('.boot-status');
      const cursorSpan = lineEl.querySelector('.boot-cursor');

      // Show cursor at start of this line
      if (cursorSpan) {
        tl.set(cursorSpan, { display: 'inline' });
      }

      // Type each character
      if (charSpans.length > 0) {
        tl.to(charSpans, {
          opacity: 1,
          duration: 0.01,
          stagger: 0.02,
        });
      }

      // Hide cursor on this line after typing
      if (cursorSpan) {
        tl.set(cursorSpan, { display: 'none' });
      }

      // Show OK status after a randomized delay
      if (statusSpan && lineData.status) {
        const randomDelay = 0.1 + Math.random() * 0.4;
        tl.to({}, { duration: randomDelay });
        tl.to(statusSpan, { opacity: 1, duration: 0.05 });
      }

      // Add screen flicker at specific points
      if (lineIndex === 3 || lineIndex === 6) {
        tl.to(container, {
          filter: 'brightness(1.5)',
          duration: 0.05,
        });
        tl.to(container, {
          filter: 'brightness(0.7)',
          duration: 0.05,
        });
        tl.to(container, {
          filter: 'brightness(1)',
          duration: 0.1,
        });
      }

      // Line delay
      if (lineData.delay > 0) {
        tl.to({}, { duration: lineData.delay });
      }
    });

    // ACCESS GRANTED full-screen flash
    tl.to(container, {
      filter: 'brightness(3)',
      duration: 0.1,
    });
    tl.to(container, {
      filter: 'brightness(0.5)',
      duration: 0.1,
    });
    tl.to(container, {
      filter: 'brightness(1)',
      duration: 0.2,
    });

    // Final glow on ACCESS GRANTED
    const lastLine = linesContainer.children[linesContainer.children.length - 1] as HTMLElement;
    if (lastLine) {
      tl.to(lastLine, {
        textShadow: '0 0 20px var(--color-terminal-amber), 0 0 40px var(--color-terminal-amber)',
        duration: 0.3,
        repeat: 2,
        yoyo: true,
      });
    }

    // Hold before completing
    tl.to({}, { duration: 0.5 });

    return () => {
      tl.kill();
    };
  }, [onComplete]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 flex flex-col items-center justify-center z-[9999] cursor-pointer"
      style={{ backgroundColor: 'var(--color-terminal-bg)' }}
      role="status"
      aria-label="System boot sequence. Press any key or click to skip."
      onClick={skip}
    >
      <div ref={linesRef} className="font-mono text-sm sm:text-base leading-relaxed text-terminal-amber">
        {BOOT_LINES.map((lineData, i) => (
          <div
            key={i}
            className={`glow-text ${
              lineData.isAccessGranted ? 'mt-2 text-lg font-bold' : ''
            }`}
            style={{
              display: 'none',
              minHeight: lineData.text === '' ? '1em' : undefined,
            }}
          >
            {lineData.text.split('').map((char, ci) => (
              <span key={ci} className="boot-char" style={{ opacity: 0 }}>
                {char}
              </span>
            ))}
            {lineData.status && (
              <span className="boot-status ml-1 font-bold" style={{ opacity: 0, color: 'var(--color-status-safe)' }}>
                {' '}{lineData.status}
              </span>
            )}
            <span className="boot-cursor cursor-blink" style={{ display: 'none' }}>_</span>
          </div>
        ))}
      </div>
      <div
        className="font-mono text-xs mt-8 cursor-blink"
        style={{ color: 'var(--color-terminal-amber-dim)' }}
      >
        PRESS ANY KEY TO SKIP
      </div>
    </div>
  );
}
