import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  FileQuestion,
  ArrowLeft,
  Home,
  Code2,
  Gamepad2,
  BookOpen,
  Map,
  Search,
  Sparkles
} from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();
  const [query, setQuery] = React.useState('');

  const quickLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: Home, desc: 'Your progress & daily challenge' },
    { to: '/ide', label: 'Java Cloud IDE', icon: Code2, desc: 'Live linter workspace with strict no-auto-complete' },
    { to: '/games', label: '2.5D Game Worlds', icon: Gamepad2, desc: '6 interactive WebGL worlds' },
    { to: '/questions', label: 'Question Bank', icon: BookOpen, desc: '250 Top MNC Interview questions & PDF' },
    { to: '/roadmap', label: 'Java Roadmap', icon: Map, desc: 'Zero to hero developer path' },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/questions?search=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-200">
      {/* Background radial gradient accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-2xl w-full text-center relative z-10 space-y-8">
        {/* 404 Graphic Badge */}
        <div className="inline-flex flex-col items-center">
          <div className="relative">
            <span className="text-8xl sm:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-b from-slate-300 via-slate-400 to-slate-200 dark:from-slate-700 dark:via-slate-800 dark:to-slate-950 tracking-tighter select-none">
              404
            </span>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-500/20 to-indigo-500/20 border border-sky-500/30 flex items-center justify-center backdrop-blur-md text-sky-500 dark:text-sky-400 shadow-xl shadow-sky-500/10 animate-bounce">
                <FileQuestion className="w-8 h-8" />
              </div>
            </div>
          </div>
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-sky-600 dark:text-sky-400 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 mt-2">
            HTTP 404 &bull; Resource Missing
          </span>
        </div>

        {/* Message */}
        <div className="space-y-2 max-w-lg mx-auto">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Chamber Not Found in JavaQuest Registry
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            The route or coordinate you navigated to doesn't exist, was moved, or requires higher clearance.
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="max-w-md mx-auto">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search questions, topics, or modules..."
              className="w-full pl-10 pr-24 py-2.5 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors shadow-sm dark:shadow-none"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1.5 bottom-1.5 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 font-semibold text-[11px] transition-colors"
            >
              Search
            </button>
          </div>
        </form>

        {/* Quick Navigation Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left max-w-lg mx-auto">
          {quickLinks.slice(0, 4).map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.to}
                to={link.to}
                className="p-3.5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900 shadow-sm dark:shadow-none transition-all group flex items-start gap-3"
              >
                <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 flex items-center justify-center text-slate-600 dark:text-slate-300 group-hover:text-sky-600 dark:group-hover:text-sky-400 group-hover:border-sky-500/40 transition-colors shrink-0">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-xs text-slate-900 dark:text-slate-200 group-hover:text-sky-600 dark:group-hover:text-white transition-colors">
                    {link.label}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate mt-0.5">
                    {link.desc}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs flex items-center gap-2 transition-colors cursor-pointer shadow-sm dark:shadow-none"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Go Back
          </button>
          <Link
            to="/dashboard"
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all"
          >
            <Home className="w-3.5 h-3.5" />
            Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};
