import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { gameBridge, GameBridgePayload } from '../../engine/GameBridge';

interface ThreeArchitectureProps {
  level?: number;
  className?: string;
}

export const ThreeArchitecture: React.FC<ThreeArchitectureProps> = ({
  level = 1,
  className = '',
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [tps, setTps] = useState(1420);
  const [statusMessage, setStatusMessage] = useState('SPRING CLOUD ARCHITECTURE: ALL PODS NOMINAL');

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // --- 1. SCENE & CAMERA ---
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020512);
    scene.fog = new THREE.FogExp2(0x020512, 0.035);

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 500;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(6.5, 6.0, 8.0);

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
    const ambientLight = new THREE.AmbientLight(0x0f172a, 1.5);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0x38bdf8, 1.5);
    keyLight.position.set(5, 12, 6);
    keyLight.castShadow = true;
    scene.add(keyLight);

    const coreLight = new THREE.PointLight(0x3b82f6, 3, 9);
    coreLight.position.set(0, 2, 0);
    scene.add(coreLight);

    // --- 4. ENTERPRISE BLUEPRINT GRID FLOOR ---
    const floorSize = 16;
    const floorGeo = new THREE.PlaneGeometry(floorSize, floorSize);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x030712,
      roughness: 0.3,
      metalness: 0.85,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    const grid = new THREE.GridHelper(floorSize, 16, 0x38bdf8, 0x1e3a8a);
    grid.position.y = 0.01;
    scene.add(grid);

    // --- 5. 3D MICROSERVICE POD NODES ---
    const createPod = (x: number, z: number, label: string, colorHex: number) => {
      const podGroup = new THREE.Group();
      podGroup.position.set(x, 0, z);

      // Base Stand
      const stand = new THREE.Mesh(
        new THREE.CylinderGeometry(0.85, 0.95, 0.25, 16),
        new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.85, roughness: 0.2 })
      );
      stand.position.y = 0.125;
      stand.castShadow = true;
      stand.receiveShadow = true;

      // Holographic Cube
      const cubeGeo = new THREE.BoxGeometry(1.0, 1.0, 1.0);
      const cubeMat = new THREE.MeshStandardMaterial({
        color: colorHex,
        emissive: colorHex,
        emissiveIntensity: 0.4,
        roughness: 0.2,
        metalness: 0.7,
        transparent: true,
        opacity: 0.88,
      });
      const cube = new THREE.Mesh(cubeGeo, cubeMat);
      cube.position.y = 0.9;
      cube.castShadow = true;

      // Beacon Ring
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.75, 0.03, 16, 32),
        new THREE.MeshBasicMaterial({ color: colorHex })
      );
      ring.rotation.x = Math.PI / 2;
      ring.position.y = 1.6;

      podGroup.add(stand, cube, ring);
      scene.add(podGroup);
      return { group: podGroup, cube, ring };
    };

    const gatewayPod = createPod(0, -2.5, 'GATEWAY', 0x38bdf8);
    const userPod = createPod(-2.5, 0.5, 'USER-SVC', 0x10b981);
    const orderPod = createPod(2.5, 0.5, 'ORDER-SVC', 0xf59e0b);
    const dbPod = createPod(0, 3.2, 'DATABASE', 0xa855f7);

    // --- 6. 3D GLOWING FIBER-OPTIC DATA PIPELINES ---
    const conduitMat = new THREE.MeshBasicMaterial({ color: 0x3b82f6, transparent: true, opacity: 0.45 });

    const createConduit = (p1: THREE.Vector3, p2: THREE.Vector3) => {
      const curve = new THREE.LineCurve3(p1, p2);
      const tubeGeo = new THREE.TubeGeometry(curve, 16, 0.04, 8, false);
      const tube = new THREE.Mesh(tubeGeo, conduitMat);
      scene.add(tube);
    };

    const pGateway = new THREE.Vector3(0, 0.9, -2.5);
    const pUser = new THREE.Vector3(-2.5, 0.9, 0.5);
    const pOrder = new THREE.Vector3(2.5, 0.9, 0.5);
    const pDb = new THREE.Vector3(0, 0.9, 3.2);

    createConduit(pGateway, pUser);
    createConduit(pGateway, pOrder);
    createConduit(pUser, pDb);
    createConduit(pOrder, pDb);

    // --- 7. ANIMATED DATA PACKET ORBS ---
    const packetGeo = new THREE.SphereGeometry(0.12, 16, 16);
    const packetMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });

    const packet1 = new THREE.Mesh(packetGeo, packetMat);
    const packet2 = new THREE.Mesh(packetGeo, packetMat);
    scene.add(packet1, packet2);

    let packetSpeed = 0.015;

    // --- 8. EVENT LISTENERS ---
    const triggerTrafficSurge = () => {
      coreLight.intensity = 8;
      packetSpeed = 0.045;
      setTps(prev => prev + 2400);
      setStatusMessage('CLOUD CLUSTER SURGE: High-throughput API traffic flowing');
      setTimeout(() => {
        coreLight.intensity = 3;
        packetSpeed = 0.015;
      }, 1000);
    };

    const unsubscribe = gameBridge.on('CODE_EXECUTED', (payload: GameBridgePayload) => {
      if (payload.data?.compiled) {
        triggerTrafficSurge();
      } else {
        setStatusMessage('MICROSERVICE ARCHITECTURE ERROR: Compiler Failed');
      }
    });

    // --- 9. RENDER LOOP ---
    const clock = new THREE.Clock();
    let animId: number;
    let t1 = 0;
    let t2 = 0;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();
      controls.update();

      // Floating pod rotations
      gatewayPod.cube.rotation.y = elapsed * 0.8;
      userPod.cube.rotation.y = elapsed * 0.6;
      orderPod.cube.rotation.y = elapsed * 0.7;
      dbPod.cube.rotation.y = elapsed * 0.5;

      gatewayPod.ring.rotation.z += 0.02;
      userPod.ring.rotation.z += 0.02;
      orderPod.ring.rotation.z += 0.02;
      dbPod.ring.rotation.z += 0.02;

      // Animate Packet 1: Gateway -> User -> DB
      t1 += packetSpeed;
      if (t1 > 1.0) t1 = 0;
      if (t1 < 0.5) {
        packet1.position.lerpVectors(pGateway, pUser, t1 * 2);
      } else {
        packet1.position.lerpVectors(pUser, pDb, (t1 - 0.5) * 2);
      }

      // Animate Packet 2: Gateway -> Order -> DB
      t2 += packetSpeed;
      if (t2 > 1.0) t2 = 0;
      if (t2 < 0.5) {
        packet2.position.lerpVectors(pGateway, pOrder, t2 * 2);
      } else {
        packet2.position.lerpVectors(pOrder, pDb, (t2 - 0.5) * 2);
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

      {/* 3D Topology HUD */}
      <div className="absolute top-4 left-4 pointer-events-none space-y-1">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
          <span className="font-mono text-xs font-bold text-sky-400 tracking-wider">
            3D CLOUD TOPOLOGY: SERVICE MESH #{level}
          </span>
        </div>
        <p className="font-mono text-[11px] text-emerald-300">
          {statusMessage}
        </p>
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-900/90 border border-slate-700/80 backdrop-blur-md px-4 py-2 rounded-xl text-center pointer-events-none shadow-2xl">
        <p className="font-mono text-xs font-bold text-white">
          Spring Cloud Gateway & PostgreSQL Data Mesh
        </p>
        <p className="font-mono text-[10px] text-cyan-300 mt-0.5">
          Throughput: {tps.toLocaleString()} TPS | Latency: 4ms | Microservices: 4 Healthy Pods
        </p>
      </div>

      <div className="absolute top-4 right-4 bg-slate-900/70 border border-slate-800 backdrop-blur-sm px-2.5 py-1 rounded-lg text-[10px] font-mono text-slate-400 pointer-events-none">
        Rotate 3D: Left Click + Drag | Zoom: Scroll
      </div>
    </div>
  );
};
