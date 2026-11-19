import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Puzzle, CheckCircle2, RotateCcw, AlertTriangle } from 'lucide-react';
import { InteractiveExercise, ExerciseEvaluationResult } from '../../types';
import { api } from '../../services/api';

interface ParsonsPuzzleBoardProps {
  exercise: InteractiveExercise;
  onSolved?: () => void;
}

export const ParsonsPuzzleBoard: React.FC<ParsonsPuzzleBoardProps> = ({ exercise, onSolved }) => {
  const initialTiles = exercise.metadata_json?.tiles || [];
  const [sourceTiles, setSourceTiles] = useState<any[]>(initialTiles);
  const [targetTiles, setTargetTiles] = useState<any[]>([]);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [result, setResult] = useState<ExerciseEvaluationResult | null>(null);

  const moveToTarget = (tile: any) => {
    setSourceTiles(sourceTiles.filter((t) => t.id !== tile.id));
    setTargetTiles([...targetTiles, tile]);
  };

  const moveToSource = (tile: any) => {
    setTargetTiles(targetTiles.filter((t) => t.id !== tile.id));
    setSourceTiles([...sourceTiles, tile]);
  };

  const handleReset = () => {
    setSourceTiles(initialTiles);
    setTargetTiles([]);
    setResult(null);
  };

  const handleVerify = async () => {
    setIsEvaluating(true);
    setResult(null);
    const sequence = targetTiles.map((t) => t.id);
    try {
      const res = await api.submitExercise(exercise.id, { sequence });
      setResult(res);
      if (res.is_correct) {
        confetti({ particleCount: 75, spread: 70, origin: { y: 0.6 } });
        onSolved?.();
      }
    } catch (e: any) {
      setResult({
        is_correct: false,
        xp_awarded: 0,
        feedback: e.message || 'Verification failed.',
      });
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Available Source Tiles (6 cols) */}
        <div className="lg:col-span-6 space-y-3">
          <span className="text-xs font-mono text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1.5">
            <Puzzle className="w-3.5 h-3.5 text-amber-400" /> Available Code Tiles (Click to move to Assembly Area)
          </span>

          <div className="space-y-2">
            {sourceTiles.map((tile) => (
              <div
                key={tile.id}
                onClick={() => moveToTarget(tile)}
                className={`p-3 rounded-xl border text-xs font-mono cursor-pointer transition-all shadow-md ${
                  tile.is_distractor
                    ? 'bg-slate-950 border-rose-900/60 hover:border-rose-400 text-rose-300'
                    : 'bg-slate-950 border-slate-800 hover:border-amber-400/60 text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="whitespace-pre">{tile.code}</span>
                  {tile.is_distractor && (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 font-sans font-bold">
                      Distractor
                    </span>
                  )}
                </div>
              </div>
            ))}

            {sourceTiles.length === 0 && (
              <div className="p-8 text-center text-xs font-mono text-slate-600 rounded-2xl border border-dashed border-slate-800">
                All tiles moved to target assembly sequence.
              </div>
            )}
          </div>
        </div>

        {/* Target Assembly Sequence (6 cols) */}
        <div className="lg:col-span-6 space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-amber-400 font-semibold uppercase tracking-wider block">
                Target Assembly Sequence
              </span>
              <button
                onClick={handleReset}
                className="text-[11px] text-slate-400 hover:text-white underline font-mono flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
            </div>

            <div className="mt-2 min-h-[220px] rounded-2xl border-2 border-dashed border-slate-800 bg-slate-950/60 p-3 space-y-2">
              {targetTiles.length === 0 ? (
                <p className="text-xs text-slate-600 font-mono text-center pt-16">
                  Click tiles from the left to drop them here in execution order
                </p>
              ) : (
                targetTiles.map((tile) => (
                  <div
                    key={tile.id}
                    onClick={() => moveToSource(tile)}
                    className="p-3 rounded-xl bg-slate-900 border border-amber-500/40 hover:border-rose-500/50 text-xs font-mono text-amber-200 cursor-pointer transition-all shadow-md flex items-center justify-between"
                  >
                    <span className="whitespace-pre">{tile.code}</span>
                    <span className="text-[10px] text-slate-500 font-sans">Click to remove</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="space-y-2 mt-4">
            <button
              onClick={handleVerify}
              disabled={isEvaluating || targetTiles.length === 0}
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50"
            >
              <Puzzle className="w-3.5 h-3.5 fill-current" />
              {isEvaluating ? 'Verifying Syntax Flow...' : 'Verify Code Assembly & Syntax'}
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
              {result ? result.feedback : 'Arrange tiles in order, then click verify.'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
