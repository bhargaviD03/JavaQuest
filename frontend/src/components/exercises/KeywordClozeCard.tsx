import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Tag, CheckCircle2 } from 'lucide-react';
import { InteractiveExercise, ExerciseEvaluationResult } from '../../types';
import { api } from '../../services/api';

interface KeywordClozeCardProps {
  exercise: InteractiveExercise;
  onSolved?: () => void;
}

export const KeywordClozeCard: React.FC<KeywordClozeCardProps> = ({ exercise, onSolved }) => {
  const blanks = exercise.metadata_json?.blanks || [];
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<ExerciseEvaluationResult | null>(null);

  const handleSelect = (id: string, val: string) => {
    setAnswers({ ...answers, [id]: val });
  };

  const handleCheck = async () => {
    setIsSubmitting(true);
    setResult(null);
    try {
      const res = await api.submitExercise(exercise.id, { answers });
      setResult(res);
      if (res.is_correct) {
        confetti({ particleCount: 75, spread: 75, origin: { y: 0.6 } });
        onSolved?.();
      }
    } catch (e: any) {
      setResult({
        is_correct: false,
        xp_awarded: 0,
        feedback: e.message || 'Check error.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 font-mono text-xs md:text-sm leading-loose shadow-2xl space-y-6">
      <div className="space-y-4">
        <div>
          <select
            value={answers['b1'] || ''}
            onChange={(e) => handleSelect('b1', e.target.value)}
            className="bg-slate-900 border border-teal-500/50 text-teal-300 rounded px-2 py-1 font-bold font-mono focus:outline-none focus:border-teal-400 mr-2"
          >
            <option value="">[Class Modifier]</option>
            {blanks.find((b: any) => b.id === 'b1')?.options.map((opt: string, i: number) => (
              <option key={i} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          <span className="text-purple-400">class</span> <span className="text-emerald-400">PaymentGateway</span> &#123;
        </div>

        <div className="pl-6">
          <span className="text-purple-400">public</span>
          <select
            value={answers['b2'] || ''}
            onChange={(e) => handleSelect('b2', e.target.value)}
            className="bg-slate-900 border border-teal-500/50 text-teal-300 rounded px-2 py-1 font-bold font-mono focus:outline-none focus:border-teal-400 mx-2"
          >
            <option value="">[Method Spec]</option>
            {blanks.find((b: any) => b.id === 'b2')?.options.map((opt: string, i: number) => (
              <option key={i} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          <span className="text-blue-400">processPayment</span>(<span className="text-purple-400">double</span> amount);
        </div>

        <div>&#125;</div>

        <div className="mt-4">
          <span className="text-purple-400">public class</span> <span className="text-emerald-400">StripeGateway</span>
          <select
            value={answers['b3'] || ''}
            onChange={(e) => handleSelect('b3', e.target.value)}
            className="bg-slate-900 border border-teal-500/50 text-teal-300 rounded px-2 py-1 font-bold font-mono focus:outline-none focus:border-teal-400 mx-2"
          >
            <option value="">[Inheritance Keyword]</option>
            {blanks.find((b: any) => b.id === 'b3')?.options.map((opt: string, i: number) => (
              <option key={i} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          <span className="text-emerald-400">PaymentGateway</span> &#123;
        </div>

        <div className="pl-6">
          <select
            value={answers['b4'] || ''}
            onChange={(e) => handleSelect('b4', e.target.value)}
            className="bg-slate-900 border border-teal-500/50 text-teal-300 rounded px-2 py-1 font-bold font-mono focus:outline-none focus:border-teal-400 mr-2"
          >
            <option value="">[Annotation]</option>
            {blanks.find((b: any) => b.id === 'b4')?.options.map((opt: string, i: number) => (
              <option key={i} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        <div className="pl-6">
          <span className="text-purple-400">public void</span> <span className="text-blue-400">processPayment</span>(
          <span className="text-purple-400">double</span> amount) &#123; System.out.println("Processing: " + amount); &#125;
        </div>

        <div>&#125;</div>
      </div>

      <div className="pt-4 border-t border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <button
          onClick={handleCheck}
          disabled={isSubmitting}
          className="px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-teal-500/20 transition-all disabled:opacity-50"
        >
          {isSubmitting ? 'Checking Contract...' : 'Check Cloze Answers'}
        </button>

        <span
          className={`text-xs font-mono ${
            result
              ? result.is_correct
                ? 'text-emerald-400 font-bold'
                : 'text-rose-400 font-bold'
              : 'text-slate-400'
          }`}
        >
          {result ? result.feedback : 'Select all 4 blanks and click Check.'}
        </span>
      </div>
    </div>
  );
};
