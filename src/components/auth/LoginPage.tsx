import React, { useState } from 'react';
import { Shield, Lock, Mail, ArrowLeft, Eye, EyeOff, AlertCircle, CheckCircle2, Key, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

interface LoginPageProps {
  onSuccess: () => void;
  onBackToPortfolio: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSuccess, onBackToPortfolio }) => {
  const { login } = useAuth();
  const { theme, animationsEnabled } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isLight = theme.id === 'clean-vibrant';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError('Please provide both email and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      await login(email.trim(), password);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Invalid email or password. Please verify your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFillDemo = () => {
    setEmail('admin@admin.com');
    setPassword('password123');
    setError(null);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-12 z-10">
      <div className="w-full max-w-md">
        {/* Back link */}
        <button
          onClick={onBackToPortfolio}
          className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border backdrop-blur-md mb-6 transition-all shadow-xs cursor-pointer ${
            isLight
              ? 'bg-white/80 text-zinc-700 hover:bg-white border-zinc-200'
              : 'bg-white/10 text-zinc-200 hover:bg-white/20 border-white/15'
          }`}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Portfolio</span>
        </button>

        {/* Card */}
        <div
          className={`rounded-3xl shadow-2xl border backdrop-blur-2xl overflow-hidden ${
            isLight
              ? 'bg-white/95 border-zinc-200 text-zinc-900'
              : 'bg-zinc-950/80 border-white/15 text-white'
          }`}
        >
          {/* Animated Header Banner */}
          <div className="p-6 sm:p-8 text-center relative overflow-hidden">
            {/* Top gradient stripe */}
            <div
              className={`absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r ${theme.accentGradient} ${
                animationsEnabled ? 'animate-gradient-flow' : ''
              }`}
            />

            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg bg-gradient-to-tr ${theme.accentGradient} text-white`}
            >
              <Shield className="w-7 h-7" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight">CMS Admin Portal</h1>
            <p className={`text-xs sm:text-sm mt-1 font-normal ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
              Sign in to manage projects, profile details, and messages
            </p>
          </div>

          {/* Form Body */}
          <div className="p-6 sm:p-8 space-y-5">
            {/* Demo Credentials Box */}
            <div
              className={`p-3.5 rounded-2xl border text-xs backdrop-blur-md ${
                isLight
                  ? 'bg-zinc-50/80 border-zinc-200 text-zinc-700'
                  : 'bg-white/[0.04] border-white/10 text-zinc-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-amber-400" /> Default Admin Login:
                </span>
                <button
                  type="button"
                  onClick={handleFillDemo}
                  className={`px-2.5 py-1 rounded-lg text-white text-[11px] font-bold shadow-xs transition-all cursor-pointer bg-gradient-to-r ${theme.accentGradient}`}
                >
                  Auto-Fill
                </button>
              </div>
              <div
                className={`font-mono text-[11px] p-2.5 rounded-xl border space-y-0.5 ${
                  isLight
                    ? 'bg-white text-zinc-800 border-zinc-200'
                    : 'bg-black/30 text-zinc-200 border-white/10'
                }`}
              >
                <div>
                  Email: <span className="font-bold">admin@admin.com</span>
                </div>
                <div>
                  Password: <span className="font-bold">password123</span>
                </div>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="admin-email"
                  className={`block text-xs font-semibold mb-1.5 ${
                    isLight ? 'text-zinc-700' : 'text-zinc-300'
                  }`}
                >
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    id="admin-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@admin.com"
                    className={`w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border focus:outline-none transition-all shadow-xs backdrop-blur-md ${
                      isLight
                        ? 'bg-zinc-50 border-zinc-300 text-zinc-900 placeholder:text-zinc-400 focus:ring-2 focus:ring-violet-500'
                        : 'bg-white/10 border-white/15 text-white placeholder:text-zinc-500 focus:ring-2 focus:ring-violet-400 focus:border-transparent'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="admin-password"
                  className={`block text-xs font-semibold mb-1.5 ${
                    isLight ? 'text-zinc-700' : 'text-zinc-300'
                  }`}
                >
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    id="admin-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border focus:outline-none transition-all shadow-xs backdrop-blur-md ${
                      isLight
                        ? 'bg-zinc-50 border-zinc-300 text-zinc-900 placeholder:text-zinc-400 focus:ring-2 focus:ring-violet-500'
                        : 'bg-white/10 border-white/15 text-white placeholder:text-zinc-500 focus:ring-2 focus:ring-violet-400 focus:border-transparent'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white cursor-pointer"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3 px-4 rounded-xl text-sm font-bold text-white shadow-xl ${
                  theme.glowColor
                } transition-all cursor-pointer bg-gradient-to-r ${theme.accentGradient} ${
                  animationsEnabled ? 'animate-gradient-flow' : ''
                } hover:scale-[1.02] active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 mt-2`}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Sign In to Admin CMS</span>
                  </>
                )}
              </button>
            </form>
          </div>

          <div
            className={`px-6 py-4 border-t text-center text-xs ${
              isLight
                ? 'bg-zinc-50/70 border-zinc-200 text-zinc-500'
                : 'bg-white/[0.02] border-white/10 text-zinc-400'
            }`}
          >
            Protected CMS • Bcrypt Password Hashing & JWT Authentication
          </div>
        </div>
      </div>
    </div>
  );
};
