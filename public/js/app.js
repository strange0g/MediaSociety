// Application Entry Point & Initialization Bootstrap

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Game Simulation Engine
  const gameEngine = new GameEngine('game-canvas');

  // Initialize UI Event Controller
  const uiController = new UIController(gameEngine);
  uiController.init();
});
