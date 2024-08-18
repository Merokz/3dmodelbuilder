// /index.tsx
"use client"; // Ensure this is at the top
import { SceneStateManager } from "./components/scene/SceneStateManager";
import { Scene } from "./components/scene/Scene";
import Sidebar from "./components/sidebar/Sidebar";
import { useState } from 'react';

interface AssetConfig {
  name: string;
  modelPath: string;
  scale: number | [number, number, number];
  fov: number;
}

export default function Home() {
  const [modelsToAdd, setModelsToAdd] = useState<AssetConfig[]>([]);

  const handleAddToScene = (modelData: AssetConfig) => {
    setModelsToAdd((prevModels) => [...prevModels, modelData]);
  };

  return (
    <div className="flex">
      <Sidebar onAddToScene={handleAddToScene} />
      <main className="flex min-h-screen flex-col items-center justify-between">
        <SceneStateManager>
          <Scene addedModels={modelsToAdd} />
        </SceneStateManager>
      </main>
    </div>
  );
}
