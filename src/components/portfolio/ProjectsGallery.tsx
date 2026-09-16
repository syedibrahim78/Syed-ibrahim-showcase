import React, { useState, useMemo } from 'react';
import { Search, ExternalLink, Github, Sparkles, Code2, ArrowUpRight, Filter } from 'lucide-react';
import { Project } from '../../types';
import { ProjectDetailModal } from './ProjectDetailModal';
import { useTheme } from '../../context/ThemeContext';

interface ProjectsGalleryProps {
  projects: Project[];
  isLoading: boolean;
}

export const ProjectsGallery: React.FC<ProjectsGalleryProps> = ({ projects, isLoading }) => {
  const { theme, animationsEnabled } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTech, setSelectedTech] = useState<string>('all');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const isLight = theme.id === 'clean-vibrant';

  // Extract all unique tech tags from projects
  const allTechTags = useMemo(() => {
    const set = new Set<string>();
    projects.forEach((p) => {
      p.tech_stack?.forEach((t) => set.add(t));
    });
    return Array.from(set);
  }, [projects]);

  // Filter projects by search and tech filter
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.short_description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.tech_stack?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesTech =
        selectedTech === 'all' || p.tech_stack?.some((t) => t.toLowerCase() === selectedTech.toLowerCase());

      return matchesSearch && matchesTech;
    });
  }, [projects, searchQuery, selectedTech]);

  return (
    <section
      id="projects"
      className={`relative py-20 md:py-28 z-10 transition-colors border-y ${
        isLight
          ? 'bg-zinc-100/60 border-zinc-200/80'
          : 'bg-black/25 backdrop-blur-md border-white/10'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Section Heading with Animated Accent */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <div
              className={`text-xs font-bold uppercase tracking-wider mb-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border ${
                isLight
                  ? 'bg-violet-100/80 border-violet-200 text-violet-800'
                  : 'bg-white/10 border-white/15 text-zinc-300'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Project Showcase</span>
            </div>
            <h2
              className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${
                isLight ? 'text-zinc-900' : 'text-white'
              }`}
            >
              Featured Works & Experiments
            </h2>
            <p className={`mt-1.5 text-sm sm:text-base ${isLight ? 'text-zinc-600' : 'text-zinc-300'}`}>
              Selected production applications, algorithms, systems engineering, and creative UI code.
            </p>
          </div>

          <div
            className={`text-xs font-medium px-3 py-1.5 rounded-xl border backdrop-blur-md self-start md:self-auto ${
              isLight
                ? 'bg-white/80 text-zinc-600 border-zinc-200'
                : 'bg-white/10 text-zinc-300 border-white/10'
            }`}
          >
            Showing {filteredProjects.length} of {projects.length} published{' '}
            {projects.length === 1 ? 'project' : 'projects'}
          </div>
        </div>

        {/* Filter Controls & Search */}
        <div className="flex flex-col sm:flex-row gap-3 mb-10">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Search projects by title, keyword, or tech stack..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border focus:outline-none transition-all shadow-xs backdrop-blur-md ${
                isLight
                  ? 'bg-white/90 border-zinc-300 text-zinc-900 placeholder:text-zinc-400 focus:ring-2 focus:ring-indigo-500'
                  : 'bg-white/10 border-white/15 text-white placeholder:text-zinc-400 focus:ring-2 focus:ring-violet-400 focus:border-transparent'
              }`}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>

          {/* Tech tags filter pills */}
          {allTechTags.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              <button
                onClick={() => setSelectedTech('all')}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer shadow-xs ${
                  selectedTech === 'all'
                    ? `bg-gradient-to-r ${theme.accentGradient} text-white shadow-md ${
                        animationsEnabled ? 'animate-gradient-flow' : ''
                      }`
                    : isLight
                    ? 'bg-white/80 text-zinc-700 hover:bg-white border border-zinc-200'
                    : 'bg-white/10 text-zinc-300 hover:bg-white/20 border border-white/10'
                }`}
              >
                All Tech
              </button>
              {allTechTags.slice(0, 5).map((tech) => (
                <button
                  key={tech}
                  onClick={() => setSelectedTech(selectedTech === tech ? 'all' : tech)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer shadow-xs ${
                    selectedTech.toLowerCase() === tech.toLowerCase()
                      ? `bg-gradient-to-r ${theme.accentGradient} text-white shadow-md ${
                          animationsEnabled ? 'animate-gradient-flow' : ''
                        }`
                      : isLight
                      ? 'bg-white/80 text-zinc-700 hover:bg-white border border-zinc-200'
                      : 'bg-white/10 text-zinc-300 hover:bg-white/20 border border-white/10'
                  }`}
                >
                  {tech}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Loading Skeleton */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden p-4 space-y-4 animate-pulse backdrop-blur-md"
              >
                <div className="h-44 bg-white/10 rounded-xl"></div>
                <div className="h-5 bg-white/10 rounded w-3/4"></div>
                <div className="h-4 bg-white/10 rounded w-full"></div>
                <div className="h-4 bg-white/10 rounded w-2/3"></div>
                <div className="flex gap-2 pt-2">
                  <div className="h-6 bg-white/10 rounded w-16"></div>
                  <div className="h-6 bg-white/10 rounded w-16"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Projects Grid */}
        {!isLoading && filteredProjects.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <article
                key={project.id}
                className={`group flex flex-col rounded-2xl border backdrop-blur-xl transition-all duration-300 overflow-hidden shadow-lg hover:shadow-2xl hover:-translate-y-1 ${
                  isLight
                    ? 'bg-white/90 border-zinc-200/90 hover:border-violet-400/80 hover:shadow-violet-500/10'
                    : 'bg-zinc-900/60 border-white/10 hover:border-violet-400/60 hover:shadow-violet-500/20'
                }`}
              >
                {/* Thumbnail */}
                <div
                  onClick={() => setSelectedProject(project)}
                  className="relative h-48 w-full overflow-hidden cursor-pointer bg-zinc-900"
                >
                  {project.image_url ? (
                    <img
                      src={project.image_url}
                      alt={project.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-zinc-500 bg-zinc-900">
                      <Code2 className="w-8 h-8 stroke-[1.5] mb-1" />
                      <span className="text-xs font-medium">Project Preview</span>
                    </div>
                  )}

                  {/* Gradient bottom shadow overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

                  {/* Featured Badge with Animated Gradient */}
                  {project.is_featured && (
                    <div
                      className={`absolute top-3 left-3 px-3 py-1 rounded-full text-[11px] font-bold text-white shadow-md flex items-center gap-1.5 bg-gradient-to-r ${theme.accentGradient} ${
                        animationsEnabled ? 'animate-gradient-flow' : ''
                      }`}
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Featured</span>
                    </div>
                  )}

                  {/* Quick View Overlay on hover */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-2xs">
                    <span className="bg-white/90 text-zinc-950 font-semibold px-4 py-2 rounded-xl text-xs shadow-xl scale-95 group-hover:scale-100 transition-transform">
                      View Project Story
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3
                      onClick={() => setSelectedProject(project)}
                      className={`text-base sm:text-lg font-bold cursor-pointer transition-colors leading-snug line-clamp-1 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r ${theme.accentGradient} ${
                        isLight ? 'text-zinc-900' : 'text-white'
                      }`}
                    >
                      {project.title}
                    </h3>
                    <p
                      className={`mt-2.5 text-xs sm:text-sm leading-relaxed line-clamp-2 font-normal ${
                        isLight ? 'text-zinc-600' : 'text-zinc-300'
                      }`}
                    >
                      {project.short_description}
                    </p>

                    {/* Tech Stack Badges with colorful tints */}
                    {project.tech_stack && project.tech_stack.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {project.tech_stack.slice(0, 4).map((tech, idx) => (
                          <span
                            key={idx}
                            className={`px-2.5 py-0.5 rounded-lg text-[11px] font-semibold border backdrop-blur-md ${
                              isLight
                                ? 'bg-zinc-100 text-zinc-700 border-zinc-200'
                                : 'bg-white/10 text-zinc-200 border-white/10'
                            }`}
                          >
                            {tech}
                          </span>
                        ))}
                        {project.tech_stack.length > 4 && (
                          <span
                            className={`px-2 py-0.5 rounded-lg text-[11px] font-semibold ${
                              isLight ? 'text-zinc-500' : 'text-zinc-400'
                            }`}
                          >
                            +{project.tech_stack.length - 4}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Card Footer Actions */}
                  <div
                    className={`mt-6 pt-4 flex items-center justify-between border-t ${
                      isLight ? 'border-zinc-200' : 'border-white/10'
                    }`}
                  >
                    <button
                      onClick={() => setSelectedProject(project)}
                      className={`text-xs font-bold flex items-center gap-1.5 cursor-pointer hover:gap-2 transition-all ${
                        isLight ? 'text-violet-700 hover:text-violet-950' : 'text-cyan-400 hover:text-cyan-300'
                      }`}
                    >
                      <span>Read Story</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>

                    <div className="flex items-center gap-1.5">
                      {project.github_url && (
                        <a
                          href={project.github_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`p-2 rounded-xl transition-all ${
                            isLight
                              ? 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100'
                              : 'text-zinc-300 hover:text-white hover:bg-white/10'
                          }`}
                          title="Source Code"
                        >
                          <Github className="w-4 h-4" />
                        </a>
                      )}
                      {project.live_demo_url && (
                        <a
                          href={project.live_demo_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`p-2 rounded-xl transition-all ${
                            isLight
                              ? 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100'
                              : 'text-zinc-300 hover:text-white hover:bg-white/10'
                          }`}
                          title="Live Demo"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredProjects.length === 0 && (
          <div
            className={`text-center py-16 rounded-2xl border p-8 max-w-md mx-auto backdrop-blur-xl ${
              isLight
                ? 'bg-white border-zinc-200 text-zinc-900'
                : 'bg-zinc-900/70 border-white/10 text-white'
            }`}
          >
            <div className="w-12 h-12 rounded-full bg-white/10 text-zinc-400 flex items-center justify-center mx-auto mb-3">
              <Filter className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold">No matching projects found</h3>
            <p className={`text-xs mt-1 mb-4 ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
              Try adjusting your search keywords or clearing active filters.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedTech('all');
              }}
              className={`px-5 py-2.5 text-xs font-bold text-white rounded-xl shadow-md transition-all cursor-pointer bg-gradient-to-r ${theme.accentGradient}`}
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Project Detail Modal */}
      <ProjectDetailModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
      />
    </section>
  );
};
