"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";
import * as THREE from "three";
import { GalaxyBackground } from "./GalaxyBackground";
import { SpaceShip, BlueSun } from "./SpaceShip";
import { MemoryPlanet } from "./MemoryPlanet";
import { StarCluster, SkillNode } from "./StarCluster";
import { ProjectPlanets, ProjectNode } from "./ProjectPlanets";
import { AsteroidBelt } from "./AsteroidBelt";

// Custom camera controller that handles smooth cinematic zooms depending on active sector
function CameraController({ activeSector }: { activeSector: string }) {
  const lookAtRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, -5));

  useFrame((state) => {
    const targetPos = new THREE.Vector3(0, 0, 18);
    const targetLookAt = new THREE.Vector3(0, 0, -5);

    switch (activeSector) {
      case "intro":
        targetPos.set(0, 0, 15);
        targetLookAt.set(0, 0, -2);
        break;
      case "docking":
        targetPos.set(0, 0, 4.2);
        targetLookAt.set(0, 0.2, 0);
        break;
      case "bridge":
        targetPos.set(0, 0.4, 7);
        targetLookAt.set(0, 0.2, -5);
        break;
      case "about":
        targetPos.set(-5, 2, -6.5);
        targetLookAt.set(-5, 2, -10);
        break;
      case "skills":
        targetPos.set(5, -1, -8.5);
        targetLookAt.set(5, -1, -12);
        break;
      case "projects":
        targetPos.set(0, -4, -8.5);
        targetLookAt.set(0, -4, -12);
        break;
      case "games":
        targetPos.set(-5, -3, -8.5);
        targetLookAt.set(-5, -3, -12);
        break;
      case "aicore":
        targetPos.set(0, 3, -6.5);
        targetLookAt.set(0, 3, -10);
        break;
      case "experience":
        targetPos.set(3, 2, -8.5);
        targetLookAt.set(3, 2, -12);
        break;
      case "resume":
        targetPos.set(-3, -2, -8.5);
        targetLookAt.set(-3, -2, -12);
        break;
      case "contact":
        targetPos.set(0, -0.5, -6.5);
        targetLookAt.set(0, -0.5, -12);
        break;
    }

    // Lerp position
    state.camera.position.lerp(targetPos, 0.04);

    // Lerp lookAt targets
    lookAtRef.current.lerp(targetLookAt, 0.04);
    state.camera.lookAt(lookAtRef.current);
  });

  return null;
}

// 3D AI Core Reactor
function AICoreReactor({ active = false, onClick }: { active?: boolean; onClick?: () => void }) {
  const coreRef = useRef<THREE.Mesh | null>(null);
  const ringRef1 = useRef<THREE.Mesh | null>(null);
  const ringRef2 = useRef<THREE.Mesh | null>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (coreRef.current) {
      coreRef.current.rotation.y = time * 0.5;
      const pulse = Math.sin(time * 6) * 0.1 + 0.9;
      coreRef.current.scale.setScalar(pulse * (hovered ? 1.3 : 1));
    }
    if (ringRef1.current) {
      ringRef1.current.rotation.x = time * 1.2;
      ringRef1.current.rotation.y = time * 0.6;
    }
    if (ringRef2.current) {
      ringRef2.current.rotation.y = -time * 1.5;
      ringRef2.current.rotation.z = time * 0.8;
    }
  });

  return (
    <group position={[0, 3, -10]} scale={active ? 1.5 : 1}>
      {/* Reactor Center */}
      <mesh
        ref={coreRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={onClick}
      >
        <icosahedronGeometry args={[0.6, 2]} />
        <meshStandardMaterial
          color="#00ffff"
          emissive="#00ffff"
          emissiveIntensity={1.8}
          wireframe
        />
      </mesh>
      {/* Outer energy containment shields */}
      <mesh ref={ringRef1}>
        <torusGeometry args={[0.9, 0.02, 8, 32]} />
        <meshBasicMaterial color="#ff00ff" transparent opacity={0.6} />
      </mesh>
      <mesh ref={ringRef2}>
        <torusGeometry args={[1.1, 0.015, 8, 32]} />
        <meshBasicMaterial color="#00ffcc" transparent opacity={0.4} />
      </mesh>
      <pointLight color="#00ffff" intensity={2} distance={5} />
    </group>
  );
}

