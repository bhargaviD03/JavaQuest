import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { gameBridge, GameBridgePayload } from '../../engine/GameBridge';

interface ThreeSpaceColonyProps {
  level?: number;
  className?: string;
}

export const ThreeSpaceColony: React.FC<ThreeSpaceColonyProps> = ({
  level = 1,
  className = '',
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [o2Level, setO2Level] = useState(99);
  const [powerMW, setPowerMW] = useState(380);
  const [statusMessage, setStatusMessage] = useState('ARES OUTPOST TELEMETRY: NOMINAL');

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // --- 1. SCENE & CAMERA ---
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060814);
    scene.fog = new THREE.FogExp2(0x060814, 0.03);

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 500;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(7.5, 6.0, 8.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    container.appendChild(renderer.domElement);

    // --- 2. CONTROLS ---
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.05;
    controls.minDistance = 3;
    controls.maxDistance = 18;
    controls.target.set(0, 1.2, 0);

    // --- 3. LIGHTING ---
    const ambientLight = new THREE.AmbientLight(0x1e1b4b, 1.2);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfed7aa, 1.6);
    sunLight.position.set(10, 15, 8);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    scene.add(sunLight);

    const domeLight = new THREE.PointLight(0x06b6d4, 3.5, 8);
    domeLight.position.set(0, 1.8, 0);
    scene.add(domeLight);

    const reactorLight = new THREE.PointLight(0xa855f7, 3, 6);
    reactorLight.position.set(2.8, 1.2, -2.5);
    scene.add(reactorLight);

    // --- 4. MARTIAN RED SURFACE & STARFIELD ---
    // Stars
    const starCount = 300;
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      starPos[i * 3] = (Math.random() - 0.5) * 60;
      starPos[i * 3 + 1] = 10 + Math.random() * 30;
      starPos[i * 3 + 2] = (Math.random() - 0.5) * 60;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.15 });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    // Mars Red Terrain
    const marsSize = 22;
    const marsGeo = new THREE.PlaneGeometry(marsSize, marsSize, 32, 32);
    const pos = marsGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const vx = pos.getX(i);
      const vy = pos.getY(i);
      pos.setZ(i, Math.sin(vx * 0.4) * 0.25 + Math.cos(vy * 0.4) * 0.25);
    }
    marsGeo.computeVertexNormals();

    const marsMat = new THREE.MeshStandardMaterial({
      color: 0x9a3412,
      roughness: 0.85,
      metalness: 0.15,
    });
    const mars = new THREE.Mesh(marsGeo, marsMat);
    mars.rotation.x = -Math.PI / 2;
    mars.receiveShadow = true;
    scene.add(mars);

    // Grid accent
    const grid = new THREE.GridHelper(marsSize, 22, 0xe11d48, 0x431407);
    grid.position.y = 0.05;
    scene.add(grid);

    // --- 5. ARES BIOSPHERE DOME ---
    const domeGroup = new THREE.Group();
    domeGroup.position.set(0, 0.1, 0);
    scene.add(domeGroup);

    // Foundation Ring
    const baseGeo = new THREE.CylinderGeometry(2.3, 2.5, 0.35, 32);
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.2 });
    const domeBase = new THREE.Mesh(baseGeo, baseMat);
    domeBase.position.y = 0.175;
    domeBase.castShadow = true;
    domeBase.receiveShadow = true;
    domeGroup.add(domeBase);

    // Hydroponics Grass Floor inside
    const greenFloorGeo = new THREE.CylinderGeometry(2.1, 2.1, 0.05, 32);
    const greenMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.6 });
    const greenFloor = new THREE.Mesh(greenFloorGeo, greenMat);
    greenFloor.position.y = 0.37;
    domeGroup.add(greenFloor);

    // Geodesic Glass Dome
    const glassGeo = new THREE.SphereGeometry(2.2, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.32,
      roughness: 0.05,
      metalness: 0.1,
      transmission: 0.65,
      ior: 1.45,
    });
    const domeGlass = new THREE.Mesh(glassGeo, glassMat);
    domeGlass.position.y = 0.36;
    domeGroup.add(domeGlass);

    // Central Command Mast
    const mastGeo = new THREE.CylinderGeometry(0.04, 0.08, 3.2, 8);
    const mast = new THREE.Mesh(mastGeo, baseMat);
    mast.position.y = 1.6;
    domeGroup.add(mast);

    const beaconGeo = new THREE.SphereGeometry(0.16, 16, 16);
    const beaconMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4 });
    const beacon = new THREE.Mesh(beaconGeo, beaconMat);
    beacon.position.y = 3.2;
    domeGroup.add(beacon);

    // --- 6. DUAL SOLAR PANEL ARRAYS ---
    const solarGroup = new THREE.Group();
    solarGroup.position.set(-3.2, 0.1, 1.5);
    scene.add(solarGroup);

    const poleGeo = new THREE.CylinderGeometry(0.08, 0.08, 1.2, 8);
    const pole = new THREE.Mesh(poleGeo, baseMat);
    pole.position.y = 0.6;
    solarGroup.add(pole);

    const panelGeo = new THREE.BoxGeometry(2.2, 0.06, 1.2);
    const panelMat = new THREE.MeshStandardMaterial({ color: 0x1d4ed8, metalness: 0.9, roughness: 0.1 });
    const panel = new THREE.Mesh(panelGeo, panelMat);
    panel.position.y = 1.2;
    panel.rotation.x = 0.4;
    panel.castShadow = true;
    solarGroup.add(panel);

    // --- 7. FUSION REACTOR SUBSTATION ---
    const reactorGroup = new THREE.Group();
    reactorGroup.position.set(2.8, 0.1, -2.5);
    scene.add(reactorGroup);

    const reactorBase = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.2, 0.4, 16), baseMat);
    reactorBase.position.y = 0.2;
    reactorBase.castShadow = true;

    const coreGeo = new THREE.TorusGeometry(0.6, 0.12, 16, 32);
    const coreMat = new THREE.MeshBasicMaterial({ color: 0xa855f7 });
    const coreRing = new THREE.Mesh(coreGeo, coreMat);
    coreRing.position.y = 0.8;
    coreRing.rotation.x = Math.PI / 2;

    reactorGroup.add(reactorBase, coreRing);

    // --- 8. 3D AUTONOMOUS MARTIAN ROVER ---
    const rover = new THREE.Group();
    rover.position.set(0, 0.3, 3.2);
    scene.add(rover);

    // Chassis
    const chassisGeo = new THREE.BoxGeometry(1.1, 0.35, 0.8);
    const chassisMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, metalness: 0.6, roughness: 0.3 });
    const chassis = new THREE.Mesh(chassisGeo, chassisMat);
    chassis.position.y = 0.25;
    chassis.castShadow = true;
    rover.add(chassis);

    // Wheels (6 wheels)
    const wheelGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.12, 16);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.8 });

    [-0.45, 0, 0.45].forEach((wx) => {
      [-0.45, 0.45].forEach((wz) => {
        const wheel = new THREE.Mesh(wheelGeo, wheelMat);
        wheel.rotation.z = Math.PI / 2;
        wheel.position.set(wx, 0.18, wz);
        wheel.castShadow = true;
        rover.add(wheel);
      });
    });

    // Sensor mast
    const rMastGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.5, 8);
    const rMast = new THREE.Mesh(rMastGeo, baseMat);
    rMast.position.set(0.35, 0.65, 0);

    const camGeo = new THREE.BoxGeometry(0.14, 0.1, 0.14);
    const camMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
    const cam = new THREE.Mesh(camGeo, camMat);
    cam.position.set(0.35, 0.9, 0);

    rover.add(rMast, cam);

    // --- 9. EVENT LISTENERS ---
    const triggerSurge = () => {
      domeLight.intensity = 8;
      reactorLight.intensity = 8;
      setPowerMW(prev => prev + 50);
      setStatusMessage('POWER SURGE ENGAGED: Multi-threaded generation nominal');
      setTimeout(() => {
        domeLight.intensity = 3.5;
        reactorLight.intensity = 3;
      }, 700);
    };

    const unsubscribe = gameBridge.on('CODE_EXECUTED', (payload: GameBridgePayload) => {
      if (payload.data?.compiled) {
        triggerSurge();
      } else {
        setStatusMessage('COLONY TELEMETRY ALERT: Java Process Error');
      }
    });

    // --- 10. RENDER LOOP ---
    const clock = new THREE.Clock();
    let animId: number;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();
      controls.update();

      // Beacon Pulse
      beacon.scale.setScalar(1 + Math.sin(elapsed * 4) * 0.2);

      // Solar tracking
      panel.rotation.y = Math.sin(elapsed * 0.5) * 0.3;

      // Reactor plasma spin
      coreRing.rotation.z += 0.03;
      coreRing.scale.setScalar(1 + Math.sin(elapsed * 6) * 0.1);

      // Rover patrol loop
      const roverAngle = elapsed * 0.35;
      rover.position.x = Math.cos(roverAngle) * 3.8;
      rover.position.z = Math.sin(roverAngle) * 3.8;
      rover.rotation.y = -roverAngle + Math.PI / 2;

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

      {/* 3D Telemetry HUD */}
      <div className="absolute top-4 left-4 pointer-events-none space-y-1">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span className="font-mono text-xs font-bold text-cyan-400 tracking-wider">
            3D MARS HABITAT: SECTOR {level}
          </span>
        </div>
        <p className="font-mono text-[11px] text-amber-300">
          {statusMessage}
        </p>
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-900/90 border border-slate-700/80 backdrop-blur-md px-4 py-2 rounded-xl text-center pointer-events-none shadow-2xl">
        <p className="font-mono text-xs font-bold text-white">
          Ares Station Alpha | Full Life Support
        </p>
        <p className="font-mono text-[10px] text-cyan-300 mt-0.5">
          Atmosphere O2: {o2Level}% | Power Output: {powerMW} MW | Rover: Active Patrol
        </p>
      </div>

      <div className="absolute top-4 right-4 bg-slate-900/70 border border-slate-800 backdrop-blur-sm px-2.5 py-1 rounded-lg text-[10px] font-mono text-slate-400 pointer-events-none">
        Rotate 3D: Left Click + Drag | Zoom: Scroll
      </div>
    </div>
  );
};
