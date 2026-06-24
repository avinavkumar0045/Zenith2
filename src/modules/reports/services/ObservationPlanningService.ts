import { useLocationStore } from '../../location/store/useLocationStore';
import { useMoonStore } from '../../moon/store/useMoonStore';
import { usePlanetStore } from '../../planets/store/usePlanetStore';
import { usePassStore } from '../../pass-predictions/store/usePassStore';
import { useObservationPlanningStore } from '../store/useObservationPlanningStore';

import { ObservationWindowEngine } from './ObservationWindowEngine';
import { ObservationQualityEngine } from './ObservationQualityEngine';
import { TargetRankingEngine } from './TargetRankingEngine';
import { ObservationAgendaEngine } from './ObservationAgendaEngine';

import { ObservationTarget, ObservationPlan } from '../types/observation-planning.types';
import * as SunCalc from 'suncalc';

class ObservationPlanningServiceClass {
  private unsubscribeLocation: (() => void) | null = null;
  private unsubscribeMoon: (() => void) | null = null;
  private unsubscribePlanet: (() => void) | null = null;
  private unsubscribePass: (() => void) | null = null;

  public initialize() {
    this.unsubscribeLocation = useLocationStore.subscribe((state, prevState) => {
      if (state.activeLocation !== prevState.activeLocation) {
        this.generatePlan();
      }
    });

    this.unsubscribeMoon = useMoonStore.subscribe((state, prevState) => {
      if (state.lastUpdated !== prevState.lastUpdated && !state.loading) {
        this.generatePlan();
      }
    });

    this.unsubscribePlanet = usePlanetStore.subscribe((state, prevState) => {
      if (state.lastUpdated !== prevState.lastUpdated && !state.loading) {
        this.generatePlan();
      }
    });

    this.unsubscribePass = usePassStore.subscribe((state, prevState) => {
      if (state.upcomingPasses !== prevState.upcomingPasses && !state.loading) {
        this.generatePlan();
      }
    });

    // Initial generate
    this.generatePlan();
  }

  private generatePlan() {
    const { activeLocation } = useLocationStore.getState();
    if (!activeLocation) return;

    const sunPos = SunCalc.getPosition(new Date(), activeLocation.latitude, activeLocation.longitude);
    const sunAlt = sunPos.altitude * 180 / Math.PI;
    const isDaylight = sunAlt > 0;

    const { moonData } = useMoonStore.getState();
    const { planets } = usePlanetStore.getState();
    const { upcomingPasses } = usePassStore.getState();

    const targets: ObservationTarget[] = [];

    // Moon
    if (moonData) {
      const window = ObservationWindowEngine.calculateApproximatedWindow(moonData.altitude, moonData.azimuth, true);
      targets.push({
        id: 'moon',
        name: 'Moon',
        type: 'Moon',
        window,
        quality: window ? ObservationQualityEngine.determineQuality(window.peakAltitude, isDaylight, moonData.isVisible) : 'Hidden',
        score: moonData.observationScore
      });
    }

    // Planets
    if (planets) {
      Object.values(planets).forEach(p => {
        const window = ObservationWindowEngine.calculateApproximatedWindow(p.altitude, p.azimuth, true);
        targets.push({
          id: `planet-${p.name}`,
          name: p.name,
          type: 'Planet',
          window,
          quality: window ? ObservationQualityEngine.determineQuality(window.peakAltitude, isDaylight, p.isAboveHorizon) : 'Hidden',
          score: p.observationScore
        });
      });
    }

    // ISS & Satellites
    if (upcomingPasses) {
      upcomingPasses.forEach(p => {
        const isISS = p.satelliteId === '25544';
        if (isISS || p.maxElevation > 40) { // Only track strong satellites or ISS
          const window = ObservationWindowEngine.calculatePassWindow(p);
          targets.push({
            id: `pass-${p.passId}`,
            name: isISS ? 'ISS' : `Satellite ${p.satelliteId}`,
            type: isISS ? 'ISS' : 'Satellite',
            window,
            quality: ObservationQualityEngine.determineQuality(window.peakAltitude, isDaylight, true),
            score: isISS ? 10 : 6
          });
        }
      });
    }

    // Engine Pipeline
    const rankedTargets = TargetRankingEngine.rankTargets(targets);
    const agenda = ObservationAgendaEngine.generateAgenda(rankedTargets);

    const bestTarget = rankedTargets.length > 0 ? rankedTargets[0] : null;

    const plan: ObservationPlan = {
      rankedTargets,
      agenda,
      bestWindow: bestTarget?.window || null,
      overallQuality: bestTarget?.quality || 'Hidden',
      bestTargetTime: bestTarget?.window?.peakTime || null
    };

    useObservationPlanningStore.getState().setPlan(plan);
  }

  public destroy() {
    if (this.unsubscribeLocation) this.unsubscribeLocation();
    if (this.unsubscribeMoon) this.unsubscribeMoon();
    if (this.unsubscribePlanet) this.unsubscribePlanet();
    if (this.unsubscribePass) this.unsubscribePass();
  }
}

export const ObservationPlanningService = new ObservationPlanningServiceClass();
