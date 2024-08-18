// components/scene/Scene.tsx

"use client";

import { Canvas, ThreeEvent } from '@react-three/fiber';
import { OrbitControls, Sphere, Line, Plane } from '@react-three/drei';
import { useScene } from './SceneStateManager';
import { Perf } from 'r3f-perf';
import * as THREE from 'three';
import { nanoid } from 'nanoid';
import { Floor, Node } from './SceneStateManager';
import { Model } from './Model';
import { useState } from 'react';

export const Scene = () => {
  const { components, currentFloor, setCurrentFloor, nodes, setNodes, hoverPosition, setHoverPosition } = useScene();
  const [draggedModel, setDraggedModel] = useState<THREE.Vector3 | null>(null);
  const [isDraggingModel, setIsDraggingModel] = useState(false);

  const snapToGrid = (position: THREE.Vector3, size: number = 1): THREE.Vector3 => {
    return new THREE.Vector3(
      Math.round(position.x / size) * size,
      position.y,
      Math.round(position.z / size) * size
    );
  };

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    if (isDraggingModel) return; // Prevent adding nodes when dragging a model
    event.stopPropagation();
    const { point } = event;
    const snappedPosition = snapToGrid(point);
    
    const newNode = new Node(snappedPosition);
    newNode.name = 'node_' + nanoid();
    newNode.position.copy(snappedPosition);
  
    if (currentFloor.nodes.length > 0 && newNode.position.equals(currentFloor.nodes[currentFloor.nodes.length - 1].position)) {
      return;
    }
  
    currentFloor.addNode(newNode);
    setNodes([...currentFloor.nodes]);
  
    if (currentFloor.nodes.length > 2 && newNode.position.distanceTo(currentFloor.nodes[0].position) < 1) {
      currentFloor.closeFloor();
      components.addFloor(currentFloor);
      setCurrentFloor(new Floor());
      setNodes([]);
    }
  };

  const handleDrop = () => {
    if (draggedModel) {
      setIsDraggingModel(false); // Reset dragging state
      const newNode = new Node(draggedModel);
      newNode.name = 'node_' + nanoid();
      newNode.position.copy(draggedModel);

      currentFloor.addNode(newNode);
      setNodes([...currentFloor.nodes]);

      if (currentFloor.nodes.length > 2 && newNode.position.distanceTo(currentFloor.nodes[0].position) < 1) {
        currentFloor.closeFloor();
        components.addFloor(currentFloor);
        setCurrentFloor(new Floor());
        setNodes([]);
      }
      setDraggedModel(null);
    }
  };

  const handlePointerMove = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    const { point } = event;
    if (isDraggingModel) {
      setDraggedModel(snapToGrid(point));
    } else {
      setHoverPosition(snapToGrid(point));
    }
  };

  return (
    <Canvas
      camera={{ position: [0, 10, 10], fov: 50 }}
    >
      <ambientLight intensity={1} />
      <gridHelper args={[100, 100]} />
      <axesHelper args={[5]} />
      <OrbitControls />
      <Plane
        args={[100, 100]}
        rotation-x={-Math.PI / 2}
        onClick={handleClick}
        onPointerMove={handlePointerMove}
        onPointerUp={handleDrop}
      >
        <meshBasicMaterial visible={false} />
      </Plane>
      {nodes.map((node) => (
        <Sphere key={node.name} args={[0.2, 16, 16]} position={node.position}>
          <meshStandardMaterial attach="material" color="blue" />
        </Sphere>
      ))}
      {currentFloor.lines.map((line, index) => (
        <Line key={index} points={line} color="violet" lineWidth={2} />
      ))}
      {components.floors.map((floor, floorIndex) => (
        <group key={floorIndex}>
          <mesh position={[0, 0, 0]} rotation={[-Math.PI / -2, 0, 0]}>
            <shapeGeometry args={[floor.body!]} />
            <meshBasicMaterial color="yellow" side={THREE.DoubleSide} />
          </mesh>
          {floor.lines.map((line, index) => (
            <Line key={`${floorIndex}-${index}`} points={line} color="red" lineWidth={2} />
          ))}
        </group>
      ))}
      {!isDraggingModel && hoverPosition && (
        <Sphere args={[0.2, 16, 16]} position={hoverPosition}>
          <meshStandardMaterial attach="material" color="green" transparent opacity={0.5} />
        </Sphere>
      )}
      {draggedModel && (
        <Model position={draggedModel} scale={[1, 1, 1]} opacity={0.5} />
      )}
      <Perf />
    </Canvas>
  );
};
