import mitt from 'mitt';
import { LocationIntelligenceObject } from '../types/location.types';

type Events = {
  locationChanged: LocationIntelligenceObject | null;
  globeClicked: { latitude: number, longitude: number };
  moonUpdated: any;
  // Future events can go here
};

export const eventBus = mitt<Events>();
