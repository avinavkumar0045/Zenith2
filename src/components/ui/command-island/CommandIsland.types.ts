export type CommandIslandState = 
  | 'idle' 
  | 'search' 
  | 'searching' 
  | 'location-ready' 
  | 'notification' 
  | 'loading' 
  | 'error';

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
