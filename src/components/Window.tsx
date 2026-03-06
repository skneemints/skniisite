import React, { useRef, useState, useEffect } from 'react';
import { motion, useMotionValue } from 'framer-motion';
import { X, Square, Minus } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface WindowProps {
  title: string;
  icon: any; // Lucide icon or string path
  children: React.ReactNode;
  onClose?: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
  onFocus?: () => void;
  isMaximized?: boolean;
  isMinimized?: boolean;
  isActive?: boolean;
  zIndex?: number;
  defaultPosition?: { x: number, y: number };
  flush?: boolean;
  transparent?: boolean;
  className?: string;
}

const MIN_W = 300;
const MIN_H = 150;

const HANDLES: { dir: string; cursor: string; style: React.CSSProperties }[] = [
  { dir: 'n',  cursor: 'ns-resize', style: { top: 0,    left: 8,   right: 8,  height: 6 } },
  { dir: 's',  cursor: 'ns-resize', style: { bottom: 0, left: 8,   right: 8,  height: 6 } },
  { dir: 'w',  cursor: 'ew-resize', style: { top: 8,    bottom: 8, left: 0,   width: 6  } },
  { dir: 'e',  cursor: 'ew-resize', style: { top: 8,    bottom: 8, right: 0,  width: 6  } },
  { dir: 'nw', cursor: 'nw-resize', style: { top: 0,    left: 0,   width: 10, height: 10 } },
  { dir: 'ne', cursor: 'ne-resize', style: { top: 0,    right: 0,  width: 10, height: 10 } },
  { dir: 'sw', cursor: 'sw-resize', style: { bottom: 0, left: 0,   width: 10, height: 10 } },
  { dir: 'se', cursor: 'se-resize', style: { bottom: 0, right: 0,  width: 10, height: 10 } },
];

