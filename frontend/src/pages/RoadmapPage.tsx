import React, { useState, useEffect } from 'react';
import {
  Map,
  BookOpen,
  CheckCircle2,
  Clock,
  Layers,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { api } from '../services/api';
import { Module, Topic, Lesson } from '../types';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { ProgressBar } from '../components/common/ProgressBar';

export const RoadmapPage: React.FC = () => {
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [expandedModuleId, setExpandedModuleId] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const fetchRoadmap = async () => {
    setLoading(true);
    try {
      const data = await api.getRoadmap();
      setModules(data);
      if (data.length > 0) {
        setExpandedModuleId(data[0].id);
        if (data[0].topics.length > 0) {
          setSelectedTopic(data[0].topics[0]);
          if (data[0].topics[0].lessons.length > 0) {
            setActiveLesson(data[0].topics[0].lessons[0]);
          }
        }
      }
    } catch (err) {
      console.error('Failed to load roadmap', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoadmap();
  }, []);

  const handleUpdateStatus = async (lessonId: number, newStatus: string) => {
    try {
      await api.updateLessonStatus(lessonId, newStatus);
      // Refresh roadmap
      const data = await api.getRoadmap();
      setModules(data);
      // update active lesson if matches
      if (activeLesson && activeLesson.id === lessonId) {
        setActiveLesson({ ...activeLesson, user_status: newStatus as any });
      }
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm text-slate-400">Loading Java roadmap...</p>
        </div>
      </div>
    );
  }

  // Calculate overall progress
  let totalLessons = 0;
  let completedLessons = 0;
  modules.forEach(m => {
    m.topics.forEach(t => {
      totalLessons += t.lessons_count;
      completedLessons += t.completed_count;
    });
  });
  const overallPct = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 md:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold">
            <Map className="w-3.5 h-3.5" />
            <span>Progressive Java Curriculum</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white">Java Learning Roadmap</h1>
          <p className="text-sm text-slate-400 max-w-xl">
            12 progressive modules from OOP Foundations to Spring Boot & Capstone Architecture. Adapt freely to your institute's pace.
          </p>
        </div>

        <div className="w-full md:w-64 p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
          <div className="flex justify-between text-xs text-slate-300">
            <span>Roadmap Mastery</span>
            <span className="font-mono text-emerald-400 font-bold">{completedLessons}/{totalLessons} Lessons</span>
          </div>
          <ProgressBar value={overallPct} color="gradient" size="md" />
        </div>
      </div>

      {/* Main Roadmap Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Modules & Topics Accordion */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between pb-1">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Curriculum Modules</h2>
            <span className="text-xs text-slate-500 font-mono">12 Modules</span>
          </div>

          <div className="space-y-3">
            {modules.map((mod) => {
              const isExpanded = expandedModuleId === mod.id;
              const modCompleted = mod.topics.reduce((acc, t) => acc + t.completed_count, 0);
              const modTotal = mod.topics.reduce((acc, t) => acc + t.lessons_count, 0);

              return (
                <div
                  key={mod.id}
                  className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setExpandedModuleId(isExpanded ? null : mod.id)}
                    className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-800/40 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-800 text-emerald-400 font-bold">
                        {mod.code}
                      </span>
                      <div>
                        <h3 className="font-bold text-sm text-slate-200">{mod.title}</h3>
                        <p className="text-xs text-slate-400 line-clamp-1">{mod.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-slate-400">{modCompleted}/{modTotal}</span>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="p-2 border-t border-slate-800/80 bg-slate-950/40 space-y-1">
                      {mod.topics.map((t) => {
                        const isTopicSelected = selectedTopic?.id === t.id;
                        return (
                          <button
                            key={t.id}
                            onClick={() => {
                              setSelectedTopic(t);
                              if (t.lessons.length > 0) setActiveLesson(t.lessons[0]);
                            }}
                            className={`w-full p-2.5 rounded-xl text-left text-xs transition-all flex items-center justify-between ${
                              isTopicSelected
                                ? 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 font-semibold'
                                : 'text-slate-300 hover:bg-slate-800/60'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              {t.status === 'mastered' ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                              ) : (
                                <span className="w-2 h-2 rounded-full bg-slate-700 shrink-0"></span>
                              )}
                              <span className="truncate max-w-[200px]">{t.title}</span>
                            </div>
                            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                              {t.status.replace('_', ' ')}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Active Topic & Lesson Detail */}
        <div className="lg:col-span-7 space-y-4">
          {selectedTopic && activeLesson ? (
            <Card className="space-y-6 bg-slate-900 border-slate-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <span className="text-xs font-mono text-emerald-400 font-semibold uppercase tracking-wider">
                    {selectedTopic.title}
                  </span>
                  <h2 className="text-xl font-bold text-white mt-1">{activeLesson.title}</h2>
                </div>

                {/* Status Switcher */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Status:</span>
                  <select
                    value={activeLesson.user_status || 'not_started'}
                    onChange={(e) => handleUpdateStatus(activeLesson.id, e.target.value)}
                    className="text-xs px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 outline-none focus:border-emerald-500"
                  >
                    <option value="not_started">Not Started</option>
                    <option value="in_progress">In Progress</option>
                    <option value="practising">Practising</option>
                    <option value="needs_revision">Needs Revision</option>
                    <option value="mastered">Mastered (+20 XP)</option>
                  </select>
                </div>
              </div>

              {/* Lesson Tabs in this Topic */}
              <div className="flex items-center gap-2 border-b border-slate-800/60 pb-3 overflow-x-auto">
                {selectedTopic.lessons.map((les) => (
                  <button
                    key={les.id}
                    onClick={() => setActiveLesson(les)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                      activeLesson.id === les.id
                        ? 'bg-slate-800 text-emerald-300 border border-slate-700'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {les.title}
                  </button>
                ))}
              </div>

              {/* Lesson Markdown Content */}
              <div className="prose prose-invert max-w-none text-slate-300 text-sm leading-relaxed space-y-4">
                {activeLesson.content_markdown.split('\n\n').map((paragraph, idx) => (
                  <div key={idx} className="whitespace-pre-line">
                    {paragraph}
                  </div>
                ))}
              </div>

              {/* Bottom Actions */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Est. {activeLesson.estimated_minutes} minutes</span>
                </div>

                <Button
                  variant="quest"
                  size="sm"
                  onClick={() => handleUpdateStatus(activeLesson.id, 'mastered')}
                  icon={<CheckCircle2 className="w-4 h-4" />}
                >
                  Mark Lesson Mastered (+20 XP)
                </Button>
              </div>
            </Card>
          ) : (
            <Card className="text-center py-12 text-slate-400">
              Select a module and topic from the left to view lessons.
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
