import Phaser from 'phaser';
import { gameBridge } from '../../engine/GameBridge';

export class SpaceColonyScene extends Phaser.Scene {
  private dome!: Phaser.GameObjects.Container;
  private rover!: Phaser.GameObjects.Container;
  private reactorCore!: Phaser.GameObjects.Arc;
  private o2Text!: Phaser.GameObjects.Text;
  private powerText!: Phaser.GameObjects.Text;
  private currentLevel: number = 1;
  private o2Level: number = 98;
  private powerMW: number = 320;

  constructor() {
    super({ key: 'SpaceColonyScene' });
  }

  create(data: { level?: number }) {
    this.currentLevel = data?.level || 1;
    const { width, height } = this.scale;

    // 1. Martian Surface (Red isometric terrain with stars)
    this.createMartianTerrain(width, height);

    // 2. Solar Array & Power Converters
    this.createSolarArrays(width, height);

    // 3. Central Biosphere Dome
    this.createBiosphereDome(width / 2, height / 2 - 10);

    // 4. Fusion Reactor Substation
    this.createFusionReactor(width / 2 + 150, height / 2 + 60);

    // 5. Autonomous Martian Rover
    this.createRover(width / 2 - 120, height / 2 + 80);

    // 6. HUD Telemetry
    this.createHUD(width, height);

    // 7. Event listeners
    this.setupBridgeEvents();

    gameBridge.emit('SCENE_READY', { gameId: 'space-colony', data: { scene: 'SpaceColonyScene', level: this.currentLevel } });
  }

  private createMartianTerrain(w: number, h: number) {
    // Starfield in deep space upper backdrop
    const stars = this.add.graphics();
    stars.fillStyle(0xffffff, 0.7);
    for (let i = 0; i < 40; i++) {
      stars.fillCircle(Phaser.Math.Between(10, w - 10), Phaser.Math.Between(10, 120), Phaser.Math.FloatBetween(0.5, 1.8));
    }

    // Mars Red Surface Grid
    const terrain = this.add.graphics();
    const tileW = 70;
    const tileH = 35;
    const originX = w / 2;
    const originY = 90;

    for (let r = 0; r < 10; r++) {
      for (let c = 0; c < 10; c++) {
        const x = originX + (c - r) * (tileW / 2);
        const y = originY + (c + r) * (tileH / 2);

        const isAlt = (r + c) % 2 === 0;
        terrain.fillStyle(isAlt ? 0x7c2d12 : 0x451a03, 0.9);
        terrain.lineStyle(1, 0x9a3412, 0.4);

        terrain.beginPath();
        terrain.moveTo(x, y);
        terrain.lineTo(x + tileW / 2, y + tileH / 2);
        terrain.lineTo(x, y + tileH);
        terrain.lineTo(x - tileW / 2, y + tileH / 2);
        terrain.closePath();
        terrain.fillPath();
        terrain.strokePath();
      }
    }
  }

  private createBiosphereDome(x: number, y: number) {
    this.dome = this.add.container(x, y);

    // Outer foundation ring
    const ring = this.add.ellipse(0, 30, 180, 70, 0x334155);
    ring.setStrokeStyle(3, 0x38bdf8);

    // Glass dome
    const glass = this.add.arc(0, 20, 75, 180, 360, false, 0x0284c7, 0.35);
    glass.setStrokeStyle(2, 0x7dd3fc);

    // Internal hydroponic greenery
    const green = this.add.ellipse(0, 25, 110, 40, 0x15803d, 0.8);

    // Central command antenna
    const mast = this.add.rectangle(0, -50, 4, 30, 0xe2e8f0);
    const beacon = this.add.circle(0, -65, 5, 0x38bdf8);

    // Beacon pulse
    this.tweens.add({
      targets: beacon,
      scale: 1.5,
      alpha: 0.4,
      duration: 800,
      yoyo: true,
      repeat: -1
    });

    const label = this.add.text(0, 45, 'ARES BIOSPHERE DOME', {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: '#38bdf8'
    }).setOrigin(0.5);

    this.dome.add([ring, green, glass, mast, beacon, label]);
  }

