import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = {
  primary: string;
  secondary: string;
  accent: string;
  surface: string;
  taskbarPosition: 'top' | 'bottom';
  crtEnabled: boolean;
  showDesktopIcons: boolean;
  starColor: string;
  starDirection: 'up' | 'down' | 'left' | 'right' | 'towards' | 'away';
  starSpeed: number;
};

type ThemeContextType = {
  theme: Theme;
  updateTheme: (updates: Partial<Theme>) => void;
};

const defaultTheme: Theme = {
  primary: '#f9c80e',   // Gold
  secondary: '#ab9150', // Muted gold
  accent: '#bd00ff',    // Purple
  surface: '#004d4c',   // Deep teal
  taskbarPosition: 'top',
  crtEnabled: true,
  showDesktopIcons: false,
  starColor: '#ffffff',
  starDirection: 'towards',
  starSpeed: 0.1,
};

// Returns a darkened version of a hex color (factor < 1 = darker)
const darken = (hex: string, factor: number): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const d = (n: number) => Math.round(n * factor).toString(16).padStart(2, '0');
  return `#${d(r)}${d(g)}${d(b)}`;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('sknii-theme');
    if (saved) {
      return { ...defaultTheme, ...JSON.parse(saved) };
    }
    return defaultTheme;
  });

  useEffect(() => {
    localStorage.setItem('sknii-theme', JSON.stringify(theme));

    // Update Favicon Color
    const updateFavicon = () => {
      const favicon = document.querySelector('link[rel="icon"]');
      if (!favicon) return;

      const svgString = `<svg version="1.1" width="72.64" height="66.88" viewBox="0 0 72.64 66.88" xmlns="http://www.w3.org/2000/svg">
  <ellipse style="fill:${theme.primary}" cx="35.48" cy="34.42" rx="34.47" ry="34.56" />
  <ellipse style="fill:#000000" cx="35.71" cy="34.21" rx="32.35" ry="31.91" />
  <g>
    <path style="fill:${theme.primary}" d="M 3.49,64.88 A 33.5,31.02 0 0 1 2.65,57.99 33.5,31.02 0 0 1 36.15,26.97 a 33.5,31.02 0 0 1 33.5,31.02 33.5,31.02 0 0 1 -0.69,6.27 A 35.09,39.69 0 0 0 36.33,39.17 35.09,39.69 0 0 0 3.49,64.88 Z" />
    <path style="fill:${theme.primary}" d="m 28.46,18.92 0.18,34.47 6.89,9.9 6.36,-9.37 -0.53,-35.89 9.9,-2.47 -14.67,-3.36 -1.77,-8.66 -2.12,8.66 -13.79,3.36 z" />
  </g>
</svg>`;

      const encodedSvg = encodeURIComponent(svgString);
      favicon.setAttribute('href', `data:image/svg+xml,${encodedSvg}`);
    };

    updateFavicon();
  }, [theme]);

  const updateTheme = (updates: Partial<Theme>) => {
    setTheme(prev => ({ ...prev, ...updates }));
  };

  return (
    <ThemeContext.Provider value={{ theme, updateTheme }}>
      <div 
        style={{ 
          //@ts-ignore
          '--color-primary': theme.primary,
          '--color-secondary': theme.secondary,
          '--color-accent': theme.accent,
          '--color-win-bg': theme.surface,
          '--color-win-dark': darken(theme.surface, 0.5),
        }}
        className="contents"
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};
