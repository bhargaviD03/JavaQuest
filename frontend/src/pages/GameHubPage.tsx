import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Sparkles, BookOpen, Layers, Award, ArrowRight, Gamepad2, Boxes, UtensilsCrossed, Rocket, ShieldAlert, Building2 } from 'lucide-react';
import { GAME_REGISTRY } from '../games/engine/GameRegistry';

const GAME_ICON_MAP: Record<string, React.ElementType> = {
  Boxes: Boxes,
  UtensilsCrossed: UtensilsCrossed,
  Rocket: Rocket,
  Gamepad2: Gamepad2,
  ShieldAlert: ShieldAlert,
  Building2: Building2,
};

export const GameHubPage: React.FC = () => {
  const navigate = useNavigate();
  const games = Object.values(GAME_REGISTRY);

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Hero Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-mono font-semibold mb-2">
            <Gamepad2 className="w-3.5 h-3.5" />
            <span>2.5D GAME-BASED JAVA ECOSYSTEM</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">The 6 JavaQuest Game Worlds</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Learn Java by playing, creating, and debugging in living 2.5D simulations. Every line of code directly drives the game world.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-2 shadow-sm dark:shadow-none">
            <Award className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="text-xs font-mono text-slate-700 dark:text-slate-300">
              Active Ecosystem: <strong className="text-emerald-600 dark:text-emerald-400 font-bold">6 Worlds</strong>
            </span>
          </div>
        </div>
      </div>

      {/* 6 Game Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {games.map((game) => (
          <div
            key={game.id}
            className="group rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:bg-slate-50 dark:hover:bg-slate-900/90 hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300 flex flex-col justify-between p-6 shadow-sm hover:shadow-xl relative overflow-hidden"
          >
            {/* Ambient Corner Accent */}
            <div
              className="absolute -top-12 -right-12 w-32 h-32 rounded-full blur-3xl opacity-20 pointer-events-none transition-all group-hover:opacity-40"
              style={{ backgroundColor: game.accentColor }}
            />

            <div className="space-y-4">
              {/* Header Badges */}
              <div className="flex items-center justify-between">
                {(() => {
                  const IconComp = GAME_ICON_MAP[game.icon] || Gamepad2;
                  return (
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center border shadow-sm transition-transform group-hover:scale-105"
                      style={{
                        backgroundColor: `${game.accentColor}18`,
                        borderColor: `${game.accentColor}35`,
                        color: game.accentColor,
                      }}
                    >
                      <IconComp className="w-6 h-6" />
                    </div>
                  );
                })()}
                <div className="flex items-center gap-2">
                  <span
                    className="text-[10px] px-2.5 py-0.5 rounded-full font-mono font-bold"
                    style={{ backgroundColor: `${game.accentColor}20`, color: game.accentColor }}
                  >
                    {game.difficulty}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono">
                    {game.totalLevels} Levels
                  </span>
                </div>
              </div>

              {/* Title & Tagline */}
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  {game.title}
                </h3>
                <p className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-0.5">{game.tagline}</p>
              </div>

              {/* Description */}
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">
                {game.description}
              </p>

              {/* Topics Pills */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {game.topics.slice(0, 4).map((topic, i) => (
                  <span
                    key={i}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-mono"
                  >
                    {topic}
                  </span>
                ))}
                {game.topics.length > 4 && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-950 text-slate-400 dark:text-slate-500 font-mono">
                    +{game.topics.length - 4}
                  </span>
                )}
              </div>
            </div>

            {/* Launch Action */}
            <div className="pt-6 mt-4 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
              <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                {game.id === 'creature-creator' ? 'Ready to play' : 'Available'}
              </span>
              <button
                onClick={() => navigate(`/games/${game.id}`)}
                className="px-4 py-2 rounded-xl text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg transition-all group-hover:scale-105"
                style={{ backgroundColor: game.accentColor }}
              >
                <span>Launch World</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
