import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Play, CheckCircle2, XCircle, Sparkles, Lock, ShieldCheck } from 'lucide-react';
import { InteractiveExercise, ExerciseEvaluationResult } from '../../types';
import { api } from '../../services/api';

interface CompleteCodeStubProps {
  exercise: InteractiveExercise;
  onSolved?: () => void;
}

export const CompleteCodeStub: React.FC<CompleteCodeStubProps> = ({ exercise, onSolved }) => {
  const [code, setCode] = useState(exercise.starter_code || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<ExerciseEvaluationResult | null>(null);

  const testCases = exercise.metadata_json?.test_cases || [];

  const handleRun = async () => {
    setIsSubmitting(true);
    setResult(null);
    try {
      const res = await api.submitExercise(exercise.id, { code });
      setResult(res);
      if (res.is_correct) {
        confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
        onSolved?.();
      }
    } catch (e: any) {
      setResult({
        is_correct: false,
        xp_awarded: 0,
        feedback: e.message || 'Execution failed. Please check network or syntax.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Code Editor Frame (8 cols) */}
        <div className="lg:col-span-8 rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden shadow-2xl flex flex-col justify-between">
          <div>
            <div className="bg-slate-900/90 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block"></span>
                <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block"></span>
                <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block"></span>
                <span className="ml-2 font-bold text-slate-200">{exercise.title.split(':')[1] || 'Solution.java'}</span>
              </div>
              <span className="text-[11px] text-amber-400 flex items-center gap-1">
                <Lock className="w-3 h-3" /> Locked Boilerplate
              </span>
            </div>

            <div className="p-4 font-mono text-xs md:text-sm leading-relaxed space-y-2">
              {exercise.scaffold_code && (
                <pre className="text-slate-500 overflow-x-auto whitespace-pre-wrap">{exercise.scaffold_code}</pre>
              )}

              {/* Editable Slot */}
              <div className="rounded-xl border-2 border-emerald-500/60 bg-emerald-950/20 p-3 space-y-2 mt-2">
                <div className="flex items-center justify-between text-[11px] font-bold text-emerald-400">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> EDITABLE REGION: Complete Method Logic
                  </span>
                  <span className="text-slate-400 font-normal">Return valid results</span>
                </div>
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  rows={6}
                  className="w-full bg-slate-900/95 text-emerald-300 rounded-lg p-3 font-mono text-xs md:text-sm border border-emerald-500/40 focus:outline-none focus:border-emerald-400 shadow-inner"
                  spellCheck="false"
                />
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="bg-slate-900/80 px-4 py-3 border-t border-slate-800 flex items-center justify-between">
            <button
              onClick={handleRun}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              {isSubmitting ? 'Evaluating Test Suite...' : 'Run JUnit Test Suite'}
            </button>
            <span className="text-[11px] text-slate-400 font-mono">Sandbox: HotSpot JVM 21</span>
          </div>
        </div>

        {/* Test Matrix & Feedback (4 cols) */}
        <div className="lg:col-span-4 rounded-2xl border border-slate-800 bg-slate-950 p-4 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase text-slate-400 tracking-wider font-semibold">
                Automated Test Matrix
              </span>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>

            <div className="space-y-2">
              {testCases.map((tc: any, i: number) => {
                const passed = result?.test_results?.[i]?.status === 'PASSED' || (result?.is_correct && !result?.test_results);
                const failed = result && !passed;
                return (
                  <div key={i} className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300 font-bold">{tc.name}()</span>
                      {result ? (
                        passed ? (
                          <span className="text-emerald-400 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> PASS
                          </span>
                        ) : (
                          <span className="text-rose-400 font-bold flex items-center gap-1">
                            <XCircle className="w-3.5 h-3.5" /> FAIL
                          </span>
                        )
                      ) : (
                        <span className="text-slate-500 font-bold">READY</span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500">{tc.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Feedback Card */}
          <div
            className={`p-3.5 rounded-xl border text-xs font-mono leading-relaxed transition-all ${
              result
                ? result.is_correct
                  ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                  : 'bg-rose-950/40 border-rose-500/50 text-rose-200'
                : 'bg-slate-900 border-slate-800 text-slate-400'
            }`}
          >
            {result ? (
              <div>
                <p className="font-bold">{result.feedback}</p>
                {result.is_correct && (
                  <p className="text-[11px] text-emerald-400 mt-1">+{result.xp_awarded} XP Awarded!</p>
                )}
              </div>
            ) : (
              'Click "Run JUnit Test Suite" to verify your implementation.'
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
