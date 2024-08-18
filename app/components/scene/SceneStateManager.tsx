// components/scene/SceneStateManager.tsx

"use client"; // Mark this as a client component

import { createContext, useContext, useState, ReactNode } from 'react';
import * as THREE from 'three';
import { nanoid } from 'nanoid';

// Define Types
interface SceneContextType {
  components: Components;
  currentFloor: Floor;
  setCurrentFloor: React.Dispatch<React.SetStateAction<Floor>>;
  nodes: Node[];
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
  hoverPosition: THREE.Vector3 | null;
  setHoverPosition: React.Dispatch<React.SetStateAction<THREE.Vector3 | null>>;
}

export class Components {
  floors: Floor[] = [];

  addFloor(floor: Floor) {
    this.floors.push(floor);
  }
}

export class Floor {
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

export class Node extends THREE.Object3D {
  name: string;

  constructor(position: THREE.Vector3) {
    super();
    this.name = nanoid();
    this.position.copy(position);
  }
}

// Initialize context with the proper type or null
const SceneContext = createContext<SceneContextType | null>(null);

export const useScene = (): SceneContextType => {
  const context = useContext(SceneContext);
  if (!context) {
    throw new Error("useScene must be used within a SceneStateManager");
  }
  return context;
};

export const SceneStateManager = ({ children }: { children: ReactNode }) => {
  const [components] = useState<Components>(new Components());
  const [currentFloor, setCurrentFloor] = useState<Floor>(new Floor());
  const [nodes, setNodes] = useState<Node[]>([]);
  const [hoverPosition, setHoverPosition] = useState<THREE.Vector3 | null>(null);

  return (
    <SceneContext.Provider value={{ components, currentFloor, setCurrentFloor, nodes, setNodes, hoverPosition, setHoverPosition }}>
      {children}
    </SceneContext.Provider>
  );
};
