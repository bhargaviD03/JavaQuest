import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { gameBridge, GameBridgePayload } from '../../engine/GameBridge';

interface ThreeCreatureLabProps {
  level?: number;
  className?: string;
}

export const ThreeCreatureLab: React.FC<ThreeCreatureLabProps> = ({
  level = 1,
  className = '',
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [statusMessage, setStatusMessage] = useState('AWAITING JAVA CLASS COMPILATION');
  const [creatureState, setCreatureState] = useState<'blueprint' | 'hatched'>('blueprint');
  const [stats, setStats] = useState({ hp: '--', energy: '--', species: 'null' });

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // --- 1. SCENE, CAMERA, RENDERER ---
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x030712);
    scene.fog = new THREE.FogExp2(0x030712, 0.035);

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 500;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(5.5, 4.0, 6.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    container.appendChild(renderer.domElement);

    // --- 2. ORBIT CONTROLS ---
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.05;
    controls.minDistance = 3;
    controls.maxDistance = 14;
    controls.target.set(0, 1.4, 0);

    // --- 3. LIGHTING ---
    const ambientLight = new THREE.AmbientLight(0x0f172a, 1.6);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0x38bdf8, 1.4);
    keyLight.position.set(6, 12, 5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    scene.add(keyLight);

    const podLight = new THREE.PointLight(0x10b981, 4.5, 9);
    podLight.position.set(0, 1.6, 0);
    scene.add(podLight);

    const rimLight = new THREE.PointLight(0xa855f7, 2.5, 7);
    rimLight.position.set(-4, 3, -3);
    scene.add(rimLight);

    // --- 4. ENVIRONMENT & LAB FLOOR ---
    const floorGeo = new THREE.PlaneGeometry(30, 30);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x060913,
      roughness: 0.35,
      metalness: 0.85,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    const gridHelper = new THREE.GridHelper(30, 30, 0x10b981, 0x1e293b);
    gridHelper.position.y = 0.01;
    scene.add(gridHelper);

    // Lab Pylons
    const pylonPositions = [[-3, -3], [3, -3], [-3, 3], [3, 3]];
    const pylonGeo = new THREE.CylinderGeometry(0.12, 0.18, 2.5, 8);
    const pylonMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.9, roughness: 0.2 });
    const pylonGlowMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });

    pylonPositions.forEach(([px, pz]) => {
      const pylon = new THREE.Mesh(pylonGeo, pylonMat);
      pylon.position.set(px, 1.25, pz);
      pylon.castShadow = true;
      scene.add(pylon);

      const cap = new THREE.Mesh(new THREE.SphereGeometry(0.2, 16, 16), pylonGlowMat);
      cap.position.set(px, 2.6, pz);
      scene.add(cap);
    });

    // --- 5. INCUBATION CHAMBER POD ---
    const podGroup = new THREE.Group();
    scene.add(podGroup);

    // Metallic Base
    const baseGeo = new THREE.CylinderGeometry(1.8, 2.1, 0.45, 12);
    const metalMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.85,
      roughness: 0.25,
    });
    const base = new THREE.Mesh(baseGeo, metalMat);
    base.position.y = 0.225;
    base.receiveShadow = true;
    base.castShadow = true;
    podGroup.add(base);

    // Glowing Base Rings
    const ringGeo = new THREE.TorusGeometry(1.6, 0.05, 16, 32);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
    const emitterRing = new THREE.Mesh(ringGeo, ringMat);
    emitterRing.rotation.x = Math.PI / 2;
    emitterRing.position.y = 0.46;
    podGroup.add(emitterRing);

    // Top Metal Seal
    const topCapGeo = new THREE.CylinderGeometry(1.6, 1.7, 0.3, 16);
    const topCap = new THREE.Mesh(topCapGeo, metalMat);
    topCap.position.y = 3.2;
    topCap.castShadow = true;
    podGroup.add(topCap);

    // Physical Glass Cylinder
    const glassGeo = new THREE.CylinderGeometry(1.5, 1.5, 2.6, 32, 1, true);
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x06b6d4,
      transparent: true,
      opacity: 0.22,
      roughness: 0.05,
      metalness: 0.1,
      transmission: 0.7,
      ior: 1.45,
    });
    const glass = new THREE.Mesh(glassGeo, glassMat);
    glass.position.y = 1.8;
    podGroup.add(glass);

    // Bubbles
    const bubbleCount = 50;
    const bubbleGeo = new THREE.BufferGeometry();
    const bubblePositions = new Float32Array(bubbleCount * 3);
    const bubbleSpeeds = new Float32Array(bubbleCount);

    for (let i = 0; i < bubbleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * 1.0;
      bubblePositions[i * 3] = Math.cos(angle) * radius;
      bubblePositions[i * 3 + 1] = 0.6 + Math.random() * 2.2;
      bubblePositions[i * 3 + 2] = Math.sin(angle) * radius;
      bubbleSpeeds[i] = 0.008 + Math.random() * 0.015;
    }

    bubbleGeo.setAttribute('position', new THREE.BufferAttribute(bubblePositions, 3));
    const bubbleMat = new THREE.PointsMaterial({
      color: 0x67e8f9,
      size: 0.06,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
    });
    const bubbles = new THREE.Points(bubbleGeo, bubbleMat);
    podGroup.add(bubbles);

    // --- 6. HOLOGRAPHIC BLUEPRINT (Awaiting Compilation) ---
    const hologramGroup = new THREE.Group();
    hologramGroup.position.set(0, 1.8, 0);
    scene.add(hologramGroup);

    // Gyroscope coordinate rings
    const gyroRingGeo = new THREE.TorusGeometry(1.0, 0.015, 16, 48);
    const holoWireMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      wireframe: true,
      transparent: true,
      opacity: 0.75,
    });

    const gyro1 = new THREE.Mesh(gyroRingGeo, holoWireMat);
    const gyro2 = new THREE.Mesh(gyroRingGeo, holoWireMat);
    gyro2.rotation.x = Math.PI / 2;
    const gyro3 = new THREE.Mesh(gyroRingGeo, holoWireMat);
    gyro3.rotation.y = Math.PI / 2;
    hologramGroup.add(gyro1, gyro2, gyro3);

    // Holographic Embryo Core
    const eggGeo = new THREE.SphereGeometry(0.5, 24, 24);
    eggGeo.scale(1, 1.35, 1);
    const eggMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      wireframe: true,
      emissive: 0x0369a1,
      emissiveIntensity: 0.85,
      transparent: true,
      opacity: 0.75,
    });
    const holoEgg = new THREE.Mesh(eggGeo, eggMat);
    hologramGroup.add(holoEgg);

    // Laser Scan Plane
    const scanPlaneGeo = new THREE.RingGeometry(0.05, 1.3, 32);
    const scanPlaneMat = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.55,
      blending: THREE.AdditiveBlending,
    });
    const scanPlane = new THREE.Mesh(scanPlaneGeo, scanPlaneMat);
    scanPlane.rotation.x = Math.PI / 2;
    hologramGroup.add(scanPlane);

    // --- 7. LOAD GENUINE 3D STANFORD DRAGON GLTF MODEL ---
    const dragonGroup = new THREE.Group();
    dragonGroup.position.set(0, 0.9, 0);
    dragonGroup.visible = false;
    scene.add(dragonGroup);

    let dragonModel: THREE.Object3D | null = null;
    const loader = new GLTFLoader();

    loader.load(
      '/models/dragon.glb',
      (gltf) => {
        dragonModel = gltf.scene;

        // Scale and center the dragon inside the pod
        dragonModel.scale.set(0.12, 0.12, 0.12);
        dragonModel.position.set(0, 0.5, 0);

        // Apply shimmering emerald/obsidian dragon scales material
        const dragonMat = new THREE.MeshStandardMaterial({
          color: 0x059669,
          roughness: 0.28,
          metalness: 0.85,
          emissive: 0x064e3b,
          emissiveIntensity: 0.35,
        });

        dragonModel.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.material = dragonMat;
            mesh.castShadow = true;
            mesh.receiveShadow = true;
          }
        });

        dragonGroup.add(dragonModel);
      },
      undefined,
      (err) => {
        console.warn('Could not load dragon.glb, using procedural fallback', err);
      }
    );

    // Glowing Eyes on Dragon
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
    const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), eyeMat);
    eyeL.position.set(-0.15, 1.6, 0.55);
    const eyeR = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), eyeMat);
    eyeR.position.set(0.15, 1.6, 0.55);
    dragonGroup.add(eyeL, eyeR);

    // --- 8. 3D FIRE BREATH PARTICLES ---
    const fireCount = 70;
    const fireGeo = new THREE.BufferGeometry();
    const firePositions = new Float32Array(fireCount * 3);
    const fireVels: THREE.Vector3[] = [];

    for (let i = 0; i < fireCount; i++) {
      firePositions[i * 3] = 0;
      firePositions[i * 3 + 1] = -100;
      firePositions[i * 3 + 2] = 0;
      fireVels.push(new THREE.Vector3());
    }

    fireGeo.setAttribute('position', new THREE.BufferAttribute(firePositions, 3));
    const fireMat = new THREE.PointsMaterial({
      color: 0xf97316,
      size: 0.15,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
    });
    const fireParticles = new THREE.Points(fireGeo, fireMat);
    scene.add(fireParticles);

    let isAttacking = false;
    let attackTimer = 0;

    const triggerAttackFX = () => {
      isAttacking = true;
      attackTimer = 0;
      podLight.color.setHex(0xf43f5e);
      podLight.intensity = 9;

      const positions = fireGeo.attributes.position.array as Float32Array;
      const mouthPos = new THREE.Vector3(0, 1.9, 0.6);

      for (let i = 0; i < fireCount; i++) {
        positions[i * 3] = mouthPos.x;
        positions[i * 3 + 1] = mouthPos.y;
        positions[i * 3 + 2] = mouthPos.z;

        fireVels[i].set(
          (Math.random() - 0.5) * 0.08,
          (Math.random() - 0.2) * 0.06,
          0.1 + Math.random() * 0.1
        );
      }
      fireGeo.attributes.position.needsUpdate = true;
    };

    // --- 9. GAMEBRIDGE EVENT HANDLING ---
    const unsubscribeCode = gameBridge.on('CODE_EXECUTED', (payload: GameBridgePayload) => {
      if (payload.data?.compiled) {
        hologramGroup.visible = false;
        dragonGroup.visible = true;
        setCreatureState('hatched');
        setStatusMessage('OBJECT INSTANTIATED & OPERATIONAL');
        setStats({ hp: '250', energy: '100', species: 'IgnisDragon' });

        podLight.color.setHex(0x10b981);
        podLight.intensity = 10;
        setTimeout(() => { podLight.intensity = 4.5; }, 600);
      } else {
        setStatusMessage('COMPILATION ERROR: JAVAC REJECTED CODE');
        podLight.color.setHex(0xef4444);
        podLight.intensity = 6;
      }
    });

    const unsubscribeAction = gameBridge.on('CREATURE_ACTION', (payload: GameBridgePayload) => {
      const action = payload.data?.action;
      if (action === 'attack') {
        triggerAttackFX();
        setStats(prev => ({ ...prev, energy: String(Math.max(0, parseInt(prev.energy) - 20)) }));
      } else if (action === 'eat') {
        podLight.color.setHex(0x34d399);
        podLight.intensity = 7;
        setStats(prev => ({ ...prev, energy: String(Math.min(150, parseInt(prev.energy) + 30)) }));
        setTimeout(() => { podLight.intensity = 4.5; }, 500);
      } else if (action === 'sleep') {
        podLight.color.setHex(0x38bdf8);
        setStats(prev => ({ ...prev, energy: '100' }));
      }
    });

    // --- 10. ANIMATION RENDER LOOP ---
    let scanY = -0.6;
    let scanDir = 1;
    const clock = new THREE.Clock();
    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      controls.update();

      // Animate Stasis Bubbles
      const bPos = bubbleGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < bubbleCount; i++) {
        bPos[i * 3 + 1] += bubbleSpeeds[i];
        if (bPos[i * 3 + 1] > 3.1) {
          bPos[i * 3 + 1] = 0.5;
        }
      }
      bubbleGeo.attributes.position.needsUpdate = true;

      // Animate Blueprint Hologram
      if (hologramGroup.visible) {
        gyro1.rotation.x += 0.015;
        gyro1.rotation.y += 0.01;
        gyro2.rotation.y += 0.02;
        gyro3.rotation.z += 0.012;

        holoEgg.rotation.y += 0.01;
        const pulse = 1 + Math.sin(elapsedTime * 3) * 0.05;
        holoEgg.scale.set(pulse, pulse * 1.35, pulse);

        scanY += 0.012 * scanDir;
        if (scanY > 0.7) scanDir = -1;
        if (scanY < -0.7) scanDir = 1;
        scanPlane.position.y = scanY;
      }

      // Animate Living Dragon
      if (dragonGroup.visible) {
        // Floating hover
        dragonGroup.position.y = 0.9 + Math.sin(elapsedTime * 2.2) * 0.08;

        // Subtle breathing rotation
        if (dragonModel) {
          dragonModel.rotation.y = Math.sin(elapsedTime * 0.8) * 0.25;
        }
      }

      // Animate Attack Fire Stream
      if (isAttacking) {
        attackTimer += 0.02;
        const fPos = fireGeo.attributes.position.array as Float32Array;

        for (let i = 0; i < fireCount; i++) {
          fPos[i * 3] += fireVels[i].x;
          fPos[i * 3 + 1] += fireVels[i].y;
          fPos[i * 3 + 2] += fireVels[i].z;
        }
        fireGeo.attributes.position.needsUpdate = true;

        if (attackTimer > 0.9) {
          isAttacking = false;
          podLight.color.setHex(0x10b981);
          podLight.intensity = 4.5;
          for (let i = 0; i < fireCount; i++) {
            fPos[i * 3 + 1] = -100;
          }
          fireGeo.attributes.position.needsUpdate = true;
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    // Resize
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
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      unsubscribeCode();
      unsubscribeAction();
      renderer.dispose();
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className={`relative w-full h-full min-h-[460px] bg-slate-950 rounded-2xl overflow-hidden select-none ${className}`}>
      {/* 3D Three.js WebGL Canvas Mount */}
      <div ref={mountRef} className="w-full h-full min-h-[460px] cursor-grab active:cursor-grabbing" />

      {/* Floating 3D HUD Diagnostics */}
      <div className="absolute top-4 left-4 pointer-events-none space-y-1">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="font-mono text-xs font-bold text-emerald-400 tracking-wider">
            3D WEBGL LAB: CHAMBER ALPHA-1
          </span>
        </div>
        <p className="font-mono text-[11px] text-amber-300">
          {statusMessage}
        </p>
      </div>

      {/* Bottom Telemetry HUD */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-900/90 border border-slate-700/80 backdrop-blur-md px-4 py-2 rounded-xl text-center pointer-events-none shadow-2xl">
        <p className="font-mono text-xs font-bold text-white">
          {creatureState === 'hatched' ? 'IgnisDragon @0x7FA2 (Live Heap Instance)' : 'Uninstantiated Class Blueprint'}
        </p>
        <p className="font-mono text-[10px] text-cyan-400 mt-0.5">
          HP: {stats.hp} | Energy: {stats.energy} | Species: {stats.species}
        </p>
      </div>

      {/* Interactive Orbit Help Tip */}
      <div className="absolute top-4 right-4 bg-slate-900/70 border border-slate-800 backdrop-blur-sm px-2.5 py-1 rounded-lg text-[10px] font-mono text-slate-400 pointer-events-none">
        Rotate 3D: Left Click + Drag | Zoom: Scroll
      </div>
    </div>
  );
};
