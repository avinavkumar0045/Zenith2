import React, { useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useCommandIslandState } from './CommandIslandState';
import { CommandIslandContent } from './CommandIslandContent';
import { getTransition } from './CommandIslandAnimations';
import { CommandIslandProps } from './CommandIsland.types';
import { CommandIslandEvents } from './CommandIslandEvents';
import clsx from 'clsx';

export const CommandIsland: React.FC<CommandIslandProps> = ({ className }) => {
  const {
    state,
    notification,
    activeLocation,
    triggerSearch,
    cancelSearch,
    hideNotification
  } = useCommandIslandState();
  const containerRef = useRef<HTMLDivElement>(null);

  // Click outside detection to collapse search
  useEffect(() => {
    if (state !== 'search') return;
    const cleanup = CommandIslandEvents.bindClickOutside(containerRef, cancelSearch);
    return cleanup;
  }, [state, cancelSearch]);

  // Escape key handler to collapse search or dismiss notification
  useEffect(() => {
    if (state !== 'search' && state !== 'notification') return;
    const cleanup = CommandIslandEvents.bindEscapeKey(() => {
      if (state === 'search') {
        cancelSearch();
      } else if (state === 'notification') {
        hideNotification();
      }
    });
    return cleanup;
  }, [state, cancelSearch, hideNotification]);

  // Reduced motion detection
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

  const transitionConfig = getTransition(prefersReducedMotion);

  // Determine bounds styling based on state for layout transitions
  const isSearchState = state === 'search' || state === 'searching';
  const heightClass = state === 'location-ready' ? 'h-[72px] py-2.5' : 'h-12';

  return (
    <div className={clsx("w-full flex justify-center pointer-events-auto", className)}>
      <motion.div
        ref={containerRef}
        layout
        transition={transitionConfig}
        className={clsx(
          "glass-capsule-heavy flex items-center justify-between px-3 md:px-4 rounded-full select-none overflow-hidden transition-shadow duration-[250ms]",
          heightClass,
          isSearchState 
            ? "w-full max-w-[320px] sm:max-w-[400px] md:max-w-[460px] shadow-[0_20px_50px_rgba(0,0,0,0.8)]" 
            : "w-full max-w-[280px] sm:max-w-[340px] md:max-w-[380px]"
        )}
      >
        <AnimatePresence mode="wait">
          <CommandIslandContent
            state={state}
            notification={notification}
            activeLocation={activeLocation}
            onSearchClick={triggerSearch}
            onCancelSearch={cancelSearch}
            onDismissNotification={hideNotification}
          />
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
