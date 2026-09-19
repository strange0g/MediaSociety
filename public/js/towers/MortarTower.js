if (typeof BaseTower === 'undefined' && typeof require !== 'undefined') {
  BaseTower = require('./BaseTower');
}

class MortarTower extends BaseTower {
  constructor(gridX, gridY) {
    super(gridX, gridY, 'mortar');
  }

  update(dt, enemies, gameEngine) {
    super.update(dt, enemies, gameEngine);
    if (this.isDisabled) return;

    if (this.cooldownTimer <= 0) {
      const target = this.selectTarget(enemies);
      if (target) {
        this.fire(target, gameEngine);
        this.cooldownTimer = 1.0 / this.stats.fireRate;
      }
    }
  }

  fire(target, gameEngine) {
    this.angle = Math.atan2(target.y - this.y, target.x - this.x);

    const dx = target.x - this.x;
    const dy = target.y - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const travelTime = dist / this.stats.projectileSpeed;

    const targetX = target.x + target.vx * travelTime;
    const targetY = target.y + target.vy * travelTime;

    const projectileOptions = {
      napalmDuration: this.stats.napalmDuration || null,
      napalmDps: this.stats.napalmDps || 0,
      armorReducePerHit: this.stats.armorReducePerHit || 0,
      maxArmorReduceStacks: this.stats.maxArmorReduceStacks || 0,
      towerOwner: this
    };

    const projectile = new Projectile(
      this.x,
      this.y,
      targetX,
      targetY,
      this.stats.projectileSpeed,
      this.stats.damage,
      this.stats.splashRadius,
      projectileOptions
    );

    gameEngine.projectiles.push(projectile);

    if (gameEngine.audio) gameEngine.audio.playMortarLaunch();
  }

  draw(ctx) {
    this.drawBase(ctx);

    ctx.save();
    ctx.translate(this.x, this.y);

    ctx.rotate(this.angle);
    ctx.fillStyle = '#181d30';
    ctx.fillRect(-8, -8, 16, 16);

    ctx.fillStyle = this.stats.color || '#ff0055';
    ctx.fillRect(0, -6, 20, 12);
    ctx.strokeStyle = '#ffe600';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(0, -6, 20, 12);

    ctx.restore();
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = MortarTower;
}
