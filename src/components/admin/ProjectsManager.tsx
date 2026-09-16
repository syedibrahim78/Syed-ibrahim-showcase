import React, { useState } from 'react';
import { Plus, Search, Edit3, Trash2, Globe, Github, Eye, EyeOff, Sparkles, AlertTriangle, RefreshCw, Layers } from 'lucide-react';
import { Project } from '../../types';
import { api } from '../../services/api';
import { ProjectModal } from './ProjectModal';

interface ProjectsManagerProps {
  projects: Project[];
  onRefresh: () => void;
  isLoading: boolean;
}

export const ProjectsManager: React.FC<ProjectsManagerProps> = ({ projects, onRefresh, isLoading }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  // Delete confirmation modal state
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      searchQuery.trim() === '' ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.short_description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tech_stack?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'published' && p.is_published) ||
      (statusFilter === 'draft' && !p.is_published);

    return matchesSearch && matchesStatus;
  });

  const handleToggleVisibility = async (project: Project) => {
    try {
      const res = await api.projects.toggleVisibility(project.id);
      setFeedbackMsg({
        text: `Project "${project.title}" is now ${res.is_published ? 'Published' : 'a Draft'}.`,
        type: 'success'
      });
      setTimeout(() => setFeedbackMsg(null), 3000);
      onRefresh();
    } catch (err: any) {
      setFeedbackMsg({ text: err.message || 'Failed to update visibility.', type: 'error' });
      setTimeout(() => setFeedbackMsg(null), 3000);
    }
  };

  const handleConfirmDelete = async () => {
    if (!projectToDelete) return;
    setIsDeleting(true);
    try {
      await api.projects.delete(projectToDelete.id);
      setFeedbackMsg({
        text: `Project "${projectToDelete.title}" deleted permanently.`,
        type: 'success'
      });
      setTimeout(() => setFeedbackMsg(null), 3000);
      setProjectToDelete(null);
      onRefresh();
    } catch (err: any) {
      setFeedbackMsg({ text: err.message || 'Failed to delete project.', type: 'error' });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleResetDemo = async () => {
    if (!window.confirm('Reset all projects to original sample demonstration projects?')) return;
    try {
      await api.admin.seedDemo();
      setFeedbackMsg({ text: 'Sample projects reset successfully.', type: 'success' });
      setTimeout(() => setFeedbackMsg(null), 3000);
      onRefresh();
    } catch (err: any) {
      setFeedbackMsg({ text: 'Failed to reset sample projects.', type: 'error' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Primary Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 tracking-tight">Project Management</h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-0.5">
            Create, update, organize, and toggle visibility of projects displayed on your public portfolio.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetDemo}
            className="px-3 py-2 text-xs font-medium text-zinc-600 hover:text-zinc-900 bg-zinc-100 hover:bg-zinc-200/80 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Reset to default sample projects"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset Samples</span>
          </button>
          <button
            onClick={() => {
              setEditingProject(null);
              setModalOpen(true);
            }}
            className="px-4 py-2 text-xs sm:text-sm font-medium bg-zinc-900 text-white hover:bg-zinc-800 rounded-xl transition-colors shadow-xs flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Project</span>
          </button>
        </div>
      </div>

      {/* Feedback message banner */}
      {feedbackMsg && (
        <div
          className={`p-3 rounded-xl text-xs font-medium flex items-center gap-2 animate-in fade-in ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search projects by title, tech stack, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-white border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-zinc-700"
            >
              Clear
            </button>
          )}
        </div>

        {/* Status filter tabs */}
        <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-xl">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              statusFilter === 'all' ? 'bg-white text-zinc-900 shadow-2xs' : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            All ({projects.length})
          </button>
          <button
            onClick={() => setStatusFilter('published')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              statusFilter === 'published' ? 'bg-white text-zinc-900 shadow-2xs' : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            Published ({projects.filter((p) => p.is_published).length})
          </button>
          <button
            onClick={() => setStatusFilter('draft')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              statusFilter === 'draft' ? 'bg-white text-zinc-900 shadow-2xs' : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            Drafts ({projects.filter((p) => !p.is_published).length})
          </button>
        </div>
      </div>

      {/* Projects Table / List */}
      <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-2xs">
        {isLoading ? (
          <div className="p-8 text-center text-zinc-400 text-sm">Loading projects from database...</div>
        ) : filteredProjects.length === 0 ? (
          <div className="p-12 text-center">
            <Layers className="w-10 h-10 text-zinc-300 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-zinc-800">No projects found</h3>
            <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
              {searchQuery || statusFilter !== 'all'
                ? 'Try broadening your search or resetting filters.'
                : 'Get started by creating your first portfolio showcase project.'}
            </p>
            {projects.length === 0 && (
              <button
                onClick={() => {
                  setEditingProject(null);
                  setModalOpen(true);
                }}
                className="mt-4 px-4 py-2 text-xs font-medium bg-zinc-900 text-white rounded-xl hover:bg-zinc-800 cursor-pointer"
              >
                + Add Project Now
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-100 bg-zinc-50/70 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                  <th className="py-3.5 px-4 sm:px-6">Project</th>
                  <th className="py-3.5 px-4 hidden md:table-cell">Tech Stack</th>
                  <th className="py-3.5 px-4 text-center">Visibility</th>
                  <th className="py-3.5 px-4 hidden lg:table-cell">Links</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-xs sm:text-sm">
                {filteredProjects.map((project) => (
                  <tr key={project.id} className="hover:bg-zinc-50/80 transition-colors group">
                    {/* Project Title & Short Description */}
                    <td className="py-4 px-4 sm:px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-11 sm:w-16 sm:h-12 rounded-lg bg-zinc-100 border border-zinc-200 overflow-hidden flex-shrink-0">
                          {project.image_url ? (
                            <img
                              src={project.image_url}
                              alt={project.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-zinc-400 text-[10px]">
                              No img
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-zinc-900 truncate">{project.title}</span>
                            {project.is_featured && (
                              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                                <Sparkles className="w-2.5 h-2.5" /> Featured
                              </span>
                            )}
                          </div>
                          <p className="text-zinc-500 text-xs line-clamp-1 mt-0.5 max-w-md">
                            {project.short_description}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Tech Stack */}
                    <td className="py-4 px-4 hidden md:table-cell">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {project.tech_stack?.slice(0, 3).map((t, idx) => (
                          <span
                            key={idx}
                            className="px-1.5 py-0.5 rounded text-[11px] bg-zinc-100 text-zinc-700 border border-zinc-200"
                          >
                            {t}
                          </span>
                        ))}
                        {(project.tech_stack?.length || 0) > 3 && (
                          <span className="px-1 py-0.5 text-[10px] text-zinc-400">
                            +{(project.tech_stack?.length || 0) - 3}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Visibility Toggle Button */}
                    <td className="py-4 px-4 text-center">
                      <button
                        onClick={() => handleToggleVisibility(project)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                          project.is_published
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                            : 'bg-zinc-100 text-zinc-600 border border-zinc-200 hover:bg-zinc-200/80'
                        }`}
                        title="Click to toggle visibility (Draft / Published)"
                      >
                        {project.is_published ? (
                          <>
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            <span>Published</span>
                          </>
                        ) : (
                          <>
                            <span className="w-1.5 h-1.5 rounded-full bg-zinc-400"></span>
                            <span>Draft</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* Links */}
                    <td className="py-4 px-4 hidden lg:table-cell">
                      <div className="flex items-center gap-2">
                        {project.live_demo_url ? (
                          <a
                            href={project.live_demo_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 rounded-md text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100"
                            title="Live Demo"
                          >
                            <Globe className="w-4 h-4" />
                          </a>
                        ) : (
                          <span className="text-zinc-300">-</span>
                        )}
                        {project.github_url ? (
                          <a
                            href={project.github_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 rounded-md text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100"
                            title="GitHub Repo"
                          >
                            <Github className="w-4 h-4" />
                          </a>
                        ) : (
                          <span className="text-zinc-300">-</span>
                        )}
                      </div>
                    </td>

                    {/* Action buttons (Edit, Delete) */}
                    <td className="py-4 px-4 sm:px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setEditingProject(project);
                            setModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition-colors cursor-pointer"
                          title="Edit Project"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setProjectToDelete(project)}
                          className="p-1.5 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
                          title="Delete Project"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Project Add/Edit Modal */}
      <ProjectModal
        isOpen={modalOpen}
        project={editingProject}
        onClose={() => {
          setModalOpen(false);
          setEditingProject(null);
        }}
        onSaved={() => {
          onRefresh();
        }}
      />

      {/* Delete Confirmation Modal (Prompt Requirement: "Confirmation modal before permanently deleting a project") */}
      {projectToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="fixed inset-0" onClick={() => !isDeleting && setProjectToDelete(null)} />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl border border-zinc-200 p-6 z-10 space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-zinc-900">Delete Project?</h3>
              <p className="text-sm text-zinc-600 mt-1">
                Are you sure you want to permanently delete{' '}
                <span className="font-semibold text-zinc-900">"{projectToDelete.title}"</span>? This action cannot be
                undone and will remove the project from the database immediately.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setProjectToDelete(null)}
                className="px-4 py-2 rounded-xl text-sm font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl text-sm font-medium bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition-colors shadow-xs flex items-center gap-2 cursor-pointer"
              >
                {isDeleting ? 'Deleting...' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
