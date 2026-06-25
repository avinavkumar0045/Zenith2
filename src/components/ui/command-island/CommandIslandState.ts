import { useState, useEffect, useCallback } from 'react';
import { useLocationStore } from '@/modules/location/store/useLocationStore';
import { CommandIslandState, CommandIslandController } from './CommandIsland.types';

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

  const triggerSearch = useCallback(() => {
    setStateInternal('search');
  }, []);

  const cancelSearch = useCallback(() => {
    if (activeLocation) {
      setStateInternal('location-ready');
    } else {
      setStateInternal('idle');
    }
  }, [activeLocation]);

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
    hideNotification
  };
}
