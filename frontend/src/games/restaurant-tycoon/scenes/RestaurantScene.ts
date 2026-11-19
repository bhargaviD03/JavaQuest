import Phaser from 'phaser';
import { gameBridge } from '../../engine/GameBridge';

export class RestaurantScene extends Phaser.Scene {
  private chef!: Phaser.GameObjects.Container;
  private tables: Phaser.GameObjects.Container[] = [];
  private stoveParticles!: Phaser.GameObjects.Particles.ParticleEmitter;
  private orderBoardText!: Phaser.GameObjects.Text;
  private revenueText!: Phaser.GameObjects.Text;
  private levelText!: Phaser.GameObjects.Text;
  private currentLevel: number = 1;
  private revenue: number = 0;
  private servedCount: number = 0;

  constructor() {
    super({ key: 'RestaurantScene' });
  }

  create(data: { level?: number }) {
    this.currentLevel = data?.level || 1;
    const { width, height } = this.scale;

    // 1. Isometric Floor Tiles
    this.createIsometricFloor(width, height);

    // 2. Kitchen Counter & Stove
    this.createKitchenCounter(width, height);

    // 3. Dining Tables
    this.createDiningTables(width, height);

    // 4. Chef Sprite Container
    this.createChef(width / 2, height / 2 - 20);

    // 5. HUD Display
    this.createHUD(width, height);

    // 6. Listen to GameBridge events
    this.setupBridgeEvents();

    gameBridge.emit('SCENE_READY', { gameId: 'restaurant-tycoon', data: { scene: 'RestaurantScene', level: this.currentLevel } });
  }

  private createIsometricFloor(w: number, h: number) {
    const graphics = this.add.graphics();
    const tileW = 64;
    const tileH = 32;
    const originX = w / 2;
    const originY = 80;

    for (let r = 0; r < 12; r++) {
      for (let c = 0; c < 12; c++) {
        const x = originX + (c - r) * (tileW / 2);
        const y = originY + (c + r) * (tileH / 2);

        const isAlt = (r + c) % 2 === 0;
        graphics.fillStyle(isAlt ? 0x1e293b : 0x0f172a, 0.95);
        graphics.lineStyle(1, 0x334155, 0.5);

        graphics.beginPath();
        graphics.moveTo(x, y);
        graphics.lineTo(x + tileW / 2, y + tileH / 2);
        graphics.lineTo(x, y + tileH);
        graphics.lineTo(x - tileW / 2, y + tileH / 2);
        graphics.closePath();
        graphics.fillPath();
        graphics.strokePath();
      }
    }
  }

  private createKitchenCounter(w: number, h: number) {
    const counter = this.add.container(w / 2, 140);

    // Countertop
    const bar = this.add.rectangle(0, 0, 340, 48, 0x334155);
    bar.setStrokeStyle(2, 0x64748b);
    
    // Marble top accent
    const topBar = this.add.rectangle(0, -18, 340, 12, 0xe2e8f0);

    // Stoves
    const stove1 = this.add.rectangle(-90, -5, 50, 30, 0x1e293b);
    const stove2 = this.add.rectangle(90, -5, 50, 30, 0x1e293b);
    stove1.setStrokeStyle(1, 0xf59e0b);
    stove2.setStrokeStyle(1, 0xf59e0b);

    // Stove flame particles
    const flameGfx = this.add.graphics();
    flameGfx.fillStyle(0xf97316, 1);
    flameGfx.fillCircle(4, 4, 4);
    flameGfx.generateTexture('flame_particle', 8, 8);
    flameGfx.destroy();

    this.stoveParticles = this.add.particles(w / 2 - 90, 130, 'flame_particle', {
      speed: { min: 10, max: 25 },
      angle: { min: 250, max: 290 },
      scale: { start: 0.8, end: 0 },
      alpha: { start: 0.9, end: 0 },
      lifespan: 500,
      frequency: 120
    });

    const passSign = this.add.text(0, -5, 'HOT PASS & PICKUP', {
      fontFamily: 'monospace',
      fontSize: '11px',
      color: '#38bdf8'
    }).setOrigin(0.5);

    counter.add([bar, topBar, stove1, stove2, passSign]);
  }

