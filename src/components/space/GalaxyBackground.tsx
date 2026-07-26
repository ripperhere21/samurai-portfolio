"use client";

import { useRef, useMemo } from "react";
import { useFrame, extend } from "@react-three/fiber";
import * as THREE from "three";
import { Stars, Sparkles } from "@react-three/drei";

// Simple noise shader for animated space nebulas
const NebulaShaderMaterial = {
  uniforms: {
    uTime: { value: 0 },
    uColorCyan: { value: new THREE.Color("#00e5ff") },
    uColorPurple: { value: new THREE.Color("#7b00ff") },
    uColorPink: { value: new THREE.Color("#ff007f") },
    uColorDark: { value: new THREE.Color("#03030b") }
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float uTime;
    uniform vec3 uColorCyan;
    uniform vec3 uColorPurple;
    uniform vec3 uColorPink;
    uniform vec3 uColorDark;
    varying vec2 vUv;

    // Simple pseudo-random hash
    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
    }

    // 2D Noise
    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(mix(hash(i + vec2(0.0,0.0)), hash(i + vec2(1.0,0.0)), u.x),
                 mix(hash(i + vec2(0.0,1.0)), hash(i + vec2(1.0,1.0)), u.x), u.y);
    }

    // Fractal Brownian Motion (FBM)
    float fbm(vec2 p) {
      float v = 0.0;
      float a = 0.5;
      vec2 shift = vec2(100.0);
      // Rotate to reduce axial bias
      mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
      for (int i = 0; i < 4; ++i) {
        v += a * noise(p);
        p = rot * p * 2.0 + shift;
        a *= 0.5;
      }
      return v;
    }

    void main() {
      // Scale coordinates centered
      vec2 uv = (vUv - 0.5) * 2.0;
      
      // Dynamic warp coordinates
      vec2 q = vec2(
        fbm(uv + uTime * 0.04),
        fbm(uv + vec2(1.0))
      );
      
      vec2 r = vec2(
        fbm(uv + 1.0 * q + vec2(1.7, 9.2) + uTime * 0.015),
        fbm(uv + 1.0 * q + vec2(8.3, 2.8) + uTime * 0.02)
      );

      float f = fbm(uv + r * 1.5);
      
      // Blend colors based on fbm values
      vec3 col = mix(uColorDark, uColorPurple, f);
      col = mix(col, uColorCyan, clamp(length(q), 0.0, 1.0) * 0.4);
      col = mix(col, uColorPink, clamp(length(r.x), 0.0, 1.0) * 0.35);
      
      // Add a vignette effect
      float vignette = 1.0 - smoothstep(0.4, 1.5, length(uv));
      col *= vignette;

      // Volumetric lighting boost
      col += vec3(f * f * 0.12);

      gl_FragColor = vec4(col, 1.0);
    }
  `
};

export function GalaxyBackground({ warpActive = false }: { warpActive?: boolean }) {
  const shaderRef = useRef<THREE.ShaderMaterial | null>(null);
  const starsRef = useRef<any>(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (shaderRef.current) {
      // Dynamic speed depending on Warp Jump event
      shaderRef.current.uniforms.uTime.value = time * (warpActive ? 8 : 1);
    }
    if (starsRef.current) {
      starsRef.current.rotation.y = time * (warpActive ? 0.25 : 0.005);
      starsRef.current.rotation.x = time * (warpActive ? 0.15 : 0.002);
    }
  });

  return (
    <>
      {/* Dynamic Nebula Shader in background */}
      <mesh position={[0, 0, -50]}>
        <planeGeometry args={[200, 200]} />
        <shaderMaterial
          ref={shaderRef}
          args={[NebulaShaderMaterial]}
          depthWrite={false}
        />
      </mesh>

      {/* Starfields */}
      <group ref={starsRef}>
        <Stars
          radius={120}
          depth={50}
          count={6000}
          factor={warpActive ? 12 : 6}
          saturation={0.8}
          fade
          speed={warpActive ? 15 : 1}
        />
        <Sparkles
          count={100}
          scale={30}
          size={warpActive ? 8 : 2}
          speed={warpActive ? 4 : 0.4}
          color="#00e5ff"
        />
        <Sparkles
          count={60}
          scale={45}
          size={warpActive ? 6 : 1.5}
          speed={warpActive ? 6 : 0.3}
          color="#ff007f"
        />
      </group>
    </>
  );
}
