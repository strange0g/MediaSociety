if (typeof BaseEnemy === 'undefined' && typeof require !== 'undefined') {
  BaseEnemy = require('./BaseEnemy');
}

class ScoutEnemy extends BaseEnemy {
  constructor(pathPoints) {
    super(pathPoints, 'scout');
    this.slowImmuneTimer = CONFIG.ENEMIES.scout.slowImmuneDuration || 2.0;
  }

  draw(ctx) {
    this.drawBaseShape(ctx, '#00f0ff', 10);
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = ScoutEnemy;
}
