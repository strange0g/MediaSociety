// Base Class for all Tower Arsenal entities

class BaseTower {
  constructor(gridX, gridY, towerType) {
    this.id = 'tower_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
    this.gridX = gridX;
    this.gridY = gridY;

    // Pixel coordinates (center of 64x64 tile)
    const tileSize = (typeof CONFIG !== 'undefined' ? CONFIG.GRID.TILE_SIZE : 64);
    this.x = gridX * tileSize + tileSize / 2;
    this.y = gridY * tileSize + tileSize / 2;

    this.type = towerType; // 'tesla', 'cryo', 'mortar'
    this.tier = 1;
    this.cooldownTimer = 0;
    this.disabledTimer = 0; // Disabled by boss pulse

    this.stats = JSON.parse(JSON.stringify(CONFIG.TOWERS[towerType].tiers[1]));
    this.totalSpent = CONFIG.TOWERS[towerType].cost;
    this.target = null;
    this.angle = 0;
  }

  get isDisabled() {
    return this.disabledTimer > 0;
  }

  update(dt, enemies, gameEngine) {
    if (this.disabledTimer > 0) {
      this.disabledTimer -= dt;
      if (this.disabledTimer < 0) this.disabledTimer = 0;
      return;
    }

    if (this.cooldownTimer > 0) {
      this.cooldownTimer -= dt;
    }

    // Abstract method overridden by subclasses for specific targeting & firing
  }

  canUpgrade() {
    return this.tier < 3;
  }

  getUpgradeCost() {
    if (!this.canUpgrade()) return 0;
    return CONFIG.TOWERS[this.type].tiers[this.tier].upgradeCost;
  }

  upgrade() {
    if (!this.canUpgrade()) return false;
    const nextTier = this.tier + 1;
    const upgradeCost = this.getUpgradeCost();

    this.tier = nextTier;
    this.stats = JSON.parse(JSON.stringify(CONFIG.TOWERS[this.type].tiers[nextTier]));
    this.totalSpent += upgradeCost;
    return true;
  }

  getSellValue() {
    return Math.floor(this.totalSpent * 0.7); // 70% refund value
  }

  disable(duration) {
    this.disabledTimer = Math.max(this.disabledTimer, duration);
  }

  // Find valid targets within range
  getEnemiesInRange(enemies) {
    return enemies.filter(enemy => {
      if (enemy.isDead || enemy.hasReachedEnd) return false;

      // Stealth check: Stalker is invisible unless scanned by Cryo Matrix
      if (enemy.isStealth && !enemy.isRevealed) {
        return false;
      }

      const dx = enemy.x - this.x;
      const dy = enemy.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (this.stats.minRange && dist < this.stats.minRange) return false;
      return dist <= this.stats.range;
    });
  }

  // Select target furthest along path
  selectTarget(enemies) {
    const validEnemies = this.getEnemiesInRange(enemies);
    if (validEnemies.length === 0) return null;

    // Pick enemy closest to finishing path (highest pathDistance)
    validEnemies.sort((a, b) => b.pathDistance - a.pathDistance);
    return validEnemies[0];
  }

  drawRangeIndicator(ctx) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.stats.range, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 240, 255, 0.08)';
    ctx.fill();
    ctx.strokeStyle = this.stats.color || '#00f0ff';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.stroke();

    if (this.stats.minRange) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.stats.minRange, 0, Math.PI * 2);
      ctx.strokeStyle = '#ff0055';
      ctx.stroke();
    }
    ctx.restore();
  }

  drawBase(ctx) {
    const tileSize = CONFIG.GRID.TILE_SIZE;
    const half = tileSize / 2 - 4;

    ctx.save();
    ctx.translate(this.x, this.y);

    // Draw base tile outline
    ctx.strokeStyle = this.stats.color || '#00f0ff';
    ctx.lineWidth = 2;
    ctx.strokeRect(-half, -half, half * 2, half * 2);
    ctx.fillStyle = '#111420';
    ctx.fillRect(-half + 2, -half + 2, (half - 2) * 2, (half - 2) * 2);

    // Draw tier badge
    ctx.fillStyle = this.stats.color || '#00f0ff';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'right';
    ctx.fillText('T' + this.tier, half - 4, -half + 12);

    // Disabled status overlay
    if (this.isDisabled) {
      ctx.fillStyle = 'rgba(255, 230, 0, 0.3)';
      ctx.fillRect(-half, -half, half * 2, half * 2);
      ctx.strokeStyle = '#ffe600';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-half, -half); ctx.lineTo(half, half);
      ctx.moveTo(half, -half); ctx.lineTo(-half, half);
      ctx.stroke();
    }

    ctx.restore();
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = BaseTower;
}
