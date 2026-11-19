import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarCheck,
  Map,
  BookOpen,
  Swords,
  Bot,
  Users2,
  FolderGit2,
  ExternalLink,
  Award,
  Terminal,
  Gamepad2,
  Code2,
  Sparkles,
  Settings,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

interface NavItem {
  to: string;
  label: string;
  icon: any;
  badge?: string;
  highlight?: boolean;
  count?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen = false, onClose }) => {
  const { user } = useAuth();

  const navSections: NavSection[] = [
    {
      title: 'CORE WORKSPACE',
      items: [
        {
          to: '/dashboard',
          label: 'Dashboard',
          icon: LayoutDashboard,
        },
        {
          to: '/ide',
          label: 'Java Cloud IDE',
          icon: Code2,
          badge: 'Live Linter',
          highlight: true,
        },
        {
          to: '/games',
          label: '2.5D Game Worlds',
          icon: Gamepad2,
          badge: '6 Worlds',
          highlight: true,
        },
      ],
    },
    {
      title: 'MNC CURRICULUM',
      items: [
        {
          to: '/today-topic',
          label: "Today's Institute Topic",
          icon: CalendarCheck,
          badge: 'Active',
        },
        {
          to: '/roadmap',
          label: 'Java Roadmap',
          icon: Map,
        },
        {
          to: '/questions',
          label: 'MNC Question Bank',
          icon: BookOpen,
          count: '250 MNC',
        },
        {
          to: '/code-lab',
          label: 'Interactive Code Lab',
          icon: Terminal,
          badge: '7 Formats',
        },
      ],
    },
    {
      title: 'MULTIPLAYER & AI',
      items: [
        {
          to: '/arena',
          label: 'Challenge Arena',
          icon: Swords,
        },
        {
          to: '/mentor',
          label: 'AI Java Mentor',
          icon: Bot,
          badge: '6 Modes',
        },
        {
          to: '/companion',
          label: 'Companion Mode',
          icon: Users2,
          badge: 'Live Sync',
        },
        {
          to: '/projects',
          label: 'Industry Projects',
          icon: FolderGit2,
          count: '3 Labs',
        },
        {
          to: '/external',
          label: 'External Platforms',
          icon: ExternalLink,
        },
      ],
    },
    {
      title: 'METRICS & SETTINGS',
      items: [
        {
          to: '/achievements',
          label: 'Achievements & XP',
          icon: Award,
        },
        {
          to: '/profile',
          label: 'Profile & Settings',
          icon: Settings,
        },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay (matches D:/Intranet/ standard) */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 lg:top-0 left-0 z-40 h-full w-64 bg-white/95 lg:bg-white/80 dark:bg-slate-950/95 lg:dark:bg-slate-950/60 border-r border-slate-200 dark:border-slate-800/80 flex flex-col justify-between transition-transform duration-300 ease-in-out backdrop-blur-xl ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-5 border-b border-slate-200 dark:border-slate-800/80 flex items-center justify-between shrink-0">
          <NavLink to="/dashboard" onClick={onClose} className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-4 h-4 text-slate-950 font-black" />
            </div>
            <div>
              <span className="font-extrabold text-base text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5">
                JavaQuest
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  v2.0
                </span>
              </span>
            </div>
          </NavLink>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {navSections.map((sec, sIdx) => (
            <div key={sIdx} className="space-y-1">
              <div className="px-3 text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                {sec.title}
              </div>
              <div className="space-y-0.5 pt-1">
                {sec.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={onClose}
                      className={({ isActive }) =>
                        `flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all group ${
                          isActive
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 font-semibold shadow-sm shadow-emerald-100 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30 dark:shadow-emerald-950/50'
                            : item.highlight
                            ? 'text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-900 dark:border-slate-800/60'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-900/60'
                        }`
                      }
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4 shrink-0 transition-colors group-hover:text-emerald-600 dark:group-hover:text-emerald-400" />
                        <span>{item.label}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {item.badge && (
                          <span className="text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20">
                            {item.badge}
                          </span>
                        )}
                        {item.count && (
                          <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
                            {item.count}
                          </span>
                        )}
                      </div>
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* User Mini Card at Bottom */}
        {user && (
          <div className="p-3 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50/80 dark:bg-slate-900/40 shrink-0">
            <div className="flex items-center justify-between px-2 py-1.5 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center font-bold text-white text-[11px] shrink-0">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-slate-800 dark:text-slate-200 truncate text-[11px]">{user.username}</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">{user.role} &bull; Lvl {user.level}</p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold text-[11px]">{user.total_xp} XP</span>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};
