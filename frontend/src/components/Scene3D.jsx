import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Icosahedron, Torus, Environment, Float, Sparkles, MeshTransmissionMaterial } from '@react-three/drei';

function GlassShape({ position, scale, rotationSpeed }) {
  const meshRef = useRef();

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * rotationSpeed.x;
      meshRef.current.rotation.y += delta * rotationSpeed.y;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1} position={position}>
      <Icosahedron ref={meshRef} args={[1, 0]} scale={scale}>
        <MeshTransmissionMaterial 
          backside 
          thickness={0.5} 
          roughness={0.1} 
          transmission={1} 
          ior={1.2} 
          chromaticAberration={0.4} 
          color="#a855f7" 
        />
      </Icosahedron>
    </Float>
  );
}

function MainRing() {
  const meshRef = useRef();

  useFrame((state, delta) => {
    if (meshRef.current) {
       meshRef.current.rotation.z += delta * 0.1;
       meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.2;
       meshRef.current.rotation.y = Math.cos(state.clock.elapsedTime * 0.2) * 0.2;
    }
  });

  return (
    <Torus ref={meshRef} args={[4, 0.05, 16, 100]} position={[0, 0, -2]}>
      <meshStandardMaterial color="#4f46e5" emissive="#4f46e5" emissiveIntensity={2} roughness={0.2} metalness={0.8} />
    </Torus>
  )
}

export default function Scene3D({ wide = false }) {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none opacity-80">
      <Canvas camera={{ position: [0, 0, 8], fov: wide ? 60 : 45 }}>
        <ambientLight intensity={1} />
        <directionalLight position={[10, 10, 5]} intensity={2} color="#ffffff" />
        <Environment preset="city" />
        
        <MainRing />
        
        {wide ? (
          <>
            {/* Shapes pushed far to the sides to frame the tool UI */}
            <GlassShape position={[-6, 1, -1]} scale={1.8} rotationSpeed={{ x: 0.1, y: 0.2 }} />
            <GlassShape position={[6, -1, -2]} scale={1.5} rotationSpeed={{ x: 0.3, y: 0.1 }} />
            <GlassShape position={[-5, -3, 0]} scale={2} rotationSpeed={{ x: -0.2, y: 0.4 }} />
            <GlassShape position={[7, 3, -4]} scale={2.5} rotationSpeed={{ x: 0.05, y: -0.1 }} />
            
            <GlassShape position={[-8, 4, -5]} scale={3} rotationSpeed={{ x: -0.1, y: -0.2 }} />
            <GlassShape position={[8, -4, -6]} scale={2.2} rotationSpeed={{ x: 0.2, y: 0.3 }} />
          </>
        ) : (
          <>
            <GlassShape position={[-3, 1, 0]} scale={1.5} rotationSpeed={{ x: 0.1, y: 0.2 }} />
            <GlassShape position={[3, -1, -1]} scale={1} rotationSpeed={{ x: 0.3, y: 0.1 }} />
            <GlassShape position={[0, -3, 1]} scale={0.8} rotationSpeed={{ x: -0.2, y: 0.4 }} />
            <GlassShape position={[4, 3, -3]} scale={2} rotationSpeed={{ x: 0.05, y: -0.1 }} />
          </>
        )}

        {/* Ambient floating dust */}
        <Sparkles count={200} scale={12} size={2} speed={0.4} opacity={0.3} color="#8b5cf6" />
      </Canvas>
    </div>
  );
}
