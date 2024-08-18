import React, { useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Model } from '../scene/Model';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

interface SidebarProps {
  onAddToScene: (modelData: AssetConfig) => void;
}

interface AssetConfig {
  name: string;
  modelPath: string;
  scale: number | [number, number, number];
  fov: number;
}

const assets: AssetConfig[] = [
  {
    name: 'Desk',
    modelPath: '/desktest.glb',
    scale: [0.01, 0.01, 0.01],
    fov: 20,
  },
  {
    name: 'Laptop',
    modelPath: '/laptoptest.gltf',
    scale: 0.01,
    fov: 15,
  },
  // Add more assets here
];

const Sidebar: React.FC<SidebarProps> = ({ onAddToScene }) => {
  return (
    <div className="sidebar">
      {assets.map((asset) => (
        <AssetPreview
          key={asset.name}
          asset={asset}
          onAddToScene={onAddToScene}
        />
      ))}
    </div>
  );
};

interface AssetPreviewProps {
  asset: AssetConfig;
  onAddToScene: (modelData: AssetConfig) => void;
}

const AssetPreview: React.FC<AssetPreviewProps> = ({
  asset,
  onAddToScene,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const cameraPosition = new THREE.Vector3(3, 3, 3);

  const handleHover = () => {
    setIsHovered(true);
  };

  const handleHoverOut = () => {
    setIsHovered(false);
  };

  return (
    <div
      className="asset"
      onMouseEnter={handleHover}
      onMouseLeave={handleHoverOut}
    >
      <Canvas
        style={{ height: '150px', width: '150px' }}
        camera={{ position: cameraPosition.clone(), fov: asset.fov }}
      >
        <axesHelper args={[5]} />
        <ambientLight intensity={1} />
        <RotatingCamera isHovered={isHovered} initialPosition={cameraPosition} />
        <Model modelPath={asset.modelPath} scale={asset.scale} />
      </Canvas>
      <p>{asset.name}</p>
      <button onClick={() => onAddToScene(asset)}>Add to Scene</button>
    </div>
  );
};

// Custom component to handle camera rotation
const RotatingCamera: React.FC<{ isHovered: boolean; initialPosition: THREE.Vector3 }> = ({
  isHovered,
  initialPosition,
}) => {
  const cameraRotationSpeed = 0.01;

  useFrame(({ camera }) => {
    if (isHovered) {
      camera.position.applyAxisAngle(new THREE.Vector3(0, 1, 0), cameraRotationSpeed);
      camera.lookAt(0, 0, 0);
      camera.updateProjectionMatrix();
    } else {
      camera.position.copy(initialPosition); // Reset to initial position
      camera.lookAt(0, 0, 0);
    }
  });

  return null;
};

export default Sidebar;
