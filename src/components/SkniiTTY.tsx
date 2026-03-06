import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';

interface LogEntry {
  type: 'output' | 'error' | 'input';
  text: string;
}

export const SkniiTTY: React.FC<{ onCrash?: () => void }> = ({ onCrash }) => {
  const { theme } = useTheme();
  
  // Load history from localStorage or use initial greeting
  const [history, setHistory] = useState<LogEntry[]>(() => {
    const saved = localStorage.getItem('skniitty_history');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
    return [
      { type: 'output', text: 'SKNII OS [Version 1.0.42]' },
      { type: 'output', text: '(c) 2026 Sknii Corp. All rights reserved.' },
      { type: 'output', text: '' },
      { type: 'output', text: 'Welcome to SkniiTTY. Type "help" for commands.' },
      { type: 'output', text: '' },
    ];
  });

  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('skniitty_history', JSON.stringify(history));
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  const handleCommand = (cmd: string) => {
    const cleanCmd = cmd.trim().toLowerCase();
    const newHistory: LogEntry[] = [...history, { type: 'input', text: `> ${cmd}` }];

    switch (cleanCmd) {
      case 'help':
        newHistory.push({ type: 'output', text: 'Available commands:' });
        newHistory.push({ type: 'output', text: '  help     - Show this message' });
        newHistory.push({ type: 'output', text: '  clear    - Clear the terminal' });
        newHistory.push({ type: 'output', text: '  date     - Show current date/time' });
        newHistory.push({ type: 'output', text: '  whoami   - Show current user' });
        newHistory.push({ type: 'output', text: '  version  - Show OS version' });
        newHistory.push({ type: 'output', text: '  theme    - Show current theme primary color' });
        break;
      case 'clear':
        setHistory([]);
        localStorage.removeItem('skniitty_history');
        return;
      case 'date':
        newHistory.push({ type: 'output', text: new Date().toLocaleString() });
        break;
      case 'whoami':
        newHistory.push({ type: 'output', text: 'guest@sknii-os' });
        break;
      case 'version':
        newHistory.push({ type: 'output', text: 'SKNII OS v1.0.42 (stable_build_2026.03.05)' });
        break;
      case 'theme':
        newHistory.push({ type: 'output', text: `Current Primary: ${theme.primary}` });
        break;
      case 'crash':
        onCrash?.();
        return;
      case '':
        break;
      default:
        newHistory.push({ type: 'error', text: `Command not found: ${cleanCmd}` });
    }

    setHistory(newHistory);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      handleCommand(input);
      setInput('');
    }
  };

  return (
    <div 
      className="flex flex-col h-full min-h-[400px] w-full font-mono text-sm p-3 bg-black/90 overflow-hidden"
      onClick={() => inputRef.current?.focus()}
    >
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto mb-2 custom-scrollbar"
      >
        {history.map((line, i) => (
          <div 
            key={i} 
            style={{ 
              color: line.type === 'error' ? '#ff5555' : 
                     line.type === 'input' ? theme.secondary : 
                     theme.primary 
            }}
            className="whitespace-pre-wrap break-all leading-tight mb-1"
          >
            {line.text}
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="flex gap-2 border-t border-white/10 pt-2">
        <span style={{ color: theme.secondary }} className="font-bold">{'>'}</span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 bg-transparent outline-none border-none p-0 m-0"
          style={{ color: theme.primary }}
          autoFocus
        />
      </form>
    </div>
  );
};
