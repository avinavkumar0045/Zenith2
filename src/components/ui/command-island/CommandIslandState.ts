import { useState, useEffect, useCallback } from 'react';
import { useLocationStore } from '@/modules/location/store/useLocationStore';
import { usePlanetStore } from '@/modules/planets/store/usePlanetStore';
import { useSatelliteStore } from '@/modules/satellites/store/useSatelliteStore';
import { useConstellationStore } from '@/modules/constellations/store/useConstellationStore';
import { GeocodingService } from '@/modules/location/services/GeocodingService';
import { LocationService } from '@/modules/location/services/LocationService';
import { EventEngine } from '@/components/workspaces/mission-brief/engine/EventEngine';
import { 
  CommandIslandState, 
  CommandIslandController, 
  CommandSearchResultItem, 
  LiveActivityMode
} from './CommandIsland.types';

interface NotificationItem {
  text: string;
  priority: number;
}

// A global registry to enable decoupled components to command the active Command Island instance
let globalControllerInstance: CommandIslandController | null = null;

export const CommandIslandAPI = {
  register(controller: CommandIslandController) {
    globalControllerInstance = controller;
  },
  unregister() {
    globalControllerInstance = null;
  },
  setState(state: CommandIslandState) {
    globalControllerInstance?.setState(state);
  },
  showNotification(text: string, priority: number) {
    globalControllerInstance?.showNotification(text, priority);
  },
  hideNotification() {
    globalControllerInstance?.hideNotification();
  },
  collapse() {
    globalControllerInstance?.collapse();
  },
  expand() {
    globalControllerInstance?.expand();
  }
};

