"use client";

import { Canvas, ThreeEvent, useThree } from '@react-three/fiber';
import { OrbitControls, Sphere, Line, Plane, TransformControls } from '@react-three/drei';
import { useScene } from './SceneStateManager';
import { Perf } from 'r3f-perf';
import * as THREE from 'three';
import { nanoid } from 'nanoid';
import { Floor, Node } from './SceneStateManager';
import { Model } from './Model';
import { useRef, useState, useEffect } from 'react';
import { PropertiesPanel } from './PropertiesPanel';

interface AssetConfig {
  name: string;
  modelPath: string;
  scale: number | [number, number, number];
  fov: number;
}

const CameraAndControls: React.FC<{ editingModel: AssetConfig | null }> = ({ editingModel }) => {
  const { camera } = useThree();
  const orbitControlsRef = useRef<any>(null); // Reference for OrbitControls

  // Effect to adjust the camera when editing a model
  useEffect(() => {
    if (editingModel) {
      // Move the camera to a specific position and look at the origin
      camera.position.set(5, 5, 5); // Set this to your desired camera position
      camera.lookAt(0, 0, 0);
      camera.updateProjectionMatrix();

      // Disable OrbitControls
      if (orbitControlsRef.current) {
        orbitControlsRef.current.enabled = false;
      }
    } else {
      // Restore OrbitControls when not editing
      if (orbitControlsRef.current) {
        orbitControlsRef.current.enabled = true;
      }
    }
  }, [editingModel, camera]);

  return <OrbitControls ref={orbitControlsRef} />;
};

export const Scene: React.FC<{ addedModels: AssetConfig[] }> = ({ addedModels }) => {
  const { components, currentFloor, setCurrentFloor, nodes, setNodes, hoverPosition, setHoverPosition } = useScene();
  const [editingModel, setEditingModel] = useState<AssetConfig | null>(null);
  const [modelPosition, setModelPosition] = useState(new THREE.Vector3(0, 0, 0));
  const [modelRotation, setModelRotation] = useState(new THREE.Euler(0, 0, 0));
  const [models, setModels] = useState<Array<{
    name: string;
    modelPath: string;
    scale: number | [number, number, number];
    fov: number;
    position: THREE.Vector3;
    rotation: THREE.Euler;
  }>>([]);
  const transformControlRef = useRef<any>(null); // Reference for the transform controls

  // Effect to set the editing model when a new model is added
  useEffect(() => {
    if (addedModels.length > 0) {
      setEditingModel(addedModels[addedModels.length - 1]); // Set the last added model as the editing model
      setModelPosition(new THREE.Vector3(0, 0, 0));
      setModelRotation(new THREE.Euler(0, 0, 0));
    }
  }, [addedModels]);

  // Effect to update the transform controls when the editing model changes
  useEffect(() => {
    if (transformControlRef.current && editingModel) {
      transformControlRef.current.attach(null); // Detach the current object
      transformControlRef.current.attach(transformControlRef.current.object); // Attach the object again to update the controls
    }
  }, [editingModel]);

  // Update position and rotation in state when TransformControls changes
  const handleTransformChange = () => {
    if (transformControlRef.current && transformControlRef.current.object) {
      const object = transformControlRef.current.object;
      if (object) {
        const position = object.position;
        const rotation = object.rotation;

        setModelPosition(new THREE.Vector3(position.x, position.y, position.z));
        setModelRotation(new THREE.Euler(rotation.x, rotation.y, rotation.z));
      }
    }
  };

  const snapToGrid = (position: THREE.Vector3, size: number = 1): THREE.Vector3 => {
    return new THREE.Vector3(
      Math.round(position.x / size) * size,
      position.y,
      Math.round(position.z / size) * size
    );
  };

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    if (editingModel) return; // Disable floor node placement when editing a model
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

  const handlePointerMove = (event: ThreeEvent<PointerEvent>) => {
    if (editingModel) return; // Disable hover effect when editing a model
    event.stopPropagation();
    const { point } = event;
    setHoverPosition(snapToGrid(point));
  };

  const handlePositionChange = (axis: 'x' | 'y' | 'z', value: number) => {
    const newPosition = modelPosition.clone();
    newPosition[axis] = value;
    setModelPosition(newPosition);
  };

  const handleRotationChange = (axis: 'x' | 'y' | 'z', value: number) => {
    const newRotation = modelRotation.clone();
    newRotation[axis] = THREE.MathUtils.degToRad(value);
    setModelRotation(newRotation);
  };

  const handleFinish = () => {
    if (editingModel) {
      // Generate a unique name for the model
      const uniqueName = `${editingModel.name}_${models.length + 1}`;

      // Add the finalized model to the models array
      const newModel = {
        name: uniqueName,
        modelPath: editingModel.modelPath,
        scale: editingModel.scale,
        fov: editingModel.fov,
        position: modelPosition.clone(),  // Store the current position
        rotation: modelRotation.clone()   // Store the current rotation
      };

      setModels([...models, newModel]);

      // Clear the editing state
      setEditingModel(null);
    }
  };

  const handleAbort = () => {
    // Clear the editing state without saving the model
    setEditingModel(null);
  };

  return (
    <>
      <Canvas camera={{ position: [0, 10, 10], fov: 50 }}>
        <ambientLight intensity={1} />
        <gridHelper args={[100, 100]} />
        <axesHelper args={[5]} />
        <CameraAndControls editingModel={editingModel} />
        <Plane
          args={[100, 100]}
          rotation-x={-Math.PI / 2}
          onClick={handleClick}
          onPointerMove={handlePointerMove}
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
        {models.map((model, index) => (
          <Model
            key={index}
            modelPath={model.modelPath}
            scale={model.scale}
            position={model.position}
            rotation={model.rotation}
          />
        ))}
        {hoverPosition && !editingModel && (
          <Sphere args={[0.2, 16, 16]} position={hoverPosition}>
            <meshStandardMaterial attach="material" color="green" transparent opacity={0.5} />
          </Sphere>
        )}
        {editingModel && (
          <TransformControls
            ref={transformControlRef}
            position={modelPosition}
            rotation={modelRotation}
            mode="translate"
            onChange={handleTransformChange} // Link TransformControls with the state update
          >
            <Model modelPath={editingModel.modelPath} scale={editingModel.scale} opacity={0.5} />
          </TransformControls>
        )}
        <Perf />
      </Canvas>
      {editingModel && (
        <PropertiesPanel
          position={{ x: modelPosition.x, y: modelPosition.y, z: modelPosition.z }}
          rotation={{ x: THREE.MathUtils.radToDeg(modelRotation.x), y: THREE.MathUtils.radToDeg(modelRotation.y), z: THREE.MathUtils.radToDeg(modelRotation.z) }}
          onChangePosition={handlePositionChange}
          onChangeRotation={handleRotationChange}
          onFinish={handleFinish}
          onAbort={handleAbort}
        />
      )}
    </>
  );
};
