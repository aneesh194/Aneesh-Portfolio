import * as THREE from 'three';
import { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { MeshTransmissionMaterial, Float, Environment, Sphere } from '@react-three/drei';

/**
 * A sophisticated fluid glass refraction effect.
 * Uses MeshTransmissionMaterial for high-end glass aesthetics.
 */
export default function FluidGlass() {
  return (
    <div className="w-full h-full">
      <Canvas 
        camera={{ position: [0, 0, 5], fov: 35 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />
        
        <Float speed={1.5} rotationIntensity={0.5} floatIntensity={1}>
          <GlassEntity />
        </Float>

        <Environment preset="night" />
      </Canvas>
    </div>
  );
}

function GlassEntity() {
  const meshRef = useRef();

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.sin(t / 4) * 0.2;
      meshRef.current.rotation.y = Math.cos(t / 3) * 0.3;
      // Oscillate scale slightly for a "fluid" feel
      const scale = 1 + Math.sin(t * 0.5) * 0.05;
      meshRef.current.scale.set(scale, scale, scale);
    }
  });

  return (
    <mesh ref={meshRef}>
      {/* 
        A TorusKnot provides complex geometry for beautiful refraction patterns.
        Adjust args for different "fluid" looks.
      */}
      <torusKnotGeometry args={[1, 0.4, 256, 32]} />
      <MeshTransmissionMaterial
        backside
        samples={16}
        thickness={1.5}
        backsideThickness={0.5}
        ior={1.25}
        chromaticAberration={0.06}
        anisotropy={0.1}
        distortion={0.4}
        distortionScale={0.3}
        temporalDistortion={0.1}
        clearcoat={1}
        clearcoatRoughness={0.1}
        attenuationDistance={0.5}
        attenuationColor="#ffffff"
        color="#ffffff"
        bg="#000000"
      />
    </mesh>
  );
}
