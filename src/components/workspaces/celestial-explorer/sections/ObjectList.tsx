import React, { useEffect, useRef } from 'react';
import { useCelestialExplorerStore, ExplorerObject } from '../CelestialExplorer.types';
import { Star } from 'lucide-react';
import clsx from 'clsx';

interface ObjectListProps {
  objects: ExplorerObject[];
  onFocusObject: (obj: ExplorerObject) => void;
}

export const ObjectList: React.FC<ObjectListProps> = ({ objects, onFocusObject }) => {
  const {
    selectedObjectId,
    setSelectedObjectId,
    keyboardFocusIndex,
    setKeyboardFocusIndex,
  } = useCelestialExplorerStore();

  const listRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<(HTMLButtonElement | null)[]>([]);

  // Synchronize refs length
  useEffect(() => {
    itemsRef.current = itemsRef.current.slice(0, objects.length);
  }, [objects]);

  // Set keyboardFocusIndex to match selectedObjectId initially or on change
  useEffect(() => {
    if (selectedObjectId) {
      const idx = objects.findIndex(o => o.id === selectedObjectId);
      if (idx !== -1 && idx !== keyboardFocusIndex) {
        setKeyboardFocusIndex(idx);
      }
    } else {
      setKeyboardFocusIndex(-1);
    }
  }, [selectedObjectId, objects]);

  // Scroll active item into view
  useEffect(() => {
    if (keyboardFocusIndex >= 0 && keyboardFocusIndex < objects.length) {
      const el = itemsRef.current[keyboardFocusIndex];
      if (el) {
        el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [keyboardFocusIndex]);

  // Handle global keyboard events when drawer is focused/active
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (objects.length === 0) return;

      // Prevent scrolling the main window when navigating the list
      if (['ArrowUp', 'ArrowDown', 'Enter'].includes(e.key)) {
        // If an input has focus, only allow Enter if it's not searching, but Arrow keys should navigate the list
        const activeEl = document.activeElement;
        const isInput = activeEl && activeEl.tagName === 'INPUT';
        
        if (isInput && e.key === 'Enter') return; // let search handle its enter
        
        e.preventDefault();
      }

      if (e.key === 'ArrowDown') {
        const nextIdx = Math.min(objects.length - 1, keyboardFocusIndex + 1);
        setKeyboardFocusIndex(nextIdx);
        setSelectedObjectId(objects[nextIdx].id);
      } else if (e.key === 'ArrowUp') {
        const prevIdx = Math.max(0, keyboardFocusIndex - 1);
        setKeyboardFocusIndex(prevIdx);
        setSelectedObjectId(objects[prevIdx].id);
      } else if (e.key === 'Enter') {
        if (keyboardFocusIndex >= 0 && keyboardFocusIndex < objects.length) {
          onFocusObject(objects[keyboardFocusIndex]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [objects, keyboardFocusIndex, onFocusObject]);

  const getRatingColor = (score: number) => {
    if (score >= 8) return 'text-emerald-400';
    if (score >= 6) return 'text-cyan-400';
    if (score >= 4) return 'text-amber-400';
    return 'text-rose-400';
  };

  const getVisibilityLabelClass = (state: string) => {
    if (state.includes('Visible') || state.includes('Orbit')) return 'text-emerald-400/90 bg-emerald-500/10 border-emerald-500/20';
    return 'text-slate-500 bg-white/3 border-white/5';
  };

  if (objects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-slate-500 font-sans text-xs">
        No objects match search criteria.
      </div>
    );
  }

  return (
    <div
      ref={listRef}
      className="flex-1 overflow-y-auto pr-1 flex flex-col gap-1 custom-scrollbar scroll-smooth"
      role="listbox"
      aria-label="Celestial Objects"
    >
      {objects.map((obj, idx) => {
        const isSelected = selectedObjectId === obj.id;
        const isKeyboardFocused = keyboardFocusIndex === idx;

        return (
          <button
            key={obj.id}
            ref={el => { itemsRef.current[idx] = el; }}
            role="option"
            aria-selected={isSelected}
            onClick={() => {
              setSelectedObjectId(obj.id);
              setKeyboardFocusIndex(idx);
            }}
            className={clsx(
              "w-full flex items-center justify-between px-3 py-2 rounded-xl border text-left transition-all duration-[150ms] cursor-pointer outline-none",
              isSelected
                ? "bg-white/8 border-white/15"
                : isKeyboardFocused
                  ? "bg-white/5 border-white/10"
                  : "bg-slate-900/15 border-transparent hover:bg-white/3 hover:border-white/5"
            )}
          >
            <div className="flex flex-col gap-0.5 min-w-0 flex-1 pr-2">
              <span className={clsx(
                "text-xs font-semibold truncate leading-normal transition-colors",
                isSelected ? "text-cyan-300" : "text-white/90"
              )}>
                {obj.name}
              </span>
              <div className="flex items-center gap-2 mt-0.5 text-[8px] tracking-wide text-slate-500 uppercase font-mono font-bold">
                <span>{obj.type === 'deep-sky' ? 'Deep Sky' : obj.type}</span>
                <span>•</span>
                <span className="truncate">{obj.direction} ({obj.altitude.toFixed(0)}°)</span>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Visibility Badge */}
              <span className={clsx(
                "text-[8px] font-semibold px-2 py-0.5 rounded border tracking-wide uppercase font-sans",
                getVisibilityLabelClass(obj.visibilityState)
              )}>
                {obj.visibilityState.split(' ')[0]}
              </span>

              {/* Rating */}
              <div className={clsx(
                "flex items-center gap-0.5 text-[9px] font-mono font-bold px-1.5 py-0.5 bg-slate-900/60 rounded border border-white/5",
                getRatingColor(obj.observationRating)
              )}>
                <Star className="w-2.5 h-2.5 fill-current" />
                <span>{obj.observationRating}</span>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
};
