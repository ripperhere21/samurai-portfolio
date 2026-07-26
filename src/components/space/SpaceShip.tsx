"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export function SpaceShip({ docking = false }: { docking?: boolean }) {
  const shipGroupRef = useRef<THREE.Group | null>(null);
  const ringRef = useRef<THREE.Mesh | null>(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (shipGroupRef.current) {
      if (docking) {
        // Slow approach animation
        shipGroupRef.current.position.z = THREE.MathUtils.lerp(
          shipGroupRef.current.position.z,
          2.5,
          0.02
        );
        shipGroupRef.current.position.y = THREE.MathUtils.lerp(
          shipGroupRef.current.position.y,
          0.3,
          0.02
        );
        shipGroupRef.current.rotation.x = THREE.MathUtils.lerp(
          shipGroupRef.current.rotation.x,
          0.15,
          0.02
        );
      } else {
        // Drifting orbit animation
        shipGroupRef.current.position.y = Math.sin(time * 0.5) * 0.4;
        shipGroupRef.current.position.x = Math.cos(time * 0.3) * 0.2;
        shipGroupRef.current.rotation.y = time * 0.05;
        shipGroupRef.current.rotation.z = Math.sin(time * 0.4) * 0.08;
      }
    }
    if (ringRef.current) {
      // Rotating gravity ring
      ringRef.current.rotation.y = time * 0.8;
    }
  });

  return (
    <group ref={shipGroupRef} position={[0, 0, 0]} scale={[1, 1, 1]}>
      {/* Sleek central hull */}
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[0.2, 0.4, 3.2, 12]} />
        <meshStandardMaterial
          color="#0b0e1a"
          roughness={0.15}
          metalness={0.9}
          emissive="#001833"
        />
      </mesh>

      {/* Cockpit nose cone */}
      <mesh position={[0, 1.8, 0]} castShadow>
        <coneGeometry args={[0.2, 0.6, 12]} />
        <meshStandardMaterial
          color="#00e5ff"
          roughness={0.05}
          metalness={0.9}
          emissive="#007799"
          emissiveIntensity={1.5}
        />
      </mesh>

      {/* Transverse gravity wheel ring */}
      <mesh ref={ringRef} position={[0, -0.3, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[0.9, 0.08, 8, 24]} />
        <meshStandardMaterial
          color="#ffd700"
          roughness={0.2}
          metalness={0.8}
          emissive="#221100"
        />
        {/* Navigation lights on gravity ring */}
        {[0, 1, 2, 3, 4, 5].map((i) => {
          const angle = (i * Math.PI) / 3;
          return (
            <mesh
              key={i}
              position={[Math.cos(angle) * 0.9, Math.sin(angle) * 0.9, 0]}
            >
              <sphereGeometry args={[0.04, 8, 8]} />
              <meshBasicMaterial color={i % 2 === 0 ? "#00e5ff" : "#ff007f"} />
            </mesh>
          );
        })}
      </mesh>

      {/* Structural support wings */}
      <mesh position={[0, -0.4, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <boxGeometry args={[0.1, 2.4, 0.4]} />
        <meshStandardMaterial
          color="#0f172a"
          roughness={0.2}
          metalness={0.9}
        />
      </mesh>

      {/* Dual engine nacelles */}
      {[-1.2, 1.2].map((x, i) => (
        <group key={i} position={[x, -0.6, 0]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.18, 0.18, 1.4, 8]} />
            <meshStandardMaterial
              color="#0d1117"
              roughness={0.3}
              metalness={0.8}
            />
          </mesh>
          {/* Main engines glowing thrust */}
          <mesh position={[0, -0.75, 0]}>
            <cylinderGeometry args={[0.12, 0.02, 0.25, 8]} />
            <meshStandardMaterial
              color="#00e5ff"
              emissive="#00e5ff"
              emissiveIntensity={4}
            />
          </mesh>
          <pointLight
            position={[0, -0.9, 0]}
            color="#00e5ff"
            intensity={0.5}
            distance={3}
          />
        </group>
      ))}

      {/* Solar sails panels */}
      {[-1.4, 1.4].map((x, i) => (
        <mesh
          key={i}
          position={[x * 1.3, 0.3, 0]}
          rotation={[0, 0.2, 0]}
          castShadow
        >
          <boxGeometry args={[0.8, 1.8, 0.015]} />
          <meshStandardMaterial
            color="#1e1b4b"
            roughness={0.1}
            metalness={0.95}
            emissive="#03001e"
          />
        </mesh>
      ))}
    </group>
  );
}

// Glowing Blue Star/Sun orbiting
export function BlueSun() {
  const sunRef = useRef<THREE.Mesh | null>(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (sunRef.current) {
      sunRef.current.rotation.y = time * 0.15;
    }
  });

  return (
    <group position={[0, 0, -18]}>
      {/* Main Core */}
      <mesh ref={sunRef}>
        <sphereGeometry args={[2.5, 32, 32]} />
        <meshBasicMaterial color="#00e5ff" />
      </mesh>

      {/* Corona / Glow shell */}
      <mesh scale={[1.08, 1.08, 1.08]}>
        <sphereGeometry args={[2.5, 32, 32]} />
        <meshBasicMaterial
          color="#0088ff"
          transparent
          opacity={0.35}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      <pointLight color="#00e5ff" intensity={3} distance={50} decay={1.5} />
    </group>
  );
}
