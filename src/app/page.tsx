'use client';
import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import Bot from '@/components/bot';
import Chat from '@/components/chat';
import { Landmark } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="relative min-h-screen w-full bg-background">
      <div className="absolute top-0 left-0 z-10 p-4">
        <Link href="/dashboard" className="flex items-center gap-2 text-foreground">
          <Landmark className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold tracking-tight">WealthWise</h1>
        </Link>
      </div>

      <Canvas camera={{ position: [0, 0.5, 3.5], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} />
        <Suspense fallback={null}>
          <Bot />
        </Suspense>
        <OrbitControls
          enableZoom={false}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={(3 * Math.PI) / 4}
          minAzimuthAngle={-Math.PI / 4}
          maxAzimuthAngle={Math.PI / 4}
        />
      </Canvas>
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <Chat />
      </div>
    </div>
  );
}
