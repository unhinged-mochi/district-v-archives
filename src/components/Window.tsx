import { useEffect, useRef, useCallback } from 'react';
import gsap from 'gsap';

interface WindowProps {
  id: string;
  title: string;
  zIndex: number;
  windowIndex: number;
  isClosing?: boolean;
  isActive?: boolean;
  minimized?: boolean;
  position?: { x: number; y: number };
  onClose: (id: string) => void;
  onFocus: (id: string) => void;
  onCloseComplete?: (id: string) => void;
  onMinimize?: (id: string) => void;
  onMove?: (id: string, x: number, y: number) => void;
  children: React.ReactNode;
}

export default function Window({
  id,
  title,
  zIndex,
  windowIndex,
  isClosing,
  isActive,
  minimized,
  position,
  onClose,
  onFocus,
  onCloseComplete,
  onMinimize,
  onMove,
  children,
}: WindowProps) {
  const windowRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null);

  // Open animation — CRT power-on effect
  useEffect(() => {
    if (windowRef.current) {
      gsap.fromTo(
        windowRef.current,
        { scaleY: 0, scaleX: 0.8, opacity: 0, filter: 'brightness(2)' },
        {
          scaleY: 1,
          scaleX: 1,
          opacity: 1,
          filter: 'brightness(1)',
          duration: 0.25,
          ease: 'power2.out',
        }
      );
    }
  }, []);

  // Close animation
  useEffect(() => {
    if (isClosing && windowRef.current) {
      gsap.to(windowRef.current, {
        scaleY: 0,
        scaleX: 0.8,
        opacity: 0,
        filter: 'brightness(2)',
        duration: 0.2,
        ease: 'power2.in',
        onComplete: () => onCloseComplete?.(id),
      });
    }
  }, [isClosing, id, onCloseComplete]);

  // Focus pulse
  useEffect(() => {
    if (isActive && windowRef.current) {
      gsap.fromTo(
        windowRef.current,
        {
          boxShadow: '0 0 8px rgba(255, 176, 0, 0.3), 0 4px 24px rgba(0, 0, 0, 0.6)',
        },
        {
          boxShadow: '0 0 16px rgba(255, 176, 0, 0.5), 0 4px 24px rgba(0, 0, 0, 0.6)',
          duration: 0.2,
          yoyo: true,
          repeat: 1,
        }
      );
    }
  }, [isActive]);

  // Title bar drag — desktop only
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    // Only drag on primary button, skip if clicking buttons
    if (e.button !== 0) return;
    if ((e.target as HTMLElement).closest('button')) return;

    // Skip drag on mobile (windows are fullscreen)
    if (window.matchMedia('(max-width: 768px)').matches) return;

    const el = windowRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      origX: rect.left,
      origY: rect.top,
    };

    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    el.style.cursor = 'grabbing';
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragRef.current || !onMove) return;

    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    const newX = dragRef.current.origX + dx;
    const newY = Math.max(0, dragRef.current.origY + dy); // prevent dragging above viewport

    onMove(id, newX, newY);
  }, [id, onMove]);

  const handlePointerUp = useCallback(() => {
    if (!dragRef.current) return;
    dragRef.current = null;
    const el = windowRef.current;
    if (el) el.style.cursor = '';
  }, []);

  // Compute position: use stored position if available, otherwise default offset
  const defaultOffset = (windowIndex % 8) * 20;
  const posStyle = position
    ? { top: position.y, left: position.x }
    : {
        top: `calc(10% + ${defaultOffset}px)`,
        left: `calc(50% - 350px + ${defaultOffset}px)`,
      };

  return (
    <section
      ref={windowRef}
      className="window window-responsive"
      role="dialog"
      aria-label={title}
      style={{
        position: 'absolute',
        ...posStyle,
        width: '700px',
        maxWidth: 'calc(100vw - 40px)',
        minHeight: '400px',
        zIndex,
        transformOrigin: 'center center',
        display: minimized ? 'none' : undefined,
      }}
      onMouseDown={() => onFocus(id)}
    >
      {/* Title bar — drag handle */}
      <div
        className="window-title"
        role="banner"
        style={{ cursor: onMove ? 'grab' : undefined }}
        onPointerDown={onMove ? handlePointerDown : undefined}
        onPointerMove={onMove ? handlePointerMove : undefined}
        onPointerUp={onMove ? handlePointerUp : undefined}
      >
        <h2 className="flex-1 truncate text-xs font-bold uppercase tracking-wide m-0" style={{ fontSize: 'inherit', lineHeight: 'inherit' }}>{title}</h2>
        <div className="flex items-center gap-1 shrink-0 ml-4">
          {onMinimize && (
            <button
              className="minimize-btn"
              onClick={(e) => {
                e.stopPropagation();
                onMinimize(id);
              }}
            >
              [-]
            </button>
          )}
          <button
            className="close-btn"
            onClick={(e) => {
              e.stopPropagation();
              onClose(id);
            }}
          >
            [X]
          </button>
        </div>
      </div>

      {/* Content */}
      <div
        className="p-4 overflow-y-auto window-content"
        style={{ maxHeight: 'calc(80vh - 40px)' }}
      >
        {children}
      </div>
    </section>
  );
}
