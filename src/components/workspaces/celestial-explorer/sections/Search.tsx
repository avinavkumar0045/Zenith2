import React, { useRef } from 'react';
import { Search as SearchIcon, X } from 'lucide-react';
import { useCelestialExplorerStore } from '../CelestialExplorer.types';

export const Search: React.FC = () => {
  const { searchQuery, setSearchQuery } = useCelestialExplorerStore();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClear = () => {
    setSearchQuery('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className="relative flex items-center w-full h-10 px-3 bg-slate-950/70 border border-white/10 rounded-2xl transition-all duration-300 focus-within:border-cyan-500/50 focus-within:ring-1 focus-within:ring-cyan-500/20 group">
      <SearchIcon className="w-4 h-4 text-slate-400 group-focus-within:text-cyan-400 transition-colors" />
      <input
        ref={inputRef}
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search planets, satellites, deep sky..."
        className="flex-1 min-w-0 ml-2 bg-transparent border-none outline-none text-xs text-white placeholder-slate-500 caret-cyan-400"
      />
      {searchQuery.length > 0 && (
        <button
          onClick={handleClear}
          aria-label="Clear search"
          className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};
