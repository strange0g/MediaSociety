if (typeof BaseTower === 'undefined' && typeof require !== 'undefined') {
  BaseTower = require('./BaseTower');
}

class CryoTower extends BaseTower {
  constructor(gridX, gridY) {
    super(gridX, gridY, 'cryo');
    this.attackCount = 0;
    this.pulseEffect = null;
  }

  update(dt, enemies, gameEngine) {
    super.update(dt, enemies, gameEngine);
    if (this.isDisabled) return;

    if (this.pulseEffect) {
      this.pulseEffect.duration -= dt;
      if (this.pulseEffect.duration <= 0) this.pulseEffect = null;
    }

    if (this.stats.revealsStealth) {
      enemies.forEach(enemy => {
        if (enemy.isStealth) {
          const dx = enemy.x - this.x;
          const dy = enemy.y - this.y;
          if (Math.sqrt(dx * dx + dy * dy) <= this.stats.range) {
            enemy.isRevealed = true;
          }
        }
      });
    }

    if (this.cooldownTimer <= 0) {
      const inRangeEnemies = enemies.filter(e => {
        if (e.isDead || e.hasReachedEnd) return false;
        if (e.isStealth && !e.isRevealed) {
          const dx = e.x - this.x;
          const dy = e.y - this.y;
          if (this.stats.revealsStealth && Math.sqrt(dx * dx + dy * dy) <= this.stats.range) {
            e.isRevealed = true;
          } else {
            return false;
          }
        }

        const dx = e.x - this.x;
        const dy = e.y - this.y;
        return Math.sqrt(dx * dx + dy * dy) <= this.stats.range;
      });

      if (inRangeEnemies.length > 0) {
        this.firePulse(inRangeEnemies, gameEngine);
        this.cooldownTimer = 1.0 / this.stats.fireRate;
      }
    }
  }

  firePulse(targets, gameEngine) {
    this.attackCount++;
    const isFreezePulse = (this.stats.freezeInterval && (this.attackCount % this.stats.freezeInterval === 0));

    targets.forEach(enemy => {
      enemy.applySlow(this.stats.slowRatio, 1.2);

      if (this.stats.brittleDebuff) {
        enemy.applyBrittle(this.stats.brittleDebuff, 1.5);
      }

      if (isFreezePulse) {
        enemy.applyFreeze(this.stats.freezeDuration);
      }

      if (this.stats.damage > 0) {
        enemy.takeDamage(this.stats.damage, { sourceTower: this });
      }
    });

    this.pulseEffect = {
      radius: this.stats.range,
      duration: 0.3,
      isFreeze: isFreezePulse
    };

    if (gameEngine.audio) gameEngine.audio.playCryoPulse(isFreezePulse);
  }

  draw(ctx) {
    this.drawBase(ctx);

    ctx.save();
    ctx.translate(this.x, this.y);

    ctx.rotate(Date.now() * 0.002);
    ctx.fillStyle = this.stats.color || '#00ff66';
    ctx.beginPath();
    ctx.moveTo(0, -12);
    ctx.lineTo(10, 0);
    ctx.lineTo(0, 12);
    ctx.lineTo(-10, 0);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.restore();

    if (this.pulseEffect) {
      ctx.save();
      const progress = 1 - (this.pulseEffect.duration / 0.3);
      const currentRadius = this.stats.range * progress;

      ctx.beginPath();
      ctx.arc(this.x, this.y, currentRadius, 0, Math.PI * 2);
      ctx.strokeStyle = this.pulseEffect.isFreeze ? '#ffffff' : '#00ff66';
      ctx.lineWidth = this.pulseEffect.isFreeze ? 4 : 2;
      ctx.shadowColor = this.pulseEffect.isFreeze ? '#ffffff' : '#00ff66';
      ctx.shadowBlur = 8;
      ctx.stroke();
      ctx.restore();
    }
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = CryoTower;
}
