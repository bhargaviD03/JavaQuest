import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Globe, Zap, Database } from 'lucide-react';
import { GAME_REGISTRY } from '../engine/GameRegistry';
import { GameLayout, LevelDefinition } from '../components/GameLayout';
import { ThreeArchitecture } from './components/ThreeArchitecture';
import { gameBridge } from '../engine/GameBridge';
import { api } from '../../services/api';
import { gameService } from '../../services/gameService';
import { ExecutionResult } from '../components/MonacoJavaEditor';
import { ARCHITECTURE_LEVELS } from './config/levels';

export const JavaArchitectureGame: React.FC = () => {
  const [levels, setLevels] = useState<LevelDefinition[]>(ARCHITECTURE_LEVELS);
  const [isLoadingLevels, setIsLoadingLevels] = useState(false);
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [isOperational, setIsOperational] = useState(false);
  const gameMeta = GAME_REGISTRY['java-architecture'];

  useEffect(() => {
    async function loadLevels() {
      try {
        const dbLevels = await gameService.getGameLevels('java-architecture');
        if (dbLevels && dbLevels.length > 0) {
          setLevels(dbLevels.map(gameService.formatLevel));
        }
      } catch (err) {
        console.warn('Failed to load levels from database, retaining local architecture blueprint', err);
      } finally {
        setIsLoadingLevels(false);
      }
    }
    loadLevels();
  }, []);

  const handleAction = (action: string) => {
    gameBridge.emit('CODE_EXECUTED', {
      gameId: 'java-architecture',
      data: { compiled: true, action },
    });
  };

  const handleExecuteCode = async (code: string): Promise<ExecutionResult> => {
    try {
      const currentLevel = levels[currentLevelIndex];
      const res = await api.executeJava({
        code,
        game_id: 'java-architecture',
        level_id: currentLevel ? `level-${currentLevel.levelNumber}` : 'level-1',
      });

      // Forward results to 2.5D Phaser Scene
      gameBridge.emit('CODE_EXECUTED', {
        gameId: 'java-architecture',
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

  if (isLoadingLevels && levels.length === 0) {
    return (
      <div className="min-h-[500px] flex items-center justify-center bg-slate-950 rounded-2xl border border-slate-800 text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-mono">Loading Cloud Architecture Topology from Database...</span>
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
          <ThreeArchitecture level={currentLevelIndex + 1} />
        </div>

        {/* In-Game Interactive Architecture Bar */}
        <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-bold">Cloud Mesh:</span>
            <button
              onClick={() => handleAction('route')}
              disabled={!isOperational}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 disabled:opacity-40 transition-all font-bold"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>gateway.route()</span>
            </button>
            <button
              onClick={() => handleAction('breaker')}
              disabled={!isOperational}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 disabled:opacity-40 transition-all font-bold"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>circuit.tripBreaker()</span>
            </button>
            <button
              onClick={() => handleAction('query')}
              disabled={!isOperational}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 disabled:opacity-40 transition-all font-bold"
            >
              <Database className="w-3.5 h-3.5" />
              <span>db.executeJpaQuery()</span>
            </button>
          </div>

          <span className="text-[11px] text-slate-400">
            {isOperational ? 'Microservice mesh active' : 'Compile Java code to deploy cloud topology'}
          </span>
        </div>
      </div>
    </GameLayout>
  );
};

export default JavaArchitectureGame;
