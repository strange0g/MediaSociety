if (typeof BaseTower === 'undefined' && typeof require !== 'undefined') {
  BaseTower = require('./BaseTower');
}

class TeslaTower extends BaseTower {
  constructor(gridX, gridY) {
    super(gridX, gridY, 'tesla');
    this.lightningEffect = null;
  }

  update(dt, enemies, gameEngine) {
    super.update(dt, enemies, gameEngine);
    if (this.isDisabled) return;

    if (this.lightningEffect) {
      this.lightningEffect.duration -= dt;
      if (this.lightningEffect.duration <= 0) this.lightningEffect = null;
    }

    if (this.cooldownTimer <= 0) {
      const primaryTarget = this.selectTarget(enemies);
      if (primaryTarget) {
        this.fire(primaryTarget, enemies, gameEngine);
        this.cooldownTimer = 1.0 / this.stats.fireRate;
      }
    }
  }

  fire(primaryTarget, enemies, gameEngine) {
    this.angle = Math.atan2(primaryTarget.y - this.y, primaryTarget.x - this.x);

    const hitTargets = [primaryTarget];

    const options = {
      armorPenetration: this.stats.armorPenetration || 0,
      executeThreshold: this.stats.executeThreshold || 0,
      sourceTower: this
    };

    primaryTarget.takeDamage(this.stats.damage, options);

    if (this.stats.chainTargets && this.stats.chainTargets > 0) {
      const chainRadius = 120;
      let currentSource = primaryTarget;

      for (let i = 0; i < this.stats.chainTargets; i++) {
        let nextTarget = null;
        let minDist = chainRadius;

        enemies.forEach(e => {
          if (e.isDead || e.hasReachedEnd || hitTargets.includes(e)) return;
          if (e.isStealth && !e.isRevealed) return;

          const dx = e.x - currentSource.x;
          const dy = e.y - currentSource.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist <= minDist) {
            minDist = dist;
            nextTarget = e;
          }
        });

        if (nextTarget) {
          hitTargets.push(nextTarget);
          const chainDamage = this.stats.damage * (this.stats.chainDamageMultiplier || 0.5);
          nextTarget.takeDamage(chainDamage, options);
          currentSource = nextTarget;
        } else {
          break;
        }
      }
    }

    this.lightningEffect = {
      targets: hitTargets.map(t => ({ x: t.x, y: t.y })),
      duration: 0.15
    };

    if (gameEngine.audio) gameEngine.audio.playTeslaShoot();
  }

  draw(ctx) {
    this.drawBase(ctx);

    ctx.save();
    ctx.translate(this.x, this.y);

    ctx.rotate(this.angle);
    ctx.fillStyle = this.stats.color || '#00f0ff';
    ctx.fillRect(-6, -10, 12, 20);

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, -3, 16, 6);

    ctx.restore();

    if (this.lightningEffect && this.lightningEffect.targets.length > 0) {
      ctx.save();
      ctx.strokeStyle = '#00f0ff';
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 10;
      ctx.lineWidth = this.tier === 3 ? 3 : 2;

      let currentX = this.x;
      let currentY = this.y;

      this.lightningEffect.targets.forEach(t => {
        ctx.beginPath();
        ctx.moveTo(currentX, currentY);

        const midX = (currentX + t.x) / 2 + (Math.random() - 0.5) * 16;
        const midY = (currentY + t.y) / 2 + (Math.random() - 0.5) * 16;
        ctx.lineTo(midX, midY);
        ctx.lineTo(t.x, t.y);
        ctx.stroke();

        currentX = t.x;
        currentY = t.y;
      });

      ctx.restore();
    }
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = TeslaTower;
}
