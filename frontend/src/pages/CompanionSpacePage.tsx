import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Users2,
  Share2,
  Copy,
  Check,
  Swords,
  Lock,
  Unlock,
  MessageSquare,
  Sparkles,
  Zap,
  ArrowRight,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { LearningSpace, CompanionSession, QuestionBankItem } from '../types';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { CodeBlock } from '../components/common/CodeBlock';
import { Modal } from '../components/common/Modal';

export const CompanionSpacePage: React.FC = () => {
  const { user, spaces, activeSpace, refreshSpaces, setActiveSpace } = useAuth();
  const [sessions, setSessions] = useState<CompanionSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(false);

  // New Space modal
  const [showCreateSpaceModal, setShowCreateSpaceModal] = useState(false);
  const [newSpaceName, setNewSpaceName] = useState('Java Pair Study Space');

  // Join Space modal
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinInviteCode, setJoinInviteCode] = useState('');

  // Active Session Detail & Submission Modal
  const [activeSession, setActiveSession] = useState<CompanionSession | null>(null);
  const [myAnswer, setMyAnswer] = useState('');
  const [myReasoning, setMyReasoning] = useState('');
  const [myReflection, setMyReflection] = useState('');
  const [submittingAnswer, setSubmittingAnswer] = useState(false);

  // Questions for creating new shared challenge
  const [showNewChallengeModal, setShowNewChallengeModal] = useState(false);
  const [availableQuestions, setAvailableQuestions] = useState<QuestionBankItem[]>([]);
  const [selectedQuestionId, setSelectedQuestionId] = useState<number | null>(null);

  const fetchSpaceSessions = async (spaceId: number) => {
    setLoading(true);
    try {
      const data = await api.getSpaceCompanionSessions(spaceId);
      setSessions(data);
      if (data.length > 0 && !activeSession) {
        setActiveSession(data[0]);
      }
    } catch (err) {
      console.error('Failed to load shared sessions', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeSpace) {
      fetchSpaceSessions(activeSpace.id);
    } else {
      setLoading(false);
    }
  }, [activeSpace]);

  const handleCopyInviteCode = () => {
    if (!activeSpace) return;
    navigator.clipboard.writeText(activeSpace.invite_code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCreateSpace = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newSpace = await api.createSpace(newSpaceName);
      await refreshSpaces();
      setActiveSpace(newSpace);
      setShowCreateSpaceModal(false);
    } catch (err) {
      console.error('Failed to create space', err);
    }
  };

  const handleJoinSpace = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const joinedSpace = await api.joinSpace(joinInviteCode);
      await refreshSpaces();
      setActiveSpace(joinedSpace);
      setShowJoinModal(false);
    } catch (err) {
      console.error('Failed to join space', err);
    }
  };

  const handleOpenNewChallenge = async () => {
    try {
      const qRes = await api.getQuestions({ limit: 20 });
      setAvailableQuestions(qRes.items);
      if (qRes.items.length > 0) {
        setSelectedQuestionId(qRes.items[0].id);
      }
      setShowNewChallengeModal(true);
    } catch (err) {
      console.error('Failed to get questions', err);
    }
  };

  const handleCreateChallengeSession = async () => {
    if (!activeSpace || !selectedQuestionId) return;
    try {
      const created = await api.createCompanionSession({
        space_id: activeSpace.id,
        question_id: selectedQuestionId,
        title: 'Shared Pair Challenge Session',
      });
      setSessions([created, ...sessions]);
      setActiveSession(created);
      setShowNewChallengeModal(false);
    } catch (err) {
      console.error('Failed to create challenge session', err);
    }
  };

  const handleSubmitCompanionAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSession) return;

    setSubmittingAnswer(true);
    try {
      const updated = await api.submitCompanionAnswer(
        activeSession.id,
        myAnswer,
        myReasoning,
        myReflection
      );
      setActiveSession(updated);
      setSessions(sessions.map(s => s.id === updated.id ? updated : s));
      setMyAnswer('');
      setMyReasoning('');
      setMyReflection('');

      if (updated.both_submitted) {
        confetti({
          particleCount: 90,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    } catch (err) {
      console.error('Failed to submit answer', err);
    } finally {
      setSubmittingAnswer(false);
    }
  };

  if (!activeSpace) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center space-y-6 animate-fadeIn">
        <div className="w-16 h-16 rounded-2xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-400 mx-auto">
          <Users2 className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-extrabold text-white">Join or Create a Learning Space</h1>
        <p className="text-slate-400 text-sm max-w-md mx-auto leading-relaxed">
          Learning alongside a partner doubles retention. Create your space and share your private 8-character code with your companion.
        </p>
        <div className="flex justify-center gap-4 pt-2">
          <Button variant="quest" size="lg" onClick={() => setShowCreateSpaceModal(true)}>
            Create New Space
          </Button>
          <Button variant="secondary" size="lg" onClick={() => setShowJoinModal(true)}>
            Join With Code
          </Button>
        </div>

        {/* Modal: Create Space */}
        {showCreateSpaceModal && (
          <Modal isOpen={showCreateSpaceModal} onClose={() => setShowCreateSpaceModal(false)} title="Create Learning Space">
            <form onSubmit={handleCreateSpace} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Space Name</label>
                <input
                  type="text"
                  required
                  value={newSpaceName}
                  onChange={(e) => setNewSpaceName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 outline-none focus:border-emerald-500"
                />
              </div>
              <Button type="submit" variant="quest" className="w-full">Create Space</Button>
            </form>
          </Modal>
        )}

        {/* Modal: Join Space */}
        {showJoinModal && (
          <Modal isOpen={showJoinModal} onClose={() => setShowJoinModal(false)} title="Join Learning Space">
            <form onSubmit={handleJoinSpace} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Invite Code</label>
                <input
                  type="text"
                  required
                  value={joinInviteCode}
                  onChange={(e) => setJoinInviteCode(e.target.value.toUpperCase())}
                  placeholder="e.g. 9F4B12A8"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm font-mono text-slate-100 outline-none focus:border-emerald-500 uppercase tracking-widest text-center"
                />
              </div>
              <Button type="submit" variant="quest" className="w-full">Join Space</Button>
            </form>
          </Modal>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto">
      {/* Space Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 md:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-teal-950/40 border border-teal-500/20">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-1 rounded-md bg-teal-500/10 text-teal-400">
              <Users2 className="w-4 h-4" />
            </span>
            <span className="text-xs font-semibold text-teal-400 uppercase tracking-wider">
              Pair Study Space
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white">{activeSpace.name}</h1>
          <p className="text-xs text-slate-400 mt-1">
            Independent submissions ensure uninfluenced thought. Answers unlock once both partners have submitted.
          </p>
        </div>

        {/* Invite Code Widget */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 px-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-3">
            <div>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Invite Code</span>
              <span className="font-mono text-sm font-bold text-teal-300 tracking-wider">{activeSpace.invite_code}</span>
            </div>
            <button
              onClick={handleCopyInviteCode}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
              title="Copy invite code"
            >
              {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          <Button
            variant="quest"
            size="md"
            onClick={handleOpenNewChallenge}
            icon={<Swords className="w-4 h-4" />}
          >
            Launch Pair Challenge
          </Button>
        </div>
      </div>

      {/* Main Split Layout: Challenge Sessions List & Active Session Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Shared Sessions List */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between pb-1">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Shared Challenge Sessions</h2>
            <span className="text-xs text-slate-500 font-mono">{sessions.length} Sessions</span>
          </div>

          <div className="space-y-3">
            {sessions.map((s) => {
              const isSelected = activeSession?.id === s.id;
              return (
                <div
                  key={s.id}
                  onClick={() => setActiveSession(s)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-teal-500/10 border-teal-500/50 shadow-lg shadow-teal-950/30'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-mono text-teal-400 font-semibold">{s.question?.canonical_id || 'JQ-001'}</span>
                    <Badge variant={s.both_submitted ? 'emerald' : 'amber'}>
                      {s.both_submitted ? 'Both Submitted' : s.current_user_submitted ? 'Waiting Partner' : 'Awaiting You'}
                    </Badge>
                  </div>
                  <h3 className="font-bold text-sm text-slate-200 line-clamp-1">{s.title}</h3>
                  <div className="flex items-center justify-between pt-2 text-[11px] text-slate-500">
                    <span>{new Date(s.created_at).toLocaleDateString()}</span>
                    <span>{s.submissions.length}/2 Submissions</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Active Session Arena & Side-by-Side Comparison */}
        <div className="lg:col-span-8 space-y-4">
          {activeSession ? (
            <Card className="space-y-6 bg-slate-900 border-slate-800">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <span className="text-xs font-mono text-teal-400 font-semibold uppercase tracking-wider">
                    Pair Challenge Session #{activeSession.id}
                  </span>
                  <h2 className="text-xl font-bold text-white mt-1">{activeSession.title}</h2>
                </div>

                <div className="flex items-center gap-2">
                  {activeSession.both_submitted ? (
                    <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full font-semibold">
                      <Unlock className="w-3.5 h-3.5" /> Both Unlocked
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full font-semibold">
                      <Lock className="w-3.5 h-3.5" /> Hidden until both submit
                    </span>
                  )}
                </div>
              </div>

              {/* Problem Prompt */}
              {activeSession.question && (
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    <span>Problem Statement ({activeSession.question.canonical_id})</span>
                    <Badge variant={activeSession.question.difficulty}>{activeSession.question.difficulty}</Badge>
                  </div>
                  <p className="text-sm text-slate-200 leading-relaxed font-sans">
                    {activeSession.question.prompt}
                  </p>
                </div>
              )}

              {/* If Current User hasn't submitted yet: Show submission form */}
              {!activeSession.current_user_submitted ? (
                <form onSubmit={handleSubmitCompanionAnswer} className="space-y-4 p-5 rounded-2xl bg-slate-950 border border-slate-800">
                  <div className="flex items-center gap-2 text-xs font-semibold text-teal-400 uppercase tracking-wider">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Your Independent Submission</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Your companion cannot see your code until they have also submitted their answer!
                  </p>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      Your Solution Code
                    </label>
                    <textarea
                      rows={6}
                      required
                      value={myAnswer}
                      onChange={(e) => setMyAnswer(e.target.value)}
                      placeholder="// Write your independent Java solution..."
                      className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 focus:border-teal-500 font-mono text-sm text-slate-100 outline-none leading-relaxed"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      Your Reasoning / Approach (Optional)
                    </label>
                    <textarea
                      rows={2}
                      value={myReasoning}
                      onChange={(e) => setMyReasoning(e.target.value)}
                      placeholder="Why did you choose this design or logic?"
                      className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 focus:border-teal-500 text-sm text-slate-100 outline-none"
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="quest"
                    size="md"
                    isLoading={submittingAnswer}
                    icon={<Zap className="w-4 h-4" />}
                  >
                    Submit My Solution (+40 XP upon both submitting)
                  </Button>
                </form>
              ) : (
                /* Submissions comparison grid */
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm text-slate-300 uppercase tracking-wider">
                      Side-by-Side Submissions
                    </h3>
                    <span className="text-xs text-slate-400">
                      {activeSession.both_submitted ? 'Unlocked for review' : 'Waiting on companion'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {activeSession.submissions.map((sub, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-3"
                      >
                        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-teal-500/20 text-teal-300 flex items-center justify-center text-xs font-bold">
                              {sub.username.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <span className="font-semibold text-xs text-slate-200">{sub.username}</span>
                              <span className="text-[10px] text-slate-500 block capitalize">{sub.role}</span>
                            </div>
                          </div>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {new Date(sub.submitted_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        <div>
                          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Code Submission:</span>
                          <div className="mt-1 font-mono text-xs p-3 rounded-xl bg-slate-900/90 border border-slate-800/80 text-slate-200 whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
                            {sub.answer}
                          </div>
                        </div>

                        {sub.reasoning && (
                          <div className="pt-2 border-t border-slate-800/60">
                            <span className="text-[10px] font-semibold text-teal-400 uppercase tracking-wider">Reasoning:</span>
                            <p className="text-xs text-slate-300 mt-0.5 leading-relaxed font-sans">{sub.reasoning}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Solution Guidance if unlocked */}
                  {activeSession.question?.solution_guidance && (
                    <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-xs space-y-1">
                      <span className="font-bold text-emerald-400 uppercase tracking-wider">Canonical Solution Guidance:</span>
                      <p className="text-slate-200 font-sans leading-relaxed">{activeSession.question.solution_guidance}</p>
                    </div>
                  )}
                </div>
              )}
            </Card>
          ) : (
            <Card className="text-center py-12 text-slate-400">
              Select or launch a challenge session to view side-by-side solutions.
            </Card>
          )}
        </div>
      </div>

      {/* Modal: Launch New Pair Challenge */}
      {showNewChallengeModal && (
        <Modal
          isOpen={showNewChallengeModal}
          onClose={() => setShowNewChallengeModal(false)}
          title="Launch Pair Challenge Session"
          maxWidth="lg"
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-400">
              Pick a question from the curated bank for you and your companion to attempt simultaneously.
            </p>

            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {availableQuestions.map((q) => (
                <div
                  key={q.id}
                  onClick={() => setSelectedQuestionId(q.id)}
                  className={`p-3 rounded-xl border cursor-pointer text-xs transition-all ${
                    selectedQuestionId === q.id
                      ? 'bg-teal-500/15 border-teal-500 text-teal-300 font-semibold'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-emerald-400">{q.canonical_id}</span>
                    <Badge variant={q.difficulty}>{q.difficulty}</Badge>
                  </div>
                  <h4 className="font-bold text-sm text-slate-100">{q.title}</h4>
                  <p className="text-slate-400 line-clamp-1 mt-0.5">{q.prompt}</p>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <Button variant="ghost" onClick={() => setShowNewChallengeModal(false)}>
                Cancel
              </Button>
              <Button variant="quest" onClick={handleCreateChallengeSession}>
                Start Shared Session
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
