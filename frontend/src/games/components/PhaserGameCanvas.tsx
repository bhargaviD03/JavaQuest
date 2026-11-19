import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { gameBridge } from '../engine/GameBridge';

interface PhaserGameCanvasProps {
  gameId: string;
  createScene: () => Phaser.Scene;
  width?: number | string;
  height?: number | string;
}

export const PhaserGameCanvas: React.FC<PhaserGameCanvasProps> = ({
  gameId,
  createScene,
  width = '100%',
  height = '100%',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clean up any existing game instance first
    if (gameRef.current) {
      gameRef.current.destroy(true);
      gameRef.current = null;
    }

    const sceneInstance = createScene();

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      parent: containerRef.current,
      width: 800,
      height: 500,
      backgroundColor: '#020617',
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { x: 0, y: 0 },
          debug: false,
        },
      },
      scene: [sceneInstance],
    };

    const game = new Phaser.Game(config);
    gameRef.current = game;

    // Broadcast that the scene is ready
    game.events.once('ready', () => {
      gameBridge.emit('SCENE_READY', {
        gameId,
        data: { scene: sceneInstance },
      });
    });

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, [gameId]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full min-h-[480px] rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl relative flex items-center justify-center"
      style={{ width, height }}
    />
  );
};
