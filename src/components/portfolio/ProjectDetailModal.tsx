import React from 'react';
import { X, ExternalLink, Github, Sparkles, Calendar, Layers } from 'lucide-react';
import { Project } from '../../types';
import { useTheme } from '../../context/ThemeContext';

interface ProjectDetailModalProps {
  project: Project | null;
  onClose: () => void;
}

export const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({ project, onClose }) => {
  const { theme, animationsEnabled } = useTheme();
  if (!project) return null;

  const isLight = theme.id === 'clean-vibrant';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        className={`relative w-full max-w-3xl rounded-3xl shadow-2xl border overflow-hidden z-10 my-8 max-h-[90vh] flex flex-col backdrop-blur-2xl ${
          isLight
            ? 'bg-white/95 border-zinc-200 text-zinc-900'
            : 'bg-zinc-950/90 border-white/15 text-white'
        }`}
      >
        {/* Animated colorful top accent bar */}
        <div
          className={`h-1.5 w-full bg-gradient-to-r ${theme.accentGradient} ${
            animationsEnabled ? 'animate-gradient-flow' : ''
          }`}
        />

        {/* Header Bar */}
        <div
          className={`flex items-center justify-between px-6 py-4 border-b ${
            isLight ? 'border-zinc-200 bg-zinc-50/70' : 'border-white/10 bg-white/5'
          }`}
        >
          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-bold uppercase tracking-wider ${
                isLight ? 'text-zinc-500' : 'text-zinc-400'
              }`}
            >
              Project Details
            </span>
            {project.is_featured && (
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-white text-[11px] font-bold shadow-xs bg-gradient-to-r ${theme.accentGradient}`}
              >
                <Sparkles className="w-3 h-3" /> Featured
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-xl transition-colors cursor-pointer ${
              isLight
                ? 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'
                : 'text-zinc-400 hover:text-white hover:bg-white/10'
            }`}
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto p-6 space-y-6 flex-1">
          {/* Cover image if available */}
          {project.image_url && (
            <div
              className={`w-full h-64 sm:h-80 rounded-2xl overflow-hidden border shadow-lg ${
                isLight ? 'bg-zinc-100 border-zinc-200' : 'bg-zinc-900 border-white/10'
              }`}
            >
              <img
                src={project.image_url}
                alt={project.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Title & Short Description */}
          <div>
            <h2 className="text-2xl sm:text-3xl font-black leading-snug tracking-tight">
              <span
                className={`bg-gradient-to-r ${theme.accentGradient} bg-clip-text text-transparent`}
              >
                {project.title}
              </span>
            </h2>
            <p
              className={`mt-2.5 text-base leading-relaxed ${
                isLight ? 'text-zinc-700' : 'text-zinc-300'
              }`}
            >
              {project.short_description}
            </p>
          </div>

          {/* Tech Stack Pills */}
          {project.tech_stack && project.tech_stack.length > 0 && (
            <div>
              <div
                className={`text-xs font-bold uppercase tracking-wider mb-2.5 flex items-center gap-1.5 ${
                  isLight ? 'text-zinc-500' : 'text-zinc-400'
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-violet-400" /> Technologies & Architecture
              </div>
              <div className="flex flex-wrap gap-2">
                {project.tech_stack.map((tech, idx) => (
                  <span
                    key={idx}
                    className={`px-3 py-1 rounded-xl text-xs font-semibold border backdrop-blur-md ${
                      isLight
                        ? 'bg-zinc-100 text-zinc-800 border-zinc-200'
                        : 'bg-white/10 text-zinc-200 border-white/10'
                    }`}
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Detailed Description */}
          {project.detailed_description && (
            <div
              className={`border-t pt-6 ${isLight ? 'border-zinc-200' : 'border-white/10'}`}
            >
              <h3
                className={`text-xs font-bold uppercase tracking-wider mb-3 ${
                  isLight ? 'text-zinc-500' : 'text-zinc-400'
                }`}
              >
                Deep Dive
              </h3>
              <div
                className={`text-sm sm:text-base leading-relaxed whitespace-pre-line p-5 rounded-2xl border backdrop-blur-md ${
                  isLight
                    ? 'bg-zinc-50 border-zinc-200 text-zinc-800'
                    : 'bg-white/[0.03] border-white/10 text-zinc-200'
                }`}
              >
                {project.detailed_description}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div
          className={`px-6 py-4 border-t flex flex-wrap items-center justify-between gap-3 ${
            isLight ? 'border-zinc-200 bg-zinc-50/80' : 'border-white/10 bg-white/5'
          }`}
        >
          <div className="flex items-center gap-3">
            {project.live_demo_url && (
              <a
                href={project.live_demo_url}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-white text-xs sm:text-sm font-bold shadow-lg ${theme.glowColor} transition-all hover:scale-105 cursor-pointer bg-gradient-to-r ${theme.accentGradient}`}
              >
                <span>Live Demo</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
            {project.github_url && (
              <a
                href={project.github_url}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border text-xs sm:text-sm font-semibold transition-all hover:scale-105 shadow-xs ${
                  isLight
                    ? 'border-zinc-300 bg-white text-zinc-800 hover:bg-zinc-100'
                    : 'border-white/15 bg-white/10 text-zinc-200 hover:bg-white/20 hover:text-white'
                }`}
              >
                <Github className="w-4 h-4" />
                <span>Source Code</span>
              </a>
            )}
          </div>

          <button
            onClick={onClose}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
              isLight
                ? 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-200/60'
                : 'text-zinc-400 hover:text-white hover:bg-white/10'
            }`}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
