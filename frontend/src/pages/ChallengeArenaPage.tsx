import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
  Swords,
  Flame,
  Zap,
  Lightbulb,
  CheckCircle2,
  Clock,
  ArrowRight,
  RefreshCw,
  Code2,
  Eye,
  History
} from 'lucide-react';
import { api } from '../services/api';
import { QuestionBankItem } from '../types';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { CodeBlock } from '../components/common/CodeBlock';

export const ChallengeArenaPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const qidParam = searchParams.get('qid');

  const [challenge, setChallenge] = useState<QuestionBankItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [answer, setAnswer] = useState('');
  const [hintStep, setHintStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);

  const fetchChallenge = async () => {
    setLoading(true);
    setResult(null);
    setHintStep(0);
    try {
      if (qidParam) {
        const q = await api.getQuestion(parseInt(qidParam));
        setChallenge(q);
        if (q.latest_attempt) {
          setAnswer(q.latest_attempt.submitted_answer);
        }
      } else {
        const daily = await api.getDailyChallenge();
        setChallenge(daily);
      }
    } catch (err) {
      console.error('Failed to load challenge', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallenge();
  }, [qidParam]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!challenge) return;

    setSubmitting(true);
    try {
      const res = await api.submitQuestionAttempt(challenge.id, answer, 'understood');
      setResult(res);
      setChallenge({
        ...challenge,
        has_attempted: true,
        solution_guidance: res.solution_guidance,
      });

      if (res.xp_awarded > 0) {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 }
        });
      }
    } catch (err) {
      console.error('Failed to submit challenge', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm text-slate-400">Entering Challenge Arena...</p>
        </div>
      </div>
    );
  }

  if (!challenge) {
    return (
      <Card className="text-center py-12 text-slate-400 max-w-lg mx-auto">
        No challenge loaded. Please return to the Question Bank or Dashboard.
      </Card>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn max-w-4xl mx-auto">
      {/* Arena Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 md:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 border border-emerald-500/20">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded-md bg-emerald-500/10 text-emerald-400">
              <Swords className="w-4 h-4" />
            </span>
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              {qidParam ? 'Targeted Challenge' : 'Daily Challenge Arena'}
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white">{challenge.title}</h1>
          <p className="text-xs text-slate-400">
            {challenge.topic} &bull; {challenge.question_type} &bull; Canonical ID: <span className="font-mono text-emerald-400">{challenge.canonical_id}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant={challenge.difficulty}>{challenge.difficulty}</Badge>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-300">
            <Zap className="w-4 h-4 text-emerald-400" />
            <span>+25 XP</span>
          </div>
        </div>
      </div>

      {/* Challenge Card */}
      <Card className="space-y-6 bg-slate-900 border-slate-800">
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Problem Statement</span>
          <div className="mt-2 p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-200 text-sm leading-relaxed font-sans">
            {challenge.prompt}
          </div>
        </div>

        {/* Learning Objectives */}
        {challenge.learning_objectives && challenge.learning_objectives.length > 0 && (
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Target Concepts:</span>
            <div className="flex flex-wrap gap-2 mt-1.5">
              {challenge.learning_objectives.map((obj, i) => (
                <span key={i} className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  {obj}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Progressive Hint Drawer */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
              <Lightbulb className="w-4 h-4" />
              <span>Progressive Guidance (Hint {hintStep}/2)</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setHintStep((prev) => (prev < 2 ? prev + 1 : 0))}
              className="text-xs"
            >
              {hintStep === 0 ? 'Request First Hint' : hintStep === 1 ? 'Request Deeper Hint' : 'Hide Hints'}
            </Button>
          </div>

          {hintStep >= 1 && (
            <div className="text-xs text-slate-300 border-t border-slate-800 pt-2 leading-relaxed">
              <span className="font-semibold text-amber-300">Hint 1: </span>
              {challenge.hint || 'Carefully check your class definitions and memory scopes.'}
            </div>
          )}

          {hintStep >= 2 && (
            <div className="text-xs text-slate-300 border-t border-slate-800 pt-2 leading-relaxed">
              <span className="font-semibold text-amber-300">Hint 2: </span>
              In Java, dynamic dispatch binds to the actual runtime heap object, whereas static members and overloading are resolved at compile time.
            </div>
          )}
        </div>

        {/* Submission Editor */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Your Java Code / Response
              </label>
              <span className="text-xs text-slate-500 font-mono">JDK 21 Syntax</span>
            </div>
            <textarea
              rows={8}
              required
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="// Write your Java solution here..."
              className="w-full p-4 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 text-sm text-slate-100 font-mono placeholder-slate-500 outline-none leading-relaxed"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-slate-400 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              <span>Earn 25 XP on valid submission</span>
            </span>

            <Button
              type="submit"
              variant="quest"
              size="lg"
              isLoading={submitting}
              icon={<ArrowRight className="w-4 h-4" />}
            >
              {challenge.has_attempted ? 'Resubmit Solution' : 'Submit Challenge (+25 XP)'}
            </Button>
          </div>
        </form>

        {/* Unlocked Solution & Feedback */}
        {challenge.solution_guidance && (
          <div className="p-5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-3 animate-fadeIn">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
              <Eye className="w-4 h-4" />
              <span>Unlocked Solution Guidance</span>
            </div>
            <p className="text-sm text-slate-200 leading-relaxed font-sans">
              {challenge.solution_guidance}
            </p>
            {result?.ai_feedback && (
              <p className="text-xs text-slate-400 italic pt-2 border-t border-emerald-900/40">
                AI Assessment: {result.ai_feedback}
              </p>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};
