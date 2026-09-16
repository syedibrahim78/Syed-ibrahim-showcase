import React, { useState } from 'react';
import { Shield, Key, Mail, User as UserIcon, Lock, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

export const AccountSettings: React.FC = () => {
  const { user, updateUserSession } = useAuth();

  // Basic info fields
  const [email, setEmail] = useState(user?.email || '');
  const [name, setName] = useState(user?.name || '');

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleUpdateBasic = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email.trim()) {
      setErrorMsg('Email address cannot be empty.');
      return;
    }
    if (!name.trim()) {
      setErrorMsg('Admin name cannot be empty.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.account.update({
        email: email.trim(),
        name: name.trim()
      });
      updateUserSession(res.user, res.token);
      setSuccessMsg('Account profile details updated successfully!');
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update account details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!currentPassword) {
      setErrorMsg('Please enter your current password.');
      return;
    }
    if (!newPassword) {
      setErrorMsg('Please enter a new password.');
      return;
    }
    if (newPassword.length < 6) {
      setErrorMsg('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg('New password and confirmation do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.account.update({
        currentPassword,
        newPassword
      });
      updateUserSession(res.user, res.token);
      setSuccessMsg('Password changed securely! You can now log in with your new password.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to change password. Please check your current password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 tracking-tight">Admin Account & Security</h1>
        <p className="text-xs sm:text-sm text-zinc-500 mt-0.5">
          Manage your administrator credentials, email notifications, and password authentication.
        </p>
      </div>

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Admin Profile Details */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-6 sm:p-8 space-y-5 shadow-2xs">
        <div className="flex items-center gap-2.5 pb-4 border-b border-zinc-100">
          <div className="p-2 rounded-lg bg-zinc-100 text-zinc-800">
            <UserIcon className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-zinc-900">Administrator Details</h2>
            <p className="text-xs text-zinc-500">Update your administrator name and login email address</p>
          </div>
        </div>

        <form onSubmit={handleUpdateBasic} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="admin-name" className="block text-xs font-semibold text-zinc-700 mb-1">
                Admin Name
              </label>
              <input
                id="admin-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900"
              />
            </div>

            <div>
              <label htmlFor="account-email" className="block text-xs font-semibold text-zinc-700 mb-1">
                Login Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  id="account-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 text-sm bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-zinc-900 text-white rounded-xl text-xs sm:text-sm font-semibold hover:bg-zinc-800 disabled:opacity-50 transition-colors shadow-xs cursor-pointer"
            >
              Update Admin Details
            </button>
          </div>
        </form>
      </div>

      {/* Password Change Box */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-6 sm:p-8 space-y-5 shadow-2xs">
        <div className="flex items-center gap-2.5 pb-4 border-b border-zinc-100">
          <div className="p-2 rounded-lg bg-zinc-100 text-zinc-800">
            <Key className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-zinc-900">Change Password</h2>
            <p className="text-xs text-zinc-500">
              Update your password. Requires current password verification for security.
            </p>
          </div>
        </div>

        <form onSubmit={handleUpdatePassword} className="space-y-4">
          <div>
            <label htmlFor="current-password" className="block text-xs font-semibold text-zinc-700 mb-1">
              Current Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                id="current-password"
                type={showCurrentPassword ? 'text' : 'password'}
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                className="w-full pl-9 pr-10 py-2 text-sm bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
              >
                {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="new-password" className="block text-xs font-semibold text-zinc-700 mb-1">
                New Password (min 6 characters) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  id="new-password"
                  type={showNewPassword ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="New password"
                  className="w-full pl-9 pr-10 py-2 text-sm bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirm-password" className="block text-xs font-semibold text-zinc-700 mb-1">
                Confirm New Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  id="confirm-password"
                  type={showNewPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full pl-9 pr-3.5 py-2 text-sm bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900"
                />
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-500 flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>Passwords are salted and securely hashed using bcrypt on the Express server.</span>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-zinc-900 text-white rounded-xl text-xs sm:text-sm font-semibold hover:bg-zinc-800 disabled:opacity-50 transition-colors shadow-xs cursor-pointer"
            >
              Update Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
