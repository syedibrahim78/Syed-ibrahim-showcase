import React, { useState, useEffect } from 'react';
import { Briefcase, Code2, Mail, Shield, User as UserIcon, Menu, X, ArrowUpRight, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { ThemeSelector } from '../theme/ThemeSelector';
import { Profile } from '../../types';

interface NavbarProps {
  profile: Profile | null;
  onNavigate: (view: 'portfolio' | 'login' | 'admin') => void;
  currentView: string;
}

export const Navbar: React.FC<NavbarProps> = ({ profile, onNavigate, currentView }) => {
  const { isAuthenticated, user } = useAuth();
  const { theme, animationsEnabled } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    if (currentView !== 'portfolio') {
      onNavigate('portfolio');
      setTimeout(() => {
        const el = document.getElementById(id);
        el?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById(id);
      el?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const isLight = theme.id === 'clean-vibrant';

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled
          ? isLight
            ? 'bg-white/80 backdrop-blur-xl shadow-md border-b border-zinc-200/80 py-2.5'
            : 'bg-zinc-950/80 backdrop-blur-xl shadow-lg border-b border-white/10 py-2.5'
          : 'bg-transparent py-4 border-b border-transparent'
      }`}
    >
      {/* Animated subtle rainbow border glow line at the top */}
      <div
        className={`h-[2px] w-full bg-gradient-to-r ${theme.accentGradient} ${
          animationsEnabled ? 'animate-gradient-flow' : ''
        }`}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-1 flex items-center justify-between">
        {/* Brand / Name */}
        <button
          onClick={() => scrollToSection('hero')}
          className="flex items-center gap-3 text-left group cursor-pointer"
        >
          <div
            className={`w-10 h-10 rounded-xl p-[2px] bg-gradient-to-tr ${theme.accentGradient} ${
              animationsEnabled ? 'animate-gradient-flow' : ''
            } shadow-md transition-transform group-hover:scale-105`}
          >
            <div className={`w-full h-full rounded-[10px] ${isLight ? 'bg-white text-zinc-900' : 'bg-zinc-950 text-white'} flex items-center justify-center font-bold text-sm tracking-tight`}>
              {profile?.name ? profile.name.slice(0, 2).toUpperCase() : 'SP'}
            </div>
          </div>
          <div>
            <div className={`font-bold text-sm sm:text-base leading-tight ${isLight ? 'text-zinc-900' : 'text-white'} group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r ${theme.accentGradient} transition-colors`}>
              {profile?.name || 'Student Portfolio'}
            </div>
            <div className={`text-xs hidden sm:block leading-none mt-0.5 ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
              {profile?.title ? profile.title.split('&')[0].trim() : 'Software Developer'}
            </div>
          </div>
        </button>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1.5 p-1 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
          <button
            onClick={() => scrollToSection('about')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              isLight
                ? 'text-zinc-700 hover:text-zinc-950 hover:bg-zinc-200/60'
                : 'text-zinc-300 hover:text-white hover:bg-white/10'
            }`}
          >
            About
          </button>
          <button
            onClick={() => scrollToSection('projects')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              isLight
                ? 'text-zinc-700 hover:text-zinc-950 hover:bg-zinc-200/60'
                : 'text-zinc-300 hover:text-white hover:bg-white/10'
            }`}
          >
            Projects
          </button>
          <button
            onClick={() => scrollToSection('skills')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              isLight
                ? 'text-zinc-700 hover:text-zinc-950 hover:bg-zinc-200/60'
                : 'text-zinc-300 hover:text-white hover:bg-white/10'
            }`}
          >
            Skills
          </button>
          <button
            onClick={() => scrollToSection('contact')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              isLight
                ? 'text-zinc-700 hover:text-zinc-950 hover:bg-zinc-200/60'
                : 'text-zinc-300 hover:text-white hover:bg-white/10'
            }`}
          >
            Contact
          </button>
        </nav>

        {/* Action Controls: Theme Switcher & Admin / Login button */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Animated Theme Selector Dropdown */}
          <ThemeSelector />

          {isAuthenticated ? (
            <button
              onClick={() => onNavigate('admin')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold text-white rounded-xl shadow-md transition-all cursor-pointer bg-gradient-to-r ${theme.accentGradient} ${
                animationsEnabled ? 'animate-gradient-flow' : ''
              } hover:opacity-95 hover:scale-105 active:scale-95`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin CMS</span>
            </button>
          ) : (
            <button
              onClick={() => onNavigate('login')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-xl border transition-all cursor-pointer ${
                isLight
                  ? 'text-zinc-800 bg-white/80 border-zinc-300 hover:bg-zinc-100 shadow-2xs'
                  : 'text-zinc-200 bg-white/10 border-white/15 hover:bg-white/20 shadow-xs'
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-zinc-400" />
              <span className="hidden sm:inline">Admin Portal</span>
              <span className="sm:hidden">Login</span>
            </button>
          )}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`md:hidden p-2 rounded-xl transition-colors ${
              isLight ? 'text-zinc-700 hover:bg-zinc-200' : 'text-zinc-200 hover:bg-white/10'
            }`}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div
          className={`md:hidden border-b px-4 pt-3 pb-5 space-y-1.5 backdrop-blur-xl shadow-xl ${
            isLight
              ? 'bg-white/95 border-zinc-200 text-zinc-800'
              : 'bg-zinc-950/95 border-white/10 text-zinc-100'
          }`}
        >
          <button
            onClick={() => scrollToSection('about')}
            className="w-full text-left px-3 py-2 rounded-xl text-sm font-medium hover:bg-white/10"
          >
            About
          </button>
          <button
            onClick={() => scrollToSection('projects')}
            className="w-full text-left px-3 py-2 rounded-xl text-sm font-medium hover:bg-white/10"
          >
            Projects
          </button>
          <button
            onClick={() => scrollToSection('skills')}
            className="w-full text-left px-3 py-2 rounded-xl text-sm font-medium hover:bg-white/10"
          >
            Skills
          </button>
          <button
            onClick={() => scrollToSection('contact')}
            className="w-full text-left px-3 py-2 rounded-xl text-sm font-medium hover:bg-white/10"
          >
            Contact
          </button>
          <div className="pt-2 border-t border-white/10">
            {isAuthenticated ? (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onNavigate('admin');
                }}
                className={`w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-white rounded-xl bg-gradient-to-r ${theme.accentGradient}`}
              >
                <Shield className="w-4 h-4" />
                Go to Admin Dashboard
              </button>
            ) : (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onNavigate('login');
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium bg-white/10 text-white rounded-xl"
              >
                <Shield className="w-4 h-4 text-zinc-400" />
                Admin CMS Login
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
