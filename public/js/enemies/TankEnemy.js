if (typeof BaseEnemy === 'undefined' && typeof require !== 'undefined') {
  BaseEnemy = require('./BaseEnemy');
}

class TankEnemy extends BaseEnemy {
  constructor(pathPoints) {
    super(pathPoints, 'tank');
  }

  draw(ctx) {
    this.drawBaseShape(ctx, '#ff6600', 16);
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = TankEnemy;
}
