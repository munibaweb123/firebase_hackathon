'use client';
import React, { useRef, useState, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import type { Group } from 'three';
import Link from 'next/link';
import { Button } from './ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';


function RobotModel({ hovered }: { hovered: boolean }) {
  // IMPORTANT: You need to replace this path with the actual path to your 3D model.
  // Place your model in the `public` folder.
  const { scene } = useGLTF('/hero2.glb'); 
  const groupRef = useRef<Group>(null!);

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();
    const targetY = hovered ? Math.sin(t * 2) * 0.1 + 0.1 : 0;
    
    // Smoothly interpolate the position
    if(groupRef.current) {
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY, 0.1);
    }
  });


  return (
    <primitive
      ref={groupRef}
      object={scene}
      scale={1.2} // Adjust scale as needed
      position={[0, -2.5, 0]} // Adjust position as needed
    />
  );
}

// Preload the model to prevent flash of empty canvas
useGLTF.preload('/hero2.glb');


export function Hero3D() {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="w-full h-full relative"
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-pink-500/5 dark:from-primary/10 dark:via-[#10032A] dark:to-pink-500/10" />
        <div className="absolute top-10 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl"></div>
      
      <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
        <ambientLight intensity={1.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <Suspense fallback={null}>
          <RobotModel hovered={hovered} />
        </Suspense>
        {/* <OrbitControls /> uncomment for development to control the camera */}
      </Canvas>
      
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
         <div className="container mx-auto grid lg:grid-cols-2 gap-8 lg:gap-16 items-center px-4 md:px-6">
            <div className="space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm mb-4 pointer-events-auto">
                <Sparkles className="w-4 h-4" />
                Intelligent Finance, Humanized
              </div>
              
              <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl xl:text-7xl leading-tight">
                Your AI {' '}
                <span className="bg-gradient-to-r from-primary to-pink-500 bg-clip-text text-transparent">
                  Financial Partner
                </span>
              </h1>
              
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                The smart, voice-powered way to track expenses, manage budgets, and achieve your financial goals.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4 pointer-events-auto">
                <Button asChild size="lg" className="h-12 px-8 text-base bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all">
                  <Link href="/signup" className="flex items-center gap-2">
                    Get Started Free
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              </div>
            </div>
            {/* The right column is empty to leave space for the 3D model */}
            <div></div>
          </div>
      </div>
    </div>
  );
}
