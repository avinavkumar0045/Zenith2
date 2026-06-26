import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export const VisualizationDrawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  children
}) => {
  const drawerRef = useRef<HTMLDivElement>(null);

  // Close drawer on Escape press
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Reduced motion media query checks
  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(false);
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const listener = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, []);

  const slideVariants = {
    closed: { 
      x: '-110%',
      opacity: 0,
      transition: prefersReducedMotion ? { duration: 0 } : { type: 'spring' as const, stiffness: 300, damping: 28 }
    },
    open: { 
      x: 0,
      opacity: 1,
      transition: prefersReducedMotion ? { duration: 0 } : { type: 'spring' as const, stiffness: 300, damping: 28 }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={drawerRef}
          initial="closed"
          animate="open"
          exit="closed"
          variants={slideVariants}
          className="fixed top-[72px] bottom-24 left-4 z-30 w-[calc(100vw-32px)] max-w-[360px] sm:max-w-[400px] rounded-3xl overflow-hidden pointer-events-auto border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.85)] flex flex-col p-5 text-white"
          style={{
            background: 'rgba(8, 10, 16, 0.82)',
            backdropFilter: 'blur(32px)',
            WebkitBackdropFilter: 'blur(32px)'
          }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default VisualizationDrawer;