export function useCommandIslandState() {
  const activeLocation = useLocationStore((state) => state.activeLocation);
  
  // Single state machine state
  const [state, setStateInternal] = useState<CommandIslandState>('idle');
  
  // Prioritized notification tracking
  const [notification, setNotification] = useState<NotificationItem | null>(null);

  // Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<CommandSearchResultItem[]>([]);
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Live Activity Widgets States
  const [liveActivityMode, setLiveActivityMode] = useState<LiveActivityMode>('telemetry');
  const [nextEvent, setNextEvent] = useState<any>(null);
  const [eventCountdown, setEventCountdown] = useState<string>('');

  // Sync state machine base state when the targeted geolocation changes
  useEffect(() => {
    // Only auto-transition base state if we aren't in temporary overrides like search or notification
    if (state !== 'search' && state !== 'searching' && state !== 'notification') {
      if (activeLocation) {
        setStateInternal('location-ready');
      } else {
        setStateInternal('idle');
      }
    }
  }, [activeLocation, state]);

  // Debounce search query input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Execute unified query search across multiple indexes
  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    let isCurrent = true;

    async function performSearch() {
      setStateInternal('searching');
      try {
        const queryLower = debouncedQuery.toLowerCase();
        
        // 1. Geocoding Search (async)
        const geoResults = await GeocodingService.search(debouncedQuery);
        if (!isCurrent) return;

        const results: CommandSearchResultItem[] = [];

        // Add Geocoding location results
        geoResults.forEach((r, idx) => {
          results.push({
            id: `geo-${r.latitude}-${r.longitude}-${idx}`,
            name: r.name,
            type: 'location',
            detail: r.country,
            originalData: r
          });
        });

        // 2. Add Planet results
        const planetsObj = usePlanetStore.getState().planets;
        if (planetsObj) {
          Object.values(planetsObj).forEach(p => {
            if (p.name.toLowerCase().includes(queryLower)) {
              results.push({
                id: `planet-${p.id}`,
                name: p.name,
                type: 'planet',
                detail: p.isAboveHorizon ? 'Above Horizon' : 'Below Horizon',
                originalData: p
              });
            }
          });
        }

        // 3. Add Satellite results
        const satellitesList = useSatelliteStore.getState().activeSatellites;
        if (satellitesList) {
          satellitesList.forEach(s => {
            if (s.name.toLowerCase().includes(queryLower)) {
              results.push({
                id: `sat-${s.id}`,
                name: s.name,
                type: 'satellite',
                detail: `NORAD ${s.noradId} • Altitude ${(s.altitude/1000).toFixed(0)}km`,
                originalData: s
              });
            }
          });
        }

        // 4. Add Constellation results
        const constellationsList = useConstellationStore.getState().constellations;
        if (constellationsList) {
          constellationsList.forEach(c => {
            if (c.name.toLowerCase().includes(queryLower)) {
              results.push({
                id: `const-${c.id}`,
                name: c.name,
                type: 'constellation',
                detail: c.isVisible ? 'Visible Tonight' : 'Not Visible',
                originalData: c
              });
            }
          });
        }

        if (isCurrent) {
          setSearchResults(results.slice(0, 8)); // limit to top 8 items for premium layout spacing
          setStateInternal('search');
        }
      } catch (err) {
        console.error("Command Island search error", err);
        if (isCurrent) {
          setStateInternal('search');
        }
      }
    }

    performSearch();

    return () => {
      isCurrent = false;
    };
  }, [debouncedQuery]);

  // Next upcoming event countdown compiler
  const updateNextEvent = useCallback(() => {
    if (!activeLocation) {
      setNextEvent(null);
      setEventCountdown('');
      return;
    }
    try {
      const events = EventEngine.getChronologicalEvents();
      if (events && events.length > 0) {
        const closest = events[0];
        setNextEvent(closest);
        
        const diffMs = closest.timestamp - Date.now();
        if (diffMs <= 0) {
          setEventCountdown('Now');
        } else {
          const diffSecs = Math.floor(diffMs / 1000);
          const mins = Math.floor(diffSecs / 60);
          const secs = diffSecs % 60;
          const hours = Math.floor(mins / 60);
          const minsDisplay = mins % 60;
          
          if (hours > 0) {
            setEventCountdown(`${hours}h ${minsDisplay}m`);
          } else {
            setEventCountdown(`${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
          }
        }
      } else {
        setNextEvent(null);
        setEventCountdown('');
      }
    } catch (e) {
      console.warn("Failed to compile event countdown for Command Island", e);
    }
  }, [activeLocation]);

  // Sync event calculations immediately when active location changes
  useEffect(() => {
    updateNextEvent();
  }, [activeLocation, updateNextEvent]);

  // Background interval for live-updating countdowns
  useEffect(() => {
    const interval = setInterval(() => {
      if (liveActivityMode === 'event-tracker') {
        updateNextEvent();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [liveActivityMode, updateNextEvent]);

  const triggerSearch = useCallback(() => {
    setStateInternal('search');
  }, []);

  const cancelSearch = useCallback(() => {
    setSearchQuery('');
    setSearchResults([]);
    if (activeLocation) {
      setStateInternal('location-ready');
    } else {
      setStateInternal('idle');
    }
  }, [activeLocation]);

  const selectResult = useCallback(async (item: CommandSearchResultItem) => {
    setSearchQuery('');
    setSearchResults([]);
    
    if (activeLocation) {
      setStateInternal('location-ready');
    } else {
      setStateInternal('idle');
    }

    if (item.type === 'location') {
      await LocationService.setLocationFromResult(item.originalData);
    } else if (item.type === 'planet') {
      usePlanetStore.getState().setSelectedPlanet(item.originalData.id);
      showNotification(`Tracking Planet: ${item.name}`, 2);
    } else if (item.type === 'satellite') {
      useSatelliteStore.getState().setSelectedSatellite(item.originalData);
      showNotification(`Tracking Satellite: ${item.name}`, 2);
    } else if (item.type === 'constellation') {
      showNotification(`Tracking Constellation: ${item.name}`, 2);
    }
  }, [activeLocation]);

  // Cycle through live activity widgets
  const cycleLiveActivityMode = useCallback(() => {
    setLiveActivityMode(prev => {
      if (prev === 'telemetry') return 'sky-score';
      if (prev === 'sky-score') return 'event-tracker';
      return 'telemetry';
    });
  }, []);

  // Controller API Implementations
  const setState = useCallback((newState: CommandIslandState) => {
    setStateInternal(newState);
  }, []);

  const showNotification = useCallback((text: string, priority: number) => {
    setNotification(prev => {
      // Rule: Display only ONE primary message, respect priority hierarchy
      if (!prev || priority >= prev.priority) {
        setStateInternal('notification');
        return { text, priority };
      }
      return prev;
    });
  }, []);

  const hideNotification = useCallback(() => {
    setNotification(null);
    if (activeLocation) {
      setStateInternal('location-ready');
    } else {
      setStateInternal('idle');
    }
  }, [activeLocation]);

  const collapse = useCallback(() => {
    if (activeLocation) {
      setStateInternal('location-ready');
    } else {
      setStateInternal('idle');
    }
  }, [activeLocation]);

  const expand = useCallback(() => {
    setStateInternal('search');
  }, []);

  // Register self with global API on mount
  useEffect(() => {
    const controller: CommandIslandController = {
      setState,
      showNotification,
      hideNotification,
      collapse,
      expand
    };
    CommandIslandAPI.register(controller);
    return () => {
      CommandIslandAPI.unregister();
    };
  }, [setState, showNotification, hideNotification, collapse, expand]);

  return {
    state,
    setState,
    notification,
    activeLocation,
    triggerSearch,
    cancelSearch,
    hideNotification,
    
    // Search bindings
    searchQuery,
    setSearchQuery,
    searchResults,
    selectResult,

    // Live Activity bindings
    liveActivityMode,
    setLiveActivityMode,
    cycleLiveActivityMode,
    nextEvent,
    eventCountdown
  };
}
