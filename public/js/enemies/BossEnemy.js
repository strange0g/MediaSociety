if (typeof BaseEnemy === 'undefined' && typeof require !== 'undefined') {
  BaseEnemy = require('./BaseEnemy');
}

class BossEnemy extends BaseEnemy {
  constructor(pathPoints) {
    super(pathPoints, 'boss');
    this.disablePulseTimer = CONFIG.ENEMIES.boss.disableInterval || 4.0;
    this.pulseEffect = null;
  }

  update(dt, gameEngine) {
    super.update(dt, gameEngine);
    if (this.isDead || this.hasReachedEnd) return;

    if (this.pulseEffect) {
      this.pulseEffect.duration -= dt;
      if (this.pulseEffect.duration <= 0) this.pulseEffect = null;
    }

    this.disablePulseTimer -= dt;
    if (this.disablePulseTimer <= 0) {
      this.triggerDisablePulse(gameEngine);
      this.disablePulseTimer = CONFIG.ENEMIES.boss.disableInterval;
    }
  }

  triggerDisablePulse(gameEngine) {
    const disableRadius = CONFIG.ENEMIES.boss.disableRadius || 192;
    let closestTower = null;
    let minDist = disableRadius;

    gameEngine.towers.forEach(tower => {
      const dx = tower.x - this.x;
      const dy = tower.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist <= minDist) {
        minDist = dist;
        closestTower = tower;
      }
    });

    if (closestTower) {
      closestTower.disable(CONFIG.ENEMIES.boss.disableDuration || 2.0);
      this.pulseEffect = {
        targetX: closestTower.x,
        targetY: closestTower.y,
        duration: 0.5
      };

      if (gameEngine.audio) gameEngine.audio.playBossPulse();
    }
  }

  draw(ctx) {
    this.drawBaseShape(ctx, '#ffe600', 22);

    if (this.pulseEffect) {
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(this.pulseEffect.targetX, this.pulseEffect.targetY);
      ctx.strokeStyle = '#ffe600';
      ctx.lineWidth = 4;
      ctx.shadowColor = '#ffe600';
      ctx.shadowBlur = 12;
      ctx.stroke();
      ctx.restore();
    }
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = BossEnemy;
}
