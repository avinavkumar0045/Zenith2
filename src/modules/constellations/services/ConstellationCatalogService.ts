export interface CatalogEntry {
  id: string;
  name: string;
  abbreviation: string;
  rightAscension: number; // hours
  declination: number; // degrees
  description: string;
}

export class ConstellationCatalogServiceClass {
  // Center coordinates for major constellations (approximate J2000)
  public readonly catalog: CatalogEntry[] = [
    { id: 'ori', name: 'Orion', abbreviation: 'Ori', rightAscension: 5.58, declination: 5.4, description: 'The Hunter. Contains Betelgeuse and Rigel.' },
    { id: 'tau', name: 'Taurus', abbreviation: 'Tau', rightAscension: 4.6, declination: 16.5, description: 'The Bull. Contains Aldebaran and the Pleiades.' },
    { id: 'gem', name: 'Gemini', abbreviation: 'Gem', rightAscension: 7.1, declination: 22.6, description: 'The Twins. Contains Castor and Pollux.' },
    { id: 'leo', name: 'Leo', abbreviation: 'Leo', rightAscension: 10.6, declination: 14.6, description: 'The Lion. Contains Regulus.' },
    { id: 'sco', name: 'Scorpius', abbreviation: 'Sco', rightAscension: 16.8, declination: -30.7, description: 'The Scorpion. Contains Antares.' },
    { id: 'cas', name: 'Cassiopeia', abbreviation: 'Cas', rightAscension: 1.3, declination: 62.0, description: 'The Queen. W-shaped constellation.' },
    { id: 'cyg', name: 'Cygnus', abbreviation: 'Cyg', rightAscension: 20.6, declination: 42.0, description: 'The Swan. Contains Deneb and the Northern Cross.' },
    { id: 'and', name: 'Andromeda', abbreviation: 'And', rightAscension: 0.8, declination: 38.6, description: 'The Chained Maiden. Contains the Andromeda Galaxy.' },
    { id: 'peg', name: 'Pegasus', abbreviation: 'Peg', rightAscension: 22.6, declination: 19.4, description: 'The Winged Horse. Contains the Great Square.' },
    { id: 'uma', name: 'Ursa Major', abbreviation: 'UMa', rightAscension: 11.3, declination: 48.0, description: 'The Great Bear. Contains the Big Dipper.' },
    { id: 'umi', name: 'Ursa Minor', abbreviation: 'UMi', rightAscension: 15.0, declination: 73.0, description: 'The Little Bear. Contains Polaris (North Star).' },
    { id: 'cma', name: 'Canis Major', abbreviation: 'CMa', rightAscension: 6.8, declination: -22.0, description: 'The Greater Dog. Contains Sirius, the brightest star.' },
    { id: 'cmi', name: 'Canis Minor', abbreviation: 'CMi', rightAscension: 7.6, declination: 5.2, description: 'The Lesser Dog. Contains Procyon.' },
    { id: 'lyr', name: 'Lyra', abbreviation: 'Lyr', rightAscension: 18.8, declination: 36.8, description: 'The Lyre. Contains Vega.' },
    { id: 'aql', name: 'Aquila', abbreviation: 'Aql', rightAscension: 19.6, declination: 3.3, description: 'The Eagle. Contains Altair.' },
  ];
}

export const ConstellationCatalogService = new ConstellationCatalogServiceClass();
