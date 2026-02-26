import React from 'react';
import { useTheme } from '../context/ThemeContext';

export const WelcomeWindow: React.FC = () => {
  const { theme } = useTheme();

  return (
    <div className="flex flex-col items-center justify-center py-8 space-y-4">
      <h1 
        className="text-4xl md:text-6xl tracking-tighter uppercase text-center font-lunch"
        style={{ 
          color: theme.primary,
          textShadow: `0 0 10px ${theme.primary}55`
        }}
      >
        Welcome
      </h1>
      <p className="text-xs opacity-70 text-center max-w-[200px] leading-tight font-lunch">
        SKNII_OS [VERSION 1.0.4]
        <br />
        SYSTEM READY...
      </p>
    </div>
  );
};
