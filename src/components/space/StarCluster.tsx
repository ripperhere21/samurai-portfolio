"use client";

import { useRef, useMemo, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface SkillNode {
  name: string;
  category: string;
  pos: [number, number, number];
  color: string;
  skills: string[];
}

const SKILL_NODES: SkillNode[] = [
  {
    name: "AI & NEURAL CORES",
    category: "ai",
    pos: [0, 1.5, 0],
    color: "#00e5ff",
    skills: ["Deep Learning", "PyTorch", "NLP & LLMs", "AI Agents", "Vision Models"]
  },
  {
    name: "GAME ENGINE DEVELOPMENT",
    category: "game",
    pos: [-1.8, 0, -1],
    color: "#ff007f",
    skills: ["Unity / Unreal", "C++ / C#", "Physics Engines", "ECS Architecture", "Render Pipelines"]
  },
  {
    name: "SOFTWARE ARCHITECTURE",
    category: "software",
    pos: [1.8, 0, 1],
    color: "#ffd700",
    skills: ["TypeScript / Node", "Rust / Go", "Docker & Cloud K8s", "Distributed Systems", "PostgreSQL"]
  },
  {
    name: "DIGITAL CREATIVE",
    category: "creative",
    pos: [-1.2, -1.5, 0.8],
    color: "#a855f7",
    skills: ["Shaders / GLSL", "Three.js / WebGL", "Blender 3D Modeling", "UI/UX Architecture", "Framer Motion"]
  },
  {
    name: "ANIMATION & MOTION",
    category: "motion",
    pos: [1.2, -1.5, -0.8],
    color: "#ffffff",
    skills: ["GSAP Timeline", "Keyframe Kinetics", "SVGs Animation", "Audio Synthesis", "Cinematic VFX"]
  }
];

export function StarCluster({
  active = false,
  onNodeSelect
}: {
  active?: boolean;
  onNodeSelect?: (node: SkillNode) => void;
}) {
  const clusterRef = useRef<THREE.Group | null>(null);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // Generate constellation lines
  const lineGeometry = useMemo(() => {
    const points: THREE.Vector3[] = [];
    // Connect outer nodes to a central core position, and also build a loop
    const core = new THREE.Vector3(0, 0, 0);
    
    SKILL_NODES.forEach((node) => {
      const nodePos = new THREE.Vector3(...node.pos);
      // Line from central core to node
      points.push(core);
      points.push(nodePos);
    });

    // Outer boundary connections
    for (let i = 0; i < SKILL_NODES.length; i++) {
      const nextIdx = (i + 1) % SKILL_NODES.length;
      points.push(new THREE.Vector3(...SKILL_NODES[i].pos));
      points.push(new THREE.Vector3(...SKILL_NODES[nextIdx].pos));
    }

    return new THREE.BufferGeometry().setFromPoints(points);
  }, []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (clusterRef.current) {
      // Gentle floating rotation of the constellation
      clusterRef.current.rotation.y = time * 0.08;
      clusterRef.current.rotation.z = Math.sin(time * 0.1) * 0.05;
    }
  });

  return (
    <group ref={clusterRef} position={[5, -1, -12]} scale={active ? 1.5 : 1}>
      {/* Central Core Star (The Heart of the Creator) */}
      <mesh>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial
          color="#00e5ff"
          emissive="#00e5ff"
          emissiveIntensity={2}
          roughness={0}
        />
      </mesh>
      <pointLight color="#00e5ff" intensity={1} distance={6} />

      {/* Constellation Connection Lines */}
      <lineSegments geometry={lineGeometry}>
        <lineBasicMaterial
          color="#00e5ff"
          transparent
          opacity={0.25}
          linewidth={1.5}
        />
      </lineSegments>

      {/* Skills Nodes */}
      {SKILL_NODES.map((node, idx) => {
        const isHovered = hoveredIdx === idx;
        return (
          <group key={idx} position={node.pos}>
            {/* Outer hover ring */}
            <mesh
              onPointerOver={() => setHoveredIdx(idx)}
              onPointerOut={() => setHoveredIdx(null)}
              onClick={() => onNodeSelect?.(node)}
            >
              <sphereGeometry args={[0.22, 16, 16]} />
              <meshStandardMaterial
                color={node.color}
                emissive={node.color}
                emissiveIntensity={isHovered ? 3.0 : 0.8}
                roughness={0.1}
                metalness={0.9}
              />
            </mesh>

            {/* Pulsing Aura */}
            <mesh scale={[1.4, 1.4, 1.4]}>
              <sphereGeometry args={[0.22, 16, 16]} />
              <meshBasicMaterial
                color={node.color}
                transparent
                opacity={isHovered ? 0.35 : 0.1}
                blending={THREE.AdditiveBlending}
              />
            </mesh>

            {/* Glowing glow effect */}
            {isHovered && (
              <pointLight
                color={node.color}
                intensity={1.5}
                distance={4}
                decay={2}
              />
            )}
          </group>
        );
      })}
    </group>
  );
}
export type { SkillNode };
