// Mortar Ballistic Projectile with physical travel time & splash damage logic

class Projectile {
  constructor(startX, startY, targetX, targetY, speed, damage, splashRadius, options = {}) {
    this.startX = startX;
    this.startY = startY;
    this.x = startX;
    this.y = startY;
    this.targetX = targetX;
    this.targetY = targetY;
    this.speed = speed;
    this.damage = damage;
    this.splashRadius = splashRadius;

    this.options = options; // napalm, nuclear fallout armor reduce, tower owner
    this.isHit = false;

    // Calculate total travel distance & trajectory angle
    const dx = targetX - startX;
    const dy = targetY - startY;
    this.totalDistance = Math.sqrt(dx * dx + dy * dy);
    this.travelTime = this.totalDistance / speed;
    this.elapsedTime = 0;
  }

  update(dt, gameEngine) {
    if (this.isHit) return;

    this.elapsedTime += dt;
    const progress = Math.min(1, this.elapsedTime / this.travelTime);

    // Linear x,y interpolation
    this.x = this.startX + (this.targetX - this.startX) * progress;
    this.y = this.startY + (this.targetY - this.startY) * progress;

    if (progress >= 1) {
      this.explode(gameEngine);
      this.isHit = true;
    }
  }

  explode(gameEngine) {
    // 1. Deal splash damage to enemies
    gameEngine.enemies.forEach(enemy => {
      if (enemy.isDead || enemy.hasReachedEnd) return;
      const dx = enemy.x - this.x;
      const dy = enemy.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist <= this.splashRadius) {
        // Falloff damage based on distance
        const falloff = 1 - (dist / (this.splashRadius * 1.2));
        const actualDamage = Math.max(this.damage * 0.4, this.damage * falloff);

        enemy.takeDamage(actualDamage, {
          armorReducePerHit: this.options.armorReducePerHit,
          maxArmorReduceStacks: this.options.maxArmorReduceStacks,
          sourceTower: this.options.towerOwner
        });
      }
    });

    // 2. Spawn Napalm Pool if Tier 2 or Tier 3
    if (this.options.napalmDuration) {
      const pool = new BurningPool(
        this.x,
        this.y,
        this.splashRadius,
        this.options.napalmDuration,
        this.options.napalmDps,
        this.options.towerOwner
      );
      gameEngine.burningPools.push(pool);
    }

    // 3. Spawn Explosion Particles & Play Sound
    gameEngine.spawnExplosion(this.x, this.y, '#ff0055', this.splashRadius);
    if (gameEngine.audio) gameEngine.audio.playMortarExplode();
  }

  draw(ctx) {
    if (this.isHit) return;

    // Calculate parabolic arc height for 3D trajectory effect
    const progress = this.elapsedTime / this.travelTime;
    const arcHeight = Math.sin(progress * Math.PI) * 50;

    ctx.save();
    // Shadow
    ctx.beginPath();
    ctx.arc(this.x, this.y, 4, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fill();

    // Bomb projectile with arc height
    ctx.beginPath();
    ctx.arc(this.x, this.y - arcHeight, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#ff0055';
    ctx.fill();
    ctx.strokeStyle = '#ffe600';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Projectile;
}
