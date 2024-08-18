// components/scene/Model.tsx
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { GroupProps } from '@react-three/fiber';
import { useEffect, useRef } from 'react';

interface ModelProps extends GroupProps {
  modelPath: string;  // Path to the GLTF model
  scale?: number | [number, number, number];
  opacity?: number;
}

export function Model({ modelPath, scale = 1, opacity = 1, ...props }: ModelProps) {
  const gltf = useGLTF(modelPath) as unknown as {
    nodes: { [key: string]: THREE.Mesh };
    materials: { [key: string]: THREE.MeshStandardMaterial };
  };

  const modelRef = useRef<THREE.Group>(null);

  useEffect(() => {
    if (modelRef.current) {
      const boundingBox = new THREE.Box3().setFromObject(modelRef.current);
      const center = boundingBox.getCenter(new THREE.Vector3());
      modelRef.current.position.set(-center.x, -center.y, -center.z);
    }
  }, [gltf]);

  return (
    <group ref={modelRef} {...props} dispose={null} scale={scale}>
      {Object.keys(gltf.nodes).map((key) => (
        <mesh
          key={key}
          geometry={gltf.nodes[key].geometry}
          material={gltf.nodes[key].material as THREE.Material}
        >
          <meshStandardMaterial
            attach="material"
            opacity={opacity}
            transparent={opacity < 1}
          />
        </mesh>
      ))}
    </group>
  );
}
