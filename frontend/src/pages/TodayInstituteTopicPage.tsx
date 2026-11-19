import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  CalendarCheck,
  Sparkles,
  BookOpen,
  Code2,
  Bug,
  HelpCircle,
  Award,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Zap,
  Lightbulb,
  FileQuestion,
  RefreshCw
} from 'lucide-react';
import { api } from '../services/api';
import { DailySession, DailySessionItem } from '../types';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { CodeBlock } from '../components/common/CodeBlock';
import { Badge } from '../components/common/Badge';

export const TodayInstituteTopicPage: React.FC = () => {
  const [session, setSession] = useState<DailySession | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [showNewModal, setShowNewModal] = useState(false);

  // Form states for new session
  const [instituteTopic, setInstituteTopic] = useState('Method Overloading and Method Overriding');
  const [taughtSummary, setTaughtSummary] = useState('Difference between compile-time method overloading and dynamic runtime method dispatch.');
  const [understoodSummary, setUnderstoodSummary] = useState('Overloading happens in the same class with different arguments.');
  const [difficultyNotes, setDifficultyNotes] = useState('How Java decides which overridden method to call when upcasting (Parent p = new Child()).');
  const [plannedMinutes, setPlannedMinutes] = useState(45);
  const [creating, setCreating] = useState(false);

  // User responses for interactive steps
  const [userResponse, setUserResponse] = useState('');
  const [submittingStep, setSubmittingStep] = useState(false);
  const [celebrationXp, setCelebrationXp] = useState<number | null>(null);

  const fetchSession = async () => {
    setLoading(true);
    try {
      const data = await api.getLatestDailySession();
      setSession(data);
      // Find first incomplete step
      const firstIncomplete = data.items.findIndex((item: DailySessionItem) => !item.is_completed);
      if (firstIncomplete !== -1) {
        setActiveStepIndex(firstIncomplete);
      }
    } catch (err) {
      console.error('Failed to fetch session', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSession();
  }, []);

  const handleStartNewSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const newSession = await api.startDailySession({
        institute_topic: instituteTopic,
        taught_summary: taughtSummary,
        understood_summary: understoodSummary,
        difficulty_notes: difficultyNotes,
        planned_minutes: plannedMinutes,
      });
      setSession(newSession);
      setActiveStepIndex(0);
      setShowNewModal(false);
    } catch (err) {
      console.error('Failed to start session', err);
    } finally {
      setCreating(false);
    }
  };

  const handleCompleteCurrentStep = async () => {
    if (!session) return;
    const currentItem = session.items[activeStepIndex];
    if (!currentItem) return;

    setSubmittingStep(true);
    try {
      await api.completeSessionItem(session.id, currentItem.id, userResponse);
      // Update local state
      const updatedItems = [...session.items];
      updatedItems[activeStepIndex] = {
        ...currentItem,
        is_completed: true,
        user_response: userResponse,
      };
      setSession({ ...session, items: updatedItems });
      setUserResponse('');

      // If last step (Step 9 - Reflection), finish session
      if (activeStepIndex === session.items.length - 1) {
        const finishRes = await api.finishDailySession(session.id);
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
        setCelebrationXp(finishRes.xp_awarded || 50);
      } else {
        setActiveStepIndex(activeStepIndex + 1);
      }
    } catch (err) {
      console.error('Failed to complete item', err);
    } finally {
      setSubmittingStep(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm text-slate-400">Loading your institute practice session...</p>
        </div>
      </div>
    );
  }

  const currentItem = session?.items[activeStepIndex];
  const completedCount = session?.items.filter(i => i.is_completed).length || 0;
  const progressPct = session ? Math.round((completedCount / session.items.length) * 100) : 0;

  return (
    <div className="space-y-8 animate-fadeIn max-w-5xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-br from-white via-slate-50 to-slate-100 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-2xl">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-1 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CalendarCheck className="w-4 h-4" />
            </span>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Today's Institute Sync</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">{session?.institute_topic}</h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-xl">
            {session?.difficulty_notes ? `Difficulty focus: "${session.difficulty_notes}"` : 'Practice tailored directly to what was taught in class today.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowNewModal(true)}
            icon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Log New Topic
          </Button>
        </div>
      </div>

      {/* 9-Step Progress Stepper Navigation */}
      <div className="overflow-x-auto pb-2">
        <div className="flex items-center gap-2 min-w-max">
          {session?.items.map((item, idx) => {
            const isActive = idx === activeStepIndex;
            const isDone = item.is_completed;
            return (
              <button
                key={item.id}
                onClick={() => setActiveStepIndex(idx)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
                  isActive
                    ? 'bg-emerald-50 dark:bg-emerald-500/20 border-emerald-300 dark:border-emerald-500 text-emerald-700 dark:text-emerald-300 font-bold shadow-sm dark:shadow-lg dark:shadow-emerald-900/30'
                    : isDone
                    ? 'bg-slate-100 dark:bg-slate-900/80 border-slate-200 dark:border-slate-700/80 text-emerald-600 dark:text-emerald-400 hover:border-slate-300 dark:hover:border-slate-600'
                    : 'bg-white dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {isDone ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400 shrink-0" />
                ) : (
                  <span className="w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-[10px] shrink-0 font-mono text-slate-700 dark:text-slate-300">
                    {idx + 1}
                  </span>
                )}
                <span className="truncate max-w-[130px]">{item.title.replace(/^\d+\.\s*/, '')}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Step Content Card */}
      {currentItem && (
        <Card className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-semibold uppercase tracking-wider">
                Step {activeStepIndex + 1} of 9 &bull; {currentItem.item_type.toUpperCase().replace('_', ' ')}
              </span>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-1">{currentItem.title}</h2>
            </div>
            {currentItem.is_completed && (
              <Badge variant="emerald">Completed</Badge>
            )}
          </div>

          {/* Markdown Content */}
          <div className="max-w-none text-slate-700 dark:text-slate-200 text-sm leading-relaxed space-y-4">
            {currentItem.content.split('\n\n').map((para, i) => (
              <p key={i} className="whitespace-pre-line">{para}</p>
            ))}
          </div>

          {/* Code Snippet if present */}
          {currentItem.code_snippet && (
            <div className="space-y-2">
              <CodeBlock
                code={currentItem.code_snippet}
                language="java"
                title={currentItem.title}
              />
            </div>
          )}

          {/* Interactive Response Area based on step type */}
          {currentItem.item_type === 'predict_output' && (
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
              <label className="block text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                Your Output Prediction
              </label>
              <textarea
                rows={3}
                value={userResponse || currentItem.user_response || ''}
                disabled={currentItem.is_completed}
                onChange={(e) => setUserResponse(e.target.value)}
                placeholder="Type what you expect the program will print..."
                className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700/80 text-sm text-slate-100 placeholder-slate-500 font-mono focus:border-emerald-500 focus:outline-none"
              />
              {currentItem.metadata_json && currentItem.is_completed && (
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300">
                  <p className="font-semibold mb-1">Expected Output:</p>
                  <pre className="font-mono text-xs">{currentItem.metadata_json.expected_answer}</pre>
                </div>
              )}
            </div>
          )}

          {currentItem.item_type === 'debugging' && (
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
              <label className="block text-xs font-semibold text-rose-400 uppercase tracking-wider">
                Explain the Bug & How to Fix It
              </label>
              <textarea
                rows={3}
                value={userResponse || currentItem.user_response || ''}
                disabled={currentItem.is_completed}
                onChange={(e) => setUserResponse(e.target.value)}
                placeholder="What causes the compiler error and how would you fix it?"
                className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700/80 text-sm text-slate-100 placeholder-slate-500 font-mono focus:border-emerald-500 focus:outline-none"
              />
              {currentItem.metadata_json && currentItem.is_completed && (
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300">
                  <p className="font-semibold mb-1">Bug Explanation:</p>
                  <p>{currentItem.metadata_json.bug}</p>
                </div>
              )}
            </div>
          )}

          {currentItem.item_type === 'reflection' && (
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
              <label className="block text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                Your Reflection & Key Takeaway
              </label>
              <textarea
                rows={4}
                value={userResponse || currentItem.user_response || ''}
                disabled={currentItem.is_completed}
                onChange={(e) => setUserResponse(e.target.value)}
                placeholder="In 2-3 sentences, what is your biggest 'aha!' takeaway from this session?"
                className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700/80 text-sm text-slate-100 placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          )}

          {/* Stepper Navigation Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <Button
              variant="secondary"
              size="sm"
              disabled={activeStepIndex === 0}
              onClick={() => setActiveStepIndex(activeStepIndex - 1)}
              icon={<ArrowLeft className="w-4 h-4" />}
            >
              Previous Step
            </Button>

            {!currentItem.is_completed ? (
              <Button
                variant="quest"
                size="md"
                isLoading={submittingStep}
                onClick={handleCompleteCurrentStep}
                icon={<CheckCircle2 className="w-4 h-4" />}
              >
                {activeStepIndex === session.items.length - 1 ? 'Finish Session & Claim XP' : 'Complete Step & Proceed'}
              </Button>
            ) : activeStepIndex < session.items.length - 1 ? (
              <Button
                variant="primary"
                size="md"
                onClick={() => setActiveStepIndex(activeStepIndex + 1)}
                icon={<ArrowRight className="w-4 h-4" />}
              >
                Next Step
              </Button>
            ) : (
              <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> All 9 Steps Completed!
              </span>
            )}
          </div>
        </Card>
      )}

      {/* Celebration Modal / Banner */}
      {celebrationXp !== null && (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 border border-emerald-500/40 shadow-2xl text-center space-y-4 animate-scaleUp">
          <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto">
            <Award className="w-6 h-6 animate-bounce" />
          </div>
          <h2 className="text-2xl font-extrabold text-white">Daily Institute Practice Complete!</h2>
          <p className="text-sm text-slate-300 max-w-md mx-auto">
            You successfully tackled today's topic and solidified what was taught in class.
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold font-mono">
            <Zap className="w-4 h-4 text-emerald-400" />
            <span>+{celebrationXp} XP Awarded</span>
          </div>
          <div className="pt-2">
            <Button variant="secondary" size="sm" onClick={() => setCelebrationXp(null)}>
              Dismiss
            </Button>
          </div>
        </div>
      )}

      {/* Modal to Log New Institute Topic */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white">Log Today's Institute Topic</h3>
                <p className="text-xs text-slate-400">Tell JavaQuest what was taught so it can prepare your custom session.</p>
              </div>
              <button
                onClick={() => setShowNewModal(false)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleStartNewSession} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Today's Institute Topic
                </label>
                <input
                  type="text"
                  required
                  value={instituteTopic}
                  onChange={(e) => setInstituteTopic(e.target.value)}
                  placeholder="e.g. Method Overloading and Method Overriding"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 text-sm text-slate-100 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  What did the instructor teach?
                </label>
                <textarea
                  rows={2}
                  value={taughtSummary}
                  onChange={(e) => setTaughtSummary(e.target.value)}
                  placeholder="Summary of lecture concepts..."
                  className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 text-sm text-slate-100 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  What did you find difficult?
                </label>
                <textarea
                  rows={2}
                  value={difficultyNotes}
                  onChange={(e) => setDifficultyNotes(e.target.value)}
                  placeholder="Where did you get stuck or feel confused?"
                  className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 text-sm text-slate-100 outline-none"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-slate-400">Default session: 45 minutes</span>
                <div className="flex gap-2">
                  <Button type="button" variant="ghost" onClick={() => setShowNewModal(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="quest" isLoading={creating}>
                    Generate Learning Session
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
