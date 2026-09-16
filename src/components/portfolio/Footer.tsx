import React from 'react';
import { ArrowUp, Shield, Heart, Sparkles } from 'lucide-react';
import { Profile } from '../../types';
import { useTheme } from '../../context/ThemeContext';

interface FooterProps {
  profile: Profile | null;
  onNavigate: (view: 'portfolio' | 'login' | 'admin') => void;
}

export const Footer: React.FC<FooterProps> = ({ profile, onNavigate }) => {
  const { theme, animationsEnabled } = useTheme();
  const currentYear = new Date().getFullYear();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative bg-black/60 backdrop-blur-xl text-zinc-400 py-12 border-t border-white/10 z-10">
      {/* Animated gradient top accent */}
      <div
        className={`absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r ${theme.accentGradient} ${
          animationsEnabled ? 'animate-gradient-flow' : ''
        }`}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-white/10">
          <div>
            <div className="text-base font-extrabold tracking-tight">
              <span
                className={`bg-gradient-to-r ${theme.accentGradient} bg-clip-text text-transparent`}
              >
                {profile?.name || 'Student Portfolio'}
              </span>
            </div>
            <div className="text-xs text-zinc-400 mt-0.5">
              {profile?.title || 'Computer Science Student'}
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs text-zinc-400 font-medium">
            <a href="#about" className="hover:text-white transition-colors">
              About
            </a>
            <a href="#projects" className="hover:text-white transition-colors">
              Projects
            </a>
            <a href="#skills" className="hover:text-white transition-colors">
              Skills
            </a>
            <a href="#contact" className="hover:text-white transition-colors">
              Contact
            </a>
            <button
              onClick={() => onNavigate('login')}
              className="hover:text-cyan-400 transition-colors flex items-center gap-1.5 cursor-pointer font-semibold"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin CMS</span>
            </button>
          </div>

          <button
            onClick={scrollToTop}
            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-zinc-300 hover:text-white transition-all hover:scale-105 cursor-pointer shadow-xs"
            aria-label="Back to top"
            title="Scroll to top"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-500">
          <div>
            © {currentYear} {profile?.name || 'Student'}. All rights reserved. Dynamic CMS Backend.
          </div>
          <div className="flex items-center gap-1 text-zinc-400">
            <span>Powered by React, Express, SQLite & Tailwind</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
