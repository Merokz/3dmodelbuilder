// /index.tsx
"use client"; // Ensure this is at the top
import { SceneStateManager } from "./components/scene/SceneStateManager";
import { Scene } from "./components/scene/Scene";
import Sidebar from "./components/sidebar/Sidebar";

export default function Home() {
  return (
    <div className="flex">
      <Sidebar onDragStart={() => {}} />
      <main className="flex min-h-screen flex-col items-center justify-between">
        <SceneStateManager>
          <Scene />
        </SceneStateManager>
      </main>
    </div>
  );
}
