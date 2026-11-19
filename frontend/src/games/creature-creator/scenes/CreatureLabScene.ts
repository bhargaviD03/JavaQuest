import Phaser from 'phaser';
import { gameBridge, GameBridgePayload } from '../../engine/GameBridge';

export class CreatureLabScene extends Phaser.Scene {
  private creatureSprite?: Phaser.GameObjects.Text;
  private chamberRing?: Phaser.GameObjects.Arc;
  private nameText?: Phaser.GameObjects.Text;
  private statsText?: Phaser.GameObjects.Text;
  private statusText?: Phaser.GameObjects.Text;
  private particleEmitter?: any;
  private unsubscribeBridge?: () => void;

  private creatureEnergy: number = 100;
  private isHatched: boolean = false;

  constructor() {
    super({ key: 'CreatureLabScene' });
  }

  create() {
    const { width, height } = this.scale;

    // 1. Draw 2.5D Isometric Laboratory Grid Background
    const bgGraphics = this.add.graphics();
    bgGraphics.fillStyle(0x020617, 1);
    bgGraphics.fillRect(0, 0, width, height);

    // Grid lines for 2.5D depth
    bgGraphics.lineStyle(1, 0x1e293b, 0.4);
    for (let x = 0; x < width; x += 40) {
      bgGraphics.moveTo(x, 0);
      bgGraphics.lineTo(x, height);
    }
    for (let y = 0; y < height; y += 40) {
      bgGraphics.moveTo(0, y);
      bgGraphics.lineTo(width, y);
    }
    bgGraphics.strokePath();

    // 2. Draw Incubation Chamber Platform (Isometric Oval)
    const centerX = width / 2;
    const centerY = height / 2 + 20;

    // Outer glow ring
    this.chamberRing = this.add.circle(centerX, centerY, 120, 0x064e3b, 0.4);
    this.chamberRing.setStrokeStyle(3, 0x10b981, 0.8);

    // Inner platform base
    const platform = this.add.ellipse(centerX, centerY + 50, 180, 70, 0x0f172a, 0.9);
    platform.setStrokeStyle(2, 0x38bdf8, 0.6);

    // 3. Ambient Room Lighting & Lab Tech
    this.add.text(24, 20, 'BIOMETRIC LAB: CHAMBER ALPHA-1', {
      fontFamily: 'Fira Code, monospace',
      fontSize: '13px',
      color: '#34d399',
    });

    this.statusText = this.add.text(24, 40, 'AWAITING JAVA CLASS COMPILATION', {
      fontFamily: 'Fira Code, monospace',
      fontSize: '11px',
      color: '#fbbf24',
    });

    // 4. Creature Sprite Entity (starts as unhatched energy egg)
    this.creatureSprite = this.add.text(centerX, centerY - 10, '[EGG]', {
      fontSize: '64px',
    });
    this.creatureSprite.setOrigin(0.5, 0.5);

    // 5. Creature Biometric Stats HUD
    this.nameText = this.add.text(centerX, centerY + 100, 'Uninstantiated Blueprint', {
      fontFamily: 'Fira Code, monospace',
      fontSize: '14px',
      fontStyle: 'bold',
      color: '#ffffff',
    }).setOrigin(0.5, 0.5);

    this.statsText = this.add.text(centerX, centerY + 124, 'HP: -- | Energy: -- | Species: null', {
      fontFamily: 'Fira Code, monospace',
      fontSize: '11px',
      color: '#94a3b8',
    }).setOrigin(0.5, 0.5);

    // 6. Connect to GameBridge for Live Code Execution
    this.unsubscribeBridge = gameBridge.on('CODE_EXECUTED', (payload: GameBridgePayload) => {
      this.handleCodeExecuted(payload.data);
    });

    const unsubscribeAction = gameBridge.on('CREATURE_ACTION', (payload: GameBridgePayload) => {
      this.handleCreatureAction(payload.data?.action);
    });

    this.events.once('shutdown', () => {
      this.unsubscribeBridge?.();
      unsubscribeAction();
    });
  }

  update() {
    // Subtle rotation of energy ring for 2.5D atmosphere
    if (this.chamberRing) {
      this.chamberRing.rotation += 0.005;
    }
  }

