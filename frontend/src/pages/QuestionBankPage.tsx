import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Search,
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  Zap,
  Eye,
  EyeOff,
  Filter,
  ArrowRight,
  HelpCircle,
  Code2,
  Lightbulb,
  Download,
  FileText,
  Building2
} from 'lucide-react';
import { api } from '../services/api';
import { QuestionBankItem } from '../types';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { CodeBlock } from '../components/common/CodeBlock';
import { Modal } from '../components/common/Modal';
import { SkeletonCard } from '../components/common/Skeleton';
import { SolutionGuidanceViewer } from '../components/common/SolutionGuidanceViewer';

export const QuestionBankPage: React.FC = () => {
  const [questions, setQuestions] = useState<QuestionBankItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Active question modal/drawer for attempting
  const [activeQuestion, setActiveQuestion] = useState<QuestionBankItem | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [submittedAnswer, setSubmittedAnswer] = useState('');
  const [selfAssessment, setSelfAssessment] = useState('understood');
  const [submitting, setSubmitting] = useState(false);
  const [attemptResult, setAttemptResult] = useState<any>(null);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const res = await api.getQuestions({
        search,
        topic: selectedTopic || undefined,
        difficulty: selectedDifficulty || undefined,
        question_type: selectedType || undefined,
        status_filter: statusFilter || undefined,
      });
      setQuestions(res.items);
      setTotal(res.total);
    } catch (err) {
      console.error('Failed to load questions', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [search, selectedTopic, selectedDifficulty, selectedType, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchQuestions();
  };

  const handleToggleBookmark = async (qId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await api.toggleBookmark(qId);
      setQuestions(questions.map(q => q.id === qId ? { ...q, is_bookmarked: res.is_bookmarked } : q));
      if (activeQuestion && activeQuestion.id === qId) {
        setActiveQuestion({ ...activeQuestion, is_bookmarked: res.is_bookmarked });
      }
    } catch (err) {
      console.error('Failed to toggle bookmark', err);
    }
  };

  const openAttemptModal = (q: QuestionBankItem) => {
    setActiveQuestion(q);
    setShowHint(false);
    setSubmittedAnswer(q.latest_attempt?.submitted_answer || '');
    setSelfAssessment(q.latest_attempt?.self_assessment || 'understood');
    setAttemptResult(null);
  };

  const handleSubmitAttempt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeQuestion) return;

    setSubmitting(true);
    try {
      const res = await api.submitQuestionAttempt(activeQuestion.id, submittedAnswer, selfAssessment);
      setAttemptResult(res);

      // Update question in state to mark attempted and reveal solution
      const updatedQ: QuestionBankItem = {
        ...activeQuestion,
        has_attempted: true,
        solution_guidance: res.solution_guidance,
      };
      setActiveQuestion(updatedQ);
      setQuestions(questions.map(q => q.id === activeQuestion.id ? updatedQ : q));
    } catch (err) {
      console.error('Failed to submit attempt', err);
    } finally {
      setSubmitting(false);
    }
  };

  const topicsList = [
    'OOP Foundations & Class Blueprints',
    'Core Java Collections & Frameworks',
    'Exception Handling & System Resilience',
    'Multithreading & Concurrency',
    'Streams & Functional Programming',
    'File I/O & Serialization',
    'Data Structures & Algorithms',
    'Design Patterns & Enterprise Architecture',
    'JDBC, SQL & Database Persistence',
    'JVM Internals, Memory & Garbage Collection',
    'OOP Foundations',
    'Core Java',
    'Spring Boot',
  ];

  const companiesList = [
    'All Companies',
    'Google',
    'Amazon',
    'Microsoft',
    'Meta',
    'Apple',
    'Netflix',
    'Goldman Sachs',
    'TCS',
    'Infosys'
  ];

  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 md:p-8 rounded-3xl bg-gradient-to-br from-white via-slate-50 to-slate-100 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-2xl">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-1 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <BookOpen className="w-4 h-4" />
            </span>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Curated Java Practice</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white">JavaQuest Question Bank</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-xl">
            Original practice bank matching the canonical syllabus. Solutions remain locked until your first honest attempt.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <a
            href="/downloads/250_Top_MNC_Java_Interview_Questions_Master_Guide.pdf"
            download="250_Top_MNC_Java_Interview_Questions_Master_Guide.pdf"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download 250 MNC Questions PDF</span>
          </a>

          <div className="px-4 py-2 rounded-xl bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-xs flex items-center justify-center shadow-sm dark:shadow-none">
            <span className="text-slate-500 dark:text-slate-400">Total in Library:&nbsp;</span>
            <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">{total || 250} Questions</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 shadow-sm dark:shadow-none space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, prompt keyword, or canonical ID (e.g. JQ-001)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-emerald-500 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none"
            />
          </div>
          <Button type="submit" variant="primary" size="md">
            Search
          </Button>
        </form>

        {/* Company Quick-Filter Pills (Matching Preview 3) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
            <Building2 className="w-3.5 h-3.5 text-slate-400" /> Target MNC:
          </span>
          {companiesList.map((c) => {
            const isSelected = (c === 'All Companies' && !search) || search === c;
            return (
              <button
                key={c}
                type="button"
                onClick={() => {
                  const val = c === 'All Companies' ? '' : c;
                  setSearch(val);
                }}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 font-bold dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/40 shadow-sm dark:shadow-emerald-950'
                    : 'bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                {c}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          {/* Topic filter */}
          <select
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
            className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 outline-none focus:border-emerald-500"
          >
            <option value="">All Topics (12)</option>
            {topicsList.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          {/* Difficulty filter */}
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 outline-none focus:border-emerald-500"
          >
            <option value="">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>

          {/* Question Type filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 outline-none focus:border-emerald-500"
          >
            <option value="">All Question Types</option>
            <option value="Code design">Code design</option>
            <option value="Predict output">Predict output</option>
            <option value="Debugging">Debugging</option>
            <option value="Explain code">Explain code</option>
            <option value="Coding">Coding</option>
            <option value="Knowledge check">Knowledge check</option>
            <option value="Mini design challenge">Mini design challenge</option>
          </select>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 outline-none focus:border-emerald-500"
          >
            <option value="">All Statuses</option>
            <option value="unattempted">Unattempted Only</option>
            <option value="attempted">Attempted</option>
            <option value="bookmarked">Bookmarked</option>
          </select>
        </div>
      </div>

      {/* Questions Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, idx) => (
            <SkeletonCard key={idx} />
          ))}
        </div>
      ) : questions.length === 0 ? (
        <Card className="text-center py-12 text-slate-400">
          No questions found matching your filter criteria. Try clearing some filters.
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {questions.map((q) => (
            <Card
              key={q.id}
              onClick={() => openAttemptModal(q)}
              hoverable
              className="space-y-3 relative group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20">
                    {q.canonical_id}
                  </span>
                  <Badge variant={q.difficulty}>{q.difficulty}</Badge>
                </div>
                <button
                  onClick={(e) => handleToggleBookmark(q.id, e)}
                  className={`p-1.5 rounded-lg border transition-colors ${
                    q.is_bookmarked
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-500 dark:text-amber-400'
                      : 'border-transparent text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300'
                  }`}
                  title="Bookmark question"
                >
                  {q.is_bookmarked ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                </button>
              </div>

              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  {q.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">{q.topic} &bull; {q.question_type}</p>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                {q.prompt}
              </p>

              <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-xs">
                {q.has_attempted ? (
                  <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Attempted &bull; Solution Unlocked</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500">
                    <EyeOff className="w-3.5 h-3.5" />
                    <span>Solution Locked</span>
                  </span>
                )}
                <span className="text-slate-500 dark:text-slate-400 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                  Open <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Attempt Modal */}
      {activeQuestion && (
        <Modal
          isOpen={!!activeQuestion}
          onClose={() => setActiveQuestion(null)}
          title={`${activeQuestion.canonical_id} — ${activeQuestion.title}`}
          maxWidth="2xl"
        >
          <div className="space-y-6">
            {/* Metadata Badges */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Badge variant={activeQuestion.difficulty}>{activeQuestion.difficulty}</Badge>
                <span className="text-xs text-slate-400">{activeQuestion.topic}</span>
                <span className="text-slate-600">&bull;</span>
                <span className="text-xs text-slate-400">{activeQuestion.question_type}</span>
              </div>
              <button
                onClick={(e) => handleToggleBookmark(activeQuestion.id, e)}
                className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg border ${
                  activeQuestion.is_bookmarked
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                    : 'border-slate-800 text-slate-400'
                }`}
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>{activeQuestion.is_bookmarked ? 'Bookmarked' : 'Bookmark'}</span>
              </button>
            </div>

            {/* Prompt */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Challenge Prompt</h4>
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-sm text-slate-200 leading-relaxed font-sans">
                {activeQuestion.prompt}
              </div>
            </div>

            {/* Learning Objectives */}
            {activeQuestion.learning_objectives && activeQuestion.learning_objectives.length > 0 && (
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Key Objectives:</span>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {activeQuestion.learning_objectives.map((obj, i) => (
                    <span key={i} className="text-[11px] px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                      {obj}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Progressive Hint */}
            {activeQuestion.hint && (
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
                    <Lightbulb className="w-4 h-4" />
                    <span>Need a Hint?</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowHint(!showHint)}
                    className="text-xs"
                  >
                    {showHint ? 'Hide Hint' : 'Reveal Hint'}
                  </Button>
                </div>
                {showHint && (
                  <p className="text-xs text-slate-300 pt-1 border-t border-slate-800/80 leading-relaxed">
                    {activeQuestion.hint}
                  </p>
                )}
              </div>
            )}

            {/* Submission Form */}
            <form onSubmit={handleSubmitAttempt} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Your Solution / Explanation
                </label>
                <textarea
                  rows={6}
                  required
                  value={submittedAnswer}
                  onChange={(e) => setSubmittedAnswer(e.target.value)}
                  placeholder="Write your Java code, predicted output, or explanation here..."
                  className="w-full p-4 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 text-sm text-slate-100 font-mono placeholder-slate-500 outline-none leading-relaxed"
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Self-Review:</span>
                  <select
                    value={selfAssessment}
                    onChange={(e) => setSelfAssessment(e.target.value)}
                    className="text-xs px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 outline-none focus:border-emerald-500"
                  >
                    <option value="understood">Understood Well</option>
                    <option value="struggled">Struggled a bit</option>
                    <option value="needs_revision">Needs Revision</option>
                  </select>
                </div>

                <Button
                  type="submit"
                  variant="quest"
                  size="md"
                  isLoading={submitting}
                  icon={<Zap className="w-4 h-4" />}
                >
                  {activeQuestion.has_attempted ? 'Resubmit Attempt' : 'Submit & Unlock Solution (+25 XP)'}
                </Button>
              </div>
            </form>

            {/* Unlocked Solution Guidance (Revealed only after attempting!) */}
            {activeQuestion.solution_guidance && (
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/90 border border-emerald-500/40 shadow-xl space-y-3 animate-fadeIn">
                <div className="flex items-center justify-between pb-3 border-b border-emerald-500/20">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                    <Eye className="w-4 h-4" />
                    <span>Unlocked Solution & Beginner Guide</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20">
                    MNC Verified
                  </span>
                </div>
                
                <SolutionGuidanceViewer content={activeQuestion.solution_guidance} />

                {attemptResult?.ai_feedback && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 italic pt-2 border-t border-slate-200 dark:border-slate-800">
                    AI Mentor Note: {attemptResult.ai_feedback}
                  </p>
                )}
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};
