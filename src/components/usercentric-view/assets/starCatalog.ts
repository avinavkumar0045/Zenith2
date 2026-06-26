export interface CatalogStar {
  id: string;
  name: string;
  ra: number;       // hours
  dec: number;      // degrees
  magnitude: number;
  color: string;    // CSS color mapping to spectral class
}

export interface ConstellationConnection {
  constellationId: string;
  name: string;
  connections: [string, string][]; // pairs of star IDs
}

export const BRIGHT_STARS: CatalogStar[] = [
  // Ursa Minor (Little Dipper)
  { id: 'polaris', name: 'Polaris', ra: 2.53, dec: 89.26, magnitude: 1.97, color: '#fcf8eb' }, // North Star
  { id: 'yildun', name: 'Yildun', ra: 17.53, dec: 72.18, magnitude: 4.35, color: '#ffffff' },
  { id: 'umi_epsilon', name: 'Urodelus', ra: 16.76, dec: 82.03, magnitude: 4.21, color: '#e3f2fd' },
  { id: 'umi_delta', name: 'Yildun-Delta', ra: 17.55, dec: 86.58, magnitude: 4.35, color: '#ffffff' },
  { id: 'kochab', name: 'Kochab', ra: 14.85, dec: 74.16, magnitude: 2.07, color: '#ffcc80' },
  { id: 'pherkad', name: 'Pherkad', ra: 15.35, dec: 71.83, magnitude: 3.00, color: '#e3f2fd' },
  { id: 'umi_eta', name: 'Umi-Eta', ra: 16.29, dec: 75.75, magnitude: 4.95, color: '#ffffff' },

  // Orion
  { id: 'betelgeuse', name: 'Betelgeuse', ra: 5.92, dec: 7.41, magnitude: 0.50, color: '#ffab91' }, // Orange supergiant
  { id: 'rigel', name: 'Rigel', ra: 5.25, dec: -8.20, magnitude: 0.12, color: '#80deea' },       // Blue supergiant
  { id: 'bellatrix', name: 'Bellatrix', ra: 5.42, dec: 6.35, magnitude: 1.64, color: '#b2ebf2' },   // Blue-white
  { id: 'saiph', name: 'Saiph', ra: 5.79, dec: -9.67, magnitude: 2.06, color: '#80deea' },
  { id: 'alnitak', name: 'Alnitak', ra: 5.68, dec: -1.94, magnitude: 1.74, color: '#80deea' },    // Belt
  { id: 'alnilam', name: 'Alnilam', ra: 5.60, dec: -1.20, magnitude: 1.69, color: '#80deea' },    // Belt
  { id: 'mintaka', name: 'Mintaka', ra: 5.53, dec: -0.30, magnitude: 2.25, color: '#80deea' },    // Belt
  { id: 'meissa', name: 'Meissa', ra: 5.58, dec: 9.93, magnitude: 3.39, color: '#b2ebf2' },      // Head

  // Ursa Major (Big Dipper)
  { id: 'dubhe', name: 'Dubhe', ra: 11.06, dec: 61.75, magnitude: 1.81, color: '#ffe0b2' },
  { id: 'merak', name: 'Merak', ra: 11.03, dec: 56.38, magnitude: 2.34, color: '#e3f2fd' },
  { id: 'phecda', name: 'Phecda', ra: 11.89, dec: 53.69, magnitude: 2.41, color: '#ffffff' },
  { id: 'megrez', name: 'Megrez', ra: 12.25, dec: 57.03, magnitude: 3.32, color: '#ffffff' },
  { id: 'alioth', name: 'Alioth', ra: 12.90, dec: 55.96, magnitude: 1.76, color: '#e3f2fd' },
  { id: 'mizar', name: 'Mizar', ra: 13.40, dec: 54.92, magnitude: 2.23, color: '#ffffff' },
  { id: 'alkaid', name: 'Alkaid', ra: 13.79, dec: 49.31, magnitude: 1.85, color: '#b2ebf2' },

  // Cassiopeia
  { id: 'schedar', name: 'Schedar', ra: 0.68, dec: 56.54, magnitude: 2.24, color: '#ffe0b2' },
  { id: 'caph', name: 'Caph', ra: 0.15, dec: 59.15, magnitude: 2.28, color: '#ffffff' },
  { id: 'tsih', name: 'Tsih', ra: 0.95, dec: 60.72, magnitude: 2.15, color: '#80deea' },
  { id: 'ruchbah', name: 'Ruchbah', ra: 1.43, dec: 60.23, magnitude: 2.68, color: '#ffffff' },
  { id: 'segin', name: 'Segin', ra: 1.90, dec: 63.67, magnitude: 3.35, color: '#b2ebf2' },

  // Taurus
  { id: 'aldebaran', name: 'Aldebaran', ra: 4.60, dec: 16.51, magnitude: 0.85, color: '#ffb74d' }, // Red Giant
  { id: 'elnath', name: 'Elnath', ra: 5.43, dec: 28.60, magnitude: 1.65, color: '#e3f2fd' },
  { id: 'alcyone', name: 'Alcyone', ra: 3.79, dec: 24.10, magnitude: 2.85, color: '#80deea' }, // Pleiades brightest
  { id: 'atlas', name: 'Atlas', ra: 3.82, dec: 24.05, magnitude: 3.62, color: '#80deea' },
  { id: 'electra', name: 'Electra', ra: 3.75, dec: 24.11, magnitude: 3.72, color: '#80deea' },

  // Gemini
  { id: 'castor', name: 'Castor', ra: 7.58, dec: 31.88, magnitude: 1.58, color: '#ffffff' },
  { id: 'pollux', name: 'Pollux', ra: 7.75, dec: 28.02, magnitude: 1.16, color: '#ffe0b2' },
  { id: 'gem_alhena', name: 'Alhena', ra: 6.63, dec: 16.39, magnitude: 1.93, color: '#ffffff' },
  { id: 'gem_tejat', name: 'Tejat', ra: 6.25, dec: 22.51, magnitude: 2.87, color: '#ffcc80' },
  { id: 'gem_mebsuta', name: 'Mebsuta', ra: 6.72, dec: 25.13, magnitude: 3.06, color: '#ffffff' },

  // Leo
  { id: 'regulus', name: 'Regulus', ra: 10.14, dec: 11.96, magnitude: 1.36, color: '#80deea' },
  { id: 'denebola', name: 'Denebola', ra: 11.82, dec: 14.57, magnitude: 2.14, color: '#ffffff' },
  { id: 'algieba', name: 'Algieba', ra: 10.33, dec: 19.84, magnitude: 2.01, color: '#ffe0b2' },
  { id: 'leo_zosma', name: 'Zosma', ra: 11.23, dec: 20.52, magnitude: 2.56, color: '#ffffff' },
  { id: 'leo_chertan', name: 'Chertan', ra: 11.23, dec: 15.43, magnitude: 3.33, color: '#ffffff' },

  // Scorpius
  { id: 'antares', name: 'Antares', ra: 16.49, dec: -26.43, magnitude: 1.06, color: '#ff8a65' }, // Red Supergiant
  { id: 'shaula', name: 'Shaula', ra: 17.56, dec: -37.10, magnitude: 1.62, color: '#80deea' },
  { id: 'sargas', name: 'Sargas', ra: 17.62, dec: -43.00, magnitude: 1.86, color: '#ffcc80' },
  { id: 'drischba', name: 'Dschubba', ra: 16.01, dec: -22.62, magnitude: 2.29, color: '#80deea' },
  { id: 'graffias', name: 'Acrab', ra: 16.09, dec: -19.80, magnitude: 2.56, color: '#80deea' },

  // Cygnus (Northern Cross)
  { id: 'deneb', name: 'Deneb', ra: 20.69, dec: 45.28, magnitude: 1.25, color: '#b2ebf2' },
  { id: 'albireo', name: 'Albireo', ra: 19.51, dec: 27.96, magnitude: 3.05, color: '#ffe0b2' }, // Double star (gold/blue)
  { id: 'sadr', name: 'Sadr', ra: 20.37, dec: 40.26, magnitude: 2.23, color: '#ffffff' },
  { id: 'gienah', name: 'Gienah-Cyg', ra: 20.77, dec: 33.97, magnitude: 2.48, color: '#ffe0b2' },
  { id: 'fawaris', name: 'Fawaris', ra: 19.61, dec: 45.13, magnitude: 2.87, color: '#ffffff' },

  // Lyra
  { id: 'vega', name: 'Vega', ra: 18.62, dec: 38.78, magnitude: 0.03, color: '#e0f7fa' },
  { id: 'sulafat', name: 'Sulafat', ra: 18.98, dec: 32.69, magnitude: 3.24, color: '#80deea' },
  { id: 'sheliak', name: 'Sheliak', ra: 18.83, dec: 33.36, magnitude: 3.45, color: '#e3f2fd' },

  // Aquila
  { id: 'altair', name: 'Altair', ra: 19.84, dec: 8.87, magnitude: 0.76, color: '#ffffff' },
  { id: 'tarazed', name: 'Tarazed', ra: 19.77, dec: 10.61, magnitude: 2.72, color: '#ffe0b2' },
  { id: 'alshain', name: 'Alshain', ra: 19.92, dec: 6.40, magnitude: 3.71, color: '#ffe0b2' },

  // Canis Major
  { id: 'sirius', name: 'Sirius', ra: 6.75, dec: -16.72, magnitude: -1.46, color: '#e0f7fa' }, // Brightest star
  { id: 'adhara', name: 'Adhara', ra: 6.98, dec: -28.97, magnitude: 1.50, color: '#80deea' },
  { id: 'wezen', name: 'Wezen', ra: 7.14, dec: -26.32, magnitude: 1.83, color: '#ffe0b2' },
  { id: 'mirzam', name: 'Mirzam', ra: 6.38, dec: -17.96, magnitude: 1.98, color: '#80deea' },

  // Canis Minor
  { id: 'procyon', name: 'Procyon', ra: 7.66, dec: 5.22, magnitude: 0.34, color: '#fcf8eb' },
  { id: 'gomeisa', name: 'Gomeisa', ra: 7.45, dec: 8.29, magnitude: 2.89, color: '#b2ebf2' },

  // Fomalhaut (Southern Fish)
  { id: 'fomalhaut', name: 'Fomalhaut', ra: 22.96, dec: -29.62, magnitude: 1.16, color: '#ffffff' },

  // Pegasus
  { id: 'markab', name: 'Markab', ra: 23.08, dec: 15.20, magnitude: 2.49, color: '#b2ebf2' },
  { id: 'scheat', name: 'Scheat', ra: 23.06, dec: 28.08, magnitude: 2.42, color: '#ffe0b2' },
  { id: 'algenib', name: 'Algenib', ra: 0.22, dec: 15.18, magnitude: 2.83, color: '#80deea' },
  { id: 'enif', name: 'Enif', ra: 21.74, dec: 9.87, magnitude: 2.38, color: '#ffcc80' }
];

