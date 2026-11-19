import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, Bot, Sparkles, Award, CheckCircle2, ChevronRight, ChevronLeft, Volume2, VolumeX } from 'lucide-react';
import { GameMetadata } from '../engine/GameRegistry';
import { MonacoJavaEditor, ExecutionResult } from './MonacoJavaEditor';
import { gameAudio } from '../engine/GameAudio';

export interface LevelDefinition {
  levelNumber: number;
  title: string;
  topic: string;
  learningObjective: string;
  scenario: string;
  initialCode: string;
  solutionHint?: string;
}

interface GameLayoutProps {
  gameMeta: GameMetadata;
  levels: LevelDefinition[];
  currentLevelIndex: number;
  onSelectLevel: (index: number) => void;
  onExecuteCode: (code: string) => Promise<ExecutionResult>;
  children: React.ReactNode; // Phaser Game Canvas & World UI
  onActionComplete?: () => void;
}

export const GameLayout: React.FC<GameLayoutProps> = ({
  gameMeta,
  levels,
  currentLevelIndex,
  onSelectLevel,
  onExecuteCode,
  children,
}) => {
  const navigate = useNavigate();
  const currentLevel = levels[currentLevelIndex] || levels[0];
  const [showMentor, setShowMentor] = useState(false);
  const [isMuted, setIsMuted] = useState(gameAudio.getMuted());

  const handleToggleSound = () => {
    const muted = gameAudio.toggleMute();
    setIsMuted(muted);
  };

  const handleExecuteWithAudio = async (code: string): Promise<ExecutionResult> => {
    const result = await onExecuteCode(code);
    if (result.compiled) {
      gameAudio.playSuccess();
    } else {
      gameAudio.playError();
    }
    return result;
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-12">
      {/* Top Game Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/games')}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Return to Game Hub"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">{gameMeta.icon}</span>
              <h1 className="text-xl font-extrabold text-white tracking-tight">{gameMeta.title}</h1>
              <span
                className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold"
                style={{ backgroundColor: `${gameMeta.accentColor}20`, color: gameMeta.accentColor }}
              >
                {gameMeta.tagline}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Level {currentLevel.levelNumber} of {levels.length}: {currentLevel.title}
            </p>
          </div>
        </div>

        {/* Level Paging Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs font-mono">
            <button
              disabled={currentLevelIndex <= 0}
              onClick={() => onSelectLevel(currentLevelIndex - 1)}
              className="p-1 rounded-lg hover:bg-slate-800 disabled:opacity-40 text-slate-300"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 font-bold text-slate-200">
              Lvl {currentLevel.levelNumber}/{levels.length}
            </span>
            <button
              disabled={currentLevelIndex >= levels.length - 1}
              onClick={() => onSelectLevel(currentLevelIndex + 1)}
              className="p-1 rounded-lg hover:bg-slate-800 disabled:opacity-40 text-slate-300"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleToggleSound}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          <button
            onClick={() => setShowMentor(!showMentor)}
            className="px-3 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 hover:bg-indigo-500/20 text-indigo-300 text-xs font-mono font-bold flex items-center gap-1.5 transition-all"
          >
            <Bot className="w-3.5 h-3.5" />
            <span>AI Mentor</span>
          </button>
        </div>
      </div>

      {/* Main Dual Workspace: 2.5D Phaser Canvas + Context & Monaco Code IDE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: 2.5D Phaser Canvas & Live World Reactions (7 cols) */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          <div className="flex-1 min-h-[480px] rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl relative">
            {children}
          </div>
        </div>

        {/* Right: Contextual Objective + Monaco Editor (5 cols) */}
        <div className="lg:col-span-5 flex flex-col space-y-4">
          {/* Mission Objective Card */}
          <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/80 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" /> Topic: {currentLevel.topic}
              </span>
              <span className="text-slate-400 text-[10px]">Learning Objective</span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed font-mono">
              {currentLevel.learningObjective}
            </p>
            <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 text-[11px] text-slate-400 font-mono">
              <strong className="text-slate-300">Context:</strong> {currentLevel.scenario}
            </div>
          </div>

          {/* Monaco Editor Frame */}
          <div className="flex-1 min-h-[400px]">
            <MonacoJavaEditor
              initialCode={currentLevel.initialCode}
              onExecute={handleExecuteWithAudio}
              fileName={`${gameMeta.id}.java`}
            />
          </div>

          {/* AI Mentor Drawer if toggled */}
          {showMentor && (
            <div className="p-3.5 rounded-xl border border-indigo-500/40 bg-indigo-950/30 text-xs font-mono text-indigo-200 space-y-2 animate-fadeIn">
              <div className="flex items-center gap-2 text-indigo-300 font-bold">
                <Bot className="w-4 h-4 text-indigo-400" />
                <span>AI Socratic Mentor: {currentLevel.topic}</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                {currentLevel.solutionHint ||
                  'Inspect how methods define object behavior. When you declare public void or public int, you determine what actions this creature can perform in the 2.5D habitat.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
