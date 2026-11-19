import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Swords, Utensils, Moon } from 'lucide-react';
import { GAME_REGISTRY } from '../engine/GameRegistry';
import { GameLayout, LevelDefinition } from '../components/GameLayout';
import { ThreeCreatureLab } from './components/ThreeCreatureLab';
import { gameBridge } from '../engine/GameBridge';
import { api } from '../../services/api';
import { gameService } from '../../services/gameService';
import { ExecutionResult } from '../components/MonacoJavaEditor';
import { CREATURE_CREATOR_LEVELS } from './config/levels';

export const CreatureCreatorGame: React.FC = () => {
  const [levels, setLevels] = useState<LevelDefinition[]>(CREATURE_CREATOR_LEVELS);
  const [isLoadingLevels, setIsLoadingLevels] = useState(false);
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [isHatched, setIsHatched] = useState(false);
  const gameMeta = GAME_REGISTRY['creature-creator'];

  useEffect(() => {
    async function loadLevels() {
      try {
        const dbLevels = await gameService.getGameLevels('creature-creator');
        if (dbLevels && dbLevels.length > 0) {
          setLevels(dbLevels.map(gameService.formatLevel));
        }
      } catch (err) {
        console.warn('Failed to load levels from database, retaining local blueprints', err);
      } finally {
        setIsLoadingLevels(false);
      }
    }
    loadLevels();
  }, []);

  const handleExecuteCode = async (code: string): Promise<ExecutionResult> => {
    try {
      const currentLevel = levels[currentLevelIndex];
      const res = await api.executeJava({
        code,
        class_name: 'Creature',
        game_id: 'creature-creator',
        level_id: currentLevel ? `level-${currentLevel.levelNumber}` : 'level-1',
      });

      // Forward results to 2.5D Phaser Scene
      gameBridge.emit('CODE_EXECUTED', {
        gameId: 'creature-creator',
        data: {
          compiled: res.compiled,
          output: res.output,
          errors: res.errors,
          testResults: res.test_results,
        },
      });

      if (res.compiled) {
        setIsHatched(true);
        confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
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

  const handleAction = (action: string) => {
    gameBridge.emit('CREATURE_ACTION', {
      gameId: 'creature-creator',
      data: { action },
    });
  };

  if (isLoadingLevels && levels.length === 0) {
    return (
      <div className="min-h-[500px] flex items-center justify-center bg-slate-950 rounded-2xl border border-slate-800 text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-mono">Loading Chamber Blueprints from Database...</span>
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
        {/* Full 3D Interactive WebGL Three.js World */}
        <div className="flex-1 min-h-[460px] rounded-2xl overflow-hidden shadow-2xl relative border border-slate-800">
          <ThreeCreatureLab level={currentLevelIndex + 1} />
        </div>

        {/* In-Game Interactive Habitat Controls Bar */}
        <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-bold">In-World Abilities:</span>
            <button
              onClick={() => handleAction('attack')}
              disabled={!isHatched}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 disabled:opacity-40 transition-all font-bold"
            >
              <Swords className="w-3.5 h-3.5" />
              <span>creature.attack()</span>
            </button>
            <button
              onClick={() => handleAction('eat')}
              disabled={!isHatched}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 disabled:opacity-40 transition-all font-bold"
            >
              <Utensils className="w-3.5 h-3.5" />
              <span>creature.eat()</span>
            </button>
            <button
              onClick={() => handleAction('sleep')}
              disabled={!isHatched}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 disabled:opacity-40 transition-all font-bold"
            >
              <Moon className="w-3.5 h-3.5" />
              <span>creature.sleep()</span>
            </button>
          </div>

          <span className="text-[11px] text-slate-400">
            {isHatched ? 'Creature is active in habitat' : 'Compile Java code to hatch creature'}
          </span>
        </div>
      </div>
    </GameLayout>
  );
};
