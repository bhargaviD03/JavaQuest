import React, { useEffect, useState } from 'react';
import {
  Code2,
  Bug,
  Puzzle,
  Eye,
  Sparkles,
  Flame,
  Tag,
  CheckCircle2,
  Filter,
  Lightbulb,
  Award,
  Layers
} from 'lucide-react';
import { InteractiveExercise, ExerciseType } from '../types';
import { api } from '../services/api';
import { CompleteCodeStub } from '../components/exercises/CompleteCodeStub';
import { BugHuntWorkbench } from '../components/exercises/BugHuntWorkbench';
import { ParsonsPuzzleBoard } from '../components/exercises/ParsonsPuzzleBoard';
import { OutputPredictorCard } from '../components/exercises/OutputPredictorCard';
import { ModernizeRefactorView } from '../components/exercises/ModernizeRefactorView';
import { BreakTheCodeWorkbench } from '../components/exercises/BreakTheCodeWorkbench';
import { KeywordClozeCard } from '../components/exercises/KeywordClozeCard';

export const InteractiveLabPage: React.FC = () => {
  const [exercises, setExercises] = useState<InteractiveExercise[]>([]);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [activeExercise, setActiveExercise] = useState<InteractiveExercise | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showHint, setShowHint] = useState(false);

  const fetchExercises = async () => {
    setIsLoading(true);
    try {
      const data = await api.getExercises(selectedType !== 'all' ? { exercise_type: selectedType } : undefined);
      setExercises(data);
      if (data.length > 0 && (!activeExercise || !data.some((e) => e.id === activeExercise.id))) {
        setActiveExercise(data[0]);
      }
    } catch (e) {
      console.error('Failed to load interactive exercises:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExercises();
  }, [selectedType]);

  const typeTabs: { id: string; label: string; icon: any; color: string }[] = [
    { id: 'all', label: 'All 7 Formats', icon: Layers, color: 'text-emerald-400' },
    { id: 'complete_code', label: '1. Complete Code', icon: Code2, color: 'text-emerald-400' },
    { id: 'bug_hunt', label: '2. Bug Hunt', icon: Bug, color: 'text-rose-400' },
    { id: 'parsons_puzzle', label: '3. Parsons Jigsaw', icon: Puzzle, color: 'text-amber-400' },
    { id: 'predict_output', label: '4. Mental Compiler', icon: Eye, color: 'text-sky-400' },
    { id: 'modernize_refactor', label: '5. Clean Streams', icon: Sparkles, color: 'text-purple-400' },
    { id: 'break_code', label: '6. Break the Code', icon: Flame, color: 'text-red-400' },
    { id: 'keyword_cloze', label: '7. Keyword Cloze', icon: Tag, color: 'text-teal-400' },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-mono font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>TACTILE CODE WORKBENCH</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Interactive Java Code Lab</h1>
          <p className="text-sm text-slate-400 mt-1">
            Complete missing functions, hunt bugs line-by-line, solve syntax jigsaws, and test JVM edge cases.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-mono text-slate-300">
              Solved:{' '}
              <strong className="text-emerald-400 font-bold">
                {exercises.filter((e) => e.is_solved).length}/{exercises.length}
              </strong>
            </span>
          </div>
        </div>
      </div>

      {/* Format Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {typeTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = selectedType === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSelectedType(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-medium font-mono whitespace-nowrap flex items-center gap-2 transition-all ${
                isActive
                  ? 'bg-slate-800 text-white border border-slate-700 shadow-md'
                  : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800/80 hover:bg-slate-800/50'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${tab.color}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-mono text-slate-400">Loading interactive workbench...</p>
        </div>
      ) : exercises.length === 0 ? (
        <div className="p-12 text-center rounded-3xl border border-slate-800 bg-slate-900/40 text-slate-400 font-mono text-xs">
          No exercises found for this category.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Exercise Selection List (4 cols) */}
          <div className="lg:col-span-4 space-y-3">
            <span className="text-xs font-mono text-slate-400 uppercase font-semibold tracking-wider block">
              Available Challenges ({exercises.length})
            </span>

            <div className="space-y-2.5 max-h-[700px] overflow-y-auto pr-1">
              {exercises.map((ex) => {
                const isCurrent = activeExercise?.id === ex.id;
                return (
                  <div
                    key={ex.id}
                    onClick={() => {
                      setActiveExercise(ex);
                      setShowHint(false);
                    }}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      isCurrent
                        ? 'bg-slate-900 border-emerald-500/80 shadow-xl shadow-emerald-500/5'
                        : 'bg-slate-900/40 border-slate-800/80 hover:bg-slate-900/70 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        {ex.canonical_id}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-mono text-emerald-400 font-bold">+{ex.xp_reward} XP</span>
                        {ex.is_solved && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                      </div>
                    </div>
                    <h3 className="text-sm font-bold text-white line-clamp-1">{ex.title}</h3>
                    <p className="text-xs text-slate-400 font-mono mt-1">Topic: {ex.topic}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Exercise Workspace (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {activeExercise && (
              <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-6 space-y-6">
                {/* Header for Active Exercise */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        {activeExercise.exercise_type.toUpperCase().replace('_', ' ')}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">Difficulty: {activeExercise.difficulty}</span>
                    </div>
                    <h2 className="text-xl font-extrabold text-white mt-1.5">{activeExercise.title}</h2>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">{activeExercise.prompt}</p>
                  </div>

                  {activeExercise.hint && (
                    <button
                      onClick={() => setShowHint(!showHint)}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-mono flex items-center gap-1.5 shrink-0 transition-all border border-amber-500/20"
                    >
                      <Lightbulb className="w-3.5 h-3.5" />
                      <span>{showHint ? 'Hide Hint' : 'Show Hint'}</span>
                    </button>
                  )}
                </div>

                {/* Hint Alert */}
                {showHint && activeExercise.hint && (
                  <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-500/40 text-xs font-mono text-amber-200 flex items-start gap-2 animate-fadeIn">
                    <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <p>{activeExercise.hint}</p>
                  </div>
                )}

                {/* Render the appropriate Component based on exercise_type */}
                {activeExercise.exercise_type === 'complete_code' && (
                  <CompleteCodeStub exercise={activeExercise} onSolved={fetchExercises} />
                )}
                {activeExercise.exercise_type === 'bug_hunt' && (
                  <BugHuntWorkbench exercise={activeExercise} onSolved={fetchExercises} />
                )}
                {activeExercise.exercise_type === 'parsons_puzzle' && (
                  <ParsonsPuzzleBoard exercise={activeExercise} onSolved={fetchExercises} />
                )}
                {activeExercise.exercise_type === 'predict_output' && (
                  <OutputPredictorCard exercise={activeExercise} onSolved={fetchExercises} />
                )}
                {activeExercise.exercise_type === 'modernize_refactor' && (
                  <ModernizeRefactorView exercise={activeExercise} onSolved={fetchExercises} />
                )}
                {activeExercise.exercise_type === 'break_code' && (
                  <BreakTheCodeWorkbench exercise={activeExercise} onSolved={fetchExercises} />
                )}
                {activeExercise.exercise_type === 'keyword_cloze' && (
                  <KeywordClozeCard exercise={activeExercise} onSolved={fetchExercises} />
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