export const CONSTELLATION_CONNECTIONS: ConstellationConnection[] = [
  {
    constellationId: 'ori',
    name: 'Orion',
    connections: [
      ['betelgeuse', 'alnitak'],
      ['bellatrix', 'mintaka'],
      ['alnitak', 'alnilam'],
      ['alnilam', 'mintaka'],
      ['alnitak', 'saiph'],
      ['mintaka', 'rigel'],
      ['betelgeuse', 'meissa'],
      ['bellatrix', 'meissa']
    ]
  },
  {
    constellationId: 'uma',
    name: 'Ursa Major',
    connections: [
      ['dubhe', 'merak'],
      ['merak', 'phecda'],
      ['phecda', 'megrez'],
      ['megrez', 'dubhe'],
      ['megrez', 'alioth'],
      ['alioth', 'mizar'],
      ['mizar', 'alkaid']
    ]
  },
  {
    constellationId: 'umi',
    name: 'Ursa Minor',
    connections: [
      ['polaris', 'umi_delta'],
      ['umi_delta', 'umi_epsilon'],
      ['umi_epsilon', 'yildun'],
      ['yildun', 'umi_eta'],
      ['umi_eta', 'kochab'],
      ['kochab', 'pherkad'],
      ['pherkad', 'yildun']
    ]
  },
  {
    constellationId: 'cas',
    name: 'Cassiopeia',
    connections: [
      ['caph', 'schedar'],
      ['schedar', 'tsih'],
      ['tsih', 'ruchbah'],
      ['ruchbah', 'segin']
    ]
  },
  {
    constellationId: 'gem',
    name: 'Gemini',
    connections: [
      ['castor', 'gem_mebsuta'],
      ['gem_mebsuta', 'gem_tejat'],
      ['pollux', 'gem_alhena']
    ]
  },
  {
    constellationId: 'leo',
    name: 'Leo',
    connections: [
      ['regulus', 'leo_chertan'],
      ['leo_chertan', 'leo_zosma'],
      ['leo_zosma', 'denebola'],
      ['regulus', 'algieba'],
      ['algieba', 'leo_zosma']
    ]
  },
  {
    constellationId: 'sco',
    name: 'Scorpius',
    connections: [
      ['graffias', 'drischba'],
      ['drischba', 'antares'],
      ['antares', 'shaula'],
      ['shaula', 'sargas']
    ]
  },
  {
    constellationId: 'cyg',
    name: 'Cygnus',
    connections: [
      ['deneb', 'sadr'],
      ['sadr', 'albireo'],
      ['sadr', 'gienah'],
      ['sadr', 'fawaris']
    ]
  },
  {
    constellationId: 'lyr',
    name: 'Lyra',
    connections: [
      ['vega', 'sheliak'],
      ['sheliak', 'sulafat'],
      ['sulafat', 'vega']
    ]
  },
  {
    constellationId: 'aql',
    name: 'Aquila',
    connections: [
      ['altair', 'tarazed'],
      ['altair', 'alshain']
    ]
  }
];

