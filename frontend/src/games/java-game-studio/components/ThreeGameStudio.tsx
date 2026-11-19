import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { gameBridge, GameBridgePayload } from '../../engine/GameBridge';

interface ThreeGameStudioProps {
  level?: number;
  className?: string;
}

export const ThreeGameStudio: React.FC<ThreeGameStudioProps> = ({
  level = 1,
  className = '',
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [score, setScore] = useState(2400);
  const [statusMessage, setStatusMessage] = useState('GAME ENGINE RUNTIME: 60 FPS NOMINAL');

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // --- 1. SCENE & CAMERA ---
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060612);
    scene.fog = new THREE.FogExp2(0x060612, 0.035);

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 500;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(6.0, 5.0, 7.0);

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
    controls.target.set(0, 1.2, 0);

    // --- 3. LIGHTING ---
    const ambientLight = new THREE.AmbientLight(0x18182f, 1.5);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xa855f7, 1.6);
    sunLight.position.set(5, 10, 5);
    sunLight.castShadow = true;
    scene.add(sunLight);

    const arenaLight = new THREE.PointLight(0x06b6d4, 3.5, 9);
    arenaLight.position.set(0, 3.5, 0);
    scene.add(arenaLight);

    // --- 4. CYBER SYNTHWAVE ARENA FLOOR ---
    const arenaSize = 16;
    const floorGeo = new THREE.PlaneGeometry(arenaSize, arenaSize);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x050510,
      roughness: 0.2,
      metalness: 0.8,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    const grid = new THREE.GridHelper(arenaSize, 16, 0xd946ef, 0x3b82f6);
    grid.position.y = 0.02;
    scene.add(grid);

    // Glowing Neon Perimeter Barrier
    const ringGeo = new THREE.TorusGeometry(6.5, 0.08, 16, 48);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xec4899 });
    const barrier = new THREE.Mesh(ringGeo, ringMat);
    barrier.rotation.x = Math.PI / 2;
    barrier.position.y = 0.1;
    scene.add(barrier);

    // --- 5. 3D PIXEL KNIGHT HERO ---
    const hero = new THREE.Group();
    hero.position.set(-1.8, 0, 0);
    scene.add(hero);

    // Body Armor
    const armorMat = new THREE.MeshStandardMaterial({ color: 0x2563eb, metalness: 0.8, roughness: 0.3 });
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9, roughness: 0.2 });

    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.85, 0.45), armorMat);
    torso.position.y = 0.9;
    torso.castShadow = true;

    // Helmet with Visor
    const helmet = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.55, 0.55), armorMat);
    helmet.position.y = 1.6;
    helmet.castShadow = true;

    const visorMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const visor = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.16, 0.1), visorMat);
    visor.position.set(0, 1.6, 0.25);

    // Sword Arm & Golden Blade
    const swordArm = new THREE.Group();
    swordArm.position.set(0.48, 1.1, 0);

    const hilt = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.3, 8), goldMat);
    hilt.position.y = 0.1;

    const bladeGeo = new THREE.BoxGeometry(0.08, 1.1, 0.15);
    const bladeMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, emissive: 0xf59e0b, emissiveIntensity: 0.5, metalness: 0.9 });
    const blade = new THREE.Mesh(bladeGeo, bladeMat);
    blade.position.y = 0.7;
    blade.castShadow = true;

    swordArm.add(hilt, blade);
    hero.add(torso, helmet, visor, swordArm);

    // --- 6. 3D ENEMY SLIME MOB ---
    const slime = new THREE.Group();
    slime.position.set(1.8, 0, 0);
    scene.add(slime);

    const slimeMat = new THREE.MeshPhysicalMaterial({
      color: 0x10b981,
      roughness: 0.15,
      metalness: 0.2,
      transmission: 0.6,
      ior: 1.4,
    });
    const slimeBody = new THREE.Mesh(new THREE.SphereGeometry(0.6, 24, 16), slimeMat);
    slimeBody.scale.set(1.1, 0.8, 1.1);
    slimeBody.position.y = 0.5;
    slimeBody.castShadow = true;

    // Slime Eyes
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const pupilMat = new THREE.MeshBasicMaterial({ color: 0x000000 });

    const sEyeL = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), eyeMat);
    sEyeL.position.set(-0.2, 0.6, 0.5);
    const sPupilL = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 8), pupilMat);
    sPupilL.position.set(-0.2, 0.6, 0.58);

    const sEyeR = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), eyeMat);
    sEyeR.position.set(0.2, 0.6, 0.5);
    const sPupilR = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 8), pupilMat);
    sPupilR.position.set(0.2, 0.6, 0.58);

    slime.add(slimeBody, sEyeL, sPupilL, sEyeR, sPupilR);

    // --- 7. 3D FLOATING POWER COIN ---
    const coin = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.08, 24), goldMat);
    coin.rotation.z = Math.PI / 2;
    coin.position.set(0, 1.8, 0);
    scene.add(coin);

    // --- 8. COMBAT HIT SPARK PARTICLES ---
    const sparkCount = 40;
    const sparkGeo = new THREE.BufferGeometry();
    const sparkPos = new Float32Array(sparkCount * 3);
    const sparkVels: THREE.Vector3[] = [];

    for (let i = 0; i < sparkCount; i++) {
      sparkPos[i * 3] = 0;
      sparkPos[i * 3 + 1] = -100;
      sparkPos[i * 3 + 2] = 0;
      sparkVels.push(new THREE.Vector3());
    }

    sparkGeo.setAttribute('position', new THREE.BufferAttribute(sparkPos, 3));
    const sparkMat = new THREE.PointsMaterial({
      color: 0xfacc15,
      size: 0.12,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
    });
    const sparks = new THREE.Points(sparkGeo, sparkMat);
    scene.add(sparks);

    let isSlashing = false;
    let slashTimer = 0;

    const triggerHeroSlash = () => {
      isSlashing = true;
      slashTimer = 0;
      arenaLight.color.setHex(0xf43f5e);
      arenaLight.intensity = 7;

      setScore(prev => prev + 500);
      setStatusMessage('CRITICAL STRIKE: +500 PTS (AABB Collision Detected)');

      // Emit sparks from slime
      const sPos = sparkGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < sparkCount; i++) {
        sPos[i * 3] = slime.position.x;
        sPos[i * 3 + 1] = 0.6;
        sPos[i * 3 + 2] = slime.position.z;

        sparkVels[i].set(
          (Math.random() - 0.5) * 0.12,
          0.05 + Math.random() * 0.1,
          (Math.random() - 0.5) * 0.12
        );
      }
      sparkGeo.attributes.position.needsUpdate = true;
    };

    const unsubscribe = gameBridge.on('CODE_EXECUTED', (payload: GameBridgePayload) => {
      if (payload.data?.compiled) {
        triggerHeroSlash();
      } else {
        setStatusMessage('ENGINE EXECUTION HALT: JAVAC ERROR');
      }
    });

    // --- 9. RENDER LOOP ---
    const clock = new THREE.Clock();
    let animId: number;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();
      controls.update();

      // Hero idle bounce
      hero.position.y = Math.sin(elapsed * 4) * 0.05;

      // Slime squish & hop
      slimeBody.scale.y = 0.8 + Math.sin(elapsed * 5) * 0.2;
      slime.position.y = Math.max(0, Math.sin(elapsed * 5) * 0.35);

      // Coin spin & bob
      coin.rotation.y += 0.04;
      coin.position.y = 1.8 + Math.sin(elapsed * 3) * 0.15;

      // Hero slash animation
      if (isSlashing) {
        slashTimer += 0.03;
        swordArm.rotation.x = Math.sin(slashTimer * 10) * 1.5;
        hero.position.x = -1.8 + Math.sin(slashTimer * 8) * 0.8;

        const sPos = sparkGeo.attributes.position.array as Float32Array;
        for (let i = 0; i < sparkCount; i++) {
          sPos[i * 3] += sparkVels[i].x;
          sPos[i * 3 + 1] += sparkVels[i].y;
          sPos[i * 3 + 2] += sparkVels[i].z;
        }
        sparkGeo.attributes.position.needsUpdate = true;

        if (slashTimer > 0.8) {
          isSlashing = false;
          swordArm.rotation.x = 0;
          hero.position.x = -1.8;
          arenaLight.color.setHex(0x06b6d4);
          arenaLight.intensity = 3.5;
          for (let i = 0; i < sparkCount; i++) sPos[i * 3 + 1] = -100;
          sparkGeo.attributes.position.needsUpdate = true;
        }
      }

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

      {/* 3D Synthwave HUD */}
      <div className="absolute top-4 left-4 pointer-events-none space-y-1">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-pink-400 animate-ping" />
          <span className="font-mono text-xs font-bold text-pink-400 tracking-wider">
            3D ARCADE STAGE: LEVEL {level}
          </span>
        </div>
        <p className="font-mono text-[11px] text-cyan-300">
          {statusMessage}
        </p>
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-900/90 border border-slate-700/80 backdrop-blur-md px-4 py-2 rounded-xl text-center pointer-events-none shadow-2xl">
        <p className="font-mono text-xs font-bold text-white">
          Pixel Arcade Arena | Physics & ECS Engaged
        </p>
        <p className="font-mono text-[10px] text-amber-300 mt-0.5">
          Score: {score} PTS | Loop: 60 FPS | AABB: Collisions Active
        </p>
      </div>

      <div className="absolute top-4 right-4 bg-slate-900/70 border border-slate-800 backdrop-blur-sm px-2.5 py-1 rounded-lg text-[10px] font-mono text-slate-400 pointer-events-none">
        Rotate 3D: Left Click + Drag | Zoom: Scroll
      </div>
    </div>
  );
};
