// Burning Napalm Pool left on grid path by Tier 2 and Tier 3 Mortars

class BurningPool {
  constructor(x, y, radius, duration, dps, towerOwner) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.duration = duration;
    this.maxDuration = duration;
    this.dps = dps;
    this.towerOwner = towerOwner;
    this.isFinished = false;
  }

  update(dt, enemies) {
    this.duration -= dt;
    if (this.duration <= 0) {
      this.isFinished = true;
      return;
    }

    // Apply DoT to any enemies standing within pool radius
    enemies.forEach(enemy => {
      if (enemy.isDead || enemy.hasReachedEnd) return;
      const dx = enemy.x - this.x;
      const dy = enemy.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist <= this.radius) {
        const damageThisFrame = this.dps * dt;
        enemy.takeDamage(damageThisFrame, {
          armorPenetration: 0,
          sourceTower: this.towerOwner
        });
      }
    });
  }

  draw(ctx) {
    if (this.isFinished) return;
    const alpha = Math.min(1, this.duration / this.maxDuration) * 0.45;

    ctx.save();
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 0, 85, ${alpha})`;
    ctx.fill();
    ctx.strokeStyle = '#ff0055';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Pulse inner core
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius * 0.5, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 230, 0, ${alpha * 1.2})`;
    ctx.fill();
    ctx.restore();
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = BurningPool;
}
