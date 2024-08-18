import React, { useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Model } from '../scene/Model';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

interface SidebarProps {
  onDragStart: (event: React.DragEvent<HTMLDivElement>, type: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onDragStart }) => {
  const [isHovered, setIsHovered] = useState(false);
  const cameraPosition = new THREE.Vector3(0, 0, 5); // Initial camera position at a 45-degree angle

  const handleHover = () => {
    setIsHovered(true);
  };

  const handleHoverOut = () => {
    setIsHovered(false);
  };

  return (
    <div className="sidebar">
      <div
        className="asset"
        draggable
        onDragStart={(event) => onDragStart(event, 'desk')}
        onMouseEnter={handleHover}
        onMouseLeave={handleHoverOut}
      >
        <Canvas
          style={{ height: '150px', width: '150px' }}
          camera={{ position: cameraPosition.clone(), fov: 40 }}
        >
            <axesHelper args={[5]} />
          <ambientLight intensity={1} />
          <RotatingCamera isHovered={isHovered} />
          <Model position={new THREE.Vector3(0, 0, 0)} />
        </Canvas>
        <p>Desk</p>
      </div>
      {/* Add more assets with their own previews here */}
    </div>
  );
};

// Custom component to handle camera rotation
const RotatingCamera: React.FC<{ isHovered: boolean }> = ({ isHovered }) => {
  const cameraRotationSpeed = 0.01; // Adjust the rotation speed as needed

  useFrame(({ camera }) => {
    if (isHovered) {
      camera.position.applyAxisAngle(new THREE.Vector3(0, 1, 0), cameraRotationSpeed); // Rotate around the Y-axis
      camera.lookAt(0, 0, 0); // Keep the camera focused on the center
    } else {
      camera.position.set(0, 5, 5); // Reset to initial position
      camera.lookAt(0, 0, 0); // Keep the camera focused on the center
    }
  });

  return null;
};

export default Sidebar;
