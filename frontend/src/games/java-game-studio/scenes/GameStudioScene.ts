import Phaser from 'phaser';
import { gameBridge } from '../../engine/GameBridge';

export class GameStudioScene extends Phaser.Scene {
  private hero!: Phaser.GameObjects.Container;
  private mob!: Phaser.GameObjects.Container;
  private coin!: Phaser.GameObjects.Container;
  private scoreText!: Phaser.GameObjects.Text;
  private fpsText!: Phaser.GameObjects.Text;
  private currentLevel: number = 1;
  private score: number = 2400;

  constructor() {
    super({ key: 'GameStudioScene' });
  }

  create(data: { level?: number }) {
    this.currentLevel = data?.level || 1;
    const { width, height } = this.scale;

    // 1. Cyber Synthwave Studio Grid
    this.createRetroGrid(width, height);

    // 2. Arcade Cabinet Stage Frame
    this.createStageFrame(width, height);

    // 3. Pixel Hero Sprite
    this.createPixelHero(width / 2 - 80, height / 2 + 30);

    // 4. Enemy Mob
    this.createEnemyMob(width / 2 + 100, height / 2 + 30);

    // 5. Floating Power Coin
    this.createCoin(width / 2, height / 2 - 40);

    // 6. HUD
    this.createHUD(width, height);

    // 7. Bridge Listeners
    this.setupBridgeEvents();

    gameBridge.emit('SCENE_READY', { gameId: 'java-game-studio', data: { scene: 'GameStudioScene', level: this.currentLevel } });
  }

  private createRetroGrid(w: number, h: number) {
    const grid = this.add.graphics();
    grid.lineStyle(1, 0x3b82f6, 0.25);

    // Perspective lines
    for (let x = 0; x <= w; x += 35) {
      grid.moveTo(x, 0);
      grid.lineTo(x, h);
    }
    for (let y = 0; y <= h; y += 30) {
      grid.moveTo(0, y);
      grid.lineTo(w, y);
    }
    grid.strokePath();

    // Floor horizon gradient
    const floor = this.add.rectangle(w / 2, h - 60, w, 120, 0x0f172a, 0.85);
    floor.setStrokeStyle(1, 0x8b5cf6);
  }

  private createStageFrame(w: number, h: number) {
    const frame = this.add.container(w / 2, h / 2);

    const border = this.add.rectangle(0, 0, w - 80, h - 80);
    border.setStrokeStyle(2, 0xa855f7, 0.6);

    const title = this.add.text(0, -(h / 2) + 30, 'PIXEL ARCADE RUNTIME', {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#f43f5e'
    }).setOrigin(0.5);

    frame.add([border, title]);
  }

  private createPixelHero(x: number, y: number) {
    this.hero = this.add.container(x, y);

    // Shadow
    const shadow = this.add.ellipse(0, 24, 30, 12, 0x000000, 0.4);

    // Body
    const body = this.add.rectangle(0, 4, 22, 28, 0x3b82f6);
    body.setStrokeStyle(1, 0x60a5fa);

    // Helmet / Visor
    const head = this.add.circle(0, -14, 11, 0x1e293b);
    const visor = this.add.rectangle(2, -14, 12, 6, 0x06b6d4);

    // Golden sword
    const swordHilt = this.add.rectangle(14, 2, 4, 6, 0xd97706);
    const swordBlade = this.add.rectangle(14, -10, 3, 20, 0xfde047);

    const label = this.add.text(0, 34, 'HERO (YOU)', {
      fontFamily: 'monospace',
      fontSize: '9px',
      color: '#38bdf8'
    }).setOrigin(0.5);

    this.hero.add([shadow, body, head, visor, swordHilt, swordBlade, label]);

    // Idle stance bounce
    this.tweens.add({
      targets: this.hero,
      y: y - 5,
      duration: 700,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  private createEnemyMob(x: number, y: number) {
    this.mob = this.add.container(x, y);

    const shadow = this.add.ellipse(0, 20, 26, 10, 0x000000, 0.4);

    // Slime body
    const slime = this.add.circle(0, 4, 16, 0x10b981);
    slime.setStrokeStyle(2, 0x34d399);

    // Cute evil eyes
    const eye1 = this.add.circle(-5, 0, 3, 0xffffff);
    const pupil1 = this.add.circle(-5, 0, 1.5, 0x000000);
    const eye2 = this.add.circle(5, 0, 3, 0xffffff);
    const pupil2 = this.add.circle(5, 0, 1.5, 0x000000);

    const label = this.add.text(0, 28, 'SLIME LV.2', {
      fontFamily: 'monospace',
      fontSize: '8px',
      color: '#34d399'
    }).setOrigin(0.5);

    this.mob.add([shadow, slime, eye1, pupil1, eye2, pupil2, label]);

    // Squish tween
    this.tweens.add({
      targets: slime,
      scaleX: 1.2,
      scaleY: 0.8,
      duration: 600,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  private createCoin(x: number, y: number) {
    this.coin = this.add.container(x, y);

    const glow = this.add.circle(0, 0, 14, 0xf59e0b, 0.3);
    const star = this.add.circle(0, 0, 9, 0xfbbf24);
    star.setStrokeStyle(1, 0xffedd5);

    this.coin.add([glow, star]);

    // Spin / floating rotation
    this.tweens.add({
      targets: star,
      scaleX: 0.1,
      duration: 500,
      yoyo: true,
      repeat: -1
    });

    this.tweens.add({
      targets: this.coin,
      y: y - 8,
      duration: 1200,
      yoyo: true,
      repeat: -1
    });
  }

  private createHUD(w: number, h: number) {
    const hud = this.add.container(20, 20);

    const bg = this.add.rectangle(120, 30, 240, 60, 0x090d16, 0.85);
    bg.setStrokeStyle(1, 0x8b5cf6);

    const title = this.add.text(10, 10, `GAME STUDIO: LVL ${this.currentLevel}`, {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#c084fc'
    });

    this.scoreText = this.add.text(10, 26, `Score: ${this.score} pts | Coins: 12`, {
      fontFamily: 'monospace',
      fontSize: '11px',
      color: '#facc15'
    });

    this.fpsText = this.add.text(10, 42, 'GameLoop: 60 FPS | AABB: Active', {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: '#4ade80'
    });

    hud.add([bg, title, this.scoreText, this.fpsText]);
  }

  public triggerHeroAttack() {
    // Hero dashes forward and slashes
    this.tweens.add({
      targets: this.hero,
      x: this.hero.x + 80,
      duration: 250,
      yoyo: true,
      onYoyo: () => {
        // Mob flashes and gets pushed
        this.cameras.main.shake(150, 0.005);
        this.score += 500;
        this.scoreText.setText(`Score: ${this.score} pts | Coins: 12`);

        const hit = this.add.text(this.mob.x, this.mob.y - 30, 'CRITICAL HIT! +500', {
          fontFamily: 'monospace',
          fontSize: '11px',
          color: '#fbbf24',
          backgroundColor: '#831843',
          padding: { x: 4, y: 2 }
        }).setOrigin(0.5);

        this.tweens.add({
          targets: hit,
          y: hit.y - 25,
          alpha: 0,
          duration: 1000,
          onComplete: () => hit.destroy()
        });
      }
    });
  }

  private setupBridgeEvents() {
    gameBridge.on('CODE_EXECUTED', (payload: any) => {
      if (payload && payload.data && payload.data.compiled) {
        this.triggerHeroAttack();
      }
    });
  }

  destroy() {
    gameBridge.off('CODE_EXECUTED');
  }
}