// Dynamically generate procedural star field around the sphere (e.g. 2000 dim stars)
// to make the background feel immensely rich
export interface ProceduralStar {
  ra: number;
  dec: number;
  magnitude: number;
}

export const generateProceduralStars = (seed: number = 42, count: number = 5000): ProceduralStar[] => {
  const stars: ProceduralStar[] = [];
  let s = seed;
  
  const random = () => {
    const x = Math.sin(s++) * 10000;
    return x - Math.floor(x);
  };

  for (let i = 0; i < count; i++) {
    // Random RA in hours (0 to 24)
    const ra = random() * 24.0;
    
    // Galactic equator approximation: delta = 62.6 * sin((RA - 18.8) * 15°)
    const raRad = (ra - 18.8) * 15.0 * (Math.PI / 180.0);
    const galacticDec = 62.6 * Math.sin(raRad);
    
    // Spread stars around the galactic plane (Gaussian approximation using two uniform variables)
    const u1 = random() || 0.0001;
    const u2 = random();
    const normalNoise = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    
    // We blend: 60% of background stars cluster heavily around the Milky Way (spread = 12°),
    // 40% are scattered evenly across the entire sky to represent isotropic stars (spread = 50°).
    const isMilkyWay = random() < 0.60;
    const spread = isMilkyWay ? 12.0 : 50.0;
    
    let dec = galacticDec + normalNoise * spread;
    dec = Math.max(-90.0, Math.min(90.0, dec));

    // Magnitude distribution (exponential scaling)
    const magFactor = Math.pow(random(), 1.8);
    const magnitude = 3.0 + magFactor * 4.0; // magnitude 3.0 to 7.0

    stars.push({ ra, dec, magnitude });
  }

  return stars;
};