// 3D Experience Wormhole timeline node
function ExperienceWormhole({ active = false, onClick }: { active?: boolean; onClick?: () => void }) {
  const groupRef = useRef<THREE.Group | null>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.rotation.z = time * 0.25;
      // Drifts slightly
      groupRef.current.position.y = 2 + Math.sin(time * 0.8) * 0.1;
    }
  });

  // Create concentric rings for the wormhole
  const rings = Array.from({ length: 6 });

  return (
    <group
      ref={groupRef}
      position={[3, 2, -10]}
      scale={active ? 1.5 : 1}
      onClick={onClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {rings.map((_, idx) => (
        <mesh key={idx} rotation={[0, 0, (idx * Math.PI) / 6]} position={[0, 0, -idx * 0.3]}>
          <torusGeometry args={[0.4 + idx * 0.18, 0.015, 6, 24]} />
          <meshBasicMaterial
            color={idx % 2 === 0 ? "#7b00ff" : "#ff007f"}
            transparent
            opacity={hovered ? 0.8 : 0.45}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}
      <pointLight color="#7b00ff" intensity={1.5} distance={4} />
    </group>
  );
}

// 3D Resume Crystalline structure
function ResumeCrystal({ active = false, onClick }: { active?: boolean; onClick?: () => void }) {
  const crystalRef = useRef<THREE.Mesh | null>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (crystalRef.current) {
      crystalRef.current.rotation.y = time * 0.4;
      crystalRef.current.rotation.x = time * 0.2;
      crystalRef.current.position.y = -2 + Math.sin(time * 1.2) * 0.08;
    }
  });

  return (
    <group position={[-3, -2, -10]} scale={active ? 1.5 : 1}>
      {/* Crystalline wireframe container */}
      <mesh
        ref={crystalRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={onClick}
      >
        <octahedronGeometry args={[0.65, 0]} />
        <meshStandardMaterial
          color="#ffd700"
          emissive="#ffd700"
          emissiveIntensity={hovered ? 2.5 : 0.4}
          roughness={0.05}
          metalness={0.9}
          wireframe
        />
      </mesh>
      {/* Inner crystal core */}
      <mesh scale={[0.5, 0.5, 0.5]}>
        <octahedronGeometry args={[0.65, 0]} />
        <meshStandardMaterial
          color="#ffffff"
          roughness={0.1}
          metalness={0.95}
          transparent
          opacity={0.8}
        />
      </mesh>
      <pointLight color="#ffd700" intensity={1} distance={4} />
    </group>
  );
}

export function SpaceCanvas({
  activeSector,
  warpActive = false,
  onNodeSelect,
  onProjectSelect,
  onLaunchGame,
  onSectorSelect
}: {
  activeSector: string;
  warpActive?: boolean;
  onNodeSelect?: (node: SkillNode) => void;
  onProjectSelect?: (project: ProjectNode) => void;
  onLaunchGame?: () => void;
  onSectorSelect?: (sector: string) => void;
}) {
  return (
    <div className="absolute inset-0 w-full h-full z-0 select-none">
      <Canvas
        camera={{ position: [0, 0, 18], fov: 60, near: 0.1, far: 200 }}
        shadows
      >
        {/* Basic Cinematic Lights */}
        <ambientLight intensity={0.15} />
        <pointLight position={[10, 10, 10]} intensity={0.8} color="#00e5ff" />
        <pointLight position={[-10, -10, -10]} intensity={0.4} color="#ff007f" />

        {/* Camera management */}
        <CameraController activeSector={activeSector} />

        {/* Nebula and stars */}
        <GalaxyBackground warpActive={warpActive} />

        {/* Orbiting blue sun */}
        <BlueSun />

        {/* The Starship (Intro & docking cinematic) */}
        {(activeSector === "intro" || activeSector === "docking" || activeSector === "bridge") && (
          <SpaceShip docking={activeSector === "docking"} />
        )}

        {/* 3D Interactive Environments */}
        <MemoryPlanet
          active={activeSector === "about"}
          onClick={() => onSectorSelect?.("about")}
        />
        
        <StarCluster
          active={activeSector === "skills"}
          onNodeSelect={onNodeSelect}
        />

        <ProjectPlanets
          active={activeSector === "projects"}
          onProjectSelect={onProjectSelect}
        />

        <AsteroidBelt
          active={activeSector === "games"}
          onLaunchGame={onLaunchGame}
        />

        <AICoreReactor
          active={activeSector === "aicore"}
          onClick={() => onSectorSelect?.("aicore")}
        />

        <ExperienceWormhole
          active={activeSector === "experience"}
          onClick={() => onSectorSelect?.("experience")}
        />

        <ResumeCrystal
          active={activeSector === "resume"}
          onClick={() => onSectorSelect?.("resume")}
        />
      </Canvas>
    </div>
  );
}
