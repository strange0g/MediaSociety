if (typeof BaseEnemy === 'undefined' && typeof require !== 'undefined') {
  BaseEnemy = require('./BaseEnemy');
}

class StalkerEnemy extends BaseEnemy {
  constructor(pathPoints) {
    super(pathPoints, 'stalker');
  }

  draw(ctx) {
    this.drawBaseShape(ctx, '#ff0055', 12);
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = StalkerEnemy;
}
