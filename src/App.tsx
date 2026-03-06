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
import { Palette, Settings, Cpu, Monitor, ExternalLink, Plus, Trash2, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Edit2, Check, Image as ImageIcon, Layout, Box, Download, Upload, ListTree, BookOpen } from 'lucide-react';
import { ManualWindow } from './components/ManualWindow';

const AVAILABLE_ICONS = [
  { label: 'Globe', path: '/assets/icons/globe.svg' },
  { label: 'GitHub', path: '/assets/icons/github.svg' },
  { label: 'Folder', path: '/assets/icons/folder.svg' },
  { label: 'Terminal', path: '/assets/icons/terminal.svg' },
  { label: 'Message', path: '/assets/icons/message.svg' },
  { label: 'Code', path: '/assets/icons/code.svg' },
  { label: 'Rune', path: '/assets/icons/launcher-rune.svg' },
  { label: 'Sknii', path: '/assets/icons/sknii.svg' },
  { label: 'SkniiTTY', path: '/assets/icons/skniitty.svg' },
  { label: 'Unknown', path: '/assets/icons/uknown.svg' },
];

const ShortcutConfigWindow = () => {
  const { theme } = useTheme();
  const { groups, settings, updateSettings, addGroup, removeGroup, updateGroup, addSubGroup, removeSubGroup, updateSubGroup, addLink, removeLink, reorderGroups, reorderLinks, reorderSubGroups, importConfig, clearConfig } = useUserLinks();
  const [activeTab, setActiveTab] = useState<'shortcuts' | 'appearance' | 'data'>('shortcuts');
  
  // Group editing state
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupColor, setNewGroupColor] = useState('');
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [editGroupName, setEditGroupName] = useState('');
  const [editGroupColor, setEditGroupColor] = useState('');

  // SubGroup editing state
  const [newSubName, setNewSubName] = useState('');
  const [newSubColor, setNewSubColor] = useState('');
  const [editingSubId, setEditingSubId] = useState<string | null>(null);
  const [editSubName, setEditSubName] = useState('');
  const [editSubColor, setEditSubColor] = useState('');

  // Link editing state
  const [newLinkLabel, setNewLinkLabel] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [newLinkIcon, setNewLinkIcon] = useState('');
  const [newLinkColor, setNewLinkColor] = useState('');
  const [activeGroupId, setActiveGroupId] = useState<string | null>(groups[0]?.id || null);
  const [activeSubGroupId, setActiveSubGroupId] = useState<string | null>(null);
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);

  const handleAddGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (newGroupName.trim()) {
      addGroup(newGroupName.trim(), newGroupColor || undefined);
      setNewGroupName('');
      setNewGroupColor('');
    }
  };

  const handleAddSubGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeGroupId && newSubName.trim()) {
      addSubGroup(activeGroupId, newSubName.trim(), newSubColor || undefined);
      setNewSubName('');
      setNewSubColor('');
    }
  };

  const handleAddLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeGroupId && newLinkLabel && newLinkUrl) {
      const linkData = {
        label: newLinkLabel,
        url: newLinkUrl.startsWith('http') ? newLinkUrl : `https://${newLinkUrl}`,
        icon: newLinkIcon || undefined,
        color: newLinkColor || undefined
      };

      if (editingLinkId) {
        const group = groups.find(g => g.id === activeGroupId);
        if (group) {
          const links = activeSubGroupId 
            ? group.subgroups?.find(s => s.id === activeSubGroupId)?.links || []
            : group.links;
          const newLinks = links.map(l => l.id === editingLinkId ? { ...l, ...linkData } : l);
          reorderLinks(activeGroupId, activeSubGroupId, newLinks);
        }
        setEditingLinkId(null);
      } else {
        addLink(activeGroupId, activeSubGroupId, linkData);
      }
      setNewLinkLabel('');
      setNewLinkUrl('');
      setNewLinkIcon('');
      setNewLinkColor('');
      setShowIconPicker(false);
    }
  };

  const startEditLink = (groupId: string, subGroupId: string | null, link: any) => {
    setActiveGroupId(groupId);
    setActiveSubGroupId(subGroupId);
    setEditingLinkId(link.id);
    setNewLinkLabel(link.label);
    setNewLinkUrl(link.url);
    setNewLinkIcon(link.icon || '');
    setNewLinkColor(link.color || '');
    setShowIconPicker(false);
  };

  const cancelEdit = () => {
    setEditingLinkId(null);
    setNewLinkLabel('');
    setNewLinkUrl('');
    setNewLinkIcon('');
    setNewLinkColor('');
  };

  const moveGroup = (index: number, direction: 'left' | 'right') => {
    const newGroups = [...groups];
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex >= 0 && targetIndex < groups.length) {
      [newGroups[index], newGroups[targetIndex]] = [newGroups[targetIndex], newGroups[index]];
      reorderGroups(newGroups);
    }
  };

  const moveSubGroup = (groupId: string, index: number, direction: 'left' | 'right') => {
    const group = groups.find(g => g.id === groupId);
    if (!group || !group.subgroups) return;
    const newSubs = [...group.subgroups];
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex >= 0 && targetIndex < newSubs.length) {
      [newSubs[index], newSubs[targetIndex]] = [newSubs[targetIndex], newSubs[index]];
      reorderSubGroups(groupId, newSubs);
    }
  };

  const moveLink = (groupId: string, subGroupId: string | null, index: number, direction: 'up' | 'down') => {
    const group = groups.find(g => g.id === groupId);
    if (!group) return;
    const links = subGroupId 
      ? group.subgroups?.find(s => s.id === subGroupId)?.links || []
      : group.links;
    const newLinks = [...links];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex >= 0 && targetIndex < newLinks.length) {
      [newLinks[index], newLinks[targetIndex]] = [newLinks[targetIndex], newLinks[index]];
      reorderLinks(groupId, subGroupId, newLinks);
    }
  };

  const handleExport = () => {
    const data = JSON.stringify({ groups, settings }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sknii-config-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const config = JSON.parse(event.target?.result as string);
        if (config.groups && Array.isArray(config.groups)) {
          importConfig(config);
          alert('Configuration imported successfully!');
        } else {
          alert('Invalid configuration file.');
        }
      } catch (err) {
        alert('Failed to parse configuration file.');
      }
    };
    reader.readAsText(file);
  };

  const handleClear = () => {
    if (confirm('Are you sure you want to clear ALL shortcuts and settings? This cannot be undone.')) {
      clearConfig();
    }
  };

  const activeGroup = groups.find(g => g.id === activeGroupId);
  const activeSub = activeGroup?.subgroups?.find(s => s.id === activeSubGroupId);
  const effectiveLinkColor = newLinkColor || activeSub?.color || activeGroup?.color || theme.primary;

  return (
    <div className="flex h-full gap-4 overflow-hidden">
      {/* Sidebar */}
      <div className="w-32 flex flex-col gap-1 border-r border-white/5 pr-4">
        <button 
          onClick={() => setActiveTab('shortcuts')}
          className={`flex flex-col items-center gap-1 p-2 win95-outset transition-colors ${activeTab === 'shortcuts' ? 'bg-white/10' : 'bg-black/20 hover:bg-black/40'}`}
        >
          <Layout className="w-6 h-6" style={{ color: theme.primary }} />
          <span className="text-[10px] font-bold uppercase tracking-tight">Shortcuts</span>
        </button>
        <button 
          onClick={() => setActiveTab('appearance')}
          className={`flex flex-col items-center gap-1 p-2 win95-outset transition-colors ${activeTab === 'appearance' ? 'bg-white/10' : 'bg-black/20 hover:bg-black/40'}`}
        >
          <Palette className="w-6 h-6" style={{ color: theme.secondary }} />
          <span className="text-[10px] font-bold uppercase tracking-tight">Appearance</span>
        </button>
        <button 
          onClick={() => setActiveTab('data')}
          className={`flex flex-col items-center gap-1 p-2 win95-outset transition-colors ${activeTab === 'data' ? 'bg-white/10' : 'bg-black/20 hover:bg-black/40'}`}
        >
          <Download className="w-6 h-6" style={{ color: theme.accent }} />
          <span className="text-[10px] font-bold uppercase tracking-tight">Backup</span>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'shortcuts' ? (
          <div className="flex flex-col h-full gap-4 overflow-hidden">
            {/* Group Creation */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase opacity-70">Groups (Outer Container)</label>
              <form onSubmit={handleAddGroup} className="flex gap-1">
                <input 
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  className="flex-1 bg-gray-900 border-none px-2 py-1 text-xs win95-inset"
                  placeholder="New group..."
                  style={{ color: theme.primary }}
                />
                <input type="color" value={newGroupColor} onChange={(e) => setNewGroupColor(e.target.value)} className="w-8 h-8 bg-transparent border-none cursor-pointer" />
                <button type="submit" className="px-3 py-1 win95-outset text-[10px] font-bold uppercase hover:bg-gray-800"><Plus className="w-3 h-3" /></button>
              </form>
            </div>

            {/* Groups & Subgroups View */}
            <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar flex-1 min-h-0">
              {groups.map((group, idx) => (
                <div 
                  key={group.id} 
                  className={`min-w-[200px] p-2 win95-outset bg-black/40 flex flex-col gap-2 cursor-pointer transition-colors h-fit ${activeGroupId === group.id && !activeSubGroupId ? 'ring-1 ring-inset ring-white/20 bg-black/60' : 'hover:bg-black/50'}`}
                  style={group.color ? { borderColor: `${group.color}44` } : {}}
                  onClick={() => { setActiveGroupId(group.id); setActiveSubGroupId(null); }}
                >
                  <div className="flex items-center justify-between gap-1">
                    {editingGroupId === group.id ? (
                      <div className="flex-1 flex flex-col gap-1" onClick={e => e.stopPropagation()}>
                        <div className="flex gap-1">
                          <input value={editGroupName} onChange={(e) => setEditGroupName(e.target.value)} className="flex-1 bg-gray-900 text-[10px] px-1" autoFocus />
                          <button onClick={() => { updateGroup(group.id, { name: editGroupName, color: editGroupColor || undefined }); setEditingGroupId(null); }}><Check className="w-3 h-3 text-green-500" /></button>
                        </div>
                        <input type="color" value={editGroupColor} onChange={(e) => setEditGroupColor(e.target.value)} className="w-full h-4 bg-transparent border-none" />
                      </div>
                    ) : (
                      <>
                        <span className="text-[10px] font-bold truncate flex-1 uppercase tracking-widest" style={{ color: group.color || theme.accent }}>{group.name}</span>
                        <div className="flex gap-0.5">
                          <button onClick={(e) => { e.stopPropagation(); setEditingGroupId(group.id); setEditGroupName(group.name); setEditGroupColor(group.color || ''); }}><Edit2 className="w-2.5 h-2.5" /></button>
                          <button onClick={(e) => { e.stopPropagation(); moveGroup(idx, 'left'); }} disabled={idx === 0}><ArrowLeft className="w-2.5 h-2.5" /></button>
                          <button onClick={(e) => { e.stopPropagation(); moveGroup(idx, 'right'); }} disabled={idx === groups.length - 1}><ArrowRight className="w-2.5 h-2.5" /></button>
                          <button onClick={(e) => { e.stopPropagation(); removeGroup(group.id); }} className="text-red-500"><Trash2 className="w-2.5 h-2.5" /></button>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Direct Links */}
                  <div className="space-y-1">
                    {group.links.map((link, lIdx) => (
                      <div 
                        key={link.id} 
                        className={`text-[9px] p-1 win95-inset flex items-center justify-between group/link ${editingLinkId === link.id ? 'bg-white/10' : 'bg-black/20 hover:bg-black/30'}`}
                        onClick={(e) => { e.stopPropagation(); startEditLink(group.id, null, link); }}
                      >
                        <span className="truncate" style={{ color: link.color || group.color || theme.primary }}>{link.label}</span>
                        <div className="flex gap-0.5 opacity-0 group-hover/link:opacity-100 transition-opacity">
                          <button onClick={(e) => { e.stopPropagation(); moveLink(group.id, null, lIdx, 'up'); }} disabled={lIdx === 0}><ArrowUp className="w-2 h-2" /></button>
                          <button onClick={(e) => { e.stopPropagation(); moveLink(group.id, null, lIdx, 'down'); }} disabled={lIdx === group.links.length - 1}><ArrowDown className="w-2 h-2" /></button>
                          <button onClick={(e) => { e.stopPropagation(); removeLink(group.id, null, link.id); }} className="text-red-500"><Trash2 className="w-2 h-2" /></button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Subgroups */}
                  <div className="mt-2 space-y-2">
                    {group.subgroups?.map((sub, sIdx) => (
                      <div 
                        key={sub.id} 
                        className={`p-1.5 win95-inset bg-black/20 space-y-1 ${activeSubGroupId === sub.id ? 'ring-1 ring-white/20 bg-black/40' : ''}`}
                        onClick={(e) => { e.stopPropagation(); setActiveGroupId(group.id); setActiveSubGroupId(sub.id); }}
                      >
                        <div className="flex items-center justify-between gap-1">
                          {editingSubId === sub.id ? (
                            <div className="flex-1 flex gap-1" onClick={e => e.stopPropagation()}>
                              <input value={editSubName} onChange={(e) => setEditSubName(e.target.value)} className="flex-1 bg-gray-900 text-[9px] px-1" />
                              <input type="color" value={editSubColor} onChange={(e) => setEditSubColor(e.target.value)} className="w-4 h-4 bg-transparent border-none" />
                              <button onClick={() => { updateSubGroup(group.id, sub.id, { name: editSubName, color: editSubColor || undefined }); setEditingSubId(null); }}><Check className="w-3 h-3 text-green-500" /></button>
                            </div>
                          ) : (
                            <>
                              <span className="text-[9px] font-bold truncate flex-1" style={{ color: sub.color || group.color || theme.accent }}>{sub.name}</span>
                              <div className="flex gap-0.5">
                                <button onClick={(e) => { e.stopPropagation(); setEditingSubId(sub.id); setEditSubName(sub.name); setEditSubColor(sub.color || ''); }}><Edit2 className="w-2 h-2" /></button>
                                <button onClick={(e) => { e.stopPropagation(); moveSubGroup(group.id, sIdx, 'left'); }} disabled={sIdx === 0}><ArrowLeft className="w-2 h-2" /></button>
                                <button onClick={(e) => { e.stopPropagation(); moveSubGroup(group.id, sIdx, 'right'); }} disabled={sIdx === (group.subgroups?.length || 0) - 1}><ArrowRight className="w-2 h-2" /></button>
                                <button onClick={(e) => { e.stopPropagation(); removeSubGroup(group.id, sub.id); }} className="text-red-500"><Trash2 className="w-2 h-2" /></button>
                              </div>
                            </>
                          )}
                        </div>
                        <div className="space-y-0.5">
                          {sub.links.map((link, lIdx) => (
                            <div 
                              key={link.id} 
                              className={`text-[8px] p-0.5 border-l-2 flex items-center justify-between group/slink ${editingLinkId === link.id ? 'bg-white/10' : 'hover:bg-black/20'}`}
                              style={{ borderLeftColor: link.color || sub.color || group.color || theme.primary }}
                              onClick={(e) => { e.stopPropagation(); startEditLink(group.id, sub.id, link); }}
                            >
                              <span className="truncate">{link.label}</span>
                              <div className="flex gap-0.5 opacity-0 group-hover/slink:opacity-100">
                                <button onClick={(e) => { e.stopPropagation(); moveLink(group.id, sub.id, lIdx, 'up'); }} disabled={lIdx === 0}><ArrowUp className="w-1.5 h-1.5" /></button>
                                <button onClick={(e) => { e.stopPropagation(); moveLink(group.id, sub.id, lIdx, 'down'); }} disabled={lIdx === sub.links.length - 1}><ArrowDown className="w-1.5 h-1.5" /></button>
                                <button onClick={(e) => { e.stopPropagation(); removeLink(group.id, sub.id, link.id); }} className="text-red-500"><Trash2 className="w-1.5 h-1.5" /></button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                    <form onSubmit={handleAddSubGroup} className="flex gap-1" onClick={e => e.stopPropagation()}>
                      <input value={newSubName} onChange={(e) => setNewSubName(e.target.value)} className="flex-1 bg-gray-900 border-none px-1 text-[8px] win95-inset h-5" placeholder="Add subgroup..." />
                      <button type="submit" className="px-1 win95-outset text-[8px] font-bold hover:bg-gray-800"><ListTree className="w-2 h-2" /></button>
                    </form>
                  </div>
                </div>
              ))}
            </div>

            {/* Link Management */}
            {activeGroupId && (
              <div className="space-y-2 p-3 win95-inset bg-black/30 mt-auto border-t border-white/5 h-fit shrink-0">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-[10px] font-bold uppercase opacity-70">
                    {editingLinkId ? 'Edit' : 'Add'} Shortcut to {activeSubGroupId ? `Subgroup: ${activeSub?.name}` : `Group: ${activeGroup?.name}`}
                  </div>
                  {editingLinkId && <button onClick={cancelEdit} className="text-[8px] uppercase hover:text-white px-2 py-0.5 win95-outset bg-red-900/20 text-red-500">Cancel</button>}
                </div>
                
                <form onSubmit={handleAddLink} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[8px] font-bold uppercase opacity-50 block">Label</label>
                      <input value={newLinkLabel} onChange={(e) => setNewLinkLabel(e.target.value)} className="w-full bg-gray-900 border-none px-2 py-1.5 text-xs win95-inset" placeholder="e.g. GitHub" style={{ color: effectiveLinkColor }} required />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8px] font-bold uppercase opacity-50 block">URL</label>
                      <input value={newLinkUrl} onChange={(e) => setNewLinkUrl(e.target.value)} className="w-full bg-gray-900 border-none px-2 py-1.5 text-xs win95-inset" placeholder="e.g. github.com" style={{ color: theme.primary }} required />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="text-[8px] font-bold uppercase opacity-50 block">Icon</label>
                        <button type="button" onClick={() => setShowIconPicker(!showIconPicker)} className={`text-[8px] uppercase px-1 py-0.5 win95-outset flex items-center gap-1 ${showIconPicker ? 'bg-white/10' : 'bg-black/20'}`}><ImageIcon className="w-2.5 h-2.5" /> {showIconPicker ? 'Close' : 'Picker'}</button>
                      </div>
                      <input value={newLinkIcon} onChange={(e) => setNewLinkIcon(e.target.value)} className="w-full bg-gray-900 border-none px-2 py-1.5 text-xs win95-inset" placeholder="/path/to/icon.svg" style={{ color: effectiveLinkColor }} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8px] font-bold uppercase opacity-50 block">Color Override</label>
                      <div className="flex gap-2">
                        <input type="color" value={newLinkColor || activeSub?.color || activeGroup?.color || theme.primary} onChange={(e) => setNewLinkColor(e.target.value)} className="w-8 h-8 bg-transparent border-none cursor-pointer" />
                        <button type="button" onClick={() => setNewLinkColor('')} className="text-[8px] uppercase opacity-50 hover:opacity-100">Reset</button>
                      </div>
                    </div>
                  </div>

                  {showIconPicker && (
                    <div className="win95-inset bg-black/40 p-2 grid grid-cols-10 gap-1 overflow-y-auto max-h-[80px] custom-scrollbar">
                      {AVAILABLE_ICONS.map(icon => (
                        <button key={icon.path} type="button" onClick={() => setNewLinkIcon(icon.path)} className={`p-1 win95-outset hover:bg-white/10 transition-colors flex items-center justify-center ${newLinkIcon === icon.path ? 'ring-1 ring-white/30' : ''}`}><img src={icon.path} alt="" className="w-4 h-4 object-contain" /></button>
                      ))}
                    </div>
                  )}

                  <button type="submit" className="w-full py-1.5 win95-outset text-[10px] font-bold uppercase hover:bg-gray-800 flex items-center justify-center gap-1" style={{ color: effectiveLinkColor }}>
                    {editingLinkId ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />} {editingLinkId ? 'Save Changes' : 'Add Shortcut'}
                  </button>
                </form>
              </div>
            )}
          </div>
        ) : activeTab === 'appearance' ? (
          <div className="space-y-6 p-4">
            <h3 className="text-xs font-bold uppercase tracking-widest border-b border-white/10 pb-2">Dashboard Appearance</h3>
            
            <div className="flex items-center justify-between p-3 win95-outset bg-black/20">
              <div className="flex items-center gap-3">
                <Box className="w-5 h-5" style={{ color: theme.primary }} />
                <div className="flex flex-col">
                  <span className="text-xs font-bold uppercase">Shortcut Frames</span>
                  <span className="text-[10px] opacity-50">Show or hide the 3D bevel around buttons</span>
                </div>
              </div>
              <button 
                onClick={() => updateSettings({ showFrames: !settings.showFrames })}
                className={`px-4 py-1 text-[10px] font-bold win95-outset transition-colors ${settings.showFrames ? 'text-green-500 bg-green-900/10' : 'text-red-500 bg-red-900/10'}`}
              >
                {settings.showFrames ? 'ENABLED' : 'DISABLED'}
              </button>
            </div>

            <div className="flex items-center justify-between p-3 win95-outset bg-black/20">
              <div className="flex items-center gap-3">
                <Monitor className="w-5 h-5" style={{ color: theme.secondary }} />
                <div className="flex flex-col">
                  <span className="text-xs font-bold uppercase">Start Maximized</span>
                  <span className="text-[10px] opacity-50">Open dashboard in full screen on startup</span>
                </div>
              </div>
              <button 
                onClick={() => updateSettings({ startMaximized: !settings.startMaximized })}
                className={`px-4 py-1 text-[10px] font-bold win95-outset transition-colors ${settings.startMaximized ? 'text-green-500 bg-green-900/10' : 'text-red-500 bg-red-900/10'}`}
              >
                {settings.startMaximized ? 'ENABLED' : 'DISABLED'}
              </button>
            </div>

            <div className="p-4 win95-inset bg-black/40 text-[10px] opacity-70 italic">
              When frames are disabled, icons and text will automatically use your chosen shortcut colors to stay visible.
            </div>
          </div>
        ) : (
          <div className="space-y-6 p-4">
            <h3 className="text-xs font-bold uppercase tracking-widest border-b border-white/10 pb-2">Backup & Restore</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3 p-4 win95-outset bg-black/20">
                <div className="flex items-center gap-3">
                  <Download className="w-5 h-5" style={{ color: theme.primary }} />
                  <span className="text-xs font-bold uppercase">Export Config</span>
                </div>
                <p className="text-[10px] opacity-50">Save your current setup to a .json file</p>
                <button 
                  onClick={handleExport}
                  className="w-full py-2 win95-outset text-[10px] font-bold uppercase hover:bg-gray-800"
                  style={{ color: theme.primary }}
                >
                  Download File
                </button>
              </div>

              <div className="space-y-3 p-4 win95-outset bg-black/20">
                <div className="flex items-center gap-3">
                  <Upload className="w-5 h-5" style={{ color: theme.secondary }} />
                  <span className="text-xs font-bold uppercase">Import Config</span>
                </div>
                <p className="text-[10px] opacity-50">Load a setup from a .json file</p>
                <div className="relative">
                  <input 
                    type="file" 
                    accept=".json"
                    onChange={handleImport}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <button className="w-full py-2 win95-outset text-[10px] font-bold uppercase hover:bg-gray-800" style={{ color: theme.secondary }}>
                    Choose File
                  </button>
                </div>
              </div>
            </div>

            <div className="p-4 win95-inset bg-red-900/10 border border-red-900/30 text-[10px] text-red-500 italic">
              Warning: Importing a configuration will overwrite your current shortcuts and settings.
            </div>

            <div className="mt-auto pt-4 border-t border-white/5">
              <button 
                onClick={handleClear}
                className="w-full py-2 win95-outset text-[10px] font-bold uppercase hover:bg-red-950 transition-colors text-red-500"
              >
                Clear All Configuration
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const ShortcutsDashboard = ({ onOpenConfig }: { onOpenConfig: () => void }) => {
  const { theme } = useTheme();
  const { groups, settings } = useUserLinks();

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
        {groups.length === 0 ? (
          <div className="flex flex-col items-center gap-4 opacity-50">
            <Monitor className="w-16 h-16" style={{ color: theme.primary }} />
            <div className="text-center space-y-2">
              <p className="font-bold uppercase tracking-widest">No Shortcuts Configured</p>
              <button 
                onClick={onOpenConfig}
                className="px-4 py-1 win95-outset text-xs font-bold hover:bg-gray-800"
                style={{ color: theme.primary }}
              >
                Open Configuration
              </button>
            </div>
          </div>
        ) : (
          <div className="flex gap-12 items-start">
            {groups.map(group => {
              const groupColor = group.color || theme.accent;
              return (
                <div key={group.id} className="flex flex-col gap-6">
                  <h3 
                    className="text-sm font-bold uppercase tracking-[0.2em] border-b pb-2 mb-2 text-center" 
                    style={{ color: groupColor, borderColor: `${groupColor}33` }}
                  >
                    {group.name}
                  </h3>
                  <div className="flex gap-10 items-start">
                    {/* Direct Links Column */}
                    {group.links.length > 0 && (
                      <div className="flex flex-col gap-4">
                        {group.links.map(link => {
                          const linkColor = link.color || group.color || theme.primary;
                          return (
                            <button
                              key={link.id}
                              onClick={() => window.open(link.url, '_blank')}
                              className="flex flex-col items-center gap-2 group transition-transform hover:scale-110 active:scale-95"
                            >
                              <div 
                                className={`p-3 rounded-sm transition-colors relative overflow-hidden flex items-center justify-center ${settings.showFrames ? 'win95-outset bg-black/40 group-hover:bg-black/60' : 'bg-transparent'}`}
                                style={settings.showFrames ? {} : { color: linkColor }}
                              >
                                {link.icon ? (
                                  <div 
                                    className="w-8 h-8 transition-all"
                                    style={{ 
                                      backgroundColor: linkColor,
                                      WebkitMask: `url(${link.icon}) no-repeat center / contain`,
                                      mask: `url(${link.icon}) no-repeat center / contain`,
                                      filter: !settings.showFrames ? `drop-shadow(0 0 5px ${linkColor}66)` : 'none',
                                    }}
                                  />
                                ) : (
                                  <ExternalLink className="w-8 h-8" style={{ color: linkColor }} />
                                )}
                                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                              <span 
                                className="text-[10px] font-bold uppercase tracking-wider text-center max-w-[100px] break-words" 
                                style={{ color: linkColor, textShadow: settings.showFrames ? '0 0 10px rgba(0,0,0,0.8)' : `0 0 8px ${linkColor}33` }}
                              >
                                {link.label}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* Subgroup Columns */}
                    {group.subgroups?.map(sub => (
                      <div key={sub.id} className="flex flex-col gap-4 min-w-[120px]">
                        <div className="text-[10px] font-bold uppercase tracking-[0.1em] opacity-60 text-center border-b border-white/5 pb-1" style={{ color: sub.color || groupColor }}>
                          {sub.name}
                        </div>
                        <div className="flex flex-col gap-4">
                          {sub.links.map(link => {
                            const linkColor = link.color || sub.color || group.color || theme.primary;
                            return (
                              <button
                                key={link.id}
                                onClick={() => window.open(link.url, '_blank')}
                                className="flex flex-col items-center gap-2 group transition-transform hover:scale-110 active:scale-95"
                              >
                                <div 
                                  className={`p-3 rounded-sm transition-colors relative overflow-hidden flex items-center justify-center ${settings.showFrames ? 'win95-outset bg-black/40 group-hover:bg-black/60' : 'bg-transparent'}`}
                                  style={settings.showFrames ? {} : { color: linkColor }}
                                >
                                  {link.icon ? (
                                    <div 
                                      className="w-8 h-8 transition-all"
                                      style={{ 
                                        backgroundColor: linkColor,
                                        WebkitMask: `url(${link.icon}) no-repeat center / contain`,
                                        mask: `url(${link.icon}) no-repeat center / contain`,
                                        filter: !settings.showFrames ? `drop-shadow(0 0 5px ${linkColor}66)` : 'none',
                                      }}
                                    />
                                  ) : (
                                    <ExternalLink className="w-8 h-8" style={{ color: linkColor }} />
                                  )}
                                  <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                                <span 
                                  className="text-[10px] font-bold uppercase tracking-wider text-center max-w-[100px] break-words" 
                                  style={{ color: linkColor, textShadow: settings.showFrames ? '0 0 10px rgba(0,0,0,0.8)' : `0 0 8px ${linkColor}33` }}
                                >
                                  {link.label}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

const Desktop = () => {
  const { theme } = useTheme();
  const { groups, settings } = useUserLinks();
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
      if (settings.startMaximized) {
        setMaximizedWindows(['shortcuts']);
      }
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
      if (settings.startMaximized) {
        setMaximizedWindows(['shortcuts']);
      }
    } else {
      setOpenWindows(['welcome']);
      setWindowStack(['welcome']);
    }
    setMinimizedWindows([]);
    setMaximizedWindows([]);
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
              onDoubleClick={() => toggleWindow('shortcuts')}
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
                <WelcomeWindow onGetStarted={() => toggleWindow('manual')} />
              </Window>
            </div>
          )}

          {openWindows.includes('manual') && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <Window 
                title="SkniiOS_Manual.hlp" 
                icon={BookOpen} 
                onClose={() => closeWindow('manual')}
                onMinimize={() => minimizeWindow('manual')}
                onMaximize={() => maximizeWindow('manual')}
                onFocus={() => focusWindow('manual')}
                zIndex={getZIndex('manual')}
                isActive={windowStack[windowStack.length - 1] === 'manual'}
                isMinimized={minimizedWindows.includes('manual')}
                isMaximized={maximizedWindows.includes('manual')}
                defaultPosition={{ x: 0, y: 0 }}
                className="max-w-3xl w-[90vw]"
              >
                <ManualWindow />
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
                className="max-w-4xl w-[90vw] h-[70vh]"
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
                <SettingsWindow onOpenManual={() => toggleWindow('manual')} />
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
