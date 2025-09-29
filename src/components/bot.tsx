'use client';
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Box } from '@react-three/drei';
import * as THREE from 'three';

const Bot = () => {
  const headRef = useRef<THREE.Mesh>(null!);
  const bodyRef = useRef<THREE.Mesh>(null!);
  const leftEyeRef = useRef<THREE.Mesh>(null!);
  const rightEyeRef = useRef<THREE.Mesh>(null!);
  const antennaRef = useRef<THREE.Mesh>(null!);
  const antennaTipRef = useRef<THREE.Mesh>(null!);

  const accentMaterial = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#F5A623', roughness: 0.3, metalness: 0.8 }),
    []
  );
  const bodyMaterial = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#4A4A4A', roughness: 0.1, metalness: 0.9 }),
    []
  );
  const eyeMaterial = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#7ED321', emissive: '#7ED321', emissiveIntensity: 2 }),
    []
  );

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    // Gentle floating animation
    if (headRef.current) {
      headRef.current.position.y = 0.8 + Math.sin(time) * 0.05;
    }
    if (bodyRef.current) {
      bodyRef.current.position.y = -0.25 + Math.sin(time * 0.8) * 0.05;
    }

    // Antenna animation
    if (antennaRef.current) {
      antennaRef.current.rotation.z = Math.sin(time * 2) * 0.1;
    }
    if (antennaTipRef.current) {
        const antennaWorldPosition = new THREE.Vector3();
        antennaRef.current.getWorldPosition(antennaWorldPosition);
        antennaTipRef.current.position.set(
            antennaWorldPosition.x,
            antennaWorldPosition.y + 0.55,
            antennaWorldPosition.z
        )
    }
  });

  return (
    <group>
      {/* Head */}
      <Sphere ref={headRef} args={[0.5, 32, 32]} position={[0, 0.8, 0]} material={accentMaterial} />

      {/* Eyes */}
      <Sphere ref={leftEyeRef} args={[0.08, 16, 16]} position={[-0.2, 0.85, 0.4]} material={eyeMaterial} />
      <Sphere ref={rightEyeRef} args={[0.08, 16, 16]} position={[0.2, 0.85, 0.4]} material={eyeMaterial} />
      
      {/* Body */}
      <Box ref={bodyRef} args={[0.8, 1, 0.8]} position={[0, -0.25, 0]} material={bodyMaterial}>
        <meshStandardMaterial {...bodyMaterial} />
      </Box>

       {/* Antenna */}
      <group ref={antennaRef} position={[0, 1.3, 0]}>
        <Box args={[0.05, 0.6, 0.05]} position={[0, 0.25, 0]} material={bodyMaterial}>
           <meshStandardMaterial {...bodyMaterial} />
        </Box>
      </group>
      <Sphere ref={antennaTipRef} args={[0.07, 16, 16]} material={eyeMaterial} position={[0, 1.85, 0]}/>

    </group>
  );
};

export default Bot;
