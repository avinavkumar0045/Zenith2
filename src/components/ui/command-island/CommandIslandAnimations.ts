import { Transition, Variants } from 'framer-motion';

// Standard spring configuration for organic, physical morphing
export const springTransition: Transition = {
  type: "spring",
  stiffness: 350,
  damping: 28,
  mass: 1
};

// Fade variant for content elements inside the island to prevent harsh layout jumps
export const contentFadeVariants: Variants = {
  hidden: { 
    opacity: 0,
    transition: { duration: 0.1, ease: "easeInOut" }
  },
  visible: { 
    opacity: 1,
    transition: { duration: 0.15, ease: "easeInOut", delay: 0.05 }
  }
};

// Get appropriate transitions depending on system preferences
export function getTransition(prefersReducedMotion: boolean): Transition {
  if (prefersReducedMotion) {
    return {
      duration: 0
    };
  }
  return springTransition;
}
