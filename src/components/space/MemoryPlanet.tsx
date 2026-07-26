"use client";

import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// Custom shader for gaseous purple-magenta planet
const PlanetShader = {
  uniforms: {
    uTime: { value: 0 },
    uHover: { value: 0 }
  },
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      vViewPosition = -mvPosition.xyz;
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  fragmentShader: `
    uniform float uTime;
    uniform float uHover;
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vViewPosition;

    // Simple noise generator
    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
    }
    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(mix(hash(i + vec2(0.0,0.0)), hash(i + vec2(1.0,0.0)), u.x),
                 mix(hash(i + vec2(0.0,1.0)), hash(i + vec2(1.0,1.0)), u.x), u.y);
    }
    float fbm(vec2 p) {
      float v = 0.0;
      float a = 0.5;
      for (int i = 0; i < 4; ++i) {
        v += a * noise(p);
        p = p * 2.0;
        a *= 0.5;
      }
      return v;
    }

    void main() {
      // Swirling gas belt coordinates
      vec2 p = vUv * vec2(8.0, 4.0);
      p.x += uTime * 0.05 + fbm(p + uTime * 0.02) * 1.5;
      
      float n = fbm(p);

      // Gas bands colors (violet, magenta, deep indigo, neon highlights)
      vec3 colorDeep = vec3(0.05, 0.01, 0.12);
      vec3 colorMagenta = vec3(1.0, 0.0, 0.5);
      vec3 colorPurple = vec3(0.48, 0.0, 1.0);
      vec3 colorCyan = vec3(0.0, 0.9, 1.0);
      
      vec3 finalColor = mix(colorDeep, colorPurple, n);
      finalColor = mix(finalColor, colorMagenta, smoothstep(0.3, 0.7, n));
      finalColor = mix(finalColor, colorCyan, smoothstep(0.65, 0.8, n) * (0.3 + uHover * 0.4));

      // Calculate lighting (Lambertian reflection + glowing rim)
      vec3 normal = normalize(vNormal);
      vec3 viewDir = normalize(vViewPosition);
      
      // Fake directional light direction
      vec3 lightDir = normalize(vec3(1.0, 0.8, 1.0));
      float diff = max(dot(normal, lightDir), 0.05);

      // Fresnel rim glow
      float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 3.0);
      vec3 rimColor = mix(vec3(0.5, 0.0, 0.8), vec3(0.0, 0.9, 1.0), uHover);
      vec3 glow = rimColor * fresnel * (1.2 + uHover * 1.0);

      // Final composite
      vec3 litColor = finalColor * diff + glow;

      gl_FragColor = vec4(litColor, 1.0);
    }
  `
};

export function MemoryPlanet({ active = false, onClick }: { active?: boolean; onClick?: () => void }) {
  const planetRef = useRef<THREE.Mesh | null>(null);
  const ringRef = useRef<THREE.Mesh | null>(null);
  const shaderRef = useRef<THREE.ShaderMaterial | null>(null);
  const [hovered, setHovered] = useState(false);

  const hoverValue = useRef(0);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (planetRef.current) {
      planetRef.current.rotation.y = time * 0.12 + (hovered ? time * 0.08 : 0);
      planetRef.current.rotation.x = Math.sin(time * 0.2) * 0.1;
    }
    if (ringRef.current) {
      ringRef.current.rotation.z = -time * 0.05;
    }

    // Lerp hover value for smooth transitions
    hoverValue.current = THREE.MathUtils.lerp(
      hoverValue.current,
      hovered ? 1.0 : 0.0,
      0.1
    );

    if (shaderRef.current) {
      shaderRef.current.uniforms.uTime.value = time;
      shaderRef.current.uniforms.uHover.value = hoverValue.current;
    }
  });

  return (
    <group position={[-5, 2, -10]} scale={active ? 1.5 : 1}>
      {/* Glow aura */}
      <mesh>
        <sphereGeometry args={[1.52, 32, 32]} />
        <meshBasicMaterial
          color="#aa00ff"
          transparent
          opacity={0.12}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Main Planet Body */}
      <mesh
        ref={planetRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={onClick}
      >
        <sphereGeometry args={[1.5, 32, 32]} />
        <shaderMaterial
          ref={shaderRef}
          args={[PlanetShader]}
          uniforms={THREE.UniformsUtils.clone(PlanetShader.uniforms)}
        />
      </mesh>

      {/* Planet Rings */}
      <mesh ref={ringRef} rotation={[1.4, 0.4, 0]}>
        <ringGeometry args={[2.0, 2.8, 64]} />
        <meshStandardMaterial
          color="#ff00aa"
          transparent
          opacity={0.35}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}
