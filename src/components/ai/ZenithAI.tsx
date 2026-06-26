import React, { useEffect } from 'react';
import { ZenithAIDrawer } from './ZenithAIDrawer';
import { ZenithAIContent } from './ZenithAIContent';

interface ZenithAIProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ZenithAI: React.FC<ZenithAIProps> = ({ isOpen, onClose }) => {
  // Sync body class state to allow coordinate indicators or command island shifts
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('ai-drawer-open');
    } else {
      document.body.classList.remove('ai-drawer-open');
    }
    return () => {
      document.body.classList.remove('ai-drawer-open');
    };
  }, [isOpen]);

  return (
    <ZenithAIDrawer isOpen={isOpen} onClose={onClose}>
      <ZenithAIContent onClose={onClose} />
    </ZenithAIDrawer>
  );
};

export default ZenithAI;
