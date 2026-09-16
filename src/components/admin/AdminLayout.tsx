import React, { useState, useEffect, useCallback } from 'react';
import {
  LayoutDashboard,
  Layers,
  User as UserIcon,
  Shield,
  Mail,
  LogOut,
  ExternalLink,
  Menu,
  X,
  Plus
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { DashboardStats, Project, Profile, Message } from '../../types';
import { api } from '../../services/api';
import { AdminOverview } from './AdminOverview';
import { ProjectsManager } from './ProjectsManager';
import { ProfileSettings } from './ProfileSettings';
import { AccountSettings } from './AccountSettings';
import { MessagesManager } from './MessagesManager';
import { ProjectModal } from './ProjectModal';

interface AdminLayoutProps {
  onNavigateToPortfolio: () => void;
}

type AdminTab = 'overview' | 'projects' | 'profile' | 'account' | 'messages';

export const AdminLayout: React.FC<AdminLayoutProps> = ({ onNavigateToPortfolio }) => {
  const { user, logout } = useAuth();
  const [currentTab, setCurrentTab] = useState<AdminTab>('overview');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Quick project modal trigger from anywhere
  const [quickProjectModalOpen, setQuickProjectModalOpen] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [statsData, projectsData, profileData, messagesData] = await Promise.all([
        api.stats.get().catch(() => null),
        api.projects.getAllAdmin().catch(() => []),
        api.profile.get().catch(() => null),
        api.messages.getAll().catch(() => [])
      ]);

      setStats(statsData);
      setProjects(projectsData);
      setProfile(profileData);
      setMessages(messagesData);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleLogout = async () => {
    await logout();
    onNavigateToPortfolio();
  };

  return (
    <div className="min-h-screen bg-zinc-100 flex flex-col">
      {/* Top Admin Header */}
      <header className="sticky top-0 z-30 bg-zinc-900 text-white border-b border-zinc-800 px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              className="md:hidden p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
              aria-label="Toggle navigation"
            >
              {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold text-xs">
                CMS
              </div>
              <div>
                <span className="font-bold text-sm tracking-tight text-white block leading-none">Portfolio Admin</span>
                <span className="text-[10px] text-zinc-400 leading-none mt-0.5 block">Content Management System</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onNavigateToPortfolio}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-medium transition-colors cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">View Public Site</span>
            </button>

            {/* Admin Profile Pill */}
            <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-zinc-800 text-xs">
              <div className="w-7 h-7 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-300 flex items-center justify-center font-semibold text-xs">
                {user?.name ? user.name[0].toUpperCase() : 'A'}
              </div>
              <div className="text-left leading-tight">
                <div className="font-medium text-white">{user?.name || 'Administrator'}</div>
                <div className="text-[10px] text-zinc-400">{user?.email}</div>
              </div>
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-zinc-800 transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Admin Body */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 md:p-8 flex flex-col md:flex-row gap-6 md:gap-8">
        {/* Sidebar Navigation */}
        <aside
          className={`${
            mobileNavOpen ? 'block' : 'hidden'
          } md:block w-full md:w-64 flex-shrink-0 space-y-2`}
        >
          <div className="bg-white rounded-2xl border border-zinc-200 p-3 shadow-2xs space-y-1">
            <button
              onClick={() => {
                setCurrentTab('overview');
                setMobileNavOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                currentTab === 'overview'
                  ? 'bg-zinc-900 text-white font-semibold shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <LayoutDashboard className="w-4 h-4" />
                <span>Overview</span>
              </div>
            </button>

            <button
              onClick={() => {
                setCurrentTab('projects');
                setMobileNavOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                currentTab === 'projects'
                  ? 'bg-zinc-900 text-white font-semibold shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Layers className="w-4 h-4" />
                <span>Projects</span>
              </div>
              <span
                className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                  currentTab === 'projects' ? 'bg-zinc-800 text-white' : 'bg-zinc-100 text-zinc-600'
                }`}
              >
                {projects.length}
              </span>
            </button>

            <button
              onClick={() => {
                setCurrentTab('profile');
                setMobileNavOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                currentTab === 'profile'
                  ? 'bg-zinc-900 text-white font-semibold shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <UserIcon className="w-4 h-4" />
                <span>Student Profile</span>
              </div>
            </button>

            <button
              onClick={() => {
                setCurrentTab('account');
                setMobileNavOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                currentTab === 'account'
                  ? 'bg-zinc-900 text-white font-semibold shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Shield className="w-4 h-4" />
                <span>Account & Security</span>
              </div>
            </button>

            <button
              onClick={() => {
                setCurrentTab('messages');
                setMobileNavOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                currentTab === 'messages'
                  ? 'bg-zinc-900 text-white font-semibold shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4" />
                <span>Messages Inbox</span>
              </div>
              {messages.filter((m) => !m.is_read).length > 0 && (
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center">
                  {messages.filter((m) => !m.is_read).length}
                </span>
              )}
            </button>
          </div>

          {/* Quick Add Project Action */}
          <div className="p-4 rounded-2xl bg-white border border-zinc-200 shadow-2xs">
            <h4 className="text-xs font-semibold text-zinc-900 mb-1">Quick Action</h4>
            <p className="text-[11px] text-zinc-500 mb-3">Add a new work to showcase</p>
            <button
              onClick={() => setQuickProjectModalOpen(true)}
              className="w-full py-2 px-3 rounded-xl bg-zinc-100 hover:bg-zinc-200/80 text-zinc-900 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New Project</span>
            </button>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 min-w-0">
          {currentTab === 'overview' && (
            <AdminOverview
              stats={stats}
              projects={projects}
              profile={profile}
              onNavigateTab={(tab) => setCurrentTab(tab)}
              onOpenNewProject={() => setQuickProjectModalOpen(true)}
              onViewPortfolio={onNavigateToPortfolio}
            />
          )}

          {currentTab === 'projects' && (
            <ProjectsManager projects={projects} onRefresh={loadData} isLoading={isLoading} />
          )}

          {currentTab === 'profile' && (
            <ProfileSettings
              profile={profile}
              onProfileUpdated={(updatedProfile) => {
                setProfile(updatedProfile);
                loadData();
              }}
            />
          )}

          {currentTab === 'account' && <AccountSettings />}

          {currentTab === 'messages' && (
            <MessagesManager messages={messages} onRefresh={loadData} isLoading={isLoading} />
          )}
        </main>
      </div>

      {/* Quick Add Project Modal */}
      <ProjectModal
        isOpen={quickProjectModalOpen}
        project={null}
        onClose={() => setQuickProjectModalOpen(false)}
        onSaved={() => {
          loadData();
          setCurrentTab('projects');
        }}
      />
    </div>
  );
};
