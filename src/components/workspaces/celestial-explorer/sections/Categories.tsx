import React from 'react';
import { useCelestialExplorerStore, ExplorerCategory } from '../CelestialExplorer.types';
import clsx from 'clsx';

interface CategoriesProps {
  counts: Record<ExplorerCategory | 'all', number>;
}

export const Categories: React.FC<CategoriesProps> = ({ counts }) => {
  const { activeCategory, setActiveCategory } = useCelestialExplorerStore();

  const categories: { id: ExplorerCategory | 'all'; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'planets', label: 'Planets' },
    { id: 'moon', label: 'Moon' },
    { id: 'stations', label: 'Stations' },
    { id: 'satellites', label: 'Satellites' },
    { id: 'constellations', label: 'Constellations' },
    { id: 'deep-sky', label: 'Deep Sky' },
  ];

  return (
    <div className="w-full select-none">
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none custom-scrollbar">
        {categories.map((cat) => {
          const isActive = activeCategory === cat.id;
          const count = counts[cat.id] ?? 0;

          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={clsx(
                "flex-shrink-0 flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-sans font-medium tracking-wide border transition-all duration-[200ms] cursor-pointer",
                isActive
                  ? "bg-white/20 border-white/35 text-white font-semibold shadow-[0_0_8px_rgba(255,255,255,0.1)]"
                  : "bg-slate-900/40 border-white/5 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 hover:border-white/10"
              )}
            >
              <span>{cat.label}</span>
              <span className={clsx(
                "text-[8px] font-mono px-1 py-0.2 rounded-full",
                isActive ? "bg-white/15 text-white" : "bg-white/5 text-slate-500"
              )}>
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
