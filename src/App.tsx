import { useState } from 'react';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { MusicProvider } from './context/MusicContext';
import { Window } from './components/Window';
import { Taskbar } from './components/Taskbar';
import { ThemeWindow, SettingsWindow } from './components/ThemeSettings';
import { Starfield } from './components/Starfield';
import { WelcomeWindow } from './components/WelcomeWindow';
import { Palette, Settings, Cpu, Monitor } from 'lucide-react';

const Desktop = () => {
  const { theme } = useTheme();
  const [openWindows, setOpenWindows] = useState<string[]>(['welcome']);

  const toggleWindow = (id: string) => {
    console.log('Toggling window:', id);
    setOpenWindows(prev => 
      prev.includes(id) ? prev.filter(w => w !== id) : [...prev, id]
    );
  };

  return (
    <div className={`h-screen w-screen flex flex-col relative overflow-hidden select-none`}>
      <Starfield />
      
      {/* CRT Effects */}
      {theme.crtEnabled && (
        <>
          <div className="crt-overlay" />
          <div className="scanline" />
        </>
      )}

      {/* Taskbar at Top/Bottom based on theme */}
      <Taskbar onOpenWindow={toggleWindow} />

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
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          {openWindows.includes('welcome') && (
            <Window 
              title="SYS_BOOT.EXE" 
              icon={Monitor} 
              onClose={() => toggleWindow('welcome')}
              defaultPosition={{ x: 0, y: 0 }}
            >
              <WelcomeWindow />
            </Window>
          )}

          {openWindows.includes('theme') && (
            <Window 
              title="Theme Settings" 
              icon={Palette} 
              onClose={() => toggleWindow('theme')}
              defaultPosition={{ x: -100, y: -50 }}
            >
              <ThemeWindow />
            </Window>
          )}

          {openWindows.includes('settings') && (
            <Window 
              title="System Settings" 
              icon={Settings} 
              onClose={() => toggleWindow('settings')}
              defaultPosition={{ x: 100, y: 50 }}
            >
              <SettingsWindow />
            </Window>
          )}

          {openWindows.includes('hardware') && (
            <Window 
              title="Hardware_Monitor.sys" 
              icon={Cpu} 
              onClose={() => toggleWindow('hardware')}
              defaultPosition={{ x: 0, y: 0 }}
            >
              <div className="space-y-2">
                <p style={{ color: theme.primary }}>CPU_LOAD: [|||||-----] 50%</p>
                <p style={{ color: theme.secondary }}>MEM_USED: [||||||||--] 82%</p>
                <p className="text-[10px] mt-4 opacity-50">LOCATION: /DEV/SKNII/SYSTEM</p>
              </div>
            </Window>
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