  private createDiningTables(w: number, h: number) {
    const tablePositions = [
      { x: w / 2 - 140, y: 260, label: 'Table #1' },
      { x: w / 2 + 140, y: 260, label: 'Table #2' },
      { x: w / 2 - 90, y: 350, label: 'Table #3' },
      { x: w / 2 + 90, y: 350, label: 'Table #4' },
    ];

    tablePositions.forEach((pos, idx) => {
      const table = this.add.container(pos.x, pos.y);

      // Shadow
      const shadow = this.add.ellipse(0, 14, 70, 35, 0x000000, 0.4);

      // Tabletop Isometric
      const tableTop = this.add.ellipse(0, 0, 64, 32, 0xd97706);
      tableTop.setStrokeStyle(2, 0xfef3c7);

      // Cloth
      const cloth = this.add.ellipse(0, -2, 42, 20, 0xffffff);

      // Centerpiece flower
      const flower = this.add.circle(0, -6, 5, 0xec4899);

      // Chairs
      const chairL = this.add.rectangle(-38, 0, 14, 20, 0x92400e);
      const chairR = this.add.rectangle(38, 0, 14, 20, 0x92400e);

      // Number badge
      const tag = this.add.text(0, 22, pos.label, {
        fontFamily: 'monospace',
        fontSize: '10px',
        color: '#94a3b8'
      }).setOrigin(0.5);

      table.add([shadow, chairL, chairR, tableTop, cloth, flower, tag]);
      this.tables.push(table);
    });
  }

  private createChef(x: number, y: number) {
    this.chef = this.add.container(x, y);

    // Shadow
    const shadow = this.add.ellipse(0, 26, 32, 14, 0x000000, 0.45);

    // Body (Apron)
    const body = this.add.rectangle(0, 8, 26, 32, 0xffffff);
    body.setStrokeStyle(1, 0xcbd5e1);

    // Blue necktie
    const tie = this.add.rectangle(0, -3, 8, 8, 0x2563eb);

    // Head
    const head = this.add.circle(0, -12, 12, 0xfcd34d);

    // Chef Toque (Hat)
    const hatBase = this.add.rectangle(0, -25, 20, 10, 0xffffff);
    const hatPuff = this.add.circle(0, -32, 14, 0xffffff);

    // Name tag
    const nameText = this.add.text(0, 35, 'CHEF JAVA', {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: '#38bdf8'
    }).setOrigin(0.5);

    this.chef.add([shadow, body, tie, head, hatBase, hatPuff, nameText]);

    // Breathing / idle bounce
    this.tweens.add({
      targets: this.chef,
      y: y - 4,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  private createHUD(w: number, h: number) {
    const hudContainer = this.add.container(20, 20);

    const bg = this.add.rectangle(130, 35, 260, 70, 0x0f172a, 0.85);
    bg.setStrokeStyle(1, 0x38bdf8);

    this.levelText = this.add.text(12, 10, `RESTAURANT TYCOON: LVL ${this.currentLevel}`, {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#38bdf8'
    });

    this.orderBoardText = this.add.text(12, 28, 'Active Orders: 3 Pending', {
      fontFamily: 'monospace',
      fontSize: '11px',
      color: '#facc15'
    });

    this.revenueText = this.add.text(12, 46, 'Revenue: $184.50 | Rating: 4.8/5.0', {
      fontFamily: 'monospace',
      fontSize: '11px',
      color: '#34d399'
    });

    hudContainer.add([bg, this.levelText, this.orderBoardText, this.revenueText]);
  }

  public animateOrderCooked(dishName: string = 'Truffle Pasta') {
    // Chef dashes to stove, cooks, and presents dish
    this.tweens.add({
      targets: this.chef,
      x: this.scale.width / 2 - 70,
      y: 160,
      duration: 400,
      ease: 'Power2',
      onComplete: () => {
        // Pop dish above chef
        const dish = this.add.text(this.chef.x, this.chef.y - 50, `${dishName}!`, {
          fontFamily: 'sans-serif',
          fontSize: '13px',
          color: '#ffffff',
          backgroundColor: '#059669',
          padding: { x: 6, y: 3 }
        }).setOrigin(0.5);

        this.tweens.add({
          targets: dish,
          y: dish.y - 30,
          alpha: 0,
          duration: 1200,
          onComplete: () => dish.destroy()
        });

        // Return chef
        this.tweens.add({
          targets: this.chef,
          x: this.scale.width / 2,
          y: this.scale.height / 2 - 20,
          delay: 300,
          duration: 500,
          ease: 'Power2'
        });
      }
    });

    this.servedCount++;
    this.revenue += 28.5;
    this.revenueText.setText(`Revenue: $${this.revenue.toFixed(2)} | Rating: 4.9/5.0`);
    this.orderBoardText.setText(`Orders Expedited: ${this.servedCount}`);
  }

  public setLevel(lvl: number) {
    this.currentLevel = lvl;
    if (this.levelText) {
      this.levelText.setText(`RESTAURANT TYCOON: LVL ${this.currentLevel}`);
    }
  }

  private setupBridgeEvents() {
    gameBridge.on('CODE_EXECUTED', (payload: any) => {
      if (payload && payload.data && payload.data.compiled) {
        this.animateOrderCooked();
      }
    });
  }

  destroy() {
    gameBridge.off('CODE_EXECUTED');
  }
}
