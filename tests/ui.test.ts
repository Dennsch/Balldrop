import { Game } from '../src/Game';
import { GameUI } from '../src/GameUI';

// Mock DOM elements for testing UI components
const createMockDOMWithLogo = () => {
  document.body.innerHTML = `
    <div class="game-container">
      <header>
        <div class="header-content">
          <div class="logo-container">
            <img src="assets/icon.png" alt="Balldrop Game Logo" class="game-logo">
          </div>
          <h1>Balldrop Game</h1>
        </div>
        <div class="game-info">
          <div class="player-info">
            <div class="player player-1">
              <span class="player-name">Player 1</span>
              <span class="balls-remaining">Balls: <span id="player1-balls">10</span></span>
            </div>
            <div class="current-turn">
              <span id="current-player">Player 1's Turn</span>
            </div>
            <div class="player player-2">
              <span class="player-name">Player 2</span>
              <span class="balls-remaining">Balls: <span id="player2-balls">10</span></span>
            </div>
          </div>
        </div>
      </header>
      <main>
        <div class="game-board">
          <div class="column-selectors" id="column-selectors"></div>
          <div class="grid-container">
            <div class="grid" id="game-grid"></div>
          </div>
        </div>
        <div class="game-controls">
          <button id="new-game-btn" class="btn btn-primary">New Game</button>
          <button id="reset-btn" class="btn btn-secondary">Reset</button>
        </div>
        <div class="game-status">
          <div id="winner-message" class="winner-message hidden"></div>
          <div id="game-message" class="game-message"></div>
        </div>
      </main>
    </div>
  `;
};

describe('UI Component Tests', () => {
  let game: Game;
  let gameUI: GameUI;

  beforeEach(() => {
    createMockDOMWithLogo();
    game = new Game({
      gridSize: 5,
      ballsPerPlayer: 3,
      minBoxes: 1,
      maxBoxes: 2
    });
    gameUI = new GameUI(game);
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  describe('Logo Integration', () => {
    it('should have logo element in the DOM', () => {
      const logoElement = document.querySelector('.game-logo') as HTMLImageElement;
      expect(logoElement).toBeTruthy();
      expect(logoElement.tagName).toBe('IMG');
    });

    it('should have correct logo attributes', () => {
      const logoElement = document.querySelector('.game-logo') as HTMLImageElement;
      expect(logoElement.src).toContain('assets/icon.png');
      expect(logoElement.alt).toBe('Balldrop Game Logo');
      expect(logoElement.classList.contains('game-logo')).toBe(true);
    });

    it('should have logo container with proper structure', () => {
      const logoContainer = document.querySelector('.logo-container');
      const headerContent = document.querySelector('.header-content');
      
      expect(logoContainer).toBeTruthy();
      expect(headerContent).toBeTruthy();
      expect(headerContent?.contains(logoContainer as Node)).toBe(true);
    });

    it('should maintain header structure with logo and title', () => {
      const headerContent = document.querySelector('.header-content');
      const logoContainer = headerContent?.querySelector('.logo-container');
      const title = headerContent?.querySelector('h1');
      
      expect(logoContainer).toBeTruthy();
      expect(title).toBeTruthy();
      expect(title?.textContent).toBe('Balldrop Game');
    });
  });

  describe('CSS Classes and Styling', () => {
    it('should have proper CSS classes applied', () => {
      const gameContainer = document.querySelector('.game-container');
      const headerContent = document.querySelector('.header-content');
      const logoContainer = document.querySelector('.logo-container');
      const player1 = document.querySelector('.player-1');
      const player2 = document.querySelector('.player-2');
      
      expect(gameContainer?.classList.contains('game-container')).toBe(true);
      expect(headerContent?.classList.contains('header-content')).toBe(true);
      expect(logoContainer?.classList.contains('logo-container')).toBe(true);
      expect(player1?.classList.contains('player-1')).toBe(true);
      expect(player2?.classList.contains('player-2')).toBe(true);
    });

    it('should have button elements with correct classes', () => {
      const newGameBtn = document.getElementById('new-game-btn');
      const resetBtn = document.getElementById('reset-btn');
      
      expect(newGameBtn?.classList.contains('btn')).toBe(true);
      expect(newGameBtn?.classList.contains('btn-primary')).toBe(true);
      expect(resetBtn?.classList.contains('btn')).toBe(true);
      expect(resetBtn?.classList.contains('btn-secondary')).toBe(true);
    });
  });

  describe('Game Functionality with New UI', () => {
    it('should maintain game functionality with logo present', () => {
      // Start game
      game.startNewGame();
      expect(game.getState()).toBe(1); // GameState.PLAYING
      
      // Drop a ball
      game.dropBallSync(0);
      
      // Check if UI still updates correctly
      const player1BallsElement = document.getElementById('player1-balls');
      const currentPlayerElement = document.getElementById('current-player');
      
      expect(player1BallsElement?.textContent).toBe('2');
      expect(currentPlayerElement?.textContent).toBe("Player 2's Turn");
    });

    it('should handle winner display with new styling', () => {
      game.startNewGame();
      
      // Play a complete game
      for (let i = 0; i < 6; i++) {
        game.dropBallSync(i % 5);
      }
      
      const winnerMessage = document.getElementById('winner-message');
      expect(winnerMessage?.classList.contains('hidden')).toBe(false);
      
      // Check if winner message has appropriate class
      const hasWinnerClass = winnerMessage?.classList.contains('player1-wins') || 
                            winnerMessage?.classList.contains('player2-wins') || 
                            winnerMessage?.classList.contains('tie');
      expect(hasWinnerClass).toBe(true);
    });
  });

  describe('Responsive Design Elements', () => {
    it('should have responsive structure in place', () => {
      const gameContainer = document.querySelector('.game-container');
      const headerContent = document.querySelector('.header-content');
      const gameBoard = document.querySelector('.game-board');
      const gameControls = document.querySelector('.game-controls');
      
      expect(gameContainer).toBeTruthy();
      expect(headerContent).toBeTruthy();
      expect(gameBoard).toBeTruthy();
      expect(gameControls).toBeTruthy();
    });
  });
});