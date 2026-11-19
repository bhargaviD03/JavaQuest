import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { AlertTriangle, Bug, Zap, CheckCircle2, RotateCcw } from 'lucide-react';
import { InteractiveExercise, ExerciseEvaluationResult } from '../../types';
import { api } from '../../services/api';

interface BugHuntWorkbenchProps {
  exercise: InteractiveExercise;
  onSolved?: () => void;
}

export const BugHuntWorkbench: React.FC<BugHuntWorkbenchProps> = ({ exercise, onSolved }) => {
  const [patch, setPatch] = useState(exercise.starter_code || '');
  const [selectedLines, setSelectedLines] = useState<number[]>(exercise.metadata_json?.bug_lines || []);
  const [isCompiling, setIsCompiling] = useState(false);
  const [result, setResult] = useState<ExerciseEvaluationResult | null>(null);

  const compilerError = exercise.metadata_json?.compiler_error || 'Compilation or runtime exception detected.';
  const lines = (exercise.scaffold_code || '').split('\n');

  const handleApplyPatch = async () => {
    setIsCompiling(true);
    setResult(null);
    try {
      const res = await api.submitExercise(exercise.id, { patch });
      setResult(res);
      if (res.is_correct) {
        confetti({ particleCount: 85, spread: 80, origin: { y: 0.6 } });
        onSolved?.();
      }
    } catch (e: any) {
      setResult({
        is_correct: false,
        xp_awarded: 0,
        feedback: e.message || 'Compiler check failed.',
      });
    } finally {
      setIsCompiling(false);
    }
  };

  const handleLineClick = (lineIndex: number) => {
    const lineNo = lineIndex + 1;
    setSelectedLines([lineNo]);
  };

  return (
    <div className="space-y-6">
      {/* Compiler / Exception Alert Banner */}
      <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/50 flex items-start gap-3 shadow-lg">
        <AlertTriangle className="w-5 h-5 text-rose-400 mt-0.5 shrink-0" />
        <div className="space-y-1 text-xs font-mono">
          <span className="text-rose-400 font-bold block">Compiler / Runtime Failure Log:</span>
          <pre className="text-slate-300 whitespace-pre-wrap">{compilerError}</pre>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Line-by-Line Code Inspector (7 cols) */}
        <div className="lg:col-span-7 rounded-2xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs md:text-sm space-y-1 shadow-2xl overflow-x-auto">
          <div className="text-slate-500 text-[11px] mb-2 font-mono flex items-center gap-1.5">
            <Bug className="w-3.5 h-3.5 text-rose-400" />
            <span>Click on the line(s) with defects to inspect and refactor:</span>
          </div>

          {lines.map((lineText, idx) => {
            const lineNo = idx + 1;
            const isBugLine = (exercise.metadata_json?.bug_lines || []).includes(lineNo);
            const isSelected = selectedLines.includes(lineNo);

            return (
              <div
                key={idx}
                onClick={() => handleLineClick(idx)}
                className={`flex items-center px-2 py-1 rounded transition-all cursor-pointer ${
                  isBugLine
                    ? 'bg-rose-950/30 border border-rose-500/40 hover:bg-rose-900/40 text-rose-200'
                    : isSelected
                    ? 'bg-slate-800 border border-slate-700'
                    : 'hover:bg-slate-900/80 text-slate-300'
                }`}
              >
                <span className={`w-8 select-none text-[11px] ${isBugLine ? 'text-rose-400 font-bold' : 'text-slate-600'}`}>
                  {lineNo}
                </span>
                <span className="flex-1 whitespace-pre">{lineText}</span>
                {isBugLine && (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 font-bold uppercase tracking-wider shrink-0 ml-2 inline-flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    <span>Defect</span>
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Surgical Diff Patch Editor (5 cols) */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-800 bg-slate-950 p-5 space-y-4 flex flex-col justify-between shadow-2xl">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-mono font-bold text-slate-200 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-rose-400" /> Surgical Diff Patcher
              </span>
              <span className="text-[11px] text-emerald-400 font-mono">Lines {selectedLines.join(', ')}</span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              {exercise.metadata_json?.rule || 'Refactor the culprit lines directly to satisfy Java specification rules.'}
            </p>

            <div className="space-y-1.5">
              <label className="text-[11px] font-mono text-slate-400">Patched Line(s) Replacement:</label>
              <textarea
                value={patch}
                onChange={(e) => setPatch(e.target.value)}
                rows={5}
                className="w-full bg-slate-900 text-emerald-300 rounded-xl p-3 font-mono text-xs border border-slate-700 focus:outline-none focus:border-emerald-400 shadow-inner"
                spellCheck="false"
              />
            </div>
          </div>

          <div className="space-y-2">
            <button
              onClick={handleApplyPatch}
              disabled={isCompiling}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-400 hover:to-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-rose-500/20 transition-all disabled:opacity-50"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              {isCompiling ? 'Running javac re-compile...' : 'Apply Surgical Patch & Re-compile'}
            </button>

            <div
              className={`p-2.5 rounded-xl border text-center font-mono text-[11px] transition-all ${
                result
                  ? result.is_correct
                    ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                    : 'bg-rose-950/40 border-rose-500/50 text-rose-200'
                  : 'bg-slate-900 border-slate-800 text-slate-400'
              }`}
            >
              {result ? result.feedback : 'Inspect code, write replacement patch, and re-compile.'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
