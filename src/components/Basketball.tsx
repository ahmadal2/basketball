import React, { useRef, forwardRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Cylinder, Torus, Decal } from '@react-three/drei';
import * as THREE from 'three';

interface BasketballProps {
  color?: string;
  showPedestal?: boolean;
  scrollProgress?: React.RefObject<number>;
}

// Keyframe data: [progress, x, y, z, scale]
const KEYFRAMES = [
  { p: 0,    x: 0,  y: 0,    z: 0,  s: 1.2 }, // Hero: center, medium
  { p: 0.2,  x: 5,  y: -1.8, z: 0,  s: 4.5 }, // Elite Control: right, BIG
  { p: 0.4,  x: -5, y: -3.5, z: 0,  s: 4.5 }, // Perfect Flight: left, BIG
  { p: 0.6,  x: 0,  y: 0,    z: 0,  s: 2.2 }, // Aerodynamics: center
  { p: 0.8,  x: 0,  y: 1.2,  z: 0,  s: 2.5 }, // Champion: up
  { p: 1.0,  x: 0,  y: 4,    z: -5, s: 1.0 }, // Defy Gravity: fly away
];

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function easeInOut(t: number) {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

function getKeyframeValues(progress: number) {
  const p = Math.max(0, Math.min(1, progress));
  
  let from = KEYFRAMES[0];
  let to = KEYFRAMES[KEYFRAMES.length - 1];
  
  for (let i = 0; i < KEYFRAMES.length - 1; i++) {
    if (p >= KEYFRAMES[i].p && p <= KEYFRAMES[i + 1].p) {
      from = KEYFRAMES[i];
      to = KEYFRAMES[i + 1];
      break;
    }
  }
  
  const segmentRange = to.p - from.p;
  const t = segmentRange === 0 ? 0 : easeInOut((p - from.p) / segmentRange);
  
  return {
    x: lerp(from.x, to.x, t),
    y: lerp(from.y, to.y, t),
    z: lerp(from.z, to.z, t),
    s: lerp(from.s, to.s, t),
  };
}

export const Basketball = forwardRef<THREE.Group, BasketballProps>(({ color = "#FF5A00", showPedestal = false, scrollProgress }, ref) => {
  const innerMeshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);

  const { logoTexture, roughnessMap, normalMap } = useMemo(() => {
    // Logo texture
    const logoCanvas = document.createElement('canvas');
    logoCanvas.width = 512;
    logoCanvas.height = 256;
    const lctx = logoCanvas.getContext('2d');
    if (lctx) {
      lctx.fillStyle = 'rgba(0,0,0,0)';
      lctx.fillRect(0, 0, logoCanvas.width, logoCanvas.height);
      lctx.fillStyle = '#111';
      lctx.font = 'bold 80px "Anton", sans-serif';
      lctx.textAlign = 'center';
      lctx.textBaseline = 'middle';
      lctx.fillText('SPALDING', logoCanvas.width / 2, logoCanvas.height / 2);
    }

    // Procedural pebbled roughness map — fine grain micro-texture
    const roughCanvas = document.createElement('canvas');
    roughCanvas.width = 1024;
    roughCanvas.height = 1024;
    const rctx = roughCanvas.getContext('2d');
    if (rctx) {
      rctx.fillStyle = '#a0a0a0';
      rctx.fillRect(0, 0, 1024, 1024);
      const rng = (seed: number) => {
        let s = seed;
        return () => { s = (s * 16807 + 0) % 2147483647; return (s - 1) / 2147483646; };
      };
      const rand = rng(42);
      // 8000 tiny pebble dots — fine grain like real basketball leather
      for (let i = 0; i < 8000; i++) {
        const x = rand() * 1024;
        const y = rand() * 1024;
        const r = rand() * 0.9 + 0.2; // very small: 0.2–1.1px
        const brightness = Math.floor(rand() * 60 + 80); // 80–140
        rctx.beginPath();
        rctx.arc(x, y, r, 0, Math.PI * 2);
        rctx.fillStyle = `rgb(${brightness},${brightness},${brightness})`;
        rctx.fill();
      }
    }

    // Normal map — very subtle micro-bumps
    const normCanvas = document.createElement('canvas');
    normCanvas.width = 1024;
    normCanvas.height = 1024;
    const nctx = normCanvas.getContext('2d');
    if (nctx) {
      nctx.fillStyle = '#8080ff';
      nctx.fillRect(0, 0, 1024, 1024);
      const rng2 = (seed: number) => {
        let s = seed;
        return () => { s = (s * 16807 + 0) % 2147483647; return (s - 1) / 2147483646; };
      };
      const rand2 = rng2(99);
      for (let i = 0; i < 7000; i++) {
        const x = rand2() * 1024;
        const y = rand2() * 1024;
        const r = rand2() * 0.8 + 0.2; // fine dots
        const bx = Math.floor(rand2() * 30 + 110);
        const by = Math.floor(rand2() * 30 + 110);
        nctx.beginPath();
        nctx.arc(x, y, r, 0, Math.PI * 2);
        nctx.fillStyle = `rgb(${bx},${by},255)`;
        nctx.fill();
      }
    }

    return {
      logoTexture: new THREE.CanvasTexture(logoCanvas),
      roughnessMap: new THREE.CanvasTexture(roughCanvas),
      normalMap: new THREE.CanvasTexture(normCanvas),
    };
  }, []);

  useFrame((state, delta) => {
    // Slow idle spin of inner mesh
    if (innerMeshRef.current) {
      innerMeshRef.current.rotation.y += 0.005;
      innerMeshRef.current.rotation.x += 0.002;
    }

    // Scroll-driven animation of the outer group
    if (groupRef.current) {
      const progress = scrollProgress?.current ?? 0;
      const { x, y, z, s } = getKeyframeValues(progress);

      // Smooth lerp toward target (0.08 = ~8% per frame, fast enough at 60fps)
      const lerpFactor = 1 - Math.pow(0.1, delta * 10);
      groupRef.current.position.x = lerp(groupRef.current.position.x, x, lerpFactor);
      groupRef.current.position.y = lerp(groupRef.current.position.y, y, lerpFactor);
      groupRef.current.position.z = lerp(groupRef.current.position.z, z, lerpFactor);
      groupRef.current.scale.setScalar(lerp(groupRef.current.scale.x, s, lerpFactor));

      // Add gentle rotation as ball moves
      groupRef.current.rotation.y += delta * 0.3;
    }
  });

  return (
    <group ref={ref}>
      <group ref={groupRef}>
        <Sphere ref={innerMeshRef} args={[1, 64, 64]} scale={1}>
          <meshStandardMaterial
            color={color}
            roughness={0.75}
            metalness={0.0}
            roughnessMap={roughnessMap}
            normalMap={normalMap}
            normalScale={new THREE.Vector2(0.12, 0.12)}
          />

          {/* Logo Decal */}
          <Decal position={[0, 0, 1]} rotation={[0, 0, 0]} scale={[1.2, 0.6, 1]}>
            <meshBasicMaterial
              map={logoTexture}
              transparent
              polygonOffset
              polygonOffsetFactor={-1}
            />
          </Decal>
          <Decal position={[0, 0, -1]} rotation={[0, Math.PI, 0]} scale={[1.2, 0.6, 1]}>
            <meshBasicMaterial
              map={logoTexture}
              transparent
              polygonOffset
              polygonOffsetFactor={-1}
            />
          </Decal>

          {/* Basketball seam lines */}
          <Torus args={[1.001, 0.004, 8, 100]} rotation={[0, 0, 0]}>
            <meshStandardMaterial color="#111" roughness={0.5} />
          </Torus>
          <Torus args={[1.001, 0.004, 8, 100]} rotation={[Math.PI / 2, 0, 0]}>
            <meshStandardMaterial color="#111" roughness={0.5} />
          </Torus>
          <Torus args={[1.001, 0.004, 8, 100]} rotation={[0, Math.PI / 2, 0]}>
            <meshStandardMaterial color="#111" roughness={0.5} />
          </Torus>
          <Torus args={[1.001, 0.004, 8, 100]} rotation={[0, Math.PI / 4, Math.PI / 2]}>
            <meshStandardMaterial color="#111" roughness={0.5} />
          </Torus>
        </Sphere>
      </group>

      {/* Pedestal */}
      {showPedestal && (
        <group position={[0, -2.5, 0]}>
          <Cylinder args={[1.4, 1.4, 0.3, 64]} position={[0, 0.4, 0]}>
            <meshStandardMaterial color="#1a1a1a" metalness={0.8} roughness={0.2} />
          </Cylinder>
          <Cylinder args={[1.8, 1.8, 0.5, 64]} position={[0, 0, 0]}>
            <meshStandardMaterial color="#111" metalness={0.9} roughness={0.1} />
          </Cylinder>
          <Cylinder args={[2.2, 2.2, 0.7, 64]} position={[0, -0.6, 0]}>
            <meshStandardMaterial color="#050505" metalness={1} roughness={0} />
          </Cylinder>
          <Torus args={[1.42, 0.015, 16, 100]} rotation={[Math.PI / 2, 0, 0]} position={[0, 0.55, 0]}>
            <meshBasicMaterial color={color} />
          </Torus>
        </group>
      )}
    </group>
  );
});

Basketball.displayName = 'Basketball';
