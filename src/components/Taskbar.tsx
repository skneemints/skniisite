import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Palette, Settings, Music, List } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useMusic } from '../context/MusicContext';
import { MusicPlayer } from './MusicPlayer';

interface TaskbarProps {
  onOpenWindow: (type: string) => void;
  openWindows: string[];
  minimizedWindows: string[];
  onShutdown: () => void;
}

export const Taskbar: React.FC<TaskbarProps> = ({ onOpenWindow, openWindows, minimizedWindows, onShutdown }) => {
  const [showStart, setShowStart] = useState(false);
  const [showMusic, setShowMusic] = useState(false);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const { theme } = useTheme();
  const { isPlaying } = useMusic();

  const isTop = theme.taskbarPosition === 'top';
  
  const isTerminalOpen = openWindows.includes('terminal');
  const isTerminalMinimized = minimizedWindows.includes('terminal');
  const isTerminalActive = isTerminalOpen && !isTerminalMinimized;

  return (
    <>
    <div className={`h-12 win95-outset surface-grit flex items-center px-1 gap-2 relative z-[100] ${isTop ? 'order-first' : 'order-last'}`}>
      
      {/* Start Button */}
      <button 
        onClick={() => { setShowStart(!showStart); setShowMusic(false); }}
        className={`h-9 px-4 win95-outset flex items-center gap-2 font-bold relative z-10 active:win95-inset transition-colors ${showStart ? 'win95-inset' : ''}`}
      >
        <div
          className={`w-4 h-4 transition-all ${showStart ? '' : 'opacity-50'}`}
          style={{
            backgroundColor: theme.primary,
            WebkitMask: 'url(/assets/icons/launcher-rune.svg) no-repeat center / contain',
            mask: 'url(/assets/icons/launcher-rune.svg) no-repeat center / contain',
          }}
        />
        <span style={{ color: theme.primary, opacity: showStart ? 1 : 0.6 }}>START</span>
      </button>

      <div className="h-8 border-r border-gray-700 mx-1 relative z-10" />

      {/* SkniiTTY Button */}
      <button
        onClick={() => onOpenWindow('terminal')}
        className={`h-9 px-3 win95-outset flex flex-col items-center justify-center gap-0.5 font-bold active:win95-inset transition-colors ${isTerminalActive ? 'win95-inset' : ''}`}
        title="SkniiTTY Terminal"
      >
        <div
          className={`w-5 h-5 transition-all ${isTerminalActive ? '' : 'opacity-60'}`}
          style={{
            backgroundColor: theme.primary,
            WebkitMask: 'url(/assets/icons/skniitty.svg) no-repeat center / contain',
            mask: 'url(/assets/icons/skniitty.svg) no-repeat center / contain',
          }}
        />
        {/* Open indicator — visible whenever the terminal is open (even if minimized) */}
        <div
          className="h-0.5 w-4 rounded-full transition-all duration-200"
          style={{ backgroundColor: isTerminalOpen ? theme.primary : 'transparent' }}
        />
      </button>

      {/* Center Spacer */}
      <div className="flex-1" />

      {/* Music Icon */}
      <button 
        onClick={() => { setShowMusic(!showMusic); setShowStart(false); }}
        className={`win95-outset h-9 w-9 flex items-center justify-center relative z-10 active:win95-inset ${isPlaying ? 'animate-pulse' : ''} ${showMusic ? 'win95-inset' : ''}`}
        style={{ color: theme.primary }}
      >
        <Music className="w-5 h-5" />
      </button>

      {/* OS Status */}
      <div className="win95-inset h-9 px-3 flex items-center gap-2 text-xs font-bold relative z-10" style={{ color: theme.primary }}>
        <div className="w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: theme.primary }} />
        OS_ACTIVE
      </div>

      {/* Clock */}
      <div className="win95-inset h-9 px-3 flex items-center gap-3 text-xs font-bold relative z-10" style={{ color: theme.primary }}>
        <span className="font-mono">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
      </div>

    </div>

    {/* START MENU — fixed, z-99 so the taskbar (z-100) sits on top of it */}
    <AnimatePresence>
      {showStart && (
        <motion.div
          initial={{ y: isTop ? '-100%' : '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: isTop ? '-100%' : '100%', opacity: 0 }}
          transition={{ duration: 0.2, ease: [0.25, 0, 0, 1] }}
          className="w-64 win95-outset bg-[#1a1a1a] surface-grit p-1"
          style={{ position: 'fixed', [isTop ? 'top' : 'bottom']: 48, left: 0, zIndex: 99 }}
        >
          <div className="relative z-10 flex">
            <div
              className="w-6 flex items-end justify-center py-4"
              style={{ background: `linear-gradient(to bottom, ${theme.accent}, ${theme.primary})` }}
            >
              <span className="rotate-180 [writing-mode:vertical-lr] font-bold text-black tracking-widest text-sm uppercase">SKNII OS</span>
            </div>
            <div className="flex-1 flex flex-col gap-1 p-1">
              <button
                onClick={() => { onOpenWindow('theme'); setShowStart(false); }}
                className="w-full text-left px-4 py-2 hover:bg-gray-700 flex items-center gap-2 font-bold text-xs"
              >
                <Palette className="w-4 h-4" /> THEME_COLORS
              </button>
              <button
                onClick={() => { onOpenWindow('settings'); setShowStart(false); }}
                className="w-full text-left px-4 py-2 hover:bg-gray-700 flex items-center gap-2 font-bold text-xs"
              >
                <Settings className="w-4 h-4" /> SETTINGS
              </button>
              <div className="border-t border-gray-700 my-1" />
              <button
                onClick={() => { onShutdown(); setShowStart(false); }}
                className="w-full text-left px-4 py-2 hover:bg-red-900 font-bold text-xs text-red-500"
              >
                SHUTDOWN
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>

    {/* MUSIC PLAYER — fixed, z-99 so the taskbar (z-100) sits on top of it */}
    <AnimatePresence>
      {showMusic && (
        <motion.div
          initial={{ y: isTop ? '-100%' : '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: isTop ? '-100%' : '100%', opacity: 0 }}
          transition={{ duration: 0.2, ease: [0.25, 0, 0, 1] }}
          className="w-64 win95-outset bg-[#1a1a1a] surface-grit p-3"
          style={{ position: 'fixed', [isTop ? 'top' : 'bottom']: 48, right: 8, zIndex: 99 }}
        >
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4 border-b border-gray-700 pb-2">
              <Music className="w-4 h-4" style={{ color: theme.primary }} />
              <span className="text-xs font-bold tracking-tighter uppercase flex-1">Media Player</span>
              <button
                onClick={() => setShowPlaylist(p => !p)}
                className="win95-outset p-1 flex items-center justify-center hover:bg-gray-800 active:win95-inset"
                style={{ color: '#9ca3af' }}
                title={showPlaylist ? 'Now Playing' : 'Playlist'}
              >
                {showPlaylist ? <Music className="w-3 h-3" /> : <List className="w-3 h-3" />}
              </button>
            </div>
            <MusicPlayer showPlaylist={showPlaylist} setShowPlaylist={setShowPlaylist} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
    </>
  );
};
