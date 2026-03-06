import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { HelpCircle } from 'lucide-react';

export const ThemeWindow: React.FC = () => {
  const { theme, updateTheme } = useTheme();

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-bold mb-2 uppercase tracking-widest text-gray-400">Primary Color</label>
        <div className="flex gap-2">
          {['#05d9e8', '#00ff00', '#f9c80e', '#ffffff'].map(c => (
            <button 
              key={c}
              onClick={() => updateTheme({ primary: c })}
              className={`w-8 h-8 win95-outset ${theme.primary === c ? 'ring-2 ring-white' : ''}`}
              style={{ backgroundColor: c }}
            />
          ))}
          <input 
            type="color" 
            value={theme.primary} 
            onChange={(e) => updateTheme({ primary: e.target.value })}
            className="w-8 h-8 bg-transparent border-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold mb-2 uppercase tracking-widest text-gray-400">Secondary Color</label>
        <div className="flex gap-2">
          {['#ff2a6d', '#ff0000', '#ff8800', '#bd00ff'].map(c => (
            <button 
              key={c}
              onClick={() => updateTheme({ secondary: c })}
              className={`w-8 h-8 win95-outset ${theme.secondary === c ? 'ring-2 ring-white' : ''}`}
              style={{ backgroundColor: c }}
            />
          ))}
          <input 
            type="color" 
            value={theme.secondary} 
            onChange={(e) => updateTheme({ secondary: e.target.value })}
            className="w-8 h-8 bg-transparent border-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold mb-2 uppercase tracking-widest text-gray-400">Surface Color</label>
        <div className="flex gap-2">
          {['#1a1a1a', '#0d1117', '#1e1b2e', '#12100e'].map(c => (
            <button
              key={c}
              onClick={() => updateTheme({ surface: c })}
              className={`w-8 h-8 win95-outset ${theme.surface === c ? 'ring-2 ring-white' : ''}`}
              style={{ backgroundColor: c }}
            />
          ))}
          <input
            type="color"
            value={theme.surface}
            onChange={(e) => updateTheme({ surface: e.target.value })}
            className="w-8 h-8 bg-transparent border-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold mb-2 uppercase tracking-widest text-gray-400">Star Color</label>
        <div className="flex gap-2">
          {['#ffffff', '#05d9e8', '#f9c80e', '#ff2a6d'].map(c => (
            <button 
              key={c}
              onClick={() => updateTheme({ starColor: c })}
              className={`w-8 h-8 win95-outset ${theme.starColor === c ? 'ring-2 ring-white' : ''}`}
              style={{ backgroundColor: c }}
            />
          ))}
          <input 
            type="color" 
            value={theme.starColor} 
            onChange={(e) => updateTheme({ starColor: e.target.value })}
            className="w-8 h-8 bg-transparent border-none"
          />
        </div>
      </div>
    </div>
  );
};

export const SettingsWindow: React.FC<{ onOpenManual?: () => void }> = ({ onOpenManual }) => {
  const { theme, updateTheme } = useTheme();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase">Taskbar Position</span>
        <div className="flex gap-2">
          <button 
            onClick={() => updateTheme({ taskbarPosition: 'top' })}
            className={`px-3 py-1 text-[10px] font-bold win95-outset ${theme.taskbarPosition === 'top' ? 'bg-gray-700 text-white' : 'bg-gray-900 text-gray-500'}`}
          >
            TOP
          </button>
          <button 
            onClick={() => updateTheme({ taskbarPosition: 'bottom' })}
            className={`px-3 py-1 text-[10px] font-bold win95-outset ${theme.taskbarPosition === 'bottom' ? 'bg-gray-700 text-white' : 'bg-gray-900 text-gray-500'}`}
          >
            BOTTOM
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase">CRT Scanlines</span>
        <button 
          onClick={() => updateTheme({ crtEnabled: !theme.crtEnabled })}
          className={`px-4 py-1 text-[10px] font-bold win95-outset ${theme.crtEnabled ? 'text-green-500' : 'text-red-500'}`}
        >
          {theme.crtEnabled ? 'ENABLED' : 'DISABLED'}
        </button>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase">Desktop Icons</span>
        <button 
          onClick={() => updateTheme({ showDesktopIcons: !theme.showDesktopIcons })}
          className={`px-4 py-1 text-[10px] font-bold win95-outset ${theme.showDesktopIcons ? 'text-green-500' : 'text-red-500'}`}
        >
          {theme.showDesktopIcons ? 'VISIBLE' : 'HIDDEN'}
        </button>
      </div>

      <div className="space-y-2">
        <span className="text-xs font-bold uppercase block">Star Direction</span>
        <div className="grid grid-cols-3 gap-1">
          {['up', 'down', 'left', 'right', 'towards', 'away'].map(dir => (
            <button 
              key={dir}
              onClick={() => updateTheme({ starDirection: dir as any })}
              className={`px-1 py-1 text-[8px] font-bold win95-outset uppercase ${theme.starDirection === dir ? 'bg-gray-700 text-white' : 'bg-gray-900 text-gray-500'}`}
            >
              {dir}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-xs font-bold uppercase">Star Speed</span>
          <span className="text-xs font-mono" style={{ color: theme.primary }}>{theme.starSpeed}x</span>
        </div>
        <input 
          type="range" 
          min="0.1" 
          max="10" 
          step="0.1"
          value={theme.starSpeed}
          onChange={(e) => updateTheme({ starSpeed: parseFloat(e.target.value) })}
          className="w-full h-2 bg-gray-900 appearance-none win95-inset"
          style={{ accentColor: theme.primary }}
        />
      </div>

      <div className="pt-4 border-t border-white/5 flex justify-center">
        <button 
          onClick={onOpenManual}
          className="flex items-center gap-2 px-4 py-2 win95-outset bg-black/40 hover:bg-black/60 transition-colors group"
        >
          <HelpCircle className="w-4 h-4 group-hover:scale-110 transition-transform" style={{ color: theme.secondary }} />
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 group-hover:text-white">System Info & Help</span>
        </button>
      </div>
    </div>
  );
};
