// Cyberpunk Tower Defense Global Configuration & Specifications

const CONFIG = {
  GRID: {
    COLS: 15,
    ROWS: 10,
    TILE_SIZE: 64, // 15x64 = 960px width, 10x64 = 640px height
  },

  GAME: {
    INITIAL_CREDITS: 250,
    INITIAL_HP: 20,
    MAX_WAVES: 10,
  },

  // Tower Classes Specifications (Exact match to product specs)
  TOWERS: {
    tesla: {
      id: 'tesla',
      name: 'Overclocked Tesla Rail',
      type: 'Single-Target DPS',
      icon: '⚡',
      color: '#00f0ff',
      cost: 100,
      tiers: {
        1: {
          name: 'Tesla Rail T1',
          cost: 100,
          upgradeCost: 75,
          range: 160, // in pixels
          damage: 35,
          fireRate: 1.2, // attacks per second
          desc: 'High single-target physical damage, medium fire rate.'
        },
        2: {
          name: 'Hyper-Capacitor',
          cost: 175,
          upgradeCost: 125,
          range: 190,
          damage: 55,
          fireRate: 1.5,
          chainTargets: 2,
          chainDamageMultiplier: 0.5,
          desc: 'Chain lightning effect leaping to up to 2 adjacent targets for 50% damage.'
        },
        3: {
          name: 'Quantum Singularity Rail',
          cost: 300,
          upgradeCost: 0,
          range: 220,
          damage: 90,
          fireRate: 1.8,
          chainTargets: 2,
          chainDamageMultiplier: 0.5,
          armorPenetration: 0.40, // ignores 40% enemy armor
          executeThreshold: 0.10, // executes targets below 10% health
          desc: 'Ignores 40% enemy armor and executes targets below 10% health.'
        }
      }
    },

    cryo: {
      id: 'cryo',
      name: 'Cryo-Chamber Matrix',
      type: 'AoE Support',
      icon: '❄️',
      color: '#00ff66',
      cost: 125,
      tiers: {
        1: {
          name: 'Cryo Matrix T1',
          cost: 125,
          upgradeCost: 85,
          range: 130,
          damage: 0,
          fireRate: 1.0,
          slowRatio: 0.20, // 20% slow
          desc: 'Zero damage, applies a 20% flat movement slow to all enemies in range.'
        },
        2: {
          name: 'Permafrost Field',
          cost: 210,
          upgradeCost: 140,
          range: 150,
          damage: 0,
          fireRate: 1.0,
          slowRatio: 0.40, // 40% slow
          brittleDebuff: 0.15, // +15% damage from all other sources
          desc: 'Slow increased to 40%. Applies "Brittle" (+15% damage taken).'
        },
        3: {
          name: 'Sub-Zero Flash Freeze',
          cost: 350,
          upgradeCost: 0,
          range: 180,
          damage: 10,
          fireRate: 1.2,
          slowRatio: 0.40,
          brittleDebuff: 0.15,
          freezeInterval: 5, // every 5th attack
          freezeDuration: 1.5, // 1.5s freeze
          revealsStealth: true,
          desc: 'Every 5th attack freezes caught enemies for 1.5s. Scans and reveals stealth units.'
        }
      }
    },

    mortar: {
      id: 'mortar',
      name: 'Plasma Mortar',
      type: 'Heavy Splash Battery',
      icon: '💥',
      color: '#ff0055',
      cost: 150,
      tiers: {
        1: {
          name: 'Plasma Mortar T1',
          cost: 150,
          upgradeCost: 100,
          minRange: 100,
          range: 280,
          damage: 70,
          splashRadius: 60,
          fireRate: 0.4, // 1 shot per 2.5s
          projectileSpeed: 300,
          desc: 'High explosive splash damage, slow fire rate, min/max range.'
        },
        2: {
          name: 'Napalm Catalyst',
          cost: 250,
          upgradeCost: 150,
          minRange: 100,
          range: 300,
          damage: 105,
          splashRadius: 70,
          fireRate: 0.45,
          projectileSpeed: 320,
          napalmDuration: 3.0, // 3s pool
          napalmDps: 25,
          desc: 'Leaves a burning pool on path for 3s dealing DoT to units.'
        },
        3: {
          name: 'Nuclear Fallout Core',
          cost: 400,
          upgradeCost: 0,
          minRange: 100,
          range: 340,
          damage: 160,
          splashRadius: 140, // double burning pool / splash radius
          fireRate: 0.5,
          projectileSpeed: 350,
          napalmDuration: 3.0,
          napalmDps: 45,
          armorReducePerHit: 0.05, // 5% permanent armor reduction
          maxArmorReduceStacks: 5, // up to 25%
          desc: 'Reduces enemy armor by 5%/hit (stacks 5x) and doubles pool radius.'
        }
      }
    }
  },

  // Enemy Archetypes
  ENEMIES: {
    scout: {
      type: 'scout',
      name: 'Data-Scraper',
      hp: 60,
      armor: 0,
      speed: 120, // px per sec
      reward: 15,
      weight: 1, // core health damage
      slowImmuneDuration: 2.0, // immune to slow 2s
      color: '#00f0ff'
    },
    tank: {
      type: 'tank',
      name: 'Malware Tank',
      hp: 320,
      armor: 25,
      speed: 45,
      reward: 35,
      weight: 3,
      color: '#ff6600'
    },
    stalker: {
      type: 'stalker',
      name: 'Glitch Stalker',
      hp: 130,
      armor: 5,
      speed: 80,
      reward: 25,
      weight: 2,
      isStealth: true,
      color: '#ff0055'
    },
    boss: {
      type: 'boss',
      name: 'Decompiler',
      hp: 2500,
      armor: 40,
      speed: 35,
      reward: 200,
      weight: 10,
      disableRadius: 3 * 64, // 3 tiles
      disableInterval: 4.0, // every 4s
      disableDuration: 2.0, // disables for 2s
      color: '#ffe600'
    }
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONFIG;
}
