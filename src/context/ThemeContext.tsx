import React, { createContext, useContext, useState, useEffect } from 'react';
import { ThemeId, ThemeConfig } from '../types';

export const THEMES: Record<ThemeId, ThemeConfig> = {
  aurora: {
    id: 'aurora',
    name: 'Cosmic Aurora',
    description: 'Electric violet, neon cyan & luminous fuchsia',
    accentGradient: 'from-violet-500 via-fuchsia-500 to-cyan-400',
    bodyBg: 'bg-[#080915]',
    cardBg: 'bg-[#101226]/80',
    textPrimary: 'text-white',
    textSecondary: 'text-zinc-300',
    orb1Color: 'bg-violet-600/35',
    orb2Color: 'bg-cyan-500/30',
    orb3Color: 'bg-fuchsia-600/30',
    glowColor: 'shadow-violet-500/25',
  },
  cyberpunk: {
    id: 'cyberpunk',
    name: 'Cyber Sunset',
    description: 'Neon coral, fiery amber & magenta glow',
    accentGradient: 'from-rose-500 via-amber-500 to-fuchsia-500',
    bodyBg: 'bg-[#120816]',
    cardBg: 'bg-[#1d0e25]/85',
    textPrimary: 'text-white',
    textSecondary: 'text-rose-200/90',
    orb1Color: 'bg-rose-600/35',
    orb2Color: 'bg-amber-500/30',
    orb3Color: 'bg-purple-600/35',
    glowColor: 'shadow-rose-500/25',
  },
  'neon-matrix': {
    id: 'neon-matrix',
    name: 'Emerald Pulse',
    description: 'Electric emerald, vivid cyan & lime highlights',
    accentGradient: 'from-emerald-400 via-teal-400 to-cyan-400',
    bodyBg: 'bg-[#061210]',
    cardBg: 'bg-[#0b1f1a]/85',
    textPrimary: 'text-white',
    textSecondary: 'text-emerald-200/85',
    orb1Color: 'bg-emerald-500/35',
    orb2Color: 'bg-cyan-500/30',
    orb3Color: 'bg-teal-500/30',
    glowColor: 'shadow-emerald-500/25',
  },
  'electric-candy': {
    id: 'electric-candy',
    name: 'Candy Spectrum',
    description: 'Rainbow prism, electric pink & sunny yellow',
    accentGradient: 'from-yellow-400 via-pink-500 to-cyan-400',
    bodyBg: 'bg-[#0d0a21]',
    cardBg: 'bg-[#191438]/85',
    textPrimary: 'text-white',
    textSecondary: 'text-indigo-200/90',
    orb1Color: 'bg-pink-500/35',
    orb2Color: 'bg-yellow-400/25',
    orb3Color: 'bg-indigo-500/35',
    glowColor: 'shadow-pink-500/25',
  },
  'clean-vibrant': {
    id: 'clean-vibrant',
    name: 'Vibrant Light',
    description: 'Fresh crisp canvas with colorful animated gradients',
    accentGradient: 'from-indigo-600 via-purple-600 to-pink-500',
    bodyBg: 'bg-[#f6f8fc]',
    cardBg: 'bg-white/90',
    textPrimary: 'text-zinc-900',
    textSecondary: 'text-zinc-600',
    orb1Color: 'bg-purple-400/25',
    orb2Color: 'bg-cyan-400/25',
    orb3Color: 'bg-pink-400/25',
    glowColor: 'shadow-indigo-500/20',
  },
};

interface ThemeContextType {
  themeId: ThemeId;
  theme: ThemeConfig;
  setThemeId: (id: ThemeId) => void;
  animationsEnabled: boolean;
  setAnimationsEnabled: (enabled: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeId, setThemeIdState] = useState<ThemeId>(() => {
    const saved = localStorage.getItem('app_theme_id') as ThemeId;
    return saved && THEMES[saved] ? saved : 'aurora';
  });

  const [animationsEnabled, setAnimationsEnabledState] = useState<boolean>(() => {
    const saved = localStorage.getItem('app_theme_anim');
    return saved !== null ? saved === 'true' : true;
  });

  const setThemeId = (id: ThemeId) => {
    setThemeIdState(id);
    localStorage.setItem('app_theme_id', id);
  };

  const setAnimationsEnabled = (enabled: boolean) => {
    setAnimationsEnabledState(enabled);
    localStorage.setItem('app_theme_anim', String(enabled));
  };

  const theme = THEMES[themeId] || THEMES.aurora;

  return (
    <ThemeContext.Provider
      value={{
        themeId,
        theme,
        setThemeId,
        animationsEnabled,
        setAnimationsEnabled,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

const defaultThemeContext: ThemeContextType = {
  themeId: 'aurora',
  theme: THEMES.aurora,
  setThemeId: () => {},
  animationsEnabled: true,
  setAnimationsEnabled: () => {},
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    return defaultThemeContext;
  }
  return context;
};
