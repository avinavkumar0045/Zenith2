import React, { useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useCommandIslandState } from './CommandIslandState';
import { CommandIslandContent } from './CommandIslandContent';
import { getTransition } from './CommandIslandAnimations';
import { CommandIslandProps } from './CommandIsland.types';
import { CommandIslandEvents } from './CommandIslandEvents';
import clsx from 'clsx';

export const CommandIsland: React.FC<CommandIslandProps> = ({ className }) => {
  const stateBindings = useCommandIslandState();
  const {
    state,
    notification,
    cancelSearch,
    hideNotification,
    searchQuery,
    searchResults
  } = stateBindings;

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
  const hasSearchResults = isSearchState && searchQuery.trim().length >= 2 && searchResults.length > 0;

  // Premium height constraints with breathing room (no camera setup panel)
  // Align search box height (h-11) and remove vertical padding when search is collapsed for perfect vertical centering.
  const heightClass = hasSearchResults 
    ? "h-auto py-4 px-4 md:px-5" 
    : state === 'location-ready' 
      ? 'h-[68px] py-2.5 px-4 md:px-5' 
      : 'h-11 py-0 px-4';

  const borderRadiusClass = hasSearchResults
    ? "rounded-[24px]"
    : "rounded-full";

  const flexClass = hasSearchResults
    ? "flex-col items-stretch"
    : "flex-row items-center justify-between";

  return (
    <div className={clsx("w-full flex justify-center pointer-events-auto", className)}>
      <motion.div
        ref={containerRef}
        layout
        transition={transitionConfig}
        className={clsx(
          "bg-slate-950/93 backdrop-blur-2xl border border-white/10 border-t-white/20 border-b-white/5 shadow-[0_12px_32px_-8px_rgba(0,0,0,0.95)] select-none overflow-hidden flex relative",
          borderRadiusClass,
          flexClass,
          heightClass,
          isSearchState 
            ? "w-full max-w-[320px] sm:max-w-[400px] md:max-w-[460px]" 
            : "w-full max-w-[280px] sm:max-w-[340px] md:max-w-[380px]"
        )}
      >
        <AnimatePresence mode="popLayout">
          <CommandIslandContent
            {...stateBindings}
            onSearchClick={stateBindings.triggerSearch}
            onCancelSearch={stateBindings.cancelSearch}
            onDismissNotification={stateBindings.hideNotification}
          />
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
