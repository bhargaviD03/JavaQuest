import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Flame, ShieldAlert, CheckCircle2, ShieldCheck } from 'lucide-react';
import { InteractiveExercise, ExerciseEvaluationResult } from '../../types';
import { api } from '../../services/api';

interface BreakTheCodeWorkbenchProps {
  exercise: InteractiveExercise;
  onSolved?: () => void;
}

export const BreakTheCodeWorkbench: React.FC<BreakTheCodeWorkbenchProps> = ({ exercise, onSolved }) => {
  const [low, setLow] = useState('2000000000');
  const [high, setHigh] = useState('2000000000');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<ExerciseEvaluationResult | null>(null);

  const handleAttack = async () => {
    setIsSubmitting(true);
    setResult(null);
    try {
      const res = await api.submitExercise(exercise.id, { low: parseInt(low, 10), high: parseInt(high, 10) });
      setResult(res);
      if (res.is_correct) {
        confetti({ particleCount: 80, spread: 80, origin: { y: 0.6 } });
        onSolved?.();
      }
    } catch (e: any) {
      setResult({
        is_correct: false,
        xp_awarded: 0,
        feedback: e.message || 'Execution error.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Method Code (7 cols) */}
        <div className="lg:col-span-7 rounded-2xl border border-slate-800 bg-slate-950 p-5 font-mono text-xs md:text-sm space-y-2 shadow-2xl leading-relaxed">
          <div className="text-slate-500 text-[11px] pb-2 border-b border-slate-800 flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-red-400" /> Vulnerable Method Specification:
          </div>
          <pre className="text-slate-300 overflow-x-auto whitespace-pre-wrap">{exercise.scaffold_code}</pre>
        </div>

        {/* Attack Vector Form (5 cols) */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-800 bg-slate-950 p-5 space-y-4 flex flex-col justify-between shadow-2xl">
          <div className="space-y-3">
            <span className="text-xs font-mono font-bold text-slate-200 flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-red-400" /> Submit Attack Vectors:
            </span>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-slate-400 font-mono">low argument:</label>
                <input
                  type="number"
                  value={low}
                  onChange={(e) => setLow(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 font-mono text-xs text-slate-200 focus:outline-none focus:border-red-400"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 font-mono">high argument:</label>
                <input
                  type="number"
                  value={high}
                  onChange={(e) => setHigh(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 font-mono text-xs text-slate-200 focus:outline-none focus:border-red-400"
                />
              </div>
            </div>

            <p className="text-[11px] text-slate-500">
              Hint: What occurs when <code className="text-red-400 font-mono">low + high &gt; 2,147,483,647</code>?
            </p>
          </div>

          <div className="space-y-2">
            <button
              onClick={handleAttack}
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-xl bg-red-500 hover:bg-red-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-red-500/20 transition-all disabled:opacity-50"
            >
              <Flame className="w-3.5 h-3.5 fill-current" />
              {isSubmitting ? 'Simulating Attack Vector...' : 'Execute with Inputs & Provoke Bug'}
            </button>

            <div
              className={`p-2.5 rounded-xl border text-center font-mono text-[11px] transition-all ${
                result
                  ? result.is_correct
                    ? 'bg-red-950/40 border-red-500/50 text-red-200'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                  : 'bg-slate-900 border-slate-800 text-slate-400'
              }`}
            >
              {result ? result.feedback : 'Enter values and click execute to trigger bug.'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
