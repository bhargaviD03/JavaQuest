import Phaser from 'phaser';
import { gameBridge } from '../../engine/GameBridge';

export class ForensicsScene extends Phaser.Scene {
  private serverRack!: Phaser.GameObjects.Container;
  private radarArm!: Phaser.GameObjects.Line;
  private heapMeter!: Phaser.GameObjects.Rectangle;
  private statusText!: Phaser.GameObjects.Text;
  private currentLevel: number = 1;
  private breachesNeutralized: number = 0;

  constructor() {
    super({ key: 'ForensicsScene' });
  }

  create(data: { level?: number }) {
    this.currentLevel = data?.level || 1;
    const { width, height } = this.scale;

    // 1. Dark Cyber Grid & Radar
    this.createCyberGrid(width, height);

    // 2. Mainframe Server Racks
    this.createServerRack(width / 2 - 100, height / 2 - 20);

    // 3. Holographic Forensic Display Terminal
    this.createTerminalStation(width / 2 + 100, height / 2 + 20);

    // 4. Memory Heap Gauge
    this.createHeapGauge(width / 2, height - 70);

    // 5. HUD
    this.createHUD(width, height);

    // 6. Listen for code execution
    this.setupBridgeEvents();

    gameBridge.emit('SCENE_READY', { gameId: 'java-forensics', data: { scene: 'ForensicsScene', level: this.currentLevel } });
  }

  private createCyberGrid(w: number, h: number) {
    const grid = this.add.graphics();
    grid.lineStyle(1, 0x064e3b, 0.4);

    for (let x = 0; x <= w; x += 30) {
      grid.moveTo(x, 0);
      grid.lineTo(x, h);
    }
    for (let y = 0; y <= h; y += 30) {
      grid.moveTo(0, y);
      grid.lineTo(w, y);
    }
    grid.strokePath();

    // Radar circular sweep
    const radarCenter = this.add.circle(w / 2, h / 2 - 30, 90);
    radarCenter.setStrokeStyle(1, 0x10b981, 0.3);

    const radarInner = this.add.circle(w / 2, h / 2 - 30, 45);
    radarInner.setStrokeStyle(1, 0x10b981, 0.2);

    this.radarArm = this.add.line(w / 2, h / 2 - 30, 0, 0, 90, 0, 0x34d399, 0.7);

    this.tweens.add({
      targets: this.radarArm,
      angle: 360,
      duration: 4000,
      repeat: -1,
      ease: 'Linear'
    });
  }

  private createServerRack(x: number, y: number) {
    this.serverRack = this.add.container(x, y);

    // Shadow
    const shadow = this.add.ellipse(0, 70, 70, 20, 0x000000, 0.5);

    // Rack Tower
    const tower = this.add.rectangle(0, 0, 60, 130, 0x0f172a);
    tower.setStrokeStyle(2, 0x10b981);

    // Server units & LEDs
    const lights: Phaser.GameObjects.Arc[] = [];
    for (let i = -50; i <= 50; i += 20) {
      const slot = this.add.rectangle(0, i, 52, 14, 0x1e293b);
      slot.setStrokeStyle(1, 0x334155);

      const led = this.add.circle(18, i, 3, 0xef4444); // red alarm led
      lights.push(led);

      this.serverRack.add([slot, led]);
    }

    const tag = this.add.text(0, 78, 'CORPO_SERVER_01', {
      fontFamily: 'monospace',
      fontSize: '8px',
      color: '#10b981'
    }).setOrigin(0.5);

    this.serverRack.add([shadow, tower, tag]);

    // Blinking lights
    this.time.addEvent({
      delay: 500,
      loop: true,
      callback: () => {
        lights.forEach(l => {
          l.setAlpha(l.alpha === 1 ? 0.3 : 1);
        });
      }
    });
  }

  private createTerminalStation(x: number, y: number) {
    const station = this.add.container(x, y);

    const desk = this.add.rectangle(0, 30, 90, 24, 0x1e293b);
    desk.setStrokeStyle(1, 0x38bdf8);

    const screen = this.add.rectangle(0, -5, 70, 45, 0x0284c7, 0.3);
    screen.setStrokeStyle(2, 0x38bdf8);

    const terminalText = this.add.text(0, -5, 'ANALYZING\\nSTACK TRACE\\n[DEBUGGING]', {
      fontFamily: 'monospace',
      fontSize: '8px',
      color: '#7dd3fc',
      align: 'center'
    }).setOrigin(0.5);

    station.add([desk, screen, terminalText]);

    this.tweens.add({
      targets: screen,
      alpha: 0.5,
      duration: 1000,
      yoyo: true,
      repeat: -1
    });
  }

  private createHeapGauge(x: number, y: number) {
    const gauge = this.add.container(x, y);

    const label = this.add.text(0, -18, 'JVM HEAP ALLOCATION MONITOR', {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: '#34d399'
    }).setOrigin(0.5);

    const barBg = this.add.rectangle(0, 0, 220, 16, 0x064e3b);
    barBg.setStrokeStyle(1, 0x059669);

    this.heapMeter = this.add.rectangle(-110, 0, 140, 14, 0x10b981).setOrigin(0, 0.5);

    gauge.add([label, barBg, this.heapMeter]);
  }

  private createHUD(w: number, h: number) {
    const hud = this.add.container(20, 20);

    const bg = this.add.rectangle(130, 35, 260, 70, 0x032115, 0.85);
    bg.setStrokeStyle(1, 0x10b981);

    const title = this.add.text(12, 10, `FORENSICS CIRU: LVL ${this.currentLevel}`, {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#10b981'
    });

    this.statusText = this.add.text(12, 28, 'Breaches Neutralized: 0', {
      fontFamily: 'monospace',
      fontSize: '11px',
      color: '#facc15'
    });

    const sub = this.add.text(12, 46, 'Audit: Jvm Inspector Online', {
      fontFamily: 'monospace',
      fontSize: '11px',
      color: '#38bdf8'
    });

    hud.add([bg, title, this.statusText, sub]);
  }

  public resolveIncident() {
    this.cameras.main.flash(300, 16, 185, 129);
    this.breachesNeutralized++;
    this.statusText.setText(`Breaches Neutralized: ${this.breachesNeutralized} (RESOLVED)`);

    // Shrink heap meter (garbage collected)
    this.tweens.add({
      targets: this.heapMeter,
      width: 60,
      duration: 600,
      ease: 'Power2'
    });

    const banner = this.add.text(this.scale.width / 2, this.scale.height / 2 - 90, 'VULNERABILITY PATCHED', {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#ffffff',
      backgroundColor: '#059669',
      padding: { x: 8, y: 4 }
    }).setOrigin(0.5);

    this.tweens.add({
      targets: banner,
      y: banner.y - 30,
      alpha: 0,
      duration: 1500,
      onComplete: () => banner.destroy()
    });
  }

  private setupBridgeEvents() {
    gameBridge.on('CODE_EXECUTED', (payload: any) => {
      if (payload && payload.data && payload.data.compiled) {
        this.resolveIncident();
      }
    });
  }

  destroy() {
    gameBridge.off('CODE_EXECUTED');
  }
}
