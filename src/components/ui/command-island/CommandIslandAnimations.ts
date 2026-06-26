import { Transition, Variants } from 'framer-motion';

// Elastic liquid-physics spring configuration
export const springTransition: Transition = {
  type: "spring",
  stiffness: 420,
  damping: 26,
  mass: 0.85
};

// Seamless simultaneous slide-fade variants to prevent disjointed flashing
export const contentFadeVariants: Variants = {
  hidden: { 
    opacity: 0,
    y: 8,
    scale: 0.96,
    transition: { duration: 0.12, ease: "easeOut" }
  },
  visible: { 
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { 
      type: "spring",
      stiffness: 380,
      damping: 24,
      mass: 0.9,
      staggerChildren: 0.05,
      delayChildren: 0.02
    }
  }
};

// Staggered item entrance for nested labels and stats
export const childItemVariants: Variants = {
  hidden: { opacity: 0, y: 5 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: "spring", stiffness: 350, damping: 22 }
  }
};

export function getTransition(prefersReducedMotion: boolean): Transition {
  if (prefersReducedMotion) {
    return { duration: 0 };
  }
  return springTransition;
}
