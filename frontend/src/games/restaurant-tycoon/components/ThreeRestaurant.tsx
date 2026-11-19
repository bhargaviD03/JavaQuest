import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { gameBridge, GameBridgePayload } from '../../engine/GameBridge';

interface ThreeRestaurantProps {
  level?: number;
  className?: string;
}

export const ThreeRestaurant: React.FC<ThreeRestaurantProps> = ({
  level = 1,
  className = '',
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [revenue, setRevenue] = useState(184.5);
  const [ordersServed, setOrdersServed] = useState(3);
  const [statusMessage, setStatusMessage] = useState('KITCHEN PREP READY - SERVICE OPEN');

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // --- 1. SCENE, CAMERA, RENDERER ---
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0f1d);
    scene.fog = new THREE.FogExp2(0x0a0f1d, 0.04);

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 500;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(6.5, 5.5, 7.5);

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
    controls.maxDistance = 15;
    controls.target.set(0, 1.0, 0);

    // --- 3. LIGHTING ---
    const ambientLight = new THREE.AmbientLight(0xfff7ed, 1.4);
    scene.add(ambientLight);

    const chandelierLight = new THREE.PointLight(0xfef08a, 2.5, 10);
    chandelierLight.position.set(0, 4, 0);
    chandelierLight.castShadow = true;
    scene.add(chandelierLight);

    const stoveLight = new THREE.PointLight(0xf97316, 3, 6);
    stoveLight.position.set(0, 1.5, -2.5);
    scene.add(stoveLight);

    // --- 4. CHECKERBOARD DINING FLOOR ---
    const floorSize = 14;
    const floorGeo = new THREE.PlaneGeometry(floorSize, floorSize);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.3,
      metalness: 0.2,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    const grid = new THREE.GridHelper(floorSize, 14, 0xd97706, 0x334155);
    grid.position.y = 0.01;
    scene.add(grid);

    // --- 5. KITCHEN PASS COUNTER & STOVES ---
    const counterGroup = new THREE.Group();
    counterGroup.position.set(0, 0.6, -2.6);
    scene.add(counterGroup);

    // Stainless steel counter
    const counterGeo = new THREE.BoxGeometry(5.0, 1.2, 1.1);
    const steelMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.85, roughness: 0.2 });
    const counterMesh = new THREE.Mesh(counterGeo, steelMat);
    counterMesh.castShadow = true;
    counterMesh.receiveShadow = true;
    counterGroup.add(counterMesh);

    // Marble pass top
    const passTopGeo = new THREE.BoxGeometry(5.2, 0.1, 1.2);
    const marbleMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.1, metalness: 0.1 });
    const passTop = new THREE.Mesh(passTopGeo, marbleMat);
    passTop.position.y = 0.65;
    passTop.castShadow = true;
    counterGroup.add(passTop);

    // Two Stoves on Counter
    const stoveGeo = new THREE.BoxGeometry(0.9, 0.12, 0.7);
    const burnerMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.9, roughness: 0.3 });

    const stove1 = new THREE.Mesh(stoveGeo, burnerMat);
    stove1.position.set(-1.4, 0.72, 0);
    const stove2 = new THREE.Mesh(stoveGeo, burnerMat);
    stove2.position.set(1.4, 0.72, 0);
    counterGroup.add(stove1, stove2);

    // Sizzling pans
    const panGeo = new THREE.CylinderGeometry(0.3, 0.25, 0.1, 16);
    const panMat = new THREE.MeshStandardMaterial({ color: 0x18181b, metalness: 0.9, roughness: 0.2 });
    const pan1 = new THREE.Mesh(panGeo, panMat);
    pan1.position.set(-1.4, 0.82, 0);
    const pan2 = new THREE.Mesh(panGeo, panMat);
    pan2.position.set(1.4, 0.82, 0);
    counterGroup.add(pan1, pan2);

    // --- 6. STOVE FLAME PARTICLES ---
    const flameCount = 40;
    const flameGeo = new THREE.BufferGeometry();
    const flamePositions = new Float32Array(flameCount * 3);
    const flameSpeeds = new Float32Array(flameCount);

    for (let i = 0; i < flameCount; i++) {
      const isStove1 = i % 2 === 0;
      flamePositions[i * 3] = isStove1 ? -1.4 + (Math.random() - 0.5) * 0.3 : 1.4 + (Math.random() - 0.5) * 0.3;
      flamePositions[i * 3 + 1] = 0.9 + Math.random() * 0.4;
      flamePositions[i * 3 + 2] = (Math.random() - 0.5) * 0.3;
      flameSpeeds[i] = 0.01 + Math.random() * 0.02;
    }

    flameGeo.setAttribute('position', new THREE.BufferAttribute(flamePositions, 3));
    const flameMat = new THREE.PointsMaterial({
      color: 0xf97316,
      size: 0.09,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });
    const flameParticles = new THREE.Points(flameGeo, flameMat);
    counterGroup.add(flameParticles);

    // --- 7. 3D DINING TABLES & CHAIRS ---
    const tablePositions = [
      { x: -2.0, z: 0.8, num: 1 },
      { x: 2.0, z: 0.8, num: 2 },
      { x: -1.4, z: 2.8, num: 3 },
      { x: 1.4, z: 2.8, num: 4 },
    ];

    const woodMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.4, metalness: 0.1 });
    const clothMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.6 });

    tablePositions.forEach((pos) => {
      const tableGroup = new THREE.Group();
      tableGroup.position.set(pos.x, 0, pos.z);

      // Tabletop & pedestal
      const topGeo = new THREE.CylinderGeometry(0.85, 0.85, 0.08, 24);
      const top = new THREE.Mesh(topGeo, woodMat);
      top.position.y = 0.85;
      top.castShadow = true;
      top.receiveShadow = true;

      const clothGeo = new THREE.CylinderGeometry(0.65, 0.65, 0.09, 24);
      const cloth = new THREE.Mesh(clothGeo, clothMat);
      cloth.position.y = 0.86;

      const legGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.85, 8);
      const leg = new THREE.Mesh(legGeo, woodMat);
      leg.position.y = 0.425;
      leg.castShadow = true;

      // Candle Centerpiece
      const candleGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.2, 8);
      const candleMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
      const candle = new THREE.Mesh(candleGeo, candleMat);
      candle.position.y = 0.98;

      const flameLight = new THREE.PointLight(0xf59e0b, 0.8, 2);
      flameLight.position.y = 1.1;

      tableGroup.add(top, cloth, leg, candle, flameLight);

      // 2 Chairs per table
      [-0.9, 0.9].forEach((cx) => {
        const chair = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.5, 0.35), woodMat);
        chair.position.set(cx, 0.25, 0);
        chair.castShadow = true;
        tableGroup.add(chair);
      });

      scene.add(tableGroup);
    });

    // --- 8. CHEF JAVA 3D SPRITE/CHARACTER ---
    const chef = new THREE.Group();
    chef.position.set(0, 0, -1.6);
    scene.add(chef);

    // Chef Apron / Body
    const bodyGeo = new THREE.CylinderGeometry(0.3, 0.38, 0.9, 16);
    const apronMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });
    const chefBody = new THREE.Mesh(bodyGeo, apronMat);
    chefBody.position.y = 0.85;
    chefBody.castShadow = true;

    // Head
    const headGeo = new THREE.SphereGeometry(0.22, 16, 16);
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xfcd34d, roughness: 0.5 });
    const chefHead = new THREE.Mesh(headGeo, skinMat);
    chefHead.position.y = 1.45;

    // Toque Hat
    const hatBaseGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.15, 16);
    const hatBase = new THREE.Mesh(hatBaseGeo, apronMat);
    hatBase.position.y = 1.62;

    const hatPuffGeo = new THREE.SphereGeometry(0.28, 16, 16);
    const hatPuff = new THREE.Mesh(hatPuffGeo, apronMat);
    hatPuff.position.y = 1.82;

    chef.add(chefBody, chefHead, hatBase, hatPuff);

    // --- 9. ANIMATED FLOATING SPECIAL DISH (Spawned on cook) ---
    const dishGroup = new THREE.Group();
    dishGroup.position.set(0, 2.2, -1.8);
    dishGroup.visible = false;
    scene.add(dishGroup);

    const plateGeo = new THREE.CylinderGeometry(0.35, 0.25, 0.05, 16);
    const plateMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const plate = new THREE.Mesh(plateGeo, plateMat);

    const foodGeo = new THREE.DodecahedronGeometry(0.18);
    const foodMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.3 });
    const food = new THREE.Mesh(foodGeo, foodMat);
    food.position.y = 0.12;

    dishGroup.add(plate, food);

    let isCookingAnimation = false;
    let cookTimer = 0;

    const triggerCookFX = (dishName = 'Truffle Rigatoni') => {
      isCookingAnimation = true;
      cookTimer = 0;
      dishGroup.visible = true;
      dishGroup.position.set(0, 1.8, -1.8);

      stoveLight.intensity = 8;
      stoveLight.color.setHex(0x10b981);

      setOrdersServed(prev => prev + 1);
      setRevenue(prev => Math.round((prev + 28.5) * 100) / 100);
      setStatusMessage(`EXPEDITED: ${dishName} served (+ $28.50)`);
    };

    // --- 10. GAMEBRIDGE EVENTS ---
    const unsubscribeCode = gameBridge.on('CODE_EXECUTED', (payload: GameBridgePayload) => {
      if (payload.data?.compiled) {
        triggerCookFX();
      } else {
        setStatusMessage('KITCHEN HALT: Java Compiler Error');
        stoveLight.color.setHex(0xef4444);
      }
    });

    // --- 11. RENDER LOOP ---
    const clock = new THREE.Clock();
    let animId: number;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();
      controls.update();

      // Chef idle breathing
      chef.position.y = Math.sin(elapsed * 3) * 0.04;

      // Animate stove flames
      const fPos = flameGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < flameCount; i++) {
        fPos[i * 3 + 1] += flameSpeeds[i];
        if (fPos[i * 3 + 1] > 1.35) {
          fPos[i * 3 + 1] = 0.85;
        }
      }
      flameGeo.attributes.position.needsUpdate = true;

      // Dish presentation tween
      if (isCookingAnimation) {
        cookTimer += 0.02;
        dishGroup.position.y += 0.015;
        dishGroup.rotation.y += 0.05;

        if (cookTimer > 1.2) {
          isCookingAnimation = false;
          dishGroup.visible = false;
          stoveLight.intensity = 3;
          stoveLight.color.setHex(0xf97316);
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
      unsubscribeCode();
      renderer.dispose();
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className={`relative w-full h-full min-h-[460px] bg-slate-950 rounded-2xl overflow-hidden select-none ${className}`}>
      <div ref={mountRef} className="w-full h-full min-h-[460px] cursor-grab active:cursor-grabbing" />

      {/* Floating 3D Restaurant HUD */}
      <div className="absolute top-4 left-4 pointer-events-none space-y-1">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          <span className="font-mono text-xs font-bold text-amber-400 tracking-wider">
            3D BISTRO FLOORS: DINING ROOM #{level}
          </span>
        </div>
        <p className="font-mono text-[11px] text-emerald-300">
          {statusMessage}
        </p>
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-900/90 border border-slate-700/80 backdrop-blur-md px-4 py-2 rounded-xl text-center pointer-events-none shadow-2xl">
        <p className="font-mono text-xs font-bold text-white">
          Le Java Bistro (Active Shift)
        </p>
        <p className="font-mono text-[10px] text-amber-300 mt-0.5">
          Revenue: ${revenue.toFixed(2)} | Orders Expedited: {ordersServed} | Rating: 4.9/5.0
        </p>
      </div>

      <div className="absolute top-4 right-4 bg-slate-900/70 border border-slate-800 backdrop-blur-sm px-2.5 py-1 rounded-lg text-[10px] font-mono text-slate-400 pointer-events-none">
        Rotate 3D: Left Click + Drag | Zoom: Scroll
      </div>
    </div>
  );
};
