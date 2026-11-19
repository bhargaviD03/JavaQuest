import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  CalendarCheck,
  Flame,
  Zap,
  Swords,
  BookOpen,
  ArrowRight,
  TrendingUp,
  Award,
  Users2,
  CheckCircle2,
  Clock,
  Layers,
  Code2,
  Gamepad2,
  Target,
  BarChart3,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { DashboardStats } from '../types';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { ProgressBar } from '../components/common/ProgressBar';
import { Skeleton, SkeletonCard, SkeletonText } from '../components/common/Skeleton';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await api.getDashboardStats();
        setStats(data);
      } catch (err) {
        console.error('Failed to load dashboard stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading || !stats) {
    return (
      <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto">
        {/* Skeleton Banner */}
        <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 animate-shimmer space-y-3">
          <Skeleton variant="pill" width={160} height={24} />
          <Skeleton variant="box" width="40%" height={32} />
          <SkeletonText lines={2} />
        </div>

        {/* Skeleton Metrics 4-grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-5 rounded-2xl bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 animate-shimmer space-y-3">
              <div className="flex items-center justify-between">
                <Skeleton variant="text" width={80} height={14} />
                <Skeleton variant="circle" width={32} height={32} />
              </div>
              <Skeleton variant="box" width={110} height={28} />
              <Skeleton variant="text" width="60%" height={12} />
            </div>
          ))}
        </div>

        {/* Skeleton Main Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <SkeletonCard className="min-h-[220px]" />
            <SkeletonCard className="min-h-[180px]" />
          </div>
          <div className="space-y-6">
            <SkeletonCard className="min-h-[240px]" />
            <SkeletonCard className="min-h-[160px]" />
          </div>
        </div>
      </div>
    );
  }

  // Simulated 7-day activity metrics
  const weekDays = [
    { day: 'Mon', count: 4, height: '65%' },
    { day: 'Tue', count: 6, height: '85%' },
    { day: 'Wed', count: 3, height: '50%' },
    { day: 'Thu', count: 7, height: '95%' },
    { day: 'Fri', count: 5, height: '75%' },
    { day: 'Sat', count: 8, height: '100%' },
    { day: 'Sun', count: 6, height: '80%' },
  ];

  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto">
      {/* 1. Hero Welcome Banner (Replicating Preview 1) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white via-slate-50 to-slate-100 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm dark:shadow-2xl">
        {/* Subtle radial corner glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>MNC Placement Readiness Tracker</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {stats.greeting}
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm leading-relaxed">
              Target for today: Deep-dive into{' '}
              <strong className="text-emerald-600 dark:text-emerald-300 font-semibold">
                {stats.today_institute_topic || 'OOP Foundations & Blueprints'}
              </strong>
              . Solve the daily MNC challenge and test raw code in the Cloud IDE.
            </p>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row gap-3">
            <Link to="/today-topic">
              <Button
                variant="quest"
                size="md"
                icon={<CalendarCheck className="w-4 h-4" />}
                className="w-full sm:w-auto shadow-emerald-500/20 shadow-lg font-bold"
              >
                Today's Institute Class
              </Button>
            </Link>
            <Link to="/ide">
              <Button
                variant="secondary"
                size="md"
                icon={<Code2 className="w-4 h-4 text-sky-500 dark:text-sky-400" />}
                className="w-full sm:w-auto"
              >
                Launch Cloud IDE
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Four Polished Stat Metric Cards (Matching Preview 1) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Current Streak */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700/80 shadow-sm dark:shadow-none hover:shadow-md transition-all space-y-3 relative group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Current Streak</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
              <Flame className="w-4 h-4 fill-amber-500 text-amber-500 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">{stats.current_streak} Days</div>
            <p className="text-[11px] text-amber-600 dark:text-amber-400/90 font-medium mt-0.5 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              <span>Top 5% consistency</span>
            </p>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-gradient-to-r from-amber-500 to-orange-400 h-full rounded-full w-4/5"></div>
          </div>
        </div>

        {/* Card 2: Total Solved MNC Problems */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700/80 shadow-sm dark:shadow-none hover:shadow-md transition-all space-y-3 relative group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">MNC Repository</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">250 Questions</div>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400/90 font-medium mt-0.5 flex items-center gap-1">
              <span>FAANG & Tier-1 Curated</span>
            </p>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full w-full"></div>
          </div>
        </div>

        {/* Card 3: Code Accuracy & Mastery */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700/80 shadow-sm dark:shadow-none hover:shadow-md transition-all space-y-3 relative group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Solution Accuracy</span>
            <div className="w-8 h-8 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-600 dark:text-sky-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">94.2%</div>
            <p className="text-[11px] text-sky-600 dark:text-sky-400/90 font-medium mt-0.5 flex items-center gap-1">
              <span>First-attempt pass rate</span>
            </p>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-gradient-to-r from-sky-500 to-indigo-500 h-full rounded-full w-[94%]"></div>
          </div>
        </div>

        {/* Card 4: Total Developer XP */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700/80 shadow-sm dark:shadow-none hover:shadow-md transition-all space-y-3 relative group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Developer XP</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Zap className="w-4 h-4 fill-indigo-500 dark:fill-indigo-400 text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">{stats.total_xp} XP</div>
            <p className="text-[11px] text-indigo-600 dark:text-indigo-300 font-medium mt-0.5 flex items-center gap-1">
              <span>Rank: Level {stats.level} &bull; {stats.xp_to_next_level} to next</span>
            </p>
          </div>
          <ProgressBar value={stats.progress_to_next_level} color="gradient" size="sm" />
        </div>
      </div>

      {/* 3. Main Dashboard Grid (2 cols on lg, 3 cols total) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols): Activity Chart + Daily Challenge */}
        <div className="lg:col-span-8 space-y-6">
          {/* Weekly Coding Activity Heatmap Bar Chart (from Preview Mockup) */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  Weekly Practice Velocity
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Questions attempted & code submissions across the last 7 days
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-500/20">
                39 Commits / Solves
              </span>
            </div>

            {/* Bar Chart Graphics */}
            <div className="pt-4 flex items-end justify-between gap-3 h-40 px-2 border-b border-slate-200 dark:border-slate-800/80 pb-2">
              {weekDays.map((item, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <span className="text-[10px] font-mono text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.count}
                  </span>
                  <div
                    className="w-full max-w-[36px] bg-gradient-to-t from-emerald-500 to-teal-400/80 rounded-t-lg group-hover:from-emerald-400 group-hover:to-teal-300 transition-all cursor-pointer shadow-lg shadow-emerald-500/10"
                    style={{ height: item.height }}
                  />
                  <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                    {item.day}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Daily Challenge Card */}
          <div className="p-6 rounded-3xl bg-white dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-900 dark:to-emerald-950/20 border border-emerald-200 dark:border-emerald-500/20 shadow-sm dark:shadow-none space-y-4 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <Swords className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">Today's Daily Challenge</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Curated from LeetCode / MNC interview circuits</p>
                </div>
              </div>
              {stats.daily_challenge && (
                <Badge variant={stats.daily_challenge.difficulty}>{stats.daily_challenge.difficulty}</Badge>
              )}
            </div>

            {stats.daily_challenge ? (
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">{stats.daily_challenge.canonical_id}</span>
                  <span>&bull;</span>
                  <span>{stats.daily_challenge.topic}</span>
                  <span>&bull;</span>
                  <span className="capitalize">{stats.daily_challenge.question_type}</span>
                </div>
                <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm sm:text-base">{stats.daily_challenge.title}</h4>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                  {stats.daily_challenge.prompt}
                </p>

                <div className="pt-3 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
                  <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-mono">
                    <Zap className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
                    <span>Reward: +25 XP</span>
                  </div>
                  <Link to={`/arena?qid=${stats.daily_challenge.id}`}>
                    <Button variant="primary" size="sm" icon={<ArrowRight className="w-4 h-4" />}>
                      Solve Daily Challenge
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500 dark:text-slate-400 py-4">No daily challenge available right now.</p>
            )}
          </div>
        </div>

        {/* Right Column (4 cols): Quick Launchers & Companion */}
        <div className="lg:col-span-4 space-y-6">
          {/* Quick Launcher: Cloud IDE */}
          <Link
            to="/ide"
            className="block p-5 rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:border-sky-400 dark:hover:border-sky-500/40 hover:bg-slate-50 dark:hover:bg-slate-900 shadow-sm dark:shadow-none hover:shadow-md transition-all group relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-500 dark:text-sky-400 group-hover:scale-105 transition-transform">
                <Code2 className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
                Real-Time
              </span>
            </div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-300 transition-colors flex items-center gap-1.5">
              Java Cloud IDE Workspace <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Real-time AST error detection as you type with strict no-auto-complete mode.
            </p>
          </Link>

          {/* Quick Launcher: 2.5D Game Worlds */}
          <Link
            to="/games"
            className="block p-5 rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-500/40 hover:bg-slate-50 dark:hover:bg-slate-900 shadow-sm dark:shadow-none hover:shadow-md transition-all group relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform">
                <Gamepad2 className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                6 WebGL Worlds
              </span>
            </div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-300 transition-colors flex items-center gap-1.5">
              2.5D Game Worlds <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Progressive Level 1 (1-line) to Level 10 (scratch) immersive 3D games.
            </p>
          </Link>

          {/* Download 250 MNC PDF Quick Action Card */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-300">
              <BookOpen className="w-4 h-4 text-amber-500 dark:text-amber-400" />
              <span>Offline Master Guide</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Download the complete 250 Top MNC Java Interview Questions offline guide.
            </p>
            <a
              href="/downloads/250_Top_MNC_Java_Interview_Questions_Master_Guide.pdf"
              download="250_Top_MNC_Java_Interview_Questions_Master_Guide.pdf"
              className="inline-flex items-center justify-center w-full gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-bold text-xs transition-colors"
            >
              Download 250 MNC PDF
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
