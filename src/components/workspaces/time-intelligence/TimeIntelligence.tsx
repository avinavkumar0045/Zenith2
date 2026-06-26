import React from 'react';
import { Drawer } from './Drawer';
import { Content } from './Content';
import { useTimeSynchronization } from './utils';

interface TimeIntelligenceProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TimeIntelligence: React.FC<TimeIntelligenceProps> = ({ isOpen, onClose }) => {
  // Sync simulated time changes to all subsystem stores and the Cesium globe
  useTimeSynchronization();

  return (
    <Drawer isOpen={isOpen} onClose={onClose}>
      <Content onClose={onClose} />
    </Drawer>
  );
};
