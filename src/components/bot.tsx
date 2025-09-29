'use client';

import * as THREE from 'three';
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Cylinder } from '@react-three/drei';

export default function Bot() {
  const groupRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Mesh>(null);
  const bodyRef = useRef<THREE.Mesh>(null);
  const leftEyeRef = useRef<THREE.Mesh>(null);
  const rightEyeRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(t * 0.5) * 0.2;
      groupRef.current.position.y = Math.sin(t) * 0.1;
    }
    if (headRef.current) {
      headRef.current.rotation.y = Math.sin(t * 1.5) * 0.1;
    }
    if (leftEyeRef.current && rightEyeRef.current) {
        const blink = Math.max(0, Math.sin(t * 5 + 2));
        leftEyeRef.current.scale.y = blink;
        rightEyeRef.current.scale.y = blink;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Head */}
      <Sphere ref={headRef} args={[1, 32, 32]} position={[0, 1.5, 0]}>
        <meshStandardMaterial color="#aaa" metalness={0.8} roughness={0.2} />
      </Sphere>

      {/* Eyes */}
      <Sphere ref={leftEyeRef} args={[0.2, 16, 16]} position={[-0.4, 1.7, 0.8]}>
        <meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={2} />
      </Sphere>
      <Sphere ref={rightEyeRef} args={[0.2, 16, 16]} position={[0.4, 1.7, 0.8]}>
        <meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={2} />
      </Sphere>
      
      {/* Body */}
      <Cylinder ref={bodyRef} args={[0.8, 1.2, 2, 32]} position={[0, -0.2, 0]}>
        <meshStandardMaterial color="#888" metalness={0.7} roughness={0.3} />
      </Cylinder>
      
      {/* Base */}
      <Cylinder args={[1.2, 1.2, 0.2, 32]} position={[0, -1.3, 0]}>
        <meshStandardMaterial color="#666" metalness={0.6} roughness={0.4} />
      </Cylinder>
    </group>
  );
}
