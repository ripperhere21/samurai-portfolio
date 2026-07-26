"use client";

import { useRef, useMemo, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface ProjectNode {
  id: string;
  name: string;
  desc: string;
  color: string;
  distance: number;
  speed: number;
  size: number;
  tech: string[];
  timeline: string;
  details: string;
  demoUrl: string;
  gitUrl: string;
}

const PROJECT_NODES: ProjectNode[] = [
  {
    id: "aether",
    name: "AETHER ENGINE",
    desc: "A high-performance WebGL 2.0 & WebAssembly rendering engine built in Rust, leveraging WebGPU bindings for photorealistic particle grids and volumetric atmospheric fog.",
    color: "#00e5ff",
    distance: 3.5,
    speed: 0.15,
    size: 0.45,
    tech: ["Rust", "WebGL 2", "WebGPU", "WGSL", "WebAssembly"],
    timeline: "Q3 2025 - Q1 2026",
    details: "Developed a custom rasterization pipeline running in WebAssembly, processing over 5 million particles at 60fps on mobile. Features include deferred shading, dynamic soft shadows, and screen-space ambient occlusion (SSAO). Used for high-fidelity interactive storytelling on the web.",
    demoUrl: "https://aether-engine.dev",
    gitUrl: "https://github.com/creator/aether-webgpu"
  },
  {
    id: "neurolink",
    name: "NEUROLINK AI CORE",
    desc: "A futuristic neural network dashboard visualizing real-time transformer model weights, embedding layers, and decision-tree node traversals in an immersive 3D space.",
    color: "#ff007f",
    distance: 5.5,
    speed: 0.08,
    size: 0.6,
    tech: ["Next.js", "PyTorch", "Three.js", "Tailwind CSS", "FastAPI"],
    timeline: "Q1 2026 - Present",
    details: "Built a WebGL-based node-graph visualizer connected to a live Python backend running LLaMA inference. Visualizes over 20,000 active nodes, plotting attention heads and token probabilities dynamically as letters are synthesized, giving developers structural insights into neural reasoning.",
    demoUrl: "https://neurolink-ai.tech",
    gitUrl: "https://github.com/creator/neurolink-core"
  },
  {
    id: "novarpg",
    name: "NOVA: PROTOCOL",
    desc: "An anime-inspired tactical space RPG protoype built with custom ECS architecture, rendering voxelized environments and dynamic tactical spaceship combat scenarios.",
    color: "#ffd700",
    distance: 7.5,
    speed: 0.05,
    size: 0.5,
    tech: ["Unity Engine", "C#", "HLSL Shaders", "FMOD Audio", "ECS"],
    timeline: "Q2 - Q4 2025",
    details: "Implemented a fully custom Entity Component System (ECS) to manage hundreds of active spaceship drones. Wrote customized HLSL post-processing shaders for cinematic bloom, chromatic aberration, and holographic HUD overlays mirroring terminal cockpit readouts.",
    demoUrl: "https://nova-protocol.games",
    gitUrl: "https://github.com/creator/nova-rpg"
  }
];

export function ProjectPlanets({
  active = false,
  onProjectSelect
}: {
  active?: boolean;
  onProjectSelect?: (project: ProjectNode) => void;
}) {
  const systemRef = useRef<THREE.Group | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // Generate orbit line geometries for rendering the circles
  const orbitPaths = useMemo(() => {
    return PROJECT_NODES.map((proj) => {
      const points: THREE.Vector3[] = [];
      for (let i = 0; i <= 64; i++) {
        const theta = (i / 64) * Math.PI * 2;
        points.push(new THREE.Vector3(Math.cos(theta) * proj.distance, 0, Math.sin(theta) * proj.distance));
      }
      return new THREE.BufferGeometry().setFromPoints(points);
    });
  }, []);

  const planetRefs = useRef<{ [key: string]: THREE.Group | null }>({});

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    PROJECT_NODES.forEach((proj) => {
      const ref = planetRefs.current[proj.id];
      if (ref) {
        // Orbit position: x = cos(time * speed) * distance, z = sin(time * speed) * distance
        const angle = time * proj.speed;
        ref.position.x = Math.cos(angle) * proj.distance;
        ref.position.z = Math.sin(angle) * proj.distance;
        
        // Spin the planet itself on its axis
        ref.rotation.y = time * 0.4;
      }
    });

    if (systemRef.current) {
      // Tilt the whole system slightly for a dynamic 3D angle
      systemRef.current.rotation.x = 0.3;
      systemRef.current.rotation.y = time * 0.02;
    }
  });

  return (
    <group ref={systemRef} position={[0, -4, -12]} scale={active ? 1.4 : 0.9}>
      {/* Central Star - Project Core Gravity Well */}
      <mesh>
        <sphereGeometry args={[1.0, 32, 32]} />
        <meshStandardMaterial
          color="#0f172a"
          roughness={0.2}
          metalness={0.9}
          emissive="#001d3d"
        />
      </mesh>
      {/* Wireframe outer ring for the Project gravity core */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.2, 0.02, 8, 48]} />
        <meshBasicMaterial color="#00e5ff" transparent opacity={0.3} />
      </mesh>

      {/* Orbit Rings */}
      {orbitPaths.map((geometry, idx) => (
        <lineLoop key={idx} geometry={geometry}>
          <lineBasicMaterial
            color="#00e5ff"
            transparent
            opacity={0.15}
            linewidth={1}
          />
        </lineLoop>
      ))}

      {/* Orbiting Project Planets */}
      {PROJECT_NODES.map((proj) => {
        const isHovered = hoveredId === proj.id;
        return (
          <group
            key={proj.id}
            ref={(el) => {
              planetRefs.current[proj.id] = el;
            }}
          >
            {/* Holographic atmosphere ring */}
            <mesh rotation={[Math.PI / 3, 0.2, 0]}>
              <ringGeometry args={[proj.size * 1.3, proj.size * 1.5, 32]} />
              <meshBasicMaterial
                color={proj.color}
                transparent
                opacity={isHovered ? 0.6 : 0.2}
                side={THREE.DoubleSide}
                blending={THREE.AdditiveBlending}
              />
            </mesh>

            {/* Main Planet sphere */}
            <mesh
              onPointerOver={() => setHoveredId(proj.id)}
              onPointerOut={() => setHoveredId(null)}
              onClick={() => onProjectSelect?.(proj)}
            >
              <sphereGeometry args={[proj.size, 32, 32]} />
              <meshStandardMaterial
                color={proj.color}
                emissive={proj.color}
                emissiveIntensity={isHovered ? 2.0 : 0.3}
                roughness={0.15}
                metalness={0.8}
              />
            </mesh>

            {/* Hover floating label */}
            {isHovered && (
              <pointLight color={proj.color} intensity={1.2} distance={3} />
            )}
          </group>
        );
      })}
    </group>
  );
}
export type { ProjectNode };
