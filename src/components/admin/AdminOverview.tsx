import React from 'react';
import { Layers, CheckCircle2, FileText, Mail, ArrowUpRight, Plus, User as UserIcon, Shield, ExternalLink, Sparkles } from 'lucide-react';
import { DashboardStats, Project, Profile } from '../../types';

interface AdminOverviewProps {
  stats: DashboardStats | null;
  projects: Project[];
  profile: Profile | null;
  onNavigateTab: (tab: 'projects' | 'profile' | 'account' | 'messages') => void;
  onOpenNewProject: () => void;
  onViewPortfolio: () => void;
}

export const AdminOverview: React.FC<AdminOverviewProps> = ({
  stats,
  projects,
  profile,
  onNavigateTab,
  onOpenNewProject,
  onViewPortfolio
}) => {
  const totalProjects = stats?.totalProjects ?? projects.length;
  const publishedProjects = stats?.publishedProjects ?? projects.filter((p) => p.is_published).length;
  const draftProjects = stats?.draftProjects ?? projects.filter((p) => !p.is_published).length;
  const unreadMessages = stats?.unreadMessages ?? 0;

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-zinc-900 text-white flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-md">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-zinc-800 text-[11px] font-medium text-emerald-400 mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span> CMS Active & Synchronized
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
            Welcome back, {profile?.name || 'Administrator'}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-xl">
            Manage your student projects, update your portfolio profile, review visitor messages, and customize security settings.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onViewPortfolio}
            className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs sm:text-sm font-medium transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <span>View Live Portfolio</span>
            <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
          </button>
          <button
            onClick={onOpenNewProject}
            className="px-4 py-2 rounded-xl bg-white hover:bg-zinc-100 text-zinc-900 text-xs sm:text-sm font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>New Project</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Projects */}
        <div
          onClick={() => onNavigateTab('projects')}
          className="p-5 rounded-2xl bg-white border border-zinc-200/90 hover:border-zinc-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-zinc-500">Total Projects</span>
            <div className="p-2 rounded-xl bg-zinc-100 group-hover:bg-zinc-900 group-hover:text-white transition-colors text-zinc-700">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-zinc-900">{totalProjects}</div>
          <div className="text-[11px] text-zinc-500 mt-1">Full database records</div>
        </div>

        {/* Published Projects */}
        <div
          onClick={() => onNavigateTab('projects')}
          className="p-5 rounded-2xl bg-white border border-zinc-200/90 hover:border-zinc-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-zinc-500">Published Live</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-zinc-900">{publishedProjects}</div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">Visible on public portfolio</div>
        </div>

        {/* Draft Projects */}
        <div
          onClick={() => onNavigateTab('projects')}
          className="p-5 rounded-2xl bg-white border border-zinc-200/90 hover:border-zinc-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-zinc-500">Draft Projects</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-zinc-900">{draftProjects}</div>
          <div className="text-[11px] text-zinc-500 mt-1">Unpublished work-in-progress</div>
        </div>

        {/* Contact Messages */}
        <div
          onClick={() => onNavigateTab('messages')}
          className="p-5 rounded-2xl bg-white border border-zinc-200/90 hover:border-zinc-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-zinc-500">Inquiries</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Mail className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-zinc-900">{unreadMessages}</div>
          <div className="text-[11px] text-zinc-500 mt-1">
            {unreadMessages > 0 ? `${unreadMessages} unread message(s)` : 'All caught up'}
          </div>
        </div>
      </div>

      {/* Profile Status Card */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-zinc-100 border border-zinc-200 overflow-hidden flex-shrink-0">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-zinc-400">
                <UserIcon className="w-6 h-6" />
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-zinc-900 text-base">{profile?.name || 'Student Profile'}</h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-medium">
                Active
              </span>
            </div>
            <p className="text-xs text-zinc-500 mt-0.5">{profile?.title || 'Computer Science Student'}</p>
            <div className="text-xs text-zinc-600 mt-1 flex items-center gap-2">
              <span>{profile?.skills?.length || 0} skills listed</span> • <span>{profile?.email || 'No email set'}</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => onNavigateTab('profile')}
          className="px-4 py-2 rounded-xl border border-zinc-200 hover:bg-zinc-50 text-zinc-800 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <span>Edit Student Profile</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Recent Projects Table Preview */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-zinc-900 text-base">Recent Projects</h3>
            <p className="text-xs text-zinc-500">Quick view of your latest project listings</p>
          </div>
          <button
            onClick={() => onNavigateTab('projects')}
            className="text-xs font-semibold text-zinc-900 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Manage All ({projects.length})</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-zinc-100">
          {projects.slice(0, 4).map((p) => (
            <div key={p.id} className="py-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-8 rounded-lg bg-zinc-100 overflow-hidden flex-shrink-0">
                  {p.image_url ? (
                    <img src={p.image_url} alt={p.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-zinc-100"></div>
                  )}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-zinc-900 truncate flex items-center gap-1.5">
                    <span>{p.title}</span>
                    {p.is_featured && <Sparkles className="w-3 h-3 text-amber-500 flex-shrink-0" />}
                  </div>
                  <div className="text-xs text-zinc-500 truncate">{p.short_description}</div>
                </div>
              </div>

              <div className="flex items-center gap-3 flex-shrink-0">
                <span
                  className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${
                    p.is_published
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-zinc-100 text-zinc-600 border border-zinc-200'
                  }`}
                >
                  {p.is_published ? 'Published' : 'Draft'}
                </span>
                <button
                  onClick={() => onNavigateTab('projects')}
                  className="text-xs text-zinc-500 hover:text-zinc-900 font-medium"
                >
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
