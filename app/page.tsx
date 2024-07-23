// /pages/index.tsx

"use client";
import { Canvas, ThreeEvent } from '@react-three/fiber';
import { OrbitControls, Sphere, Line, Plane } from '@react-three/drei';
import { useState } from 'react';
import * as THREE from 'three';
import { nanoid } from 'nanoid';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import StatsComponent from './StatsComponent';

class Components {
  floors: Floor[] = [];

  addFloor(floor: Floor) {
    this.floors.push(floor);
  }
}

class Floor {
  nodes: Node[] = [];
  lines: [THREE.Vector3, THREE.Vector3][] = [];
  body: THREE.Shape | null = null;

  addNode(node: Node) {
    this.nodes.push(node);
    if (this.nodes.length > 1) {
      const lastNode = this.nodes[this.nodes.length - 2];
      this.lines.push([lastNode.position.clone(), node.position.clone()]);
    }
  }

  closeFloor() {
    if (this.nodes.length > 2) {
      this.lines.push([this.nodes[this.nodes.length - 1].position.clone(), this.nodes[0].position.clone()]);
      this.body = new THREE.Shape();
      this.nodes.forEach((node, index) => {
        if (index === 0) {
          this.body!.moveTo(node.position.x, node.position.z); // Use X and Z coordinates for the plane
        } else {
          this.body!.lineTo(node.position.x, node.position.z);
        }
      });
      this.body.closePath();
      this.body.autoClose = true;
    }
  }
}

class Node extends THREE.Object3D {
  name: string;

  constructor(position: THREE.Vector3) {
    super();
    this.name = nanoid();
    this.position.copy(position);
  }
}

function Home() {
  const [components] = useState<Components>(new Components());
  const [currentFloor, setCurrentFloor] = useState<Floor>(new Floor());
  const [nodes, setNodes] = useState<Node[]>([]);
  const [hoverPosition, setHoverPosition] = useState<THREE.Vector3 | null>(null);

  const snapToGrid = (position: THREE.Vector3) => {
    const size = 1; // Size of the grid
    return new THREE.Vector3(
      Math.round(position.x / size) * size,
      position.y,
      Math.round(position.z / size) * size
    );
  };

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    const { point } = event;
    const snappedPosition = snapToGrid(point);
    const newNode = new Node(snappedPosition);

    currentFloor.addNode(newNode);
    setNodes([...currentFloor.nodes]);

    if (currentFloor.nodes.length > 2 && newNode.position.distanceTo(currentFloor.nodes[0].position) < 1) {
      currentFloor.closeFloor();
      components.addFloor(currentFloor);
      setCurrentFloor(new Floor());
      setNodes([]);
    }
  };

  const handlePointerMove = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    const { point } = event;
    setHoverPosition(snapToGrid(point));
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <Canvas camera={{ position: [0, 10, 10], fov: 50 }}>
      <StatsComponent/>

        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
        <pointLight position={[-10, -10, -10]} />
        <gridHelper args={[100, 100]} />
        <axesHelper args={[5]} />
        <OrbitControls />
        <Plane args={[100, 100]} rotation-x={-Math.PI / 2} onClick={handleClick} onPointerMove={handlePointerMove}>
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
        {hoverPosition && (
          <Sphere args={[0.2, 16, 16]} position={hoverPosition}>
            <meshStandardMaterial attach="material" color="green" transparent opacity={0.5} />
          </Sphere>
        )}
      </Canvas>
    </main>
  );
}

export default Home;
