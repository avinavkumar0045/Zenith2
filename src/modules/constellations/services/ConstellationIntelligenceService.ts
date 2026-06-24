import { useLocationStore } from '../../location/store/useLocationStore';
import { useWeatherStore } from '../../weather/store/useWeatherStore';
import { useConstellationStore } from '../store/useConstellationStore';

import { ConstellationCatalogService } from './ConstellationCatalogService';
import { ConstellationVisibilityService } from './ConstellationVisibilityService';
import { ConstellationZenithService } from './ConstellationZenithService';
import { ConstellationObservationService } from './ConstellationObservationService';
import { ConstellationObject } from '../types/constellation.types';

import * as SunCalc from 'suncalc';

class ConstellationIntelligenceServiceClass {
  private unsubscribeLocation: (() => void) | null = null;
  private unsubscribeWeather: (() => void) | null = null;

  public initialize() {
    this.unsubscribeLocation = useLocationStore.subscribe((state, prevState) => {
      if (state.activeLocation !== prevState.activeLocation) {
        this.generateIntelligence();
      }
    });

    this.unsubscribeWeather = useWeatherStore.subscribe((state, prevState) => {
      if (state.weather?.updatedAt !== prevState.weather?.updatedAt) {
        this.generateIntelligence();
      }
    });

    // Initial generate
    this.generateIntelligence();
  }

  private generateIntelligence() {
    const { activeLocation } = useLocationStore.getState();
    if (!activeLocation) return;

    const { weather } = useWeatherStore.getState();
    const weatherMultiplier = weather?.scoreMultiplier ?? 1.0;

    const date = new Date();
    const sunPos = SunCalc.getPosition(date, activeLocation.latitude, activeLocation.longitude);
    const sunAlt = sunPos.altitude * 180 / Math.PI;
    const isDaylight = sunAlt > 0;

    const catalog = ConstellationCatalogService.catalog;
    const constellations: ConstellationObject[] = [];

    catalog.forEach(c => {
      const { altitude, azimuth } = ConstellationVisibilityService.calculatePosition(
        c.rightAscension, 
        c.declination, 
        activeLocation.latitude, 
        activeLocation.longitude, 
        date
      );

      const isVisible = altitude > 0 && !isDaylight;
      const visibilityScore = ConstellationObservationService.calculateScore(altitude, isDaylight, weatherMultiplier);
      const isNearZenith = isVisible && ConstellationZenithService.calculateZenithDistance(altitude) < 15;

      const constellationObj: ConstellationObject = {
        id: c.id,
        name: c.name,
        abbreviation: c.abbreviation,
        rightAscension: c.rightAscension,
        declination: c.declination,
        altitude,
        azimuth,
        visibilityScore,
        isVisible,
        isNearZenith,
        recommended: visibilityScore > 7,
        description: c.description
      };
      
      constellations.push(constellationObj);
    });

    useConstellationStore.getState().setConstellations(constellations);
  }

  public destroy() {
    if (this.unsubscribeLocation) this.unsubscribeLocation();
    if (this.unsubscribeWeather) this.unsubscribeWeather();
  }
}

export const ConstellationIntelligenceService = new ConstellationIntelligenceServiceClass();
