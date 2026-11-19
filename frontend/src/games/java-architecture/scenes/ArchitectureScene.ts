import Phaser from 'phaser';
import { gameBridge } from '../../engine/GameBridge';

export class ArchitectureScene extends Phaser.Scene {
  private gatewayNode!: Phaser.GameObjects.Container;
  private userServiceNode!: Phaser.GameObjects.Container;
  private orderServiceNode!: Phaser.GameObjects.Container;
  private dbNode!: Phaser.GameObjects.Container;
  private tpsText!: Phaser.GameObjects.Text;
  private currentLevel: number = 1;
  private deployedServices: number = 4;

  constructor() {
    super({ key: 'ArchitectureScene' });
  }

  create(data: { level?: number }) {
    this.currentLevel = data?.level || 1;
    const { width, height } = this.scale;

    // 1. Enterprise Blueprint Isometric Floor
    this.createBlueprintGrid(width, height);

    // 2. Network Conduits / Pipelines
    this.createNetworkConduits(width, height);

    // 3. Microservice Pods
    this.gatewayNode = this.createServiceNode(width / 2, 130, 'SPRING CLOUD GATEWAY', 0x38bdf8);
    this.userServiceNode = this.createServiceNode(width / 2 - 130, 240, 'USER-SERVICE (8081)', 0x10b981);
    this.orderServiceNode = this.createServiceNode(width / 2 + 130, 240, 'ORDER-SERVICE (8082)', 0xf59e0b);
    this.dbNode = this.createServiceNode(width / 2, 350, 'POSTGRESQL CLUSTER (JPA)', 0xa855f7);

    // 4. HUD
    this.createHUD(width, height);

    // 5. Setup Bridge Events
    this.setupBridgeEvents();

    gameBridge.emit('SCENE_READY', { gameId: 'java-architecture', data: { scene: 'ArchitectureScene', level: this.currentLevel } });
  }

  private createBlueprintGrid(w: number, h: number) {
    const grid = this.add.graphics();
    grid.lineStyle(1, 0x1e3a8a, 0.4);

    for (let x = 0; x <= w; x += 32) {
      grid.moveTo(x, 0);
      grid.lineTo(x, h);
    }
    for (let y = 0; y <= h; y += 32) {
      grid.moveTo(0, y);
      grid.lineTo(w, y);
    }
    grid.strokePath();

    const title = this.add.text(w / 2, 45, 'ENTERPRISE ARCHITECTURE TOPOLOGY', {
      fontFamily: 'monospace',
      fontSize: '11px',
      color: '#60a5fa'
    }).setOrigin(0.5);
  }

  private createNetworkConduits(w: number, h: number) {
    const conduits = this.add.graphics();
    conduits.lineStyle(2, 0x3b82f6, 0.6);

    // Gateway to Users & Orders
    conduits.beginPath();
    conduits.moveTo(w / 2, 130);
    conduits.lineTo(w / 2 - 130, 240);
    conduits.moveTo(w / 2, 130);
    conduits.lineTo(w / 2 + 130, 240);

    // Services to Database
    conduits.moveTo(w / 2 - 130, 240);
    conduits.lineTo(w / 2, 350);
    conduits.moveTo(w / 2 + 130, 240);
    conduits.lineTo(w / 2, 350);
    conduits.strokePath();
  }

  private createServiceNode(x: number, y: number, label: string, color: number): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);

    const shadow = this.add.ellipse(0, 20, 60, 20, 0x000000, 0.4);

    // Isometric Cube / Node
    const node = this.add.rectangle(0, 0, 70, 36, 0x0f172a);
    node.setStrokeStyle(2, color);

    const core = this.add.circle(0, 0, 8, color);

    const text = this.add.text(0, 26, label, {
      fontFamily: 'monospace',
      fontSize: '8px',
      color: '#e2e8f0'
    }).setOrigin(0.5);

    container.add([shadow, node, core, text]);

    // Pulse
    this.tweens.add({
      targets: core,
      scale: 1.4,
      alpha: 0.6,
      duration: 1000,
      yoyo: true,
      repeat: -1
    });

    return container;
  }

  private createHUD(w: number, h: number) {
    const hud = this.add.container(20, 20);

    const bg = this.add.rectangle(130, 35, 260, 70, 0x030712, 0.85);
    bg.setStrokeStyle(1, 0x38bdf8);

    const title = this.add.text(12, 10, `ARCHITECTURE: LVL ${this.currentLevel}`, {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#38bdf8'
    });

    this.tpsText = this.add.text(12, 28, 'Throughput: 1,420 TPS | Latency: 12ms', {
      fontFamily: 'monospace',
      fontSize: '11px',
      color: '#34d399'
    });

    const status = this.add.text(12, 46, 'Cluster: 4 Pods Healthy (SOLID + Spring)', {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: '#93c5fd'
    });

    hud.add([bg, title, this.tpsText, status]);
  }

  public triggerDataFlow() {
    this.cameras.main.flash(250, 56, 189, 248);

    // Spawn animated packet flowing from Gateway to DB
    const packet = this.add.circle(this.scale.width / 2, 130, 6, 0xfacc15);

    this.tweens.add({
      targets: packet,
      x: this.scale.width / 2 - 130,
      y: 240,
      duration: 400,
      onComplete: () => {
        this.tweens.add({
          targets: packet,
          x: this.scale.width / 2,
          y: 350,
          duration: 400,
          onComplete: () => {
            packet.destroy();
            this.tpsText.setText('Throughput: 3,850 TPS | Latency: 4ms');
          }
        });
      }
    });
  }

  private setupBridgeEvents() {
    gameBridge.on('CODE_EXECUTED', (payload: any) => {
      if (payload && payload.data && payload.data.compiled) {
        this.triggerDataFlow();
      }
    });
  }

  destroy() {
    gameBridge.off('CODE_EXECUTED');
  }
}
