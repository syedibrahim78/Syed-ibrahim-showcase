import React from 'react';
import { useTheme } from '../../context/ThemeContext';

export const AnimatedBackground: React.FC = () => {
  const { theme, animationsEnabled } = useTheme();

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Dynamic base gradient tint */}
      <div
        className={`absolute inset-0 opacity-40 transition-colors duration-700 bg-gradient-to-br ${
          theme.id === 'cyberpunk'
            ? 'from-rose-950/40 via-purple-950/20 to-black/60'
            : theme.id === 'neon-matrix'
            ? 'from-emerald-950/40 via-teal-950/20 to-black/60'
            : theme.id === 'electric-candy'
            ? 'from-indigo-950/50 via-fuchsia-950/30 to-black/60'
            : theme.id === 'clean-vibrant'
            ? 'from-indigo-50/70 via-purple-50/40 to-pink-50/60'
            : 'from-violet-950/40 via-indigo-950/30 to-black/60'
        }`}
      />

      {/* Floating Animated Color Orb 1 (Top Left) */}
      <div
        className={`absolute -top-32 -left-32 w-96 h-96 sm:w-[32rem] sm:h-[32rem] rounded-full blur-3xl filter transition-all duration-1000 ${
          theme.orb1Color
        } ${animationsEnabled ? 'animate-float-slow' : 'opacity-40'}`}
      />

      {/* Floating Animated Color Orb 2 (Right Center) */}
      <div
        className={`absolute top-1/3 -right-36 w-80 h-80 sm:w-[30rem] sm:h-[30rem] rounded-full blur-3xl filter transition-all duration-1000 ${
          theme.orb2Color
        } ${animationsEnabled ? 'animate-float-alt' : 'opacity-40'}`}
      />

      {/* Floating Animated Color Orb 3 (Bottom Center / Left) */}
      <div
        className={`absolute -bottom-36 left-1/4 w-96 h-96 sm:w-[34rem] sm:h-[34rem] rounded-full blur-3xl filter transition-all duration-1000 ${
          theme.orb3Color
        } ${animationsEnabled ? 'animate-pulse-glow' : 'opacity-30'}`}
      />

      {/* Subtle fine dot grid texture for high-tech depth */}
      <div
        className="absolute inset-0 opacity-[0.035] dark:opacity-[0.06] mix-blend-overlay"
        style={{
          backgroundImage: `radial-gradient(currentColor 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
      />
    </div>
  );
};
