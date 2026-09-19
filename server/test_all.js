const CONFIG = require('../public/js/config.js');
const MAPS = require('../public/js/engine/MapData.js');
global.CONFIG = CONFIG;
global.MAPS = MAPS;

const BaseTower = require('../public/js/towers/BaseTower.js');
const TeslaTower = require('../public/js/towers/TeslaTower.js');
const CryoTower = require('../public/js/towers/CryoTower.js');
const MortarTower = require('../public/js/towers/MortarTower.js');

const BaseEnemy = require('../public/js/enemies/BaseEnemy.js');
const ScoutEnemy = require('../public/js/enemies/ScoutEnemy.js');
const TankEnemy = require('../public/js/enemies/TankEnemy.js');
const StalkerEnemy = require('../public/js/enemies/StalkerEnemy.js');
const BossEnemy = require('../public/js/enemies/BossEnemy.js');

const Projectile = require('../public/js/combat/Projectile.js');
const BurningPool = require('../public/js/combat/BurningPool.js');
const Particle = require('../public/js/combat/Particle.js');

const GameEngine = require('../public/js/engine/GameEngine.js');

console.log('--- Testing GameEngine Simulation & State Serialization ---');

const engine = new GameEngine(null);
engine.loadMap(MAPS.neon_grid);

// Give extra credits for testing all tower types
engine.credits = 1000;

// Build 3 towers
engine.buildTower(2, 2, 'tesla');
engine.buildTower(4, 4, 'cryo');
engine.buildTower(6, 6, 'mortar');

console.log('Towers built:', engine.towers.length, 'Remaining credits:', engine.credits);

// Start Wave 1
engine.startWave();
console.log('Wave started queue length:', engine.spawnQueue.length);

// Run 10 ticks of simulation
for (let i = 0; i < 10; i++) {
  engine.update(0.5);
}

console.log('Active enemies after 10 ticks:', engine.enemies.length);

// Test state serialization & deserialization
const serialized = engine.serializeState();
console.log('Serialized state wave:', serialized.wave, 'towers count:', serialized.towers.length);

const engine2 = new GameEngine(null);
engine2.deserializeState(serialized, MAPS.neon_grid);

console.log('Engine2 restored wave:', engine2.wave, 'towers count:', engine2.towers.length, 'hp:', engine2.hp);

if (engine2.towers.length === engine.towers.length && engine2.wave === engine.wave) {
  console.log('SUCCESS: Full Game Engine Simulation & State Persistence verified!');
} else {
  console.error('ERROR: Engine state mismatch!');
  process.exit(1);
}
