import React, { useState, useRef, useEffect } from 'react';
import { Palette, Sparkles, Check, Zap, Play, Pause } from 'lucide-react';
import { useTheme, THEMES } from '../../context/ThemeContext';
import { ThemeId } from '../../types';

export const ThemeSelector: React.FC = () => {
  const { themeId, setThemeId, animationsEnabled, setAnimationsEnabled, theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold backdrop-blur-md border transition-all cursor-pointer shadow-xs hover:scale-105 active:scale-95 bg-white/10 dark:bg-zinc-800/60 border-white/20 hover:border-white/40 text-inherit"
        title="Change Colorful Theme"
        aria-label="Change Theme"
      >
        <div className={`w-3.5 h-3.5 rounded-full bg-gradient-to-tr ${theme.accentGradient} animate-pulse`} />
        <span className="hidden sm:inline font-medium text-xs">{theme.name}</span>
        <Sparkles className="w-3 h-3 text-amber-400" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 p-3 rounded-2xl bg-zinc-900/95 backdrop-blur-xl border border-white/15 shadow-2xl text-white z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between pb-2.5 mb-2 border-b border-white/10">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-300">
              <Palette className="w-3.5 h-3.5 text-violet-400" />
              <span>Animated Theme Styles</span>
            </div>

            <button
              onClick={() => setAnimationsEnabled(!animationsEnabled)}
              className={`p-1 rounded-md text-[11px] flex items-center gap-1 transition-colors ${
                animationsEnabled
                  ? 'text-emerald-400 hover:bg-emerald-500/10'
                  : 'text-zinc-500 hover:bg-zinc-800'
              }`}
              title={animationsEnabled ? 'Pause background animations' : 'Resume background animations'}
            >
              {animationsEnabled ? (
                <>
                  <Play className="w-3 h-3 fill-emerald-400" />
                  <span className="text-[10px]">Animated</span>
                </>
              ) : (
                <>
                  <Pause className="w-3 h-3" />
                  <span className="text-[10px]">Paused</span>
                </>
              )}
            </button>
          </div>

          {/* Theme list */}
          <div className="space-y-1.5">
            {Object.values(THEMES).map((t) => {
              const isSelected = themeId === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => {
                    setThemeId(t.id as ThemeId);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left p-2 rounded-xl transition-all flex items-center justify-between group cursor-pointer ${
                    isSelected
                      ? 'bg-white/15 border border-white/20 shadow-xs'
                      : 'hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-5 h-5 rounded-lg bg-gradient-to-tr ${t.accentGradient} shadow-xs flex-shrink-0 group-hover:scale-110 transition-transform`}
                    />
                    <div>
                      <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                        {t.name}
                        {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>}
                      </div>
                      <div className="text-[10px] text-zinc-400 leading-tight">
                        {t.description}
                      </div>
                    </div>
                  </div>

                  {isSelected && <Check className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
