import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { gameBridge, GameBridgePayload } from '../../engine/GameBridge';

interface ThreeForensicsProps {
  level?: number;
  className?: string;
}

export const ThreeForensics: React.FC<ThreeForensicsProps> = ({
  level = 1,
  className = '',
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [breachesNeutralized, setBreachesNeutralized] = useState(0);
  const [statusMessage, setStatusMessage] = useState('CIRU INCIDENT MONITOR: MONITORING ACTIVE BREACHES');

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // --- 1. SCENE & CAMERA ---
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020f09);
    scene.fog = new THREE.FogExp2(0x020f09, 0.035);

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 500;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(6.5, 4.5, 7.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    container.appendChild(renderer.domElement);

    // --- 2. CONTROLS ---
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.05;
    controls.minDistance = 3;
    controls.maxDistance = 16;
    controls.target.set(0, 1.4, 0);

    // --- 3. LIGHTING ---
    const ambientLight = new THREE.AmbientLight(0x022c22, 1.6);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0x10b981, 1.5);
    keyLight.position.set(5, 12, 6);
    keyLight.castShadow = true;
    scene.add(keyLight);

    const rackLight = new THREE.PointLight(0xef4444, 3.5, 7);
    rackLight.position.set(-2.2, 2.0, -1.0);
    scene.add(rackLight);

    const termLight = new THREE.PointLight(0x38bdf8, 3, 6);
    termLight.position.set(2.0, 1.5, 0.5);
    scene.add(termLight);

    // --- 4. CYBER MATRIX FLOOR ---
    const floorSize = 16;
    const floorGeo = new THREE.PlaneGeometry(floorSize, floorSize);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x02170e,
      roughness: 0.3,
      metalness: 0.8,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    const grid = new THREE.GridHelper(floorSize, 16, 0x10b981, 0x064e3b);
    grid.position.y = 0.01;
    scene.add(grid);

    // --- 5. 3D HOLOGRAPHIC RADAR SWEEP ---
    const radarGroup = new THREE.Group();
    radarGroup.position.set(0, 0.05, 0);
    scene.add(radarGroup);

    const radarDiscGeo = new THREE.RingGeometry(0.2, 5.0, 48);
    const radarDiscMat = new THREE.MeshBasicMaterial({
      color: 0x059669,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.25,
    });
    const radarDisc = new THREE.Mesh(radarDiscGeo, radarDiscMat);
    radarDisc.rotation.x = -Math.PI / 2;
    radarGroup.add(radarDisc);

    // Rotating Radar Sweep Arm
    const armGeo = new THREE.PlaneGeometry(5.0, 0.15);
    const armMat = new THREE.MeshBasicMaterial({
      color: 0x34d399,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });
    const sweepArm = new THREE.Mesh(armGeo, armMat);
    sweepArm.rotation.x = -Math.PI / 2;
    sweepArm.position.x = 2.5;
    const armPivot = new THREE.Group();
    armPivot.add(sweepArm);
    radarGroup.add(armPivot);

    // --- 6. 3D MAINFRAME SERVER RACKS ---
    const rackGroup = new THREE.Group();
    rackGroup.position.set(-2.2, 0, -1.0);
    scene.add(rackGroup);

    const rackFrameGeo = new THREE.BoxGeometry(1.2, 2.8, 1.0);
    const rackFrameMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.9, roughness: 0.2 });
    const rackFrame = new THREE.Mesh(rackFrameGeo, rackFrameMat);
    rackFrame.position.y = 1.4;
    rackFrame.castShadow = true;
    rackFrame.receiveShadow = true;
    rackGroup.add(rackFrame);

    // Server unit slots & status LEDs
    const bladeGeo = new THREE.BoxGeometry(1.05, 0.24, 0.9);
    const bladeMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.7, roughness: 0.4 });
    const ledGeo = new THREE.SphereGeometry(0.04, 8, 8);
    const redLedMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
    const greenLedMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });

    const leds: THREE.Mesh[] = [];

    for (let y = 0.4; y <= 2.4; y += 0.35) {
      const blade = new THREE.Mesh(bladeGeo, bladeMat);
      blade.position.set(0, y, 0.05);
      rackGroup.add(blade);

      const led = new THREE.Mesh(ledGeo, redLedMat);
      led.position.set(0.42, y, 0.52);
      rackGroup.add(led);
      leds.push(led);
    }

    // --- 7. 3D HOLOGRAPHIC DETECTIVE TERMINAL ---
    const termGroup = new THREE.Group();
    termGroup.position.set(1.8, 0, 0.6);
    termGroup.rotation.y = -0.5;
    scene.add(termGroup);

    const deskGeo = new THREE.BoxGeometry(1.6, 0.8, 0.8);
    const desk = new THREE.Mesh(deskGeo, rackFrameMat);
    desk.position.y = 0.4;
    desk.castShadow = true;
    termGroup.add(desk);

    // Holographic Screen
    const screenGeo = new THREE.PlaneGeometry(1.3, 0.8);
    const screenMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.5,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    });
    const screen = new THREE.Mesh(screenGeo, screenMat);
    screen.position.set(0, 1.25, 0);
    termGroup.add(screen);

    // --- 8. 3D JVM HEAP CYLINDER GAUGE ---
    const heapGroup = new THREE.Group();
    heapGroup.position.set(0, 0, -2.6);
    scene.add(heapGroup);

    const cylinderGlassGeo = new THREE.CylinderGeometry(0.5, 0.5, 2.0, 24, 1, true);
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x10b981,
      transparent: true,
      opacity: 0.3,
      roughness: 0.1,
      metalness: 0.2,
      transmission: 0.7,
    });
    const cylinderGlass = new THREE.Mesh(cylinderGlassGeo, glassMat);
    cylinderGlass.position.y = 1.0;
    heapGroup.add(cylinderGlass);

    // Heap Liquid inside
    const liquidGeo = new THREE.CylinderGeometry(0.45, 0.45, 1.6, 24);
    const liquidMat = new THREE.MeshStandardMaterial({
      color: 0x059669,
      emissive: 0x047857,
      emissiveIntensity: 0.6,
      transparent: true,
      opacity: 0.85,
    });
    const liquid = new THREE.Mesh(liquidGeo, liquidMat);
    liquid.position.y = 0.8;
    heapGroup.add(liquid);

    // --- 9. EVENT LISTENERS ---
    const triggerRemediation = () => {
      setBreachesNeutralized(prev => prev + 1);
      setStatusMessage('VULNERABILITY INTERCEPTED & PATCHED: Memory Freed');

      rackLight.color.setHex(0x10b981);
      leds.forEach(l => (l.material = greenLedMat));

      // Purge liquid level (simulate GC)
      liquid.scale.y = 0.3;
      liquid.position.y = 0.2;
    };

    const unsubscribe = gameBridge.on('CODE_EXECUTED', (payload: GameBridgePayload) => {
      if (payload.data?.compiled) {
        triggerRemediation();
      } else {
        setStatusMessage('INCIDENT ACTIVE: Root Cause Unresolved');
        rackLight.color.setHex(0xef4444);
        leds.forEach(l => (l.material = redLedMat));
        liquid.scale.y = 1.0;
        liquid.position.y = 0.8;
      }
    });

    // --- 10. RENDER LOOP ---
    const clock = new THREE.Clock();
    let animId: number;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();
      controls.update();

      // Radar sweep
      armPivot.rotation.y = -elapsed * 1.5;

      // Screen flicker
      screen.material.opacity = 0.4 + Math.sin(elapsed * 8) * 0.15;

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      unsubscribe();
      renderer.dispose();
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className={`relative w-full h-full min-h-[460px] bg-slate-950 rounded-2xl overflow-hidden select-none ${className}`}>
      <div ref={mountRef} className="w-full h-full min-h-[460px] cursor-grab active:cursor-grabbing" />

      {/* 3D Cyber HUD */}
      <div className="absolute top-4 left-4 pointer-events-none space-y-1">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="font-mono text-xs font-bold text-emerald-400 tracking-wider">
            3D CIRU TACTICAL MAINFRAME: CASE FILE #{level}
          </span>
        </div>
        <p className="font-mono text-[11px] text-amber-300">
          {statusMessage}
        </p>
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-900/90 border border-slate-700/80 backdrop-blur-md px-4 py-2 rounded-xl text-center pointer-events-none shadow-2xl">
        <p className="font-mono text-xs font-bold text-white">
          Cyber Incident Response Unit | Live Diagnostics
        </p>
        <p className="font-mono text-[10px] text-emerald-300 mt-0.5">
          Neutralized Breaches: {breachesNeutralized} | JVM Heap: Protected | Thread Dumps: Normal
        </p>
      </div>

      <div className="absolute top-4 right-4 bg-slate-900/70 border border-slate-800 backdrop-blur-sm px-2.5 py-1 rounded-lg text-[10px] font-mono text-slate-400 pointer-events-none">
        Rotate 3D: Left Click + Drag | Zoom: Scroll
      </div>
    </div>
  );
};