  private createSolarArrays(w: number, h: number) {
    const array = this.add.container(w / 2 - 150, 170);

    // Stand
    const pole = this.add.rectangle(0, 15, 6, 30, 0x64748b);

    // Panel bank
    const panel = this.add.rectangle(0, 0, 70, 24, 0x1d4ed8);
    panel.setStrokeStyle(1, 0x93c5fd);

    const txt = this.add.text(0, 28, 'SOLAR 200kW', {
      fontFamily: 'monospace',
      fontSize: '9px',
      color: '#60a5fa'
    }).setOrigin(0.5);

    array.add([pole, panel, txt]);

    // Solar tracking animation
    this.tweens.add({
      targets: panel,
      angle: 12,
      duration: 3000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  private createFusionReactor(x: number, y: number) {
    const reactor = this.add.container(x, y);

    const base = this.add.ellipse(0, 18, 90, 40, 0x0f172a);
    base.setStrokeStyle(2, 0xec4899);

    this.reactorCore = this.add.circle(0, 0, 18, 0xa855f7);
    this.reactorCore.setStrokeStyle(3, 0xf43f5e);

    const tag = this.add.text(0, 32, 'FUSION CORE (ACTIVE)', {
      fontFamily: 'monospace',
      fontSize: '9px',
      color: '#c084fc'
    }).setOrigin(0.5);

    reactor.add([base, this.reactorCore, tag]);

    // Core energy pulsing
    this.tweens.add({
      targets: this.reactorCore,
      scale: 1.3,
      alpha: 0.7,
      duration: 600,
      yoyo: true,
      repeat: -1
    });
  }

  private createRover(x: number, y: number) {
    this.rover = this.add.container(x, y);

    // Wheels
    const w1 = this.add.circle(-14, 10, 6, 0x334155);
    const w2 = this.add.circle(14, 10, 6, 0x334155);
    const w3 = this.add.circle(0, 12, 6, 0x1e293b);

    // Chassis
    const chassis = this.add.rectangle(0, 0, 38, 16, 0xf8fafc);
    chassis.setStrokeStyle(1, 0x0284c7);

    // Sensor mast
    const mast = this.add.rectangle(8, -12, 3, 12, 0x94a3b8);
    const camera = this.add.circle(8, -18, 4, 0xef4444);

    const name = this.add.text(0, 22, 'ROVER-IV', {
      fontFamily: 'monospace',
      fontSize: '8px',
      color: '#f8fafc'
    }).setOrigin(0.5);

    this.rover.add([w1, w2, w3, chassis, mast, camera, name]);

    // Patrol movement tween
    this.tweens.add({
      targets: this.rover,
      x: x + 60,
      duration: 3500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  private createHUD(w: number, h: number) {
    const hud = this.add.container(20, 20);

    const bg = this.add.rectangle(130, 35, 260, 70, 0x090d16, 0.85);
    bg.setStrokeStyle(1, 0x0284c7);

    const title = this.add.text(12, 10, `ARES COLONY: LEVEL ${this.currentLevel}`, {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#38bdf8'
    });

    this.o2Text = this.add.text(12, 28, `Atmosphere O2: ${this.o2Level}% (Nominal)`, {
      fontFamily: 'monospace',
      fontSize: '11px',
      color: '#34d399'
    });

    this.powerText = this.add.text(12, 46, `Power Output: ${this.powerMW} MW | Defenses: Active`, {
      fontFamily: 'monospace',
      fontSize: '11px',
      color: '#facc15'
    });

    hud.add([bg, title, this.o2Text, this.powerText]);
  }

  public triggerEnergySurge() {
    this.cameras.main.flash(400, 2, 132, 199);
    this.powerMW += 50;
    this.powerText.setText(`Power Output: ${this.powerMW} MW | Defenses: Active`);

    // Rover sprint
    this.tweens.add({
      targets: this.rover,
      scale: 1.2,
      duration: 300,
      yoyo: true
    });
  }

  private setupBridgeEvents() {
    gameBridge.on('CODE_EXECUTED', (payload: any) => {
      if (payload && payload.data && payload.data.compiled) {
        this.triggerEnergySurge();
      }
    });
  }

  destroy() {
    gameBridge.off('CODE_EXECUTED');
  }
}
