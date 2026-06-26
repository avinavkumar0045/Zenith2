export type CommandIslandState = 
  | 'idle' 
  | 'search' 
  | 'searching' 
  | 'location-ready' 
  | 'notification' 
  | 'loading' 
  | 'error';

export interface CommandSearchResultItem {
  id: string;
  name: string;
  type: 'location' | 'planet' | 'satellite' | 'constellation';
  detail?: string;
  originalData: any;
}

export type LiveActivityMode = 'telemetry' | 'sky-score' | 'event-tracker';

export interface CommandIslandController {
  setState(state: CommandIslandState): void;
  showNotification(text: string, priority: number): void;
  hideNotification(): void;
  collapse(): void;
  expand(): void;
}

export interface CommandIslandProps {
  className?: string;
}
