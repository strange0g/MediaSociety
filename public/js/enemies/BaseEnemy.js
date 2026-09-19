// Base Enemy Class

class BaseEnemy {
  constructor(pathPoints, enemyType) {
    this.id = 'enemy_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
    this.type = enemyType;
    this.spec = CONFIG.ENEMIES[enemyType];

    this.pathPoints = pathPoints; // Array of {x, y} tile coordinates
    this.currentWaypointIndex = 0;

    // Convert tile coordinates to pixel coordinates
    const tileSize = CONFIG.GRID.TILE_SIZE;
    this.x = pathPoints[0].x * tileSize + tileSize / 2;
    this.y = pathPoints[0].y * tileSize + tileSize / 2;

    this.vx = 0;
    this.vy = 0;

    // Health, Armor, Speed attributes
    this.maxHp = this.spec.hp;
    this.hp = this.spec.hp;
    this.baseArmor = this.spec.armor;
    this.armorReduceStacks = 0; // Permanent armor reduction from Mortar T3
    this.baseSpeed = this.spec.speed;
    this.reward = this.spec.reward;
    this.weight = this.spec.weight;
    this.isStealth = this.spec.isStealth || false;
    this.isRevealed = !this.isStealth;

    // Status debuffs
    this.slowRatio = 0;
    this.slowTimer = 0;
    this.slowImmuneTimer = 0;

    this.brittleRatio = 0;
    this.brittleTimer = 0;

    this.freezeTimer = 0;

    this.isDead = false;
    this.hasReachedEnd = false;

    this.pathDistance = 0; // Distance covered along path for targeting priority
    this.calculateNextVelocity();
  }

  get currentArmor() {
    const reducedRatio = Math.min(0.25, this.armorReduceStacks * 0.05);
    return Math.max(0, this.baseArmor * (1 - reducedRatio));
  }

  get effectiveSpeed() {
    if (this.freezeTimer > 0) return 0;

    let speedMult = 1.0;
    if (this.slowTimer > 0 && this.slowImmuneTimer <= 0) {
      speedMult *= (1.0 - this.slowRatio);
    }
    return this.baseSpeed * speedMult;
  }

  applySlow(slowRatio, duration) {
    if (this.slowImmuneTimer > 0) return;
    if (slowRatio >= this.slowRatio || this.slowTimer <= 0) {
      this.slowRatio = slowRatio;
      this.slowTimer = duration;
    }
  }

  applyBrittle(brittleRatio, duration) {
    this.brittleRatio = Math.max(this.brittleRatio, brittleRatio);
    this.brittleTimer = Math.max(this.brittleTimer, duration);
  }

  applyFreeze(duration) {
    this.freezeTimer = Math.max(this.freezeTimer, duration);
  }

  takeDamage(rawDamage, options = {}) {
    if (this.isDead || this.hasReachedEnd) return;

    // Apply armor reduction stacks if nuclear fallout
    if (options.armorReducePerHit && this.armorReduceStacks < (options.maxArmorReduceStacks || 5)) {
      this.armorReduceStacks++;
    }

    // Apply Brittle debuff (+15% damage)
    let actualDamage = rawDamage;
    if (this.brittleTimer > 0) {
      actualDamage *= (1.0 + this.brittleRatio);
    }

    // Apply armor reduction formula (unless armorPenetration applies)
    const effectiveArmor = this.currentArmor * (1.0 - (options.armorPenetration || 0));
    const flatArmorMitigation = Math.min(effectiveArmor, actualDamage * 0.7);
    actualDamage = Math.max(1, actualDamage - flatArmorMitigation);

    // Execute check (Tesla T3 execute threshold)
    if (options.executeThreshold && (this.hp / this.maxHp) <= options.executeThreshold) {
      actualDamage = this.hp; // Instakill execute
    }

    this.hp -= actualDamage;

    if (this.hp <= 0) {
      this.hp = 0;
      this.isDead = true;
    }
  }

  calculateNextVelocity() {
    if (this.currentWaypointIndex >= this.pathPoints.length - 1) {
      this.vx = 0;
      this.vy = 0;
      return;
    }

    const tileSize = CONFIG.GRID.TILE_SIZE;
    const targetPt = this.pathPoints[this.currentWaypointIndex + 1];
    const targetX = targetPt.x * tileSize + tileSize / 2;
    const targetY = targetPt.y * tileSize + tileSize / 2;

    const dx = targetX - this.x;
    const dy = targetY - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > 0) {
      this.vx = (dx / dist);
      this.vy = (dy / dist);
    }
  }

  update(dt, gameEngine) {
    if (this.isDead || this.hasReachedEnd) return;

    // Update timers
    if (this.slowImmuneTimer > 0) this.slowImmuneTimer -= dt;
    if (this.slowTimer > 0) {
      this.slowTimer -= dt;
      if (this.slowTimer <= 0) this.slowRatio = 0;
    }
    if (this.brittleTimer > 0) {
      this.brittleTimer -= dt;
      if (this.brittleTimer <= 0) this.brittleRatio = 0;
    }
    if (this.freezeTimer > 0) {
      this.freezeTimer -= dt;
    }

    const speed = this.effectiveSpeed;
    if (speed > 0) {
      const moveDist = speed * dt;
      this.x += this.vx * moveDist;
      this.y += this.vy * moveDist;
      this.pathDistance += moveDist;

      // Check if reached current target waypoint
      const tileSize = CONFIG.GRID.TILE_SIZE;
      const targetPt = this.pathPoints[this.currentWaypointIndex + 1];
      const targetX = targetPt.x * tileSize + tileSize / 2;
      const targetY = targetPt.y * tileSize + tileSize / 2;

      const dx = targetX - this.x;
      const dy = targetY - this.y;
      const remainingDist = Math.sqrt(dx * dx + dy * dy);

      if (remainingDist < 4) {
        this.currentWaypointIndex++;
        if (this.currentWaypointIndex >= this.pathPoints.length - 1) {
          this.hasReachedEnd = true;
        } else {
          this.calculateNextVelocity();
        }
      }
    }
  }

  drawHealthBar(ctx) {
    if (this.hp >= this.maxHp) return;

    const barWidth = 28;
    const barHeight = 4;
    const hpRatio = Math.max(0, this.hp / this.maxHp);

    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(this.x - barWidth / 2, this.y - 20, barWidth, barHeight);

    ctx.fillStyle = hpRatio > 0.5 ? '#00ff66' : hpRatio > 0.25 ? '#ffe600' : '#ff0055';
    ctx.fillRect(this.x - barWidth / 2, this.y - 20, barWidth * hpRatio, barHeight);

    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    ctx.strokeRect(this.x - barWidth / 2, this.y - 20, barWidth, barHeight);
    ctx.restore();
  }

  drawBaseShape(ctx, color, size = 12) {
    ctx.save();
    ctx.translate(this.x, this.y);

    if (this.isStealth && !this.isRevealed) {
      ctx.globalAlpha = 0.2;
    }

    if (this.freezeTimer > 0) {
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 10;
    } else {
      ctx.fillStyle = color;
    }

    ctx.beginPath();
    ctx.arc(0, 0, size, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.restore();
    this.drawHealthBar(ctx);
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = BaseEnemy;
}
