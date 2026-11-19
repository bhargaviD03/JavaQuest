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
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Achievement } from '../types';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';

export const ProfilePage: React.FC = () => {
  const { user, refreshProfile } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm text-slate-400">Loading your profile & achievements...</p>
        </div>
      </div>
    );
  }

  const unlockedCount = achievements.filter(a => a.unlocked).length;

  return (
    <div className="space-y-8 animate-fadeIn max-w-5xl mx-auto">
      {/* Profile Overview Card */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-extrabold text-2xl shadow-xl shadow-emerald-500/20">
            {user.username.slice(0, 2).toUpperCase()}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-white">{user.username}</h1>
              <Badge variant={user.role === 'learner' ? 'emerald' : 'purple'}>
                {user.role}
              </Badge>
            </div>
            <p className="text-xs text-slate-400">{user.email}</p>
            <p className="text-[11px] text-slate-500">Joined {new Date(user.created_at).toLocaleDateString()}</p>
          </div>
        </div>

        {/* Gamification Stats */}
        <div className="flex items-center gap-4">
          <div className="p-3 px-4 rounded-2xl bg-slate-950 border border-slate-800 text-center">
            <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 mb-0.5">
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              <span>Total XP</span>
            </div>
            <span className="font-mono text-xl font-bold text-emerald-400">{user.total_xp}</span>
          </div>

          <div className="p-3 px-4 rounded-2xl bg-slate-950 border border-slate-800 text-center">
            <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 mb-0.5">
              <Layers className="w-3.5 h-3.5 text-sky-400" />
              <span>Level</span>
            </div>
            <span className="font-mono text-xl font-bold text-sky-300">{user.level}</span>
          </div>

          <div className="p-3 px-4 rounded-2xl bg-slate-950 border border-slate-800 text-center">
            <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 mb-0.5">
              <Flame className="w-3.5 h-3.5 text-amber-500" />
              <span>Streak</span>
            </div>
            <span className="font-mono text-xl font-bold text-amber-400">{user.current_streak}d</span>
          </div>
        </div>
      </div>

      {/* Achievement Showcase */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-emerald-400" />
              <span>Achievement Badges</span>
            </h2>
            <p className="text-xs text-slate-400">Earned through genuine learning actions and consistency</p>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {unlockedCount}/{achievements.length} Unlocked
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {achievements.map((ach) => (
            <Card
              key={ach.id}
              className={`space-y-3 transition-all ${
                ach.unlocked
                  ? 'bg-slate-900 border-emerald-500/30'
                  : 'bg-slate-950/60 border-slate-800/60 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  ach.unlocked ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-500'
                }`}>
                  {ach.unlocked ? <Award className="w-5 h-5" /> : <Lock className="w-4 h-4" />}
                </div>
                <span className="text-xs font-mono text-emerald-400 font-semibold">+{ach.xp_reward} XP</span>
              </div>

              <div>
                <h4 className="font-bold text-sm text-slate-100">{ach.title}</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{ach.description}</p>
              </div>

              <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px]">
                <span className={ach.unlocked ? 'text-emerald-400 font-semibold' : 'text-slate-500'}>
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

      {/* Auditable XP Transactions Log */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <History className="w-5 h-5 text-emerald-400" />
              <span>Auditable XP Transaction Ledger</span>
            </h2>
            <p className="text-xs text-slate-400">Guaranteed idempotency preventing duplicate event awards</p>
          </div>
          <span className="text-xs font-mono text-slate-500">{transactions.length} Records</span>
        </div>

        <Card className="p-0 overflow-hidden bg-slate-900 border-slate-800">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-3.5 pl-6 font-semibold">Timestamp</th>
                  <th className="p-3.5 font-semibold">Activity Reason</th>
                  <th className="p-3.5 font-semibold">Category</th>
                  <th className="p-3.5 pr-6 font-semibold text-right">XP Earned</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {transactions.length > 0 ? (
                  transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="p-3.5 pl-6 font-mono text-slate-400">
                        {new Date(tx.created_at).toLocaleString()}
                      </td>
                      <td className="p-3.5 font-medium text-slate-200">{tx.reason}</td>
                      <td className="p-3.5 font-mono text-slate-400 uppercase text-[11px]">{tx.reference_type}</td>
                      <td className="p-3.5 pr-6 text-right font-mono font-bold text-emerald-400">
                        +{tx.amount} XP
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="p-6 text-center text-slate-500">
                      No XP transactions logged yet. Complete a lesson or challenge to earn your first XP!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};
