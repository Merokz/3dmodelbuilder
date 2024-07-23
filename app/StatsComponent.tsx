// StatsComponent.tsx
import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import Stats from 'three/examples/jsm/libs/stats.module.js';

interface StatsComponentProps {
  showPanel?: number; // 0: fps, 1: ms, 2: mb
  position?: { top?: string; left?: string; right?: string; bottom?: string };
  scale?: number;
}

const StatsComponent: React.FC<StatsComponentProps> = ({ showPanel = 2, position, scale = 1 }) => {
  const { gl } = useThree();

  useEffect(() => {
    const stats = new Stats();
    stats.showPanel(showPanel); // 0: fps, 1: ms, 2: mb
    document.body.appendChild(stats.dom);
    stats.dom.id = 'stats';
    stats.dom.style.maxHeight = '150px';
    if (position) {
      stats.dom.style.position = 'fixed';
      stats.dom.style.maxHeight = '150px';
      if (position.top) stats.dom.style.top = position.top;
      if (position.left) stats.dom.style.left = position.left;
      if (position.right) stats.dom.style.right = position.right;
      if (position.bottom) stats.dom.style.bottom = position.bottom;
    }

    if (scale !== 1) {
      stats.dom.style.transform = `scale(${scale})`;
      stats.dom.style.transformOrigin = 'top left';
    }

    const updateStats = () => {
      stats.update();
      gl.setAnimationLoop(updateStats);
    };

    gl.setAnimationLoop(updateStats);

    return () => {
      document.body.removeChild(stats.dom);
      gl.setAnimationLoop(null);
    };
  }, [gl, showPanel, position, scale]);

  return null;
};

export default StatsComponent;
