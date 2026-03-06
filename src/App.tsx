import { useState } from 'react';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { MusicProvider } from './context/MusicContext';
import { Window } from './components/Window';
import { Taskbar } from './components/Taskbar';
import { ThemeWindow, SettingsWindow } from './components/ThemeSettings';
import { Starfield } from './components/Starfield';
import { WelcomeWindow } from './components/WelcomeWindow';
import { SkniiTTY } from './components/SkniiTTY';
import { MouseTrail } from './components/MouseTrail';
import { BSOD } from './components/BSOD';
import { Palette, Settings, Cpu, Monitor } from 'lucide-react';

const Desktop = () => {
  const { theme } = useTheme();
  const [openWindows, setOpenWindows] = useState<string[]>(['welcome']);
  const [minimizedWindows, setMinimizedWindows] = useState<string[]>([]);
  const [maximizedWindows, setMaximizedWindows] = useState<string[]>([]);
  const [windowStack, setWindowStack] = useState<string[]>(['welcome']);
  const [showBSOD, setShowBSOD] = useState(false);

  const triggerBSOD = () => {
    setShowBSOD(true);
  };

  const restartSystem = () => {
    setShowBSOD(false);
    setOpenWindows(['welcome']);
    setMinimizedWindows([]);
    setMaximizedWindows([]);
    setWindowStack(['welcome']);
  };

  const focusWindow = (id: string) => {
    setWindowStack(prev => {
      const filtered = prev.filter(w => w !== id);
      return [...filtered, id];
    });
  };

  const toggleWindow = (id: string) => {
    if (openWindows.includes(id)) {
      if (minimizedWindows.includes(id)) {
        setMinimizedWindows(prev => prev.filter(w => w !== id));
        focusWindow(id);
      } else {
        setMinimizedWindows(prev => [...prev, id]);
      }
    } else {
      setOpenWindows(prev => [...prev, id]);
      setMinimizedWindows(prev => prev.filter(w => w !== id));
      focusWindow(id);
    }
  };

  const closeWindow = (id: string) => {
    setOpenWindows(prev => prev.filter(w => w !== id));
    setMinimizedWindows(prev => prev.filter(w => w !== id));
    setMaximizedWindows(prev => prev.filter(w => w !== id));
    setWindowStack(prev => prev.filter(w => w !== id));
  };

  const minimizeWindow = (id: string) => {
    setMinimizedWindows(prev => [...prev, id]);
  };

  const maximizeWindow = (id: string) => {
    focusWindow(id);
    setMaximizedWindows(prev => 
      prev.includes(id) ? prev.filter(w => w !== id) : [...prev, id]
    );
  };

  const getZIndex = (id: string) => {
    const index = windowStack.indexOf(id);
    return index === -1 ? 50 : 50 + index;
  };

  return (
    <div className={`h-screen w-screen flex flex-col relative overflow-hidden select-none`}>
      <Starfield />
      <MouseTrail />
      
      {showBSOD && <BSOD onRestart={restartSystem} />}
      
      {/* CRT Effects */}
      {theme.crtEnabled && (
        <>
          <div className="crt-overlay" />
          <div className="scanline" />
        </>
      )}

      {/* Taskbar at Top/Bottom based on theme */}
      <Taskbar 
        onOpenWindow={toggleWindow} 
        openWindows={openWindows}
        minimizedWindows={minimizedWindows}
        onShutdown={triggerBSOD}
      />

      <main className="flex-1 relative p-6 z-10">
        {/* Desktop Icons */}
        {theme.showDesktopIcons && (
          <div className="flex flex-col gap-8 pointer-events-auto w-fit">
            <div 
              onDoubleClick={() => toggleWindow('theme')}
              className="flex flex-col items-center w-20 gap-1 group cursor-pointer"
            >
              <div className="p-2 group-hover:bg-white/5 rounded transition-colors win95-outset bg-black/40">
                <Palette className="w-8 h-8" style={{ color: theme.primary }} />
              </div>
              <span className="text-[10px] text-center font-bold bg-black/50 px-1 uppercase tracking-tight" style={{ color: theme.primary }}>Themes</span>
            </div>

            <div 
              onDoubleClick={() => toggleWindow('hardware')}
              className="flex flex-col items-center w-20 gap-1 group cursor-pointer"
            >
              <div className="p-2 group-hover:bg-white/5 rounded transition-colors win95-outset bg-black/40">
                <Cpu className="w-8 h-8" style={{ color: theme.secondary }} />
              </div>
              <span className="text-[10px] text-center font-bold bg-black/50 px-1 uppercase tracking-tight" style={{ color: theme.secondary }}>Hardware</span>
            </div>
          </div>
        )}

        {/* Windows Container */}
        <div className="absolute inset-0 pointer-events-none">
          {openWindows.includes('welcome') && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <Window 
                title="SYS_BOOT.EXE" 
                icon={Monitor} 
                onClose={() => closeWindow('welcome')}
                onMinimize={() => minimizeWindow('welcome')}
                onMaximize={() => maximizeWindow('welcome')}
                onFocus={() => focusWindow('welcome')}
                zIndex={getZIndex('welcome')}
                isActive={windowStack[windowStack.length - 1] === 'welcome'}
                isMinimized={minimizedWindows.includes('welcome')}
                isMaximized={maximizedWindows.includes('welcome')}
                defaultPosition={{ x: 0, y: 0 }}
              >
                <WelcomeWindow />
              </Window>
            </div>
          )}

          {openWindows.includes('theme') && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <Window 
                title="Theme Settings" 
                icon={Palette} 
                onClose={() => closeWindow('theme')}
                onMinimize={() => minimizeWindow('theme')}
                onMaximize={() => maximizeWindow('theme')}
                onFocus={() => focusWindow('theme')}
                zIndex={getZIndex('theme')}
                isActive={windowStack[windowStack.length - 1] === 'theme'}
                isMinimized={minimizedWindows.includes('theme')}
                isMaximized={maximizedWindows.includes('theme')}
                defaultPosition={{ x: 0, y: 0 }}
              >
                <ThemeWindow />
              </Window>
            </div>
          )}

          {openWindows.includes('settings') && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <Window 
                title="System Settings" 
                icon={Settings} 
                onClose={() => closeWindow('settings')}
                onMinimize={() => minimizeWindow('settings')}
                onMaximize={() => maximizeWindow('settings')}
                onFocus={() => focusWindow('settings')}
                zIndex={getZIndex('settings')}
                isActive={windowStack[windowStack.length - 1] === 'settings'}
                isMinimized={minimizedWindows.includes('settings')}
                isMaximized={maximizedWindows.includes('settings')}
                defaultPosition={{ x: 0, y: 0 }}
              >
                <SettingsWindow />
              </Window>
            </div>
          )}

          {openWindows.includes('hardware') && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <Window 
                title="Hardware_Monitor.sys" 
                icon={Cpu} 
                onClose={() => closeWindow('hardware')}
                onMinimize={() => minimizeWindow('hardware')}
                onMaximize={() => maximizeWindow('hardware')}
                onFocus={() => focusWindow('hardware')}
                zIndex={getZIndex('hardware')}
                isActive={windowStack[windowStack.length - 1] === 'hardware'}
                isMinimized={minimizedWindows.includes('hardware')}
                isMaximized={maximizedWindows.includes('hardware')}
                defaultPosition={{ x: 0, y: 0 }}
              >
                <div className="space-y-2">
                  <p style={{ color: theme.primary }}>CPU_LOAD: [|||||-----] 50%</p>
                  <p style={{ color: theme.secondary }}>MEM_USED: [||||||||--] 82%</p>
                  <p className="text-[10px] mt-4 opacity-50">LOCATION: /DEV/SKNII/SYSTEM</p>
                </div>
              </Window>
            </div>
          )}

          {openWindows.includes('terminal') && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <Window 
                title="SkniiTTY" 
                icon="/assets/icons/skniitty.svg" 
                onClose={() => closeWindow('terminal')}
                onMinimize={() => minimizeWindow('terminal')}
                onMaximize={() => maximizeWindow('terminal')}
                onFocus={() => focusWindow('terminal')}
                zIndex={getZIndex('terminal')}
                isActive={windowStack[windowStack.length - 1] === 'terminal'}
                isMinimized={minimizedWindows.includes('terminal')}
                isMaximized={maximizedWindows.includes('terminal')}
                defaultPosition={{ x: 0, y: 0 }}
                className="max-w-4xl w-[900px]"
                flush
              >
                <SkniiTTY onCrash={triggerBSOD} />
              </Window>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <MusicProvider>
        <Desktop />
      </MusicProvider>
    </ThemeProvider>
  );
}

export default App;