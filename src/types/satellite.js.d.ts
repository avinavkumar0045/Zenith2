declare module 'satellite.js' {
  export function twoline2satrec(tleLine1: string, tleLine2: string): any;
  export function propagate(satrec: any, date: Date): { position: any, velocity: any };
  export function gstime(date: Date): number;
  export function eciToGeodetic(positionEci: any, gmst: number): { longitude: number, latitude: number, height: number };
  export function degreesLat(radians: number): number;
  export function degreesLong(radians: number): number;
}
