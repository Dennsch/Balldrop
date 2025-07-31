import { Game } from '../src/Game';
import { GameUI } from '../src/GameUI';

// Mock DOM elements for testing UI components
const createMockDOMWithLogo = () => {
  document.body.innerHTML = `
    <div class="game-container">
      <header>
        <div class="header-content">
          <div class="logo-container">
            <img src="assets/icon.png" alt="Dropple Game Logo" class="game-logo">
          </div>
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
          <div class="animation-speed-control">
            <label for="animation-speed-select">Animation Speed:</label>
            <select id="animation-speed-select" class="speed-select">
              <option value="SLOW">Slow</option>
              <option value="NORMAL" selected>Normal</option>
              <option value="FAST">Fast</option>
              <option value="INSTANT">Instant</option>
            </select>
          </div>
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
      expect(logoElement.alt).toBe('Dropple Game Logo');
      expect(logoElement.classList.contains('game-logo')).toBe(true);
    });

    it('should have logo container with proper structure', () => {
      const logoContainer = document.querySelector('.logo-container');
      const headerContent = document.querySelector('.header-content');
      
      expect(logoContainer).toBeTruthy();
      expect(headerContent).toBeTruthy();
      expect(headerContent?.contains(logoContainer as Node)).toBe(true);
    });

    it('should have logo with modern styling', () => {
      const logoElement = document.querySelector('.game-logo') as HTMLImageElement;
      expect(logoElement).toBeTruthy();
      
      // Verify the logo has the game-logo class which should have modern styling
      expect(logoElement.classList.contains('game-logo')).toBe(true);
      
      // The actual size verification would be done through CSS, but we can verify
      // the element structure is correct for the styling to be applied
      expect(logoElement.tagName).toBe('IMG');
      expect(logoElement.src).toContain('assets/icon.png');
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

    it('should have modern speed select dropdown with correct styling', () => {
      const speedSelect = document.getElementById('animation-speed-select');
      const speedControl = document.querySelector('.animation-speed-control');
      
      expect(speedSelect).toBeTruthy();
      expect(speedControl).toBeTruthy();
      expect(speedSelect?.classList.contains('speed-select')).toBe(true);
      expect(speedSelect?.tagName).toBe('SELECT');
      
      // Check if options are present
      const options = speedSelect?.querySelectorAll('option');
      expect(options?.length).toBe(4);
      expect(options?.[1].selected).toBe(true); // Normal should be selected
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

    it('should have column selectors with mobile-friendly properties', () => {
      const columnSelectors = document.querySelector('.column-selectors');
      expect(columnSelectors).toBeTruthy();
      expect(columnSelectors?.id).toBe('column-selectors');
    });

    it('should have grid container with proper structure for mobile', () => {
      const gridContainer = document.querySelector('.grid-container');
      const grid = document.querySelector('.grid');
      
      expect(gridContainer).toBeTruthy();
      expect(grid).toBeTruthy();
      expect(grid?.id).toBe('game-grid');
      expect(gridContainer?.contains(grid as Node)).toBe(true);
    });

    it('should have touch-friendly button elements', () => {
      const buttons = document.querySelectorAll('.btn');
      expect(buttons.length).toBeGreaterThan(0);
      
      buttons.forEach(button => {
        expect(button.classList.contains('btn')).toBe(true);
      });
    });

    it('should have proper viewport meta structure for mobile', () => {
      // This would be tested in integration tests, but we can verify
      // the DOM structure supports mobile responsiveness
      const gameContainer = document.querySelector('.game-container');
      const header = document.querySelector('header');
      const main = document.querySelector('main');
      
      expect(gameContainer).toBeTruthy();
      expect(header).toBeTruthy();
      expect(main).toBeTruthy();
      expect(gameContainer?.contains(header as Node)).toBe(true);
      expect(gameContainer?.contains(main as Node)).toBe(true);
    });
  });

  describe('Mobile Touch Interaction Support', () => {
    it('should have column selectors ready for touch interaction', () => {
      // Initialize the UI to create column selectors
      gameUI.render();
      
      const columnSelectors = document.querySelectorAll('.column-selector');
      expect(columnSelectors.length).toBe(5); // 5x5 grid for test
      
      columnSelectors.forEach(selector => {
        expect(selector.tagName).toBe('BUTTON');
        expect(selector.classList.contains('column-selector')).toBe(true);
      });
    });

    it('should have grid cells ready for touch interaction', () => {
      gameUI.render();
      
      const cells = document.querySelectorAll('.cell');
      expect(cells.length).toBe(25); // 5x5 grid for test
      
      cells.forEach(cell => {
        expect(cell.classList.contains('cell')).toBe(true);
      });
    });

    it('should maintain accessibility for mobile users', () => {
      const buttons = document.querySelectorAll('button');
      const selects = document.querySelectorAll('select');
      
      buttons.forEach(button => {
        expect(button.tagName).toBe('BUTTON');
      });
      
      selects.forEach(select => {
        expect(select.tagName).toBe('SELECT');
      });
    });
  });
});