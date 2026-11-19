import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  FolderGit2,
  CheckCircle2,
  Sparkles,
  Zap,
  Layers,
  Code2,
  ArrowRight,
  BookOpen
} from 'lucide-react';
import { api } from '../services/api';
import { Project, ProjectMilestone } from '../types';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { ProgressBar } from '../components/common/ProgressBar';
import { CodeBlock } from '../components/common/CodeBlock';
import { Modal } from '../components/common/Modal';

export const ProjectLabPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Milestone submission modal
  const [activeMilestone, setActiveMilestone] = useState<ProjectMilestone | null>(null);
  const [learnerCode, setLearnerCode] = useState('');
  const [learnerReflection, setLearnerReflection] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const data = await api.getProjects();
      setProjects(data);
      if (data.length > 0 && !selectedProject) {
        setSelectedProject(data[0]);
      }
    } catch (err) {
      console.error('Failed to load projects', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const openMilestoneModal = (ms: ProjectMilestone) => {
    setActiveMilestone(ms);
    setLearnerCode(ms.learner_code || '');
    setLearnerReflection(ms.learner_reflection || '');
  };

  const handleCompleteMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject || !activeMilestone) return;

    setSubmitting(true);
    try {
      const res = await api.completeMilestone(
        selectedProject.id,
        activeMilestone.milestone_index,
        learnerCode,
        learnerReflection
      );

      // Refresh projects
      const updatedProjects = await api.getProjects();
      setProjects(updatedProjects);
      const updatedCurrent = updatedProjects.find(p => p.id === selectedProject.id);
      if (updatedCurrent) setSelectedProject(updatedCurrent);

      setActiveMilestone(null);
      if (res.xp_awarded > 0) {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 }
        });
      }
    } catch (err) {
      console.error('Failed to submit milestone', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm text-slate-400">Loading Project Lab...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 md:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/30 border border-indigo-500/20">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-1 rounded-md bg-indigo-500/10 text-indigo-400">
              <FolderGit2 className="w-4 h-4" />
            </span>
            <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
              Project-Based Architecture
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white">Java Project Lab</h1>
          <p className="text-sm text-slate-400 mt-1 max-w-xl">
            Build production-minded Java systems step by step with verified milestones, clean architecture, and reflection logs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="purple">4 Production Scaffolds</Badge>
        </div>
      </div>

      {/* Split View: Projects List & Project Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Projects Cards */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between pb-1">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Project Curriculum</h2>
            <span className="text-xs text-slate-500 font-mono">{projects.length} Projects</span>
          </div>

          <div className="space-y-3">
            {projects.map((p) => {
              const isSelected = selectedProject?.id === p.id;
              const pct = p.total_milestones > 0 ? Math.round((p.user_completed_milestones / p.total_milestones) * 100) : 0;

              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedProject(p)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-indigo-500/10 border-indigo-500 text-indigo-300 shadow-lg shadow-indigo-950/30'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-2">
                    <Badge variant={p.level === 'beginner' ? 'emerald' : 'amber'}>{p.level}</Badge>
                    <span className="font-mono text-slate-400">{p.user_completed_milestones}/{p.total_milestones} Done</span>
                  </div>
                  <h3 className="font-bold text-base text-slate-100">{p.title}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">{p.objective}</p>

                  <ProgressBar value={pct} color="gradient" size="sm" className="mt-3" />
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Active Project Details & Milestones */}
        <div className="lg:col-span-7 space-y-4">
          {selectedProject ? (
            <Card className="space-y-6 bg-slate-900 border-slate-800">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <span className="text-xs font-mono text-indigo-400 font-semibold uppercase tracking-wider">
                    {selectedProject.level.toUpperCase()} ARCHITECTURE
                  </span>
                  <h2 className="text-xl font-bold text-white mt-1">{selectedProject.title}</h2>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
                  <Zap className="w-3.5 h-3.5" />
                  <span>+35 XP per milestone</span>
                </div>
              </div>

              {/* Objective */}
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Objective</span>
                <p className="text-sm text-slate-200 mt-1 leading-relaxed">{selectedProject.objective}</p>
              </div>

              {/* Requirements & Concepts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                  <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Requirements</span>
                  <ul className="text-xs text-slate-400 space-y-1 list-disc list-inside">
                    {selectedProject.requirements.map((req, i) => (
                      <li key={i}>{req}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                  <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Concepts Covered</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedProject.concepts_covered.map((c, i) => (
                      <span key={i} className="text-[11px] px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-slate-300">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Starter Code Snippet */}
              {selectedProject.starter_code && (
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Starter Template</span>
                  <CodeBlock code={selectedProject.starter_code} language="java" title="Starter Template" />
                </div>
              )}

              {/* Interactive Milestones Tracker */}
              <div className="space-y-3 pt-2 border-t border-slate-800">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Project Milestones ({selectedProject.user_completed_milestones}/{selectedProject.total_milestones})
                </span>

                <div className="space-y-2">
                  {selectedProject.milestones.map((ms) => (
                    <div
                      key={ms.milestone_index}
                      className={`p-3.5 rounded-xl border flex items-center justify-between text-xs transition-all ${
                        ms.is_completed
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                          : 'bg-slate-950 border-slate-800 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className={`w-4 h-4 shrink-0 ${ms.is_completed ? 'text-emerald-400' : 'text-slate-600'}`} />
                        <div>
                          <span className="font-semibold text-sm text-slate-100">{ms.milestone_title}</span>
                          {ms.learner_reflection && (
                            <p className="text-[11px] text-slate-400 line-clamp-1 italic mt-0.5">
                              "{ms.learner_reflection}"
                            </p>
                          )}
                        </div>
                      </div>

                      <Button
                        variant={ms.is_completed ? 'secondary' : 'quest'}
                        size="sm"
                        onClick={() => openMilestoneModal(ms)}
                      >
                        {ms.is_completed ? 'Review Code' : 'Submit Milestone'}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          ) : (
            <Card className="text-center py-12 text-slate-400">
              Select a project from the left to view requirements and submit milestones.
            </Card>
          )}
        </div>
      </div>

      {/* Milestone Submission Modal */}
      {activeMilestone && (
        <Modal
          isOpen={!!activeMilestone}
          onClose={() => setActiveMilestone(null)}
          title={`Milestone ${activeMilestone.milestone_index} — ${activeMilestone.milestone_title}`}
          maxWidth="xl"
        >
          <form onSubmit={handleCompleteMilestone} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Your Java Implementation Code
              </label>
              <textarea
                rows={6}
                required
                value={learnerCode}
                onChange={(e) => setLearnerCode(e.target.value)}
                placeholder="// Paste the code for this milestone..."
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 font-mono text-xs text-slate-100 outline-none leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Reflection & Engineering Invariants
              </label>
              <textarea
                rows={3}
                value={learnerReflection}
                onChange={(e) => setLearnerReflection(e.target.value)}
                placeholder="What design trade-offs did you make? What bugs did you encounter?"
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 text-xs text-slate-100 outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <Button type="button" variant="ghost" onClick={() => setActiveMilestone(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="quest" isLoading={submitting}>
                Save & Claim Milestone XP (+35 XP)
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
