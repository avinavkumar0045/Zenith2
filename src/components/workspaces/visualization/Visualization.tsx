import React, { useEffect } from 'react';
import { VisualizationDrawer } from './VisualizationDrawer';
import { VisualizationContent } from './VisualizationContent';
import { VisualizationEngine } from './engine/VisualizationEngine';

interface VisualizationProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Visualization: React.FC<VisualizationProps> = ({ isOpen, onClose }) => {
  // Start engine subscription on component mount, and clean up on unmount
  useEffect(() => {
    VisualizationEngine.startSubscription();
    return () => {
      VisualizationEngine.stopSubscription();
    };
  }, []);

  return (
    <VisualizationDrawer isOpen={isOpen} onClose={onClose}>
      <VisualizationContent onClose={onClose} />
    </VisualizationDrawer>
  );
};

export default Visualization;
