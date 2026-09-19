if (typeof CONFIG === 'undefined' && typeof require !== 'undefined') CONFIG = require('../config');
if (typeof TeslaTower === 'undefined' && typeof require !== 'undefined') TeslaTower = require('../towers/TeslaTower');
if (typeof CryoTower === 'undefined' && typeof require !== 'undefined') CryoTower = require('../towers/CryoTower');
if (typeof MortarTower === 'undefined' && typeof require !== 'undefined') MortarTower = require('../towers/MortarTower');
if (typeof ScoutEnemy === 'undefined' && typeof require !== 'undefined') ScoutEnemy = require('../enemies/ScoutEnemy');
if (typeof TankEnemy === 'undefined' && typeof require !== 'undefined') TankEnemy = require('../enemies/TankEnemy');
if (typeof StalkerEnemy === 'undefined' && typeof require !== 'undefined') StalkerEnemy = require('../enemies/StalkerEnemy');
if (typeof BossEnemy === 'undefined' && typeof require !== 'undefined') BossEnemy = require('../enemies/BossEnemy');
if (typeof Particle === 'undefined' && typeof require !== 'undefined') Particle = require('../combat/Particle');

// Core Simulation Engine and State Manager

class GameEngine {
  constructor(canvasId) {
    this.canvas = (typeof document !== 'undefined' && canvasId) ? document.getElementById(canvasId) : null;
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;

    this.mapData = null;
    this.grid = [];
    this.path = [];

    // State Variables
    this.hp = CONFIG.GAME.INITIAL_HP;
    this.credits = CONFIG.GAME.INITIAL_CREDITS;
    this.wave = 1;
    this.maxWaves = CONFIG.GAME.MAX_WAVES;
    this.score = 0;
    this.totalCreditsEarned = CONFIG.GAME.INITIAL_CREDITS;
    this.elapsedTime = 0;

    // Simulation Controls
    this.gameSpeed = 1;
    this.isPaused = false;
    this.isGameOver = false;
    this.isGameWon = false;
    this.isWaveInProgress = false;

    // Collections
    this.towers = [];
    this.enemies = [];
    this.projectiles = [];
    this.burningPools = [];
    this.particles = [];

    // Spawner State
    this.spawnQueue = [];
    this.spawnTimer = 0;
    this.spawnInterval = 1.0;

    // Selection State
    this.selectedTower = null;
    this.selectedTile = null;

    this.lastFrameTime = 0;
    this.animationFrameId = null;

    this.audio = typeof AudioSynthesizer !== 'undefined' ? new AudioSynthesizer() : null;
    this.onStateChange = null;
  }

  loadMap(mapConfig) {
    this.mapData = mapConfig;
    this.grid = JSON.parse(JSON.stringify(mapConfig.grid));
    this.path = JSON.parse(JSON.stringify(mapConfig.path));

    this.hp = CONFIG.GAME.INITIAL_HP;
    this.credits = CONFIG.GAME.INITIAL_CREDITS;
    this.wave = 1;
    this.score = 0;
    this.totalCreditsEarned = CONFIG.GAME.INITIAL_CREDITS;
    this.elapsedTime = 0;

    this.isGameOver = false;
    this.isGameWon = false;
    this.isWaveInProgress = false;

    this.towers = [];
    this.enemies = [];
    this.projectiles = [];
    this.burningPools = [];
    this.particles = [];
    this.spawnQueue = [];

    this.selectedTower = null;
    this.selectedTile = null;

    this.notifyStateChange();
  }

  startWave() {
    if (this.isWaveInProgress || this.isGameOver || this.isGameWon) return;

    this.isWaveInProgress = true;
    this.generateWaveQueue(this.wave);
    this.notifyStateChange();
  }

  generateWaveQueue(waveNumber) {
    this.spawnQueue = [];

    if (waveNumber === 10) {
      this.spawnQueue.push('boss');
      this.spawnInterval = 2.0;
      return;
    }

    const scoutCount = 3 + Math.floor(waveNumber * 1.5);
    const tankCount = Math.floor(waveNumber * 0.8);
    const stalkerCount = waveNumber >= 3 ? Math.floor((waveNumber - 2) * 1.2) : 0;

    for (let i = 0; i < scoutCount; i++) this.spawnQueue.push('scout');
    for (let i = 0; i < tankCount; i++) this.spawnQueue.push('tank');
    for (let i = 0; i < stalkerCount; i++) this.spawnQueue.push('stalker');

    this.spawnQueue.sort(() => Math.random() - 0.5);
    this.spawnInterval = Math.max(0.4, 1.2 - (waveNumber * 0.08));
  }

