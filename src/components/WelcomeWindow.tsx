import React from 'react';
import { useTheme } from '../context/ThemeContext';

interface WelcomeWindowProps {
  onGetStarted: () => void;
}

export const WelcomeWindow: React.FC<WelcomeWindowProps> = ({ onGetStarted }) => {
  const { theme } = useTheme();

  return (
    <div className="flex flex-col items-center justify-center py-8 space-y-6">
      <div 
        className="w-24 h-24 mb-2"
        style={{ 
          backgroundColor: theme.primary,
          maskImage: 'url(/assets/icons/launcher-rune.svg)',
          maskRepeat: 'no-repeat',
          maskSize: 'contain',
          maskPosition: 'center',
          WebkitMaskImage: 'url(/assets/icons/launcher-rune.svg)',
          WebkitMaskRepeat: 'no-repeat',
          WebkitMaskSize: 'contain',
          WebkitMaskPosition: 'center',
          filter: `drop-shadow(0 0 10px ${theme.primary}55)`
        }}
      />
      <div className="space-y-2">
        <h1 
          className="text-4xl md:text-6xl tracking-tighter uppercase text-center font-lunch"
          style={{ 
            color: theme.primary,
            textShadow: `0 0 10px ${theme.primary}55`
          }}
        >
          Welcome
        </h1>
        <p className="text-xs opacity-70 text-center max-w-[200px] mx-auto leading-tight font-lunch">
          SKNII_OS [VERSION 1.0.4]
          <br />
          SYSTEM READY...
        </p>
      </div>

      <button 
        onClick={onGetStarted}
        className="px-8 py-2 win95-outset bg-black/40 hover:bg-black/60 transition-colors font-bold uppercase tracking-widest text-xs"
        style={{ color: theme.primary }}
      >
        Get Started
      </button>
    </div>
  );
};