  private handleCodeExecuted(data: any) {
    if (data?.compiled) {
      this.hatchCreature(data);
    } else {
      this.triggerCompilationErrorVisuals(data?.errors);
    }
  }

  private hatchCreature(data: any) {
    this.isHatched = true;
    this.creatureEnergy = 100;

    // Animate incubator flash
    this.tweens.add({
      targets: this.chamberRing,
      scaleX: 1.25,
      scaleY: 1.25,
      duration: 300,
      yoyo: true,
      ease: 'Back.easeOut',
    });

    // Transform sprite to living Dragon
    if (this.creatureSprite) {
      this.creatureSprite.setText('[DRAGON]');
      this.tweens.add({
        targets: this.creatureSprite,
        y: this.creatureSprite.y - 15,
        duration: 400,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    }

    // Update biometric telemetry
    if (this.statusText) {
      this.statusText.setText('OBJECT INSTANTIATED & OPERATIONAL');
      this.statusText.setColor('#10b981');
    }

    if (this.nameText) {
      this.nameText.setText('IgnisDragon @0x7FA2 (Live Heap Instance)');
      this.nameText.setColor('#34d399');
    }

    if (this.statsText) {
      this.statsText.setText(`HP: 250 | Energy: ${this.creatureEnergy} | Species: Dragon`);
      this.statsText.setColor('#38bdf8');
    }

    // Camera subtle flash
    this.cameras.main.flash(400, 16, 185, 129, false);
  }

  private triggerCompilationErrorVisuals(errors?: string) {
    if (this.statusText) {
      this.statusText.setText('COMPILATION FAILED: JAVAC REJECTED CODE');
      this.statusText.setColor('#f43f5e');
    }

    // Camera red shake
    this.cameras.main.shake(300, 0.01);
  }

  public handleCreatureAction(action: string) {
    if (!this.isHatched || !this.creatureSprite) return;

    if (action === 'attack') {
      if (this.creatureEnergy >= 20) {
        this.creatureEnergy -= 20;
        this.updateStatsDisplay();

        // Animate plasma strike
        this.tweens.add({
          targets: this.creatureSprite,
          scaleX: 1.3,
          scaleY: 1.3,
          angle: 15,
          duration: 150,
          yoyo: true,
          ease: 'Power2',
        });

        // Floating damage text
        const dmgText = this.add.text(
          this.creatureSprite.x + 40,
          this.creatureSprite.y - 30,
          '50 PLASMA DMG!',
          { fontFamily: 'Fira Code, monospace', fontSize: '13px', color: '#f43f5e', fontStyle: 'bold' }
        );
        this.tweens.add({
          targets: dmgText,
          y: dmgText.y - 40,
          alpha: 0,
          duration: 900,
          onComplete: () => dmgText.destroy(),
        });
      }
    } else if (action === 'eat') {
      this.creatureEnergy = Math.min(150, this.creatureEnergy + 30);
      this.updateStatsDisplay();

      const healText = this.add.text(
        this.creatureSprite.x,
        this.creatureSprite.y - 40,
        '+30 ENERGY',
        { fontFamily: 'Fira Code, monospace', fontSize: '12px', color: '#10b981', fontStyle: 'bold' }
      );
      this.tweens.add({
        targets: healText,
        y: healText.y - 30,
        alpha: 0,
        duration: 800,
        onComplete: () => healText.destroy(),
      });
    } else if (action === 'sleep') {
      this.creatureEnergy = 100;
      this.updateStatsDisplay();

      const sleepText = this.add.text(
        this.creatureSprite.x,
        this.creatureSprite.y - 40,
        'RESTORED 100% ENERGY',
        { fontFamily: 'Fira Code, monospace', fontSize: '12px', color: '#38bdf8', fontStyle: 'bold' }
      );
      this.tweens.add({
        targets: sleepText,
        y: sleepText.y - 30,
        alpha: 0,
        duration: 800,
        onComplete: () => sleepText.destroy(),
      });
    }
  }

  private updateStatsDisplay() {
    if (this.statsText) {
      this.statsText.setText(`HP: 250 | Energy: ${this.creatureEnergy} | Species: Dragon`);
    }
  }
}
