"use client";

import { useRef, useMemo, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface AsteroidData {
  id: number;
  pos: [number, number, number];
  rotSpeed: [number, number, number];
  scale: [number, number, number];
  geometryType: number; // 0: Dodecahedron, 1: Icosahedron
  isBeacon: boolean;
}

export function AsteroidBelt({
  active = false,
  onLaunchGame
}: {
  active?: boolean;
  onLaunchGame?: () => void;
}) {
  const groupRef = useRef<THREE.Group | null>(null);
  const beaconRef = useRef<THREE.Mesh | null>(null);
  const [hoveredBeacon, setHoveredBeacon] = useState(false);

  // Generate 60 procedural asteroids
  const asteroids: AsteroidData[] = useMemo(() => {
    const arr: AsteroidData[] = [];
    
    // Core parameters for the asteroid belt ring
    const innerRadius = 4.5;
    const outerRadius = 7.5;

    for (let i = 0; i < 60; i++) {
      // Angular spread
      const theta = (i / 60) * Math.PI * 2 + (Math.random() * 0.1);
      const radius = innerRadius + Math.random() * (outerRadius - innerRadius);
      
      // Calculate coordinates with slight height variation
      const x = Math.cos(theta) * radius;
      const y = (Math.random() - 0.5) * 0.8;
      const z = Math.sin(theta) * radius;

      // Rotation speeds
      const rx = (Math.random() - 0.5) * 0.8;
      const ry = (Math.random() - 0.5) * 0.8;
      const rz = (Math.random() - 0.5) * 0.8;

      // Random sizes (make some larger, some tiny)
      const s = 0.08 + Math.random() * 0.18;
      
      // Make the 12th asteroid the blinking beacon for the game
      const isBeacon = i === 12;

      arr.push({
        id: i,
        pos: [x, y, z],
        rotSpeed: [rx, ry, rz],
        scale: isBeacon ? [0.45, 0.45, 0.45] : [s, s * 0.9, s * 1.1],
        geometryType: Math.random() > 0.5 ? 1 : 0,
        isBeacon
      });
    }
    return arr;
  }, []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (groupRef.current) {
      // Belt rotation speed
      groupRef.current.rotation.y = time * 0.04;
    }
    if (beaconRef.current) {
      // Beacon glow blinking indicator
      const glow = beaconRef.current.material as THREE.MeshStandardMaterial;
      if (glow) {
        // High frequency blink
        const blink = Math.sin(time * 8.0) * 0.5 + 0.5;
        glow.emissiveIntensity = 1.0 + blink * 4.0;
      }
    }
  });

  return (
    <group ref={groupRef} position={[-5, -3, -12]} scale={active ? 1.5 : 1}>
      {/* Gravity Well / Nebula Core */}
      <mesh>
        <sphereGeometry args={[0.6, 16, 16]} />
        <meshStandardMaterial
          color="#090d16"
          roughness={0.8}
          metalness={0.2}
          emissive="#0d021a"
        />
      </mesh>

      {asteroids.map((ast) => {
        if (ast.isBeacon) {
          return (
            <group key={ast.id} position={ast.pos}>
              {/* Blinking Game Beacon Asteroid */}
              <mesh
                ref={beaconRef}
                scale={ast.scale}
                onPointerOver={() => setHoveredBeacon(true)}
                onPointerOut={() => setHoveredBeacon(false)}
                onClick={onLaunchGame}
              >
                <icosahedronGeometry args={[1, 1]} />
                <meshStandardMaterial
                  color="#ff0044"
                  emissive="#ff0044"
                  emissiveIntensity={2}
                  roughness={0.4}
                  metalness={0.9}
                />
              </mesh>
              {/* Spinning scanning rings around beacon */}
              <mesh rotation={[Math.PI / 4, timeRef(ast.id), 0]}>
                <torusGeometry args={[0.7, 0.02, 4, 16]} />
                <meshBasicMaterial color="#ff0044" transparent opacity={0.6} />
              </mesh>
              {hoveredBeacon && (
                <pointLight color="#ff0044" intensity={2} distance={3} />
              )}
            </group>
          );
        }

        return (
          <mesh
            key={ast.id}
            position={ast.pos}
            scale={ast.scale}
            rotation={[
              ast.rotSpeed[0] * 10,
              ast.rotSpeed[1] * 10,
              ast.rotSpeed[2] * 10
            ]}
          >
            {ast.geometryType === 0 ? (
              <dodecahedronGeometry args={[1]} />
            ) : (
              <icosahedronGeometry args={[1, 0]} />
            )}
            <meshStandardMaterial
              color="#2a3042"
              roughness={0.85}
              metalness={0.1}
              bumpScale={0.1}
            />
          </mesh>
        );
      })}
    </group>
  );
}

// Simple helper to avoid scope compilation issue in React loops
function timeRef(id: number) {
  return (id * 0.5) % Math.PI;
}
