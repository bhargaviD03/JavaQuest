import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, CheckCircle2, ArrowRight, History } from 'lucide-react';
import { InteractiveExercise, ExerciseEvaluationResult } from '../../types';
import { api } from '../../services/api';

interface ModernizeRefactorViewProps {
  exercise: InteractiveExercise;
  onSolved?: () => void;
}

export const ModernizeRefactorView: React.FC<ModernizeRefactorViewProps> = ({ exercise, onSolved }) => {
  const [code, setCode] = useState(exercise.starter_code || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<ExerciseEvaluationResult | null>(null);

  const smells = exercise.metadata_json?.legacy_code_smells || [];

  const handleTest = async () => {
    setIsSubmitting(true);
    setResult(null);
    try {
      const res = await api.submitExercise(exercise.id, { code });
      setResult(res);
      if (res.is_correct) {
        confetti({ particleCount: 75, spread: 80, origin: { y: 0.6 } });
        onSolved?.();
      }
    } catch (e: any) {
      setResult({
        is_correct: false,
        xp_awarded: 0,
        feedback: e.message || 'Stream verification failed.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Before: Legacy (Java 7) */}
        <div className="rounded-2xl border border-rose-900/40 bg-slate-950 p-4 space-y-3 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-mono font-bold text-rose-400 flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-rose-400" /> Before: Imperative Boilerplate (Java 7)
            </span>
            <span className="text-[10px] text-slate-500 font-mono">Legacy Syntax</span>
          </div>
          <pre className="font-mono text-xs text-slate-300 leading-relaxed overflow-x-auto whitespace-pre-wrap">
            {exercise.scaffold_code}
          </pre>
          <div className="text-[11px] text-slate-400 bg-rose-950/20 p-2.5 rounded-lg border border-rose-900/30 space-y-1">
            <span className="font-bold text-rose-300">Code Smells Identified:</span>
            <ul className="list-disc pl-4 space-y-0.5 text-slate-400">
              {smells.map((smell: string, i: number) => (
                <li key={i}>{smell}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Target / Active Editor: Modern Java Stream */}
        <div className="rounded-2xl border border-emerald-900/40 bg-slate-950 p-4 space-y-3 shadow-xl flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Target: Declarative Stream (Modern Java)
              </span>
              <span className="text-[10px] text-emerald-400 font-mono">1 Readable Pipeline</span>
            </div>

            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              rows={8}
              className="w-full bg-slate-900 text-emerald-300 rounded-xl p-3 font-mono text-xs border border-emerald-500/40 focus:outline-none focus:border-emerald-400 shadow-inner"
              spellCheck="false"
            />
          </div>

          <div className="space-y-2">
            <button
              onClick={handleTest}
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {isSubmitting ? 'Evaluating Stream Pipeline...' : 'Test & Verify Modern Stream'}
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
              {result ? result.feedback : 'Refactor imperative loop into stream pipeline, then verify.'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
