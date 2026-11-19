import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Eye, CheckCircle2, XCircle, Terminal } from 'lucide-react';
import { InteractiveExercise, ExerciseEvaluationResult } from '../../types';
import { api } from '../../services/api';

interface OutputPredictorCardProps {
  exercise: InteractiveExercise;
  onSolved?: () => void;
}

export const OutputPredictorCard: React.FC<OutputPredictorCardProps> = ({ exercise, onSolved }) => {
  const [selectedChoice, setSelectedChoice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<ExerciseEvaluationResult | null>(null);

  const options = exercise.metadata_json?.options || [];

  const handleCheck = async () => {
    if (!selectedChoice) return;
    setIsSubmitting(true);
    setResult(null);
    try {
      const res = await api.submitExercise(exercise.id, { choice: selectedChoice });
      setResult(res);
      if (res.is_correct) {
        confetti({ particleCount: 75, spread: 75, origin: { y: 0.6 } });
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
        {/* Code Snippet Window (6 cols) */}
        <div className="lg:col-span-6 rounded-2xl border border-slate-800 bg-slate-950 p-5 font-mono text-xs md:text-sm space-y-2 shadow-2xl leading-relaxed">
          <div className="text-slate-500 text-[11px] flex items-center gap-1.5 pb-2 border-b border-slate-800">
            <Terminal className="w-3.5 h-3.5 text-sky-400" /> What does this program print to stdout?
          </div>
          <pre className="text-slate-300 overflow-x-auto whitespace-pre-wrap">{exercise.scaffold_code}</pre>
        </div>

        {/* Options & Trace Area (6 cols) */}
        <div className="lg:col-span-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <span className="text-xs font-mono text-slate-400 font-semibold uppercase tracking-wider block">
              Select the Exact Console Output:
            </span>

            <div className="space-y-2">
              {options.map((opt: string, i: number) => (
                <label
                  key={i}
                  className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                    selectedChoice === opt
                      ? 'bg-sky-950/40 border-sky-500 text-sky-200 shadow-md'
                      : 'bg-slate-950 border-slate-800 hover:border-sky-500/40 text-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    name={`output-${exercise.id}`}
                    value={opt}
                    checked={selectedChoice === opt}
                    onChange={() => setSelectedChoice(opt)}
                    className="text-sky-500 focus:ring-0"
                  />
                  <code className="font-mono text-xs">{opt}</code>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <button
              onClick={handleCheck}
              disabled={isSubmitting || !selectedChoice}
              className="w-full py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-sky-500/20 transition-all disabled:opacity-50"
            >
              <Eye className="w-3.5 h-3.5" />
              {isSubmitting ? 'Simulating JVM Trace...' : 'Execute JVM & Check Prediction'}
            </button>

            <div
              className={`p-3 rounded-xl border text-xs font-mono leading-relaxed transition-all ${
                result
                  ? result.is_correct
                    ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                    : 'bg-rose-950/40 border-rose-500/50 text-rose-200'
                  : 'bg-slate-900 border-slate-800 text-slate-400'
              }`}
            >
              {result ? (
                <div className="whitespace-pre-wrap">{result.feedback}</div>
              ) : (
                'Select an option above to test your mental compiler.'
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
