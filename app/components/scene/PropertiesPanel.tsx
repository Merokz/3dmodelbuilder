// components/scene/PropertiesPanel.tsx

import React from 'react';

interface PropertiesPanelProps {
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  onChangePosition: (axis: string, value: number) => void;
  onChangeRotation: (axis: string, value: number) => void;
  onFinish: () => void;
  onAbort: () => void;
}

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  position,
  rotation,
  onChangePosition,
  onChangeRotation,
  onFinish,
  onAbort,
}) => {
  return (
    <div className="properties-panel">
      <h3>Properties</h3>
      <div>
        <label>Position X: <input type="number" value={position.x} onChange={(e) => onChangePosition('x', parseFloat(e.target.value))} /></label>
      </div>
      <div>
        <label>Position Y: <input type="number" value={position.y} onChange={(e) => onChangePosition('y', parseFloat(e.target.value))} /></label>
      </div>
      <div>
        <label>Position Z: <input type="number" value={position.z} onChange={(e) => onChangePosition('z', parseFloat(e.target.value))} /></label>
      </div>
      <div>
        <label>Rotation X: <input type="number" value={rotation.x} onChange={(e) => onChangeRotation('x', parseFloat(e.target.value))} /></label>
      </div>
      <div>
        <label>Rotation Y: <input type="number" value={rotation.y} onChange={(e) => onChangeRotation('y', parseFloat(e.target.value))} /></label>
      </div>
      <div>
        <label>Rotation Z: <input type="number" value={rotation.z} onChange={(e) => onChangeRotation('z', parseFloat(e.target.value))} /></label>
      </div>
      <div>
        <button onClick={onFinish}>Finish</button>
        <button onClick={onAbort}>Abort</button>
      </div>
    </div>
  );
};