  spawnNextEnemy() {
    if (this.spawnQueue.length === 0) return;

    const enemyType = this.spawnQueue.shift();
    let enemy = null;

    if (enemyType === 'scout') enemy = new ScoutEnemy(this.path);
    else if (enemyType === 'tank') enemy = new TankEnemy(this.path);
    else if (enemyType === 'stalker') enemy = new StalkerEnemy(this.path);
    else if (enemyType === 'boss') enemy = new BossEnemy(this.path);

    if (enemy) {
      const scaleMultiplier = 1.0 + (this.wave - 1) * 0.25;
      enemy.maxHp = Math.round(enemy.maxHp * scaleMultiplier);
      enemy.hp = enemy.maxHp;
      enemy.baseArmor = Math.round(enemy.baseArmor * (1.0 + (this.wave - 1) * 0.1));

      this.enemies.push(enemy);
    }
  }

  buildTower(gridX, gridY, towerType) {
    if (this.grid[gridY][gridX] !== 0) return false;

    const towerSpec = CONFIG.TOWERS[towerType];
    if (this.credits < towerSpec.cost) return false;

    let tower = null;
    if (towerType === 'tesla') tower = new TeslaTower(gridX, gridY);
    else if (towerType === 'cryo') tower = new CryoTower(gridX, gridY);
    else if (towerType === 'mortar') tower = new MortarTower(gridX, gridY);

    if (tower) {
      this.credits -= towerSpec.cost;
      this.grid[gridY][gridX] = 3;
      this.towers.push(tower);
      this.selectedTower = tower;

      if (this.audio) this.audio.playBuild();
      this.notifyStateChange();
      return true;
    }
    return false;
  }

  upgradeTower(tower) {
    if (!tower || !tower.canUpgrade()) return false;
    const cost = tower.getUpgradeCost();
    if (this.credits < cost) return false;

    if (tower.upgrade()) {
      this.credits -= cost;
      if (this.audio) this.audio.playBuild();
      this.notifyStateChange();
      return true;
    }
    return false;
  }

  sellTower(tower) {
    if (!tower) return false;
    const refund = tower.getSellValue();
    this.credits += refund;

    this.grid[tower.gridY][tower.gridX] = 0;
    this.towers = this.towers.filter(t => t.id !== tower.id);
    if (this.selectedTower === tower) this.selectedTower = null;

    if (this.audio) this.audio.playBuild();
    this.notifyStateChange();
    return true;
  }