export const Window: React.FC<WindowProps> = ({
  title, icon: Icon, children, onClose, onMinimize, onMaximize, onFocus,
  isMaximized, isMinimized, isActive, zIndex = 50, defaultPosition, flush = false, transparent = false, className = "max-w-md"
}) => {
  const { theme } = useTheme();
  const isTop = theme.taskbarPosition === 'top';
  const contentRef = useRef<HTMLDivElement>(null);
  const windowRef = useRef<HTMLDivElement>(null);
  // false while the opening animation plays, then flips to true.
  // Only after it's true do we add flex-1 — adding it during the animation
  // causes the browser to ignore height:0 (flex-basis falls back to content size).
  const [contentReady, setContentReady] = useState(isMaximized);
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);

  // Explicit motion values so resize can update position (for n/w edge drags)
  // and so we can zero them out when maximized without a transform offset.
  const dragX = useMotionValue(defaultPosition?.x ?? 0);
  const dragY = useMotionValue(defaultPosition?.y ?? 0);

  useEffect(() => {
    if (contentRef.current) contentRef.current.style.height = '';
  }, [contentReady, isMaximized]);

  const startDrag = (e: React.PointerEvent) => {
    if (isMaximized) return;
    if ((e.target as HTMLElement).closest('button')) return;
    e.preventDefault();
    onFocus?.();

    const startMouseX = e.clientX;
    const startMouseY = e.clientY;
    const startDragX = dragX.get();
    const startDragY = dragY.get();

    const onMove = (ev: PointerEvent) => {
      dragX.set(startDragX + ev.clientX - startMouseX);
      dragY.set(startDragY + ev.clientY - startMouseY);
    };
    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  const startResize = (e: React.PointerEvent, dir: string) => {
    if (isMaximized) return;
    // Use pointer events so stopPropagation cancels Framer Motion's drag
    e.preventDefault();
    e.stopPropagation();
    onFocus?.();

    const el = windowRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const startMouseX = e.clientX;
    const startMouseY = e.clientY;
    const startW = rect.width;
    const startH = rect.height;
    const startDragX = dragX.get();
    const startDragY = dragY.get();

    const onMove = (ev: PointerEvent) => {
      const dx = ev.clientX - startMouseX;
      const dy = ev.clientY - startMouseY;
      let newW = startW;
      let newH = startH;
      let newDragX = startDragX;
      let newDragY = startDragY;

      // The window sits in a centered flex container, so changing its width/height
      // shifts the natural (untransformed) position by half the size delta.
      // We compensate dragX/dragY on every edge so the opposite edge stays fixed.
      if (dir.includes('e')) {
        newW = Math.max(MIN_W, startW + dx);
        newDragX += (newW - startW) / 2;   // right edge grows → drift right
      }
      if (dir.includes('w')) {
        newW = Math.max(MIN_W, startW - dx);
        newDragX -= (newW - startW) / 2;   // left edge grows → drift left
      }
      if (dir.includes('s')) {
        newH = Math.max(MIN_H, startH + dy);
        newDragY += (newH - startH) / 2;
      }
      if (dir.includes('n')) {
        newH = Math.max(MIN_H, startH - dy);
        newDragY -= (newH - startH) / 2;
      }

      dragX.set(newDragX);
      dragY.set(newDragY);
      setSize({ w: newW, h: newH });
    };

    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  const maximizedStyles = isMaximized ? {
    top: isTop ? '48px' : '0',
    bottom: isTop ? '0' : '48px',
    left: '0',
    right: '0',
    width: '100vw',
    height: 'calc(100vh - 48px)',
    maxWidth: 'none',
    margin: '0',
    zIndex: 1000,
  } : {
    zIndex,
    boxShadow: isActive ? `0 0 20px ${theme.primary}66` : 'none',
    ...(size ? { width: size.w, height: size.h, maxWidth: 'none' } : {}),
  };

  return (
    <motion.div
      ref={windowRef}
      initial={isMaximized ? {} : { opacity: 0 }}
      animate={{
        scale: isMinimized ? 0.9 : 1,
        opacity: isMinimized ? 0 : 1,
        pointerEvents: isMinimized ? 'none' : 'auto'
      }}
      transition={{
        default: { duration: 0.2 },
        opacity: { duration: 0.08 },
      }}
      onMouseDown={onFocus}
      className={`win95-outset ${transparent ? '' : 'surface-grit'} overflow-hidden flex flex-col pointer-events-auto transition-shadow duration-300 ${isMaximized ? 'fixed' : 'relative ' + className} ${isMinimized ? 'invisible h-0 w-0' : ''}`}
      style={{
        // When maximized, pass 0 to cancel any drag-offset transform.
        // When not maximized, the motion value follows drag and resize.
        x: isMaximized ? 0 : dragX,
        y: isMaximized ? 0 : dragY,
        minWidth: isMaximized ? 0 : (isMinimized ? 0 : MIN_W),
        display: isMinimized ? 'none' : 'flex',
        backgroundColor: transparent ? 'transparent' : 'var(--color-win-bg)',
        ...maximizedStyles
      }}
    >
      {/* Title Bar */}
      <div
        className={`p-1 flex items-center justify-between cursor-move select-none relative z-10 ${isActive ? 'animate-pulse-slow' : ''}`}
        style={{ backgroundColor: isActive ? `${theme.primary}66` : `${theme.primary}33` }}
        onPointerDown={startDrag}
        onDoubleClick={onMaximize}
      >
        <div className="flex items-center gap-2 px-1">
          {typeof Icon === 'string' ? (
            <img src={Icon} alt="" className="w-4 h-4 object-contain" style={{ filter: `drop-shadow(0 0 2px ${theme.primary}44)` }} />
          ) : (
            <Icon className="w-4 h-4" style={{ color: theme.primary }} />
          )}
          <span className="font-bold text-xs uppercase tracking-tight text-white">{title}</span>
        </div>
        <div className="flex gap-1">
          <button
            onClick={onMinimize}
            className="win95-outset p-0.5 bg-gray-800 hover:bg-gray-700 pointer-events-auto"
          >
            <Minus className="w-3 h-3 text-gray-400" />
          </button>
          <button
            onClick={onMaximize}
            className="win95-outset p-0.5 bg-gray-800 hover:bg-gray-700 pointer-events-auto"
          >
            <Square className="w-3 h-3 text-gray-400" />
          </button>
          <button
            onClick={onClose}
            className="win95-outset p-0.5 bg-gray-800 hover:bg-red-900 pointer-events-auto group"
          >
            <X className="w-3 h-3 group-hover:text-white" style={{ color: theme.secondary }} />
          </button>
        </div>
      </div>

      {/* Content — height 0→auto animation on mount.
          flex-1 is withheld until the animation finishes so the browser
          doesn't override height:0 via flex-basis content fallback.
          Once ready, the inline height is cleared so flex-1 can fill
          the window correctly when maximized or resized. */}
      <motion.div
        ref={contentRef}
        className={`overflow-hidden flex flex-col${contentReady ? ' flex-1 min-h-0' : ''}`}
        initial={contentReady ? {} : { height: 0 }}
        animate={!contentReady ? { height: 'auto' } : {}}
        transition={{
          height: { duration: 0.22, delay: 0.08, ease: [0.25, 0, 0, 1] },
        }}
        onAnimationComplete={() => {
          if (!contentReady) setContentReady(true);
        }}
      >
        <div
          className={`${flush ? (transparent ? '' : 'win95-inset') : ('p-4 m-1 ' + (transparent ? '' : 'win95-inset'))} text-sm font-mono text-gray-300 ${transparent ? '' : 'bg-black/40 backdrop-blur-sm'} relative z-10 overflow-hidden flex flex-col flex-1 min-h-0`}
          style={transparent ? { backgroundColor: 'transparent', backgroundImage: 'none', border: 'none', boxShadow: 'none' } : {}}
        >
          {children}
        </div>
      </motion.div>

      {/* Resize handles — transparent hit areas on all 8 edges/corners.
          Uses pointer events so stopPropagation cancels Framer Motion drag. */}
      {!isMaximized && !isMinimized && HANDLES.map(({ dir, cursor, style }) => (
        <div
          key={dir}
          className="absolute z-20"
          style={{ ...style, cursor }}
          onPointerDown={(e) => startResize(e, dir)}
        />
      ))}
    </motion.div>
  );
};
