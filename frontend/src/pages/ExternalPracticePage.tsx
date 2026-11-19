import React, { useState, useEffect } from 'react';
import {
  ExternalLink,
  CheckCircle2,
  Clock,
  Sparkles,
  Bookmark,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { api } from '../services/api';
import { ExternalChallenge } from '../types';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';

export const ExternalPracticePage: React.FC = () => {
  const [challenges, setChallenges] = useState<ExternalChallenge[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchChallenges = async () => {
    setLoading(true);
    try {
      const data = await api.getExternalPractice();
      setChallenges(data);
    } catch (err) {
      console.error('Failed to load external challenges', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallenges();
  }, []);

  const handleUpdateStatus = async (challengeId: number, status: string, notes?: string) => {
    try {
      await api.updateExternalStatus(challengeId, status, notes);
      setChallenges(challenges.map(c => c.id === challengeId ? { ...c, user_status: status as any, notes: notes || c.notes } : c));
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm text-slate-400">Loading external practice domains...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 md:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-1 rounded-md bg-emerald-500/10 text-emerald-400">
              <ExternalLink className="w-4 h-4" />
            </span>
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              Official Practice Hubs
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white">External Coding Practice</h1>
          <p className="text-sm text-slate-400 mt-1 max-w-xl">
            Official domains on HackerRank and LeetCode. Track your progress, attempt dates, and notes in one place.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="blue">Official Links</Badge>
        </div>
      </div>

      {/* Content Policy Notice */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-start gap-3 text-xs text-slate-400">
        <ShieldAlert className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-slate-200">Respecting Content Policy:</strong> JavaQuest does not scrape or redistribute copyrighted LeetCode or HackerRank problem statements or solutions. Clicking practice links opens the original challenge on its official platform, allowing you to build your external profile alongside JavaQuest.
        </p>
      </div>

      {/* Challenges List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {challenges.map((c) => (
          <Card key={c.id} className="space-y-4 bg-slate-900 border-slate-800 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Badge variant={c.platform === 'LeetCode' ? 'amber' : 'emerald'}>
                  {c.platform}
                </Badge>
                <span className="text-xs font-mono text-slate-500">{c.topic}</span>
              </div>
              <h3 className="font-bold text-base text-slate-100">{c.title}</h3>
              <p className="text-xs text-slate-400">
                Official {c.platform} curated problems. Practice standard Java algorithms and data structures.
              </p>
            </div>

            <div className="pt-3 border-t border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Your Status:</span>
                <select
                  value={c.user_status}
                  onChange={(e) => handleUpdateStatus(c.id, e.target.value)}
                  className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 text-xs outline-none focus:border-emerald-500"
                >
                  <option value="not_started">Not Started</option>
                  <option value="attempted">Attempted</option>
                  <option value="solved">Solved</option>
                  <option value="needs_revision">Needs Revision</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-500 truncate max-w-[200px]">
                  {c.url}
                </span>
                <a
                  href={c.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 hover:text-white font-medium transition-colors"
                >
                  <span>Open Platform</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