  spawnExplosion(x, y, color, radius) {
    const particleCount = 12;
    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 / particleCount) * i;
      const speed = 40 + Math.random() * 60;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      this.particles.push(new Particle(x, y, color, 3 + Math.random() * 3, vx, vy, 0.4));
    }
  }

  update(dt) {
    if (this.isPaused || this.isGameOver || this.isGameWon) return;

    const scaledDt = dt * this.gameSpeed;
    this.elapsedTime += scaledDt;

    if (this.isWaveInProgress && this.spawnQueue.length > 0) {
      this.spawnTimer += scaledDt;
      if (this.spawnTimer >= this.spawnInterval) {
        this.spawnTimer = 0;
        this.spawnNextEnemy();
      }
    }

    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      enemy.update(scaledDt, this);

      if (enemy.hasReachedEnd) {
        this.hp -= enemy.weight;
        if (this.audio) this.audio.playCoreHit();

        if (this.hp <= 0) {
          this.hp = 0;
          this.isGameOver = true;
        }
        this.enemies.splice(i, 1);
        this.notifyStateChange();
      } else if (enemy.isDead) {
        this.credits += enemy.reward;
        this.totalCreditsEarned += enemy.reward;
        this.score += enemy.reward * 10 + this.wave * 20;
        this.enemies.splice(i, 1);
        this.notifyStateChange();
      }
    }

    this.towers.forEach(tower => tower.update(scaledDt, this.enemies, this));

    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const proj = this.projectiles[i];
      proj.update(scaledDt, this);
      if (proj.isHit) {
        this.projectiles.splice(i, 1);
      }
    }

    for (let i = this.burningPools.length - 1; i >= 0; i--) {
      const pool = this.burningPools[i];
      pool.update(scaledDt, this.enemies);
      if (pool.isFinished) {
        this.burningPools.splice(i, 1);
      }
    }

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.update(scaledDt);
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }

    if (this.isWaveInProgress && this.spawnQueue.length === 0 && this.enemies.length === 0) {
      this.isWaveInProgress = false;
      this.score += this.hp * 100 + this.wave * 500;

      if (this.wave >= this.maxWaves) {
        this.isGameWon = true;
      } else {
        this.wave++;
      }
      this.notifyStateChange();
    }
  }

  draw() {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const tileSize = CONFIG.GRID.TILE_SIZE;

    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (let r = 0; r < CONFIG.GRID.ROWS; r++) {
      for (let c = 0; c < CONFIG.GRID.COLS; c++) {
        const x = c * tileSize;
        const y = r * tileSize;
        const tileType = this.grid[r][c];

        if (tileType === 1) {
          ctx.fillStyle = '#181d30';
          ctx.fillRect(x, y, tileSize, tileSize);
          ctx.strokeStyle = 'rgba(0, 240, 255, 0.2)';
          ctx.strokeRect(x, y, tileSize, tileSize);
        } else if (tileType === 2) {
          ctx.fillStyle = '#0f121d';
          ctx.fillRect(x, y, tileSize, tileSize);
          ctx.strokeStyle = '#ff0055';
          ctx.strokeRect(x + 4, y + 4, tileSize - 8, tileSize - 8);
        } else if (tileType === 8) {
          ctx.fillStyle = '#ff0055';
          ctx.fillRect(x, y, tileSize, tileSize);
          ctx.fillStyle = '#fff';
          ctx.font = 'bold 11px monospace';
          ctx.textAlign = 'center';
          ctx.fillText('SPAWN', x + tileSize / 2, y + tileSize / 2 + 4);
        } else if (tileType === 9) {
          ctx.fillStyle = '#00ff66';
          ctx.fillRect(x, y, tileSize, tileSize);
          ctx.fillStyle = '#000';
          ctx.font = 'bold 11px monospace';
          ctx.textAlign = 'center';
          ctx.fillText('CORE', x + tileSize / 2, y + tileSize / 2 + 4);
        } else {
          ctx.fillStyle = '#090a0f';
          ctx.fillRect(x, y, tileSize, tileSize);
          ctx.strokeStyle = '#1a2233';
          ctx.strokeRect(x, y, tileSize, tileSize);
        }
      }
    }

    if (this.selectedTile) {
      ctx.strokeStyle = '#ffe600';
      ctx.lineWidth = 3;
      ctx.strokeRect(this.selectedTile.x * tileSize, this.selectedTile.y * tileSize, tileSize, tileSize);
    }

    this.burningPools.forEach(p => p.draw(ctx));

    if (this.selectedTower) {
      this.selectedTower.drawRangeIndicator(ctx);
    }

    this.towers.forEach(t => t.draw(ctx));
    this.enemies.forEach(e => e.draw(ctx));
    this.projectiles.forEach(p => p.draw(ctx));
    this.particles.forEach(p => p.draw(ctx));
  }

  serializeState() {
    return {
      mapId: this.mapData ? this.mapData.id : 'neon_grid',
      hp: this.hp,
      credits: this.credits,
      wave: this.wave,
      score: this.score,
      totalCreditsEarned: this.totalCreditsEarned,
      elapsedTime: this.elapsedTime,
      towers: this.towers.map(t => ({
        gridX: t.gridX,
        gridY: t.gridY,
        type: t.type,
        tier: t.tier,
        totalSpent: t.totalSpent
      }))
    };
  }

  deserializeState(savedState, mapConfig) {
    this.loadMap(mapConfig);

    this.hp = savedState.hp;
    this.credits = savedState.credits;
    this.wave = savedState.wave;
    this.score = savedState.score;
    this.totalCreditsEarned = savedState.totalCreditsEarned || savedState.credits;
    this.elapsedTime = savedState.elapsedTime || 0;

    if (savedState.towers) {
      savedState.towers.forEach(tData => {
        let tower = null;
        if (tData.type === 'tesla') tower = new TeslaTower(tData.gridX, tData.gridY);
        else if (tData.type === 'cryo') tower = new CryoTower(tData.gridX, tData.gridY);
        else if (tData.type === 'mortar') tower = new MortarTower(tData.gridX, tData.gridY);

        if (tower) {
          tower.tier = tData.tier;
          tower.stats = JSON.parse(JSON.stringify(CONFIG.TOWERS[tData.type].tiers[tData.tier]));
          tower.totalSpent = tData.totalSpent || CONFIG.TOWERS[tData.type].cost;
          this.grid[tData.gridY][tData.gridX] = 3;
          this.towers.push(tower);
        }
      });
    }

    this.notifyStateChange();
  }

  notifyStateChange() {
    if (typeof this.onStateChange === 'function') {
      this.onStateChange(this);
    }
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = GameEngine;
}
