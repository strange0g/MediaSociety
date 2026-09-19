// Map Definitions for Cyberpunk Tower Defense

const MAPS = {
  neon_grid: {
    id: 'neon_grid',
    name: 'Sector 01: Neon Grid',
    difficulty: 'EASY',
    description: 'A standard entry matrix with a single winding path through central server nodes.',
    // 15 cols x 10 rows (0 = buildable, 1 = path, 2 = obstacle, 8 = spawn, 9 = core base)
    grid: [
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [8, 1, 1, 1, 0, 0, 2, 0, 0, 0, 1, 1, 1, 1, 9],
      [0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0],
      [0, 2, 0, 1, 1, 1, 1, 1, 0, 0, 1, 0, 2, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0],
      [0, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 0, 0, 0],
      [0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 2, 0, 0],
      [0, 0, 1, 0, 2, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
      [0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    ],
    // Precise path points sequence in tile coordinates (col, row)
    path: [
      { x: 0, y: 1 },
      { x: 3, y: 1 },
      { x: 3, y: 3 },
      { x: 7, y: 3 },
      { x: 7, y: 5 },
      { x: 10, y: 5 },
      { x: 10, y: 1 },
      { x: 14, y: 1 }
    ]
  },

  cyber_highway: {
    id: 'cyber_highway',
    name: 'Sector 02: Cyber Highway',
    difficulty: 'MEDIUM',
    description: 'High-speed dual curve track with dense obstacle clusters and multiple choke points.',
    grid: [
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0],
      [0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 2, 0, 0],
      [8, 1, 1, 0, 2, 0, 0, 2, 0, 0, 1, 1, 1, 1, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0],
      [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 0],
      [0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0],
      [0, 0, 1, 0, 2, 0, 2, 0, 0, 1, 1, 1, 1, 1, 0],
      [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 9, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    ],
    path: [
      { x: 0, y: 3 },
      { x: 2, y: 3 },
      { x: 2, y: 1 },
      { x: 10, y: 1 },
      { x: 10, y: 3 },
      { x: 13, y: 3 },
      { x: 13, y: 7 },
      { x: 9, y: 7 },
      { x: 9, y: 5 },
      { x: 2, y: 5 },
      { x: 2, y: 8 },
      { x: 9, y: 8 },
      { x: 13, y: 8 }
    ]
  },

  mainframe_core: {
    id: 'mainframe_core',
    name: 'Sector 03: Mainframe Core',
    difficulty: 'EXPERT',
    description: 'Spiral layout around the central data core with minimal build spaces and tight turns.',
    grid: [
      [8, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0],
      [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 0],
      [0, 1, 0, 0, 2, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0],
      [0, 1, 0, 1, 1, 1, 1, 9, 0, 0, 1, 0, 0, 1, 0],
      [0, 1, 0, 1, 0, 2, 0, 0, 0, 0, 1, 0, 0, 1, 0],
      [0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 0],
      [0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0],
      [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    ],
    path: [
      { x: 0, y: 0 },
      { x: 13, y: 0 },
      { x: 13, y: 8 },
      { x: 1, y: 8 },
      { x: 1, y: 2 },
      { x: 10, y: 2 },
      { x: 10, y: 6 },
      { x: 3, y: 6 },
      { x: 3, y: 4 },
      { x: 7, y: 4 }
    ]
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = MAPS;
}
