import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import { MANUAL_ENTRIES } from '../constants/manual';

interface LogEntry {
  type: 'header' | 'output' | 'error' | 'input';
  text: string;
}

// Neutral text colors — theme colors used only for accents (headers, prompt)
const TEXT_OUTPUT = '#b0b0b0';   // dim gray for regular output
const TEXT_INPUT  = '#e8e8e8';   // brighter for typed commands in history
const TEXT_ERROR  = '#ff5555';

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
      { type: 'header', text: 'SKNII OS [Version 1.0.42]' },
      { type: 'header', text: '(c) 2026 Sknii Corp. All rights reserved.' },
      { type: 'header', text: 'Welcome to SkniiTTY. Type "help" for commands.' },
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

  // Clear history when the terminal is closed (unmount).
  // Minimize keeps the component mounted so this does not fire on minimize.
  useEffect(() => {
    return () => {
      localStorage.removeItem('skniitty_history');
    };
  }, []);

  const handleCommand = (cmd: string) => {
    const cleanCmd = cmd.trim().toLowerCase();
    const newHistory: LogEntry[] = [...history, { type: 'input', text: cmd }];

    switch (cleanCmd) {
      case 'help':
        newHistory.push({ type: 'output', text: 'Available commands:' });
        newHistory.push({ type: 'output', text: '  help     - Show this message' });
        newHistory.push({ type: 'output', text: '  manual   - View the SkniiOS manual' });
        newHistory.push({ type: 'output', text: '  clear    - Clear the terminal' });
        newHistory.push({ type: 'output', text: '  date     - Show current date/time' });
        newHistory.push({ type: 'output', text: '  whoami   - Show current user' });
        newHistory.push({ type: 'output', text: '  version  - Show OS version' });
        newHistory.push({ type: 'output', text: '  theme    - Show current theme primary color' });
        break;
      case 'manual':
        {
          const args = cmd.trim().split(' ');
          if (args.length === 1) {
            newHistory.push({ type: 'output', text: 'SkniiOS Manual - Available entries:' });
            Object.keys(MANUAL_ENTRIES).forEach(key => {
              newHistory.push({ type: 'output', text: `  manual ${key}` });
            });
          } else {
            const entry = MANUAL_ENTRIES[args[1].toLowerCase()];
            if (entry) {
              newHistory.push({ type: 'header', text: `--- ${entry.title} ---` });
              newHistory.push({ type: 'output', text: entry.content });
            } else {
              newHistory.push({ type: 'error', text: `Manual entry not found: ${args[1]}` });
            }
          }
        }
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

  const lineColor = (line: LogEntry) => {
    switch (line.type) {
      case 'header': return theme.primary;
      case 'error':  return TEXT_ERROR;
      case 'input':  return TEXT_INPUT;
      default:       return TEXT_OUTPUT;
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
            style={{ color: lineColor(line) }}
            className="whitespace-pre-wrap break-all leading-tight mb-1"
          >
            {line.type === 'input' && (
              <span style={{ color: theme.primary }} className="font-bold mr-2">{'>'}</span>
            )}
            {line.text}
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="flex gap-2 border-t border-white/10 pt-2">
        <span style={{ color: theme.primary }} className="font-bold">{'>'}</span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 bg-transparent outline-none border-none p-0 m-0"
          style={{ color: TEXT_INPUT }}
          autoFocus
        />
      </form>
    </div>
  );
};
