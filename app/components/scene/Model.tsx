// components/Model.tsx

import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { GroupProps } from '@react-three/fiber';
import { useEffect, useRef } from 'react';

interface ModelProps extends GroupProps {
  opacity?: number;
}

export function Model({ opacity = 1, ...props }: ModelProps) {
  const { nodes, materials } = useGLTF('/desktest.glb') as unknown as {
    nodes: { Desk_v2: THREE.Mesh };
    materials: { 'Material.001': THREE.MeshStandardMaterial };
  };

  const modelRef = useRef<THREE.Group>(null);

  useEffect(() => {
    if (modelRef.current) {
      // Calculate the bounding box
      const boundingBox = new THREE.Box3().setFromObject(modelRef.current);
      
      // Get the center of the bounding box
      const center = boundingBox.getCenter(new THREE.Vector3());

      // Offset the model so that its center aligns with the origin
      modelRef.current.position.set(-center.x, -center.y, -center.z);
    }
  }, []);

  return (
    <group ref={modelRef} {...props} dispose={null}>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Desk_v2.geometry}
        material={materials['Material.001']}
        userData={{ name: 'Desk v2' }}
        scale={0.01}
      >
        <meshStandardMaterial
          attach="material"
          color={materials['Material.001'].color}
          opacity={opacity}
          transparent={opacity < 1}
        />
      </mesh>
    </group>
  );
}

useGLTF.preload('/desktest.glb');
