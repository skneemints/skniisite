import { useState, useEffect } from 'react';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { MusicProvider } from './context/MusicContext';
import { UserLinksProvider, useUserLinks } from './context/UserLinksContext';
import { Window } from './components/Window';
import { Taskbar } from './components/Taskbar';
import { ThemeWindow, SettingsWindow } from './components/ThemeSettings';
import { Starfield } from './components/Starfield';
import { WelcomeWindow } from './components/WelcomeWindow';
import { SkniiTTY } from './components/SkniiTTY';
import { MouseTrail } from './components/MouseTrail';
import { BSOD } from './components/BSOD';
import { Palette, Settings, Cpu, Monitor, ExternalLink, Plus, Trash2, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Edit2, Check } from 'lucide-react';

const ShortcutConfigWindow = () => {
  const { theme } = useTheme();
  const { groups, addGroup, removeGroup, updateGroup, addLink, removeLink, reorderGroups, reorderLinks } = useUserLinks();
  
  const [newGroupName, setNewGroupName] = useState('');
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [editGroupName, setEditGroupName] = useState('');

  const [newLinkLabel, setNewLinkLabel] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [newLinkIcon, setNewLinkIcon] = useState('');
  const [activeGroupId, setActiveGroupId] = useState<string | null>(groups[0]?.id || null);

  const handleAddGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (newGroupName.trim()) {
      addGroup(newGroupName.trim());
      setNewGroupName('');
    }
  };

  const handleAddLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeGroupId && newLinkLabel && newLinkUrl) {
      addLink(activeGroupId, {
        label: newLinkLabel,
        url: newLinkUrl.startsWith('http') ? newLinkUrl : `https://${newLinkUrl}`,
        icon: newLinkIcon || undefined
      });
      setNewLinkLabel('');
      setNewLinkUrl('');
      setNewLinkIcon('');
    }
  };

  const moveGroup = (index: number, direction: 'left' | 'right') => {
    const newGroups = [...groups];
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex >= 0 && targetIndex < groups.length) {
      [newGroups[index], newGroups[targetIndex]] = [newGroups[targetIndex], newGroups[index]];
      reorderGroups(newGroups);
    }
  };

  const moveLink = (groupId: string, index: number, direction: 'up' | 'down') => {
    const group = groups.find(g => g.id === groupId);
    if (!group) return;
    const newLinks = [...group.links];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex >= 0 && targetIndex < newLinks.length) {
      [newLinks[index], newLinks[targetIndex]] = [newLinks[targetIndex], newLinks[index]];
      reorderLinks(groupId, newLinks);
    }
  };

  return (
    <div className="flex flex-col h-full gap-4 overflow-hidden">
      {/* Group Management */}
      <div className="space-y-2">
        <label className="text-[10px] font-bold uppercase opacity-70">Groups (Columns)</label>
        <form onSubmit={handleAddGroup} className="flex gap-1">
          <input 
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            className="flex-1 bg-gray-900 border-none px-2 py-1 text-xs win95-inset"
            placeholder="New group name..."
            style={{ color: theme.primary }}
          />
          <button type="submit" className="px-3 py-1 win95-outset text-[10px] font-bold uppercase hover:bg-gray-800">
            <Plus className="w-3 h-3" />
          </button>
        </form>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
        {groups.map((group, idx) => (
          <div 
            key={group.id} 
            className={`min-w-[150px] p-2 win95-outset bg-black/40 flex flex-col gap-2 ${activeGroupId === group.id ? 'ring-1 ring-inset ring-white/20' : ''}`}
            onClick={() => setActiveGroupId(group.id)}
          >
            <div className="flex items-center justify-between gap-1">
              {editingGroupId === group.id ? (
                <div className="flex-1 flex gap-1">
                  <input 
                    value={editGroupName}
                    onChange={(e) => setEditGroupName(e.target.value)}
                    className="flex-1 bg-gray-900 text-[10px] px-1"
                    autoFocus
                  />
                  <button onClick={() => { updateGroup(group.id, { name: editGroupName }); setEditingGroupId(null); }}>
                    <Check className="w-3 h-3 text-green-500" />
                  </button>
                </div>
              ) : (
                <>
                  <span className="text-[10px] font-bold truncate flex-1" style={{ color: theme.accent }}>{group.name}</span>
                  <div className="flex gap-0.5">
                    <button onClick={() => { setEditingGroupId(group.id); setEditGroupName(group.name); }} className="hover:text-white"><Edit2 className="w-2.5 h-2.5" /></button>
                    <button onClick={() => moveGroup(idx, 'left')} disabled={idx === 0}><ArrowLeft className="w-2.5 h-2.5" /></button>
                    <button onClick={() => moveGroup(idx, 'right')} disabled={idx === groups.length - 1}><ArrowRight className="w-2.5 h-2.5" /></button>
                    <button onClick={() => removeGroup(group.id)} className="text-red-500"><Trash2 className="w-2.5 h-2.5" /></button>
                  </div>
                </>
              )}
            </div>
            
            <div className="flex-1 overflow-y-auto max-h-[150px] space-y-1 custom-scrollbar">
              {group.links.map((link, lIdx) => (
                <div key={link.id} className="text-[9px] p-1 win95-inset bg-black/20 flex items-center justify-between group">
                  <span className="truncate flex-1">{link.label}</span>
                  <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => moveLink(group.id, lIdx, 'up')} disabled={lIdx === 0}><ArrowUp className="w-2 h-2" /></button>
                    <button onClick={() => moveLink(group.id, lIdx, 'down')} disabled={lIdx === group.links.length - 1}><ArrowDown className="w-2 h-2" /></button>
                    <button onClick={() => removeLink(group.id, link.id)} className="text-red-500"><Trash2 className="w-2 h-2" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Link Management */}
      {activeGroupId && (
        <form onSubmit={handleAddLink} className="space-y-2 p-2 win95-inset bg-black/20 mt-auto">
          <div className="text-[10px] font-bold uppercase opacity-70 mb-1">Add Link to {groups.find(g => g.id === activeGroupId)?.name}</div>
          <div className="grid grid-cols-2 gap-2">
            <input 
              value={newLinkLabel}
              onChange={(e) => setNewLinkLabel(e.target.value)}
              className="bg-gray-900 border-none px-2 py-1 text-[10px] win95-inset"
              placeholder="Label (e.g. GitHub)"
              style={{ color: theme.primary }}
            />
            <input 
              value={newLinkUrl}
              onChange={(e) => setNewLinkUrl(e.target.value)}
              className="bg-gray-900 border-none px-2 py-1 text-[10px] win95-inset"
              placeholder="URL (e.g. github.com)"
              style={{ color: theme.primary }}
            />
          </div>
          <input 
            value={newLinkIcon}
            onChange={(e) => setNewLinkIcon(e.target.value)}
            className="w-full bg-gray-900 border-none px-2 py-1 text-[10px] win95-inset"
            placeholder="Icon URL (optional, e.g. https://.../favicon.ico)"
            style={{ color: theme.primary }}
          />
          <button type="submit" className="w-full py-1 win95-outset text-[10px] font-bold uppercase hover:bg-gray-800 flex items-center justify-center gap-1">
            <Plus className="w-3 h-3" /> Add Shortcut
          </button>
        </form>
      )}
    </div>
  );
};

const ShortcutsDashboard = ({ onOpenConfig }: { onOpenConfig: () => void }) => {
  const { theme } = useTheme();
  const { groups } = useUserLinks();

  return (
    <div className="h-full w-full relative">
      <button 
        onClick={onOpenConfig}
        className="absolute top-0 right-0 p-2 win95-outset bg-black/40 hover:bg-black/60 transition-colors z-[70] group"
        title="Configure Shortcuts"
      >
        <Settings className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" style={{ color: theme.primary }} />
      </button>

      <div className="h-full w-full flex items-center justify-center overflow-auto p-4 custom-scrollbar">
        <div className="flex gap-12 items-start">
          {groups.map(group => (
            <div key={group.id} className="flex flex-col gap-6 min-w-[120px]">
              <h3 className="text-sm font-bold uppercase tracking-[0.2em] border-b pb-2 mb-2 text-center" style={{ color: theme.accent, borderColor: `${theme.accent}33` }}>
                {group.name}
              </h3>
              <div className="flex flex-col gap-4">
                {group.links.map(link => (
                  <button
                    key={link.id}
                    onClick={() => window.open(link.url, '_blank')}
                    className="flex flex-col items-center gap-2 group transition-transform hover:scale-110 active:scale-95"
                  >
                    <div className="p-3 rounded-sm win95-outset bg-black/40 group-hover:bg-black/60 transition-colors relative overflow-hidden">
                      {link.icon ? (
                        <img src={link.icon} alt="" className="w-8 h-8 object-contain" />
                      ) : (
                        <ExternalLink className="w-8 h-8" style={{ color: theme.primary }} />
                      )}
                      <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-center max-w-[100px] break-words" style={{ color: theme.primary, textShadow: '0 0 10px rgba(0,0,0,0.8)' }}>
                      {link.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const Desktop = () => {
  const { theme } = useTheme();
  const { groups } = useUserLinks();
  const [openWindows, setOpenWindows] = useState<string[]>([]);
  const [minimizedWindows, setMinimizedWindows] = useState<string[]>([]);
  const [maximizedWindows, setMaximizedWindows] = useState<string[]>([]);
  const [windowStack, setWindowStack] = useState<string[]>([]);
  const [showBSOD, setShowBSOD] = useState(false);

  // Initial window state based on shortcuts
  useEffect(() => {
    if (groups.length > 0) {
      setOpenWindows(['shortcuts']);
      setWindowStack(['shortcuts']);
      setMaximizedWindows(['shortcuts']);
    } else {
      setOpenWindows(['welcome']);
      setWindowStack(['welcome']);
    }
  }, []); // Only on mount

  const triggerBSOD = () => {
    setShowBSOD(true);
  };

  const restartSystem = () => {
    setShowBSOD(false);
    if (groups.length > 0) {
      setOpenWindows(['shortcuts']);
      setWindowStack(['shortcuts']);
      setMaximizedWindows(['shortcuts']);
    } else {
      setOpenWindows(['welcome']);
      setWindowStack(['welcome']);
    }
    setMinimizedWindows([]);
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
    <div className={`h-[100dvh] w-screen flex flex-col relative overflow-hidden select-none`}>
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
        {/* Desktop frame — Option B: 3 strips (omits the edge adjacent to the taskbar) */}
        {theme.taskbarPosition === 'bottom' && <div className="absolute top-0 left-0 right-0 h-[10px] win95-outset surface-grit pointer-events-none z-[60]" />}
        {theme.taskbarPosition === 'top'    && <div className="absolute bottom-0 left-0 right-0 h-[10px] win95-outset surface-grit pointer-events-none z-[60]" />}
        <div className={`absolute ${theme.taskbarPosition === 'top' ? 'top-0 bottom-[10px]' : 'top-[10px] bottom-0'} left-0 w-[10px] win95-outset surface-grit pointer-events-none z-[60]`} />
        <div className={`absolute ${theme.taskbarPosition === 'top' ? 'top-0 bottom-[10px]' : 'top-[10px] bottom-0'} right-0 w-[10px] win95-outset surface-grit pointer-events-none z-[60]`} />

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
              onDoubleClick={() => toggleWindow('links')}
              className="flex flex-col items-center w-20 gap-1 group cursor-pointer"
            >
              <div className="p-2 group-hover:bg-white/5 rounded transition-colors win95-outset bg-black/40">
                <ExternalLink className="w-8 h-8" style={{ color: theme.accent }} />
              </div>
              <span className="text-[10px] text-center font-bold bg-black/50 px-1 uppercase tracking-tight" style={{ color: theme.accent }}>Shortcuts</span>
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

          {openWindows.includes('shortcuts') && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <Window 
                title="Sknii_Terminal_Shortcuts.lnk" 
                icon={ExternalLink} 
                onClose={() => closeWindow('shortcuts')}
                onMinimize={() => minimizeWindow('shortcuts')}
                onMaximize={() => maximizeWindow('shortcuts')}
                onFocus={() => focusWindow('shortcuts')}
                zIndex={getZIndex('shortcuts')}
                isActive={windowStack[windowStack.length - 1] === 'shortcuts'}
                isMinimized={minimizedWindows.includes('shortcuts')}
                isMaximized={maximizedWindows.includes('shortcuts')}
                defaultPosition={{ x: 0, y: 0 }}
                transparent
                className="max-w-6xl w-[90vw] h-[80vh]"
              >
                <ShortcutsDashboard onOpenConfig={() => toggleWindow('links')} />
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

          {openWindows.includes('links') && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <Window 
                title="Shortcut Configuration" 
                icon={ExternalLink} 
                onClose={() => closeWindow('links')}
                onMinimize={() => minimizeWindow('links')}
                onMaximize={() => maximizeWindow('links')}
                onFocus={() => focusWindow('links')}
                zIndex={getZIndex('links')}
                isActive={windowStack[windowStack.length - 1] === 'links'}
                isMinimized={minimizedWindows.includes('links')}
                isMaximized={maximizedWindows.includes('links')}
                defaultPosition={{ x: 0, y: 0 }}
                className="max-w-2xl w-[90vw]"
              >
                <ShortcutConfigWindow />
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
                className="max-w-4xl w-[95vw] md:w-[900px]"
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
        <UserLinksProvider>
          <Desktop />
        </UserLinksProvider>
      </MusicProvider>
    </ThemeProvider>
  );
}

export default App;
