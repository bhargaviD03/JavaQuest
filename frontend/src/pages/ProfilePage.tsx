import React, { useState, useEffect } from 'react';
import {
  Award,
  Zap,
  Flame,
  UserCheck,
  Shield,
  Layers,
  History,
  CheckCircle2,
  Lock,
  Sparkles,
  Settings,
  User as UserIcon,
  KeyRound,
  Save,
  AlertCircle,
  Mail,
  Bot
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Achievement } from '../types';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';

const AVATAR_OPTIONS = [
  { id: 'cat-coder', label: 'Cat Coder', color: 'from-amber-400 to-orange-500' },
  { id: 'dog-coder', label: 'Dog Coder', color: 'from-sky-400 to-indigo-500' },
  { id: 'fox-coder', label: 'Fox Coder', color: 'from-rose-400 to-red-500' },
  { id: 'robot-coder', label: 'Robot Coder', color: 'from-emerald-400 to-teal-500' },
  { id: 'lion-coder', label: 'Lion Coder', color: 'from-yellow-400 to-amber-600' },
  { id: 'dragon-coder', label: 'Dragon Coder', color: 'from-purple-400 to-indigo-600' },
];

export const ProfilePage: React.FC = () => {
  const { user, refreshProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<'settings' | 'achievements' | 'ledger'>('settings');
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Profile Edit Form State
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('cat-coder');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Status message state
  const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const fetchProfileData = async () => {
    setLoading(true);
    try {
      const [achs, txs] = await Promise.all([
        api.getAchievements(),
        api.getXPTransactions(),
      ]);
      setAchievements(achs);
      setTransactions(txs);
    } catch (err) {
      console.error('Failed to load profile data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  useEffect(() => {
    if (user) {
      setUsername(user.username || '');
      setEmail(user.email || '');
      setSelectedAvatar(user.avatar || 'cat-coder');
    }
  }, [user]);

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm text-slate-400">Loading your profile & settings...</p>
        </div>
      </div>
    );
  }

  const unlockedCount = achievements.filter(a => a.unlocked).length;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus(null);

    // Validate password change if attempted
    if (newPassword || confirmPassword) {
      if (!currentPassword) {
        setSaveStatus({ type: 'error', message: 'Current password is required to set a new password.' });
        return;
      }
      if (newPassword.length < 6) {
        setSaveStatus({ type: 'error', message: 'New password must be at least 6 characters long.' });
        return;
      }
      if (newPassword !== confirmPassword) {
        setSaveStatus({ type: 'error', message: 'New passwords do not match.' });
        return;
      }
    }

    setIsSaving(true);
    try {
      const payload: any = {
        username: username.trim(),
        email: email.trim(),
        avatar: selectedAvatar,
      };

      if (newPassword) {
        payload.current_password = currentPassword;
        payload.new_password = newPassword;
      }

      await api.updateProfile(payload);
      await refreshProfile();

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setSaveStatus({ type: 'success', message: 'Profile settings updated successfully!' });
    } catch (err: any) {
      setSaveStatus({
        type: 'error',
        message: err.message || 'Failed to update profile settings. Please try again.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-5xl mx-auto pb-16">
      {/* 1. Profile Overview Header Card */}
      <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm dark:shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-extrabold text-2xl shadow-xl shadow-emerald-500/20">
            {user.username.slice(0, 2).toUpperCase()}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">{user.username}</h1>
              <Badge variant={user.role === 'learner' ? 'emerald' : 'purple'}>
                {user.role}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">{user.email}</p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              Account created: {new Date(user.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Gamification Stats */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="p-3 px-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center min-w-[85px]">
            <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-0.5">
              <Zap className="w-3.5 h-3.5 text-emerald-500" />
              <span>Total XP</span>
            </div>
            <span className="font-mono text-xl font-bold text-emerald-600 dark:text-emerald-400">{user.total_xp}</span>
          </div>

          <div className="p-3 px-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center min-w-[85px]">
            <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-0.5">
              <Layers className="w-3.5 h-3.5 text-sky-500" />
              <span>Level</span>
            </div>
            <span className="font-mono text-xl font-bold text-sky-600 dark:text-sky-300">{user.level}</span>
          </div>

          <div className="p-3 px-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center min-w-[85px]">
            <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-0.5">
              <Flame className="w-3.5 h-3.5 text-amber-500" />
              <span>Streak</span>
            </div>
            <span className="font-mono text-xl font-bold text-amber-500">{user.current_streak}d</span>
          </div>
        </div>
      </div>

      {/* 2. Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'settings'
              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Profile & Account Settings</span>
        </button>

        <button
          onClick={() => setActiveTab('achievements')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'achievements'
              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Badges & Achievements ({unlockedCount})</span>
        </button>

        <button
          onClick={() => setActiveTab('ledger')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'ledger'
              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900'
          }`}
        >
          <History className="w-4 h-4" />
          <span>XP Activity Ledger ({transactions.length})</span>
        </button>
      </div>

      {/* TAB 1: Profile & Account Settings Form */}
      {activeTab === 'settings' && (
        <Card className="p-6 md:p-8 space-y-6 bg-white dark:bg-slate-900/80 border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Settings className="w-5 h-5 text-emerald-500" />
              <span>Personal Information & Credentials</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Update your display username, email address, avatar style, and security credentials.
            </p>
          </div>

          {saveStatus && (
            <div
              className={`p-4 rounded-2xl border text-xs flex items-center gap-3 transition-all ${
                saveStatus.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-300'
                  : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-500/30 text-rose-800 dark:text-rose-300'
              }`}
            >
              {saveStatus.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              )}
              <span>{saveStatus.message}</span>
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-6">
            {/* Username & Email Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                  <span>Display Username</span>
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  minLength={3}
                  maxLength={50}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>Email Address</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>

            {/* Avatar Style Picker */}
            <div className="space-y-2 pt-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Developer Avatar Persona</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                {AVATAR_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSelectedAvatar(opt.id)}
                    className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-2 cursor-pointer ${
                      selectedAvatar === opt.id
                        ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 shadow-md shadow-emerald-500/10'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${opt.color} flex items-center justify-center text-white font-bold text-xs shadow-sm`}>
                      {opt.label.slice(0, 2).toUpperCase()}
                    </div>
                    <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                      {opt.label}
                    </span>
                    {selectedAvatar === opt.id && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Security: Password Change Section */}
            <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-sky-500" />
                  <span>Change Password</span>
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Leave these fields blank if you do not wish to change your current password.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Current Password</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-mono focus:outline-none focus:border-sky-500 transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-400">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-mono focus:outline-none focus:border-sky-500 transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-mono focus:outline-none focus:border-sky-500 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-2 flex justify-end">
              <Button
                type="submit"
                variant="quest"
                size="md"
                disabled={isSaving}
                icon={<Save className="w-4 h-4" />}
                className="font-bold shadow-lg shadow-emerald-500/20"
              >
                {isSaving ? 'Saving Changes...' : 'Save Profile Settings'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* TAB 2: Badges & Achievements */}
      {activeTab === 'achievements' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-emerald-500" />
                <span>Achievement Badges</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Earned through genuine learning actions and consistency</p>
            </div>
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
              {unlockedCount}/{achievements.length} Unlocked
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {achievements.map((ach) => (
              <Card
                key={ach.id}
                className={`space-y-3 transition-all ${
                  ach.unlocked
                    ? 'bg-white dark:bg-slate-900 border-emerald-500/30'
                    : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800/60 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    ach.unlocked ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'
                  }`}>
                    {ach.unlocked ? <Award className="w-5 h-5" /> : <Lock className="w-4 h-4" />}
                  </div>
                  <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-semibold">+{ach.xp_reward} XP</span>
                </div>

                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">{ach.title}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{ach.description}</p>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-[11px]">
                  <span className={ach.unlocked ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-slate-400 dark:text-slate-500'}>
                    {ach.unlocked ? 'Unlocked' : 'Locked'}
                  </span>
                  {ach.unlocked_at && (
                    <span className="text-slate-500">
                      {new Date(ach.unlocked_at).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: Auditable XP Transactions Log */}
      {activeTab === 'ledger' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <History className="w-5 h-5 text-emerald-500" />
                <span>Auditable XP Transaction Ledger</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Guaranteed idempotency preventing duplicate event awards</p>
            </div>
            <span className="text-xs font-mono text-slate-500">{transactions.length} Records</span>
          </div>

          <Card className="p-0 overflow-hidden bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-950/80 text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-3.5 pl-6 font-semibold">Timestamp</th>
                    <th className="p-3.5 font-semibold">Activity Reason</th>
                    <th className="p-3.5 font-semibold">Category</th>
                    <th className="p-3.5 pr-6 font-semibold text-right">XP Earned</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
                  {transactions.length > 0 ? (
                    transactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="p-3.5 pl-6 font-mono text-slate-400">
                          {new Date(tx.created_at).toLocaleString()}
                        </td>
                        <td className="p-3.5 font-medium text-slate-800 dark:text-slate-200">{tx.reason}</td>
                        <td className="p-3.5 font-mono text-slate-400 uppercase text-[11px]">{tx.reference_type}</td>
                        <td className="p-3.5 pr-6 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          +{tx.amount} XP
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-slate-500">
                        No XP transactions logged yet. Complete your first lesson, challenge, or game to earn XP!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
