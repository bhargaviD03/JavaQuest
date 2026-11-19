import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Shield, RefreshCw, Search } from 'lucide-react';
import { GAME_REGISTRY } from '../engine/GameRegistry';
import { GameLayout, LevelDefinition } from '../components/GameLayout';
import { ThreeForensics } from './components/ThreeForensics';
import { gameBridge } from '../engine/GameBridge';
import { api } from '../../services/api';
import { gameService } from '../../services/gameService';
import { ExecutionResult } from '../components/MonacoJavaEditor';

export const JavaForensicsGame: React.FC = () => {
  const [levels, setLevels] = useState<LevelDefinition[]>([]);
  const [isLoadingLevels, setIsLoadingLevels] = useState(true);
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [isOperational, setIsOperational] = useState(false);
  const gameMeta = GAME_REGISTRY['java-forensics'];

  useEffect(() => {
    async function loadLevels() {
      try {
        const dbLevels = await gameService.getGameLevels('java-forensics');
        setLevels(dbLevels.map(gameService.formatLevel));
      } catch (err) {
        console.error('Failed to load levels from database', err);
      } finally {
        setIsLoadingLevels(false);
      }
    }
    loadLevels();
  }, []);

  const handleAction = (action: string) => {
    gameBridge.emit('CODE_EXECUTED', {
      gameId: 'java-forensics',
      data: { compiled: true, action },
    });
  };

  const handleExecuteCode = async (code: string): Promise<ExecutionResult> => {
    try {
      const currentLevel = levels[currentLevelIndex];
      const res = await api.executeJava({
        code,
        game_id: 'java-forensics',
        level_id: currentLevel ? `level-${currentLevel.levelNumber}` : 'level-1',
      });

      // Forward results to 2.5D Phaser Scene
      gameBridge.emit('CODE_EXECUTED', {
        gameId: 'java-forensics',
        data: {
          compiled: res.compiled,
          output: res.output,
          errors: res.errors,
          testResults: res.test_results,
        },
      });

      if (res.compiled) {
        setIsOperational(true);
        confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
      }

      return {
        compiled: res.compiled,
        output: res.output,
        errors: res.errors,
        executionTimeMs: res.execution_time_ms,
        testResults: res.test_results,
      };
    } catch (err: any) {
      return {
        compiled: false,
        output: '',
        errors: err.message || 'Execution failed.',
      };
    }
  };

  if (isLoadingLevels || levels.length === 0) {
    return (
      <div className="min-h-[500px] flex items-center justify-center bg-slate-950 rounded-2xl border border-slate-800 text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-mono">Loading Cyber Forensics Incidents from Database...</span>
        </div>
      </div>
    );
  }

  return (
    <GameLayout
      gameMeta={gameMeta}
      levels={levels}
      currentLevelIndex={currentLevelIndex}
      onSelectLevel={setCurrentLevelIndex}
      onExecuteCode={handleExecuteCode}
    >
      <div className="flex flex-col h-full space-y-3">
        <div className="flex-1 min-h-[460px] rounded-2xl overflow-hidden shadow-2xl relative border border-slate-800">
          <ThreeForensics level={currentLevelIndex + 1} />
        </div>

        {/* In-Game Interactive Forensics Bar */}
        <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-bold">CIRU Terminal:</span>
            <button
              onClick={() => handleAction('patch')}
              disabled={!isOperational}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 disabled:opacity-40 transition-all font-bold"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>firewall.patch()</span>
            </button>
            <button
              onClick={() => handleAction('gc')}
              disabled={!isOperational}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 disabled:opacity-40 transition-all font-bold"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>jvm.triggerGC()</span>
            </button>
            <button
              onClick={() => handleAction('dump')}
              disabled={!isOperational}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 disabled:opacity-40 transition-all font-bold"
            >
              <Search className="w-3.5 h-3.5" />
              <span>trace.intercept()</span>
            </button>
          </div>

          <span className="text-[11px] text-slate-400">
            {isOperational ? 'Incident terminal online' : 'Compile Java code to isolate vulnerability'}
          </span>
        </div>
      </div>
    </GameLayout>
  );
};

export default JavaForensicsGame;
