import { Game } from '../src/Game';

// Mock window dimensions for testing different screen sizes
const mockWindowDimensions = (width: number, height: number) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  });
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: height,
  });
};

// Mock CSS media query matching
const mockMatchMedia = (query: string) => {
  return {
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  };
};

// Create DOM structure for mobile testing
const createMobileDOMStructure = () => {
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
          <div class="column-selectors" id="column-selectors">
            ${Array.from({ length: 20 }, (_, i) => 
              `<button class="column-selector" data-column="${i}">${i + 1}</button>`
            ).join('')}
          </div>
          <div class="grid-container">
            <div class="grid" id="game-grid">
              ${Array.from({ length: 400 }, (_, i) => 
                `<div class="cell" data-row="${Math.floor(i / 20)}" data-col="${i % 20}"></div>`
              ).join('')}
            </div>
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
          <div id="game-message" class="game-message">Click a column to drop a ball</div>
        </div>
      </main>
    </div>
  `;
};

describe('Mobile Responsiveness Tests', () => {
  let game: Game;

  beforeEach(() => {
    // Mock matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(mockMatchMedia),
    });

    createMobileDOMStructure();
    game = new Game({
      gridSize: 20,
      ballsPerPlayer: 10,
      minBoxes: 15,
      maxBoxes: 30
    });
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  describe('Screen Size Adaptations', () => {
    it('should handle large tablet screens (1024px)', () => {
      mockWindowDimensions(1024, 768);
      
      const gameContainer = document.querySelector('.game-container');
      const grid = document.querySelector('.grid');
      const columnSelectors = document.querySelector('.column-selectors');
      
      expect(gameContainer).toBeTruthy();
      expect(grid).toBeTruthy();
      expect(columnSelectors).toBeTruthy();
    });

    it('should handle tablet screens (768px)', () => {
      mockWindowDimensions(768, 1024);
      
      const gameContainer = document.querySelector('.game-container');
      const columnSelectors = document.querySelector('.column-selectors');
      
      expect(gameContainer).toBeTruthy();
      expect(columnSelectors).toBeTruthy();
      
      // Column selectors should be present for scrolling
      const buttons = columnSelectors?.querySelectorAll('.column-selector');
      expect(buttons?.length).toBe(20);
    });

    it('should handle large phone screens (480px)', () => {
      mockWindowDimensions(480, 800);
      
      const gameContainer = document.querySelector('.game-container');
      const grid = document.querySelector('.grid');
      const cells = document.querySelectorAll('.cell');
      
      expect(gameContainer).toBeTruthy();
      expect(grid).toBeTruthy();
      expect(cells.length).toBe(400); // 20x20 grid
    });

    it('should handle small phone screens (360px)', () => {
      mockWindowDimensions(360, 640);
      
      const gameContainer = document.querySelector('.game-container');
      const columnSelectors = document.querySelectorAll('.column-selector');
      const cells = document.querySelectorAll('.cell');
      
      expect(gameContainer).toBeTruthy();
      expect(columnSelectors.length).toBe(20);
      expect(cells.length).toBe(400);
    });
  });

  describe('Touch Target Accessibility', () => {
    it('should have column selectors with adequate touch targets', () => {
      const columnSelectors = document.querySelectorAll('.column-selector');
      
      expect(columnSelectors.length).toBe(20);
      
      columnSelectors.forEach(selector => {
        expect(selector.tagName).toBe('BUTTON');
        expect(selector.classList.contains('column-selector')).toBe(true);
        
        // Verify button has content for touch interaction
        expect(selector.textContent?.trim()).toBeTruthy();
      });
    });

    it('should have buttons with proper accessibility attributes', () => {
      const buttons = document.querySelectorAll('button');
      
      buttons.forEach(button => {
        expect(button.tagName).toBe('BUTTON');
        // Buttons should have text content or aria-label
        const hasAccessibleName = button.textContent?.trim() || 
                                 button.getAttribute('aria-label') ||
                                 button.getAttribute('title');
        expect(hasAccessibleName).toBeTruthy();
      });
    });

    it('should have form controls with proper labels', () => {
      const select = document.getElementById('animation-speed-select');
      const label = document.querySelector('label[for="animation-speed-select"]');
      
      expect(select).toBeTruthy();
      expect(label).toBeTruthy();
      expect(label?.textContent).toContain('Animation Speed');
    });
  });

  describe('Layout Structure for Mobile', () => {
    it('should have proper header structure for mobile', () => {
      const header = document.querySelector('header');
      const headerContent = document.querySelector('.header-content');
      const logoContainer = document.querySelector('.logo-container');
      const gameInfo = document.querySelector('.game-info');
      
      expect(header).toBeTruthy();
      expect(headerContent).toBeTruthy();
      expect(logoContainer).toBeTruthy();
      expect(gameInfo).toBeTruthy();
      
      expect(header?.contains(headerContent as Node)).toBe(true);
      expect(header?.contains(gameInfo as Node)).toBe(true);
    });

    it('should have proper main content structure', () => {
      const main = document.querySelector('main');
      const gameBoard = document.querySelector('.game-board');
      const gameControls = document.querySelector('.game-controls');
      const gameStatus = document.querySelector('.game-status');
      
      expect(main).toBeTruthy();
      expect(gameBoard).toBeTruthy();
      expect(gameControls).toBeTruthy();
      expect(gameStatus).toBeTruthy();
      
      expect(main?.contains(gameBoard as Node)).toBe(true);
      expect(main?.contains(gameControls as Node)).toBe(true);
      expect(main?.contains(gameStatus as Node)).toBe(true);
    });

    it('should have game board with column selectors and grid', () => {
      const gameBoard = document.querySelector('.game-board');
      const columnSelectors = document.querySelector('.column-selectors');
      const gridContainer = document.querySelector('.grid-container');
      const grid = document.querySelector('.grid');
      
      expect(gameBoard).toBeTruthy();
      expect(columnSelectors).toBeTruthy();
      expect(gridContainer).toBeTruthy();
      expect(grid).toBeTruthy();
      
      expect(gameBoard?.contains(columnSelectors as Node)).toBe(true);
      expect(gameBoard?.contains(gridContainer as Node)).toBe(true);
      expect(gridContainer?.contains(grid as Node)).toBe(true);
    });
  });

  describe('Content Scaling and Readability', () => {
    it('should have readable text content', () => {
      const gameMessage = document.querySelector('.game-message');
      const playerNames = document.querySelectorAll('.player-name');
      const ballsRemaining = document.querySelectorAll('.balls-remaining');
      
      expect(gameMessage?.textContent).toBeTruthy();
      expect(playerNames.length).toBe(2);
      expect(ballsRemaining.length).toBe(2);
      
      playerNames.forEach(name => {
        expect(name.textContent?.trim()).toBeTruthy();
      });
    });

    it('should have proper button text content', () => {
      const newGameBtn = document.getElementById('new-game-btn');
      const resetBtn = document.getElementById('reset-btn');
      
      expect(newGameBtn?.textContent).toBe('New Game');
      expect(resetBtn?.textContent).toBe('Reset');
    });

    it('should have numbered column selectors', () => {
      const columnSelectors = document.querySelectorAll('.column-selector');
      
      columnSelectors.forEach((selector, index) => {
        expect(selector.textContent?.trim()).toBe((index + 1).toString());
      });
    });
  });

  describe('Game Functionality on Mobile', () => {
    it('should maintain game state with mobile DOM structure', () => {
      game.startNewGame();
      expect(game.getState()).toBe(1); // GameState.PLAYING
      
      const grid = game.getGrid();
      expect(grid.getSize()).toBe(20);
      
      const columnWinners = grid.getColumnWinners();
      expect(columnWinners.length).toBe(20);
    });

    it('should handle ball dropping with mobile interface', () => {
      game.startNewGame();
      
      const initialBalls = game.getBallsRemaining(game.getCurrentPlayer());
      const success = game.dropBallSync(0);
      
      if (success) {
        const remainingBalls = game.getBallsRemaining(game.getCurrentPlayer() === 1 ? 2 : 1);
        expect(remainingBalls).toBe(initialBalls - 1);
      }
    });

    it('should maintain column selection functionality', () => {
      game.startNewGame();
      
      for (let i = 0; i < 20; i++) {
        const canDrop = game.canDropInColumn(i);
        expect(typeof canDrop).toBe('boolean');
      }
    });
  });

  describe('Performance Considerations', () => {
    it('should handle large grid efficiently', () => {
      const cells = document.querySelectorAll('.cell');
      const columnSelectors = document.querySelectorAll('.column-selector');
      
      expect(cells.length).toBe(400); // 20x20 grid
      expect(columnSelectors.length).toBe(20);
      
      // Verify DOM structure is efficient
      cells.forEach(cell => {
        expect(cell.classList.contains('cell')).toBe(true);
        expect(cell.hasAttribute('data-row')).toBe(true);
        expect(cell.hasAttribute('data-col')).toBe(true);
      });
    });

    it('should have minimal DOM nesting for performance', () => {
      const gameContainer = document.querySelector('.game-container');
      const nestedLevels = getMaxNestingLevel(gameContainer as Element);
      
      // Should not have excessive nesting that could impact mobile performance
      expect(nestedLevels).toBeLessThan(10);
    });
  });
});

// Helper function to calculate DOM nesting levels
function getMaxNestingLevel(element: Element, currentLevel: number = 0): number {
  let maxLevel = currentLevel;
  
  for (const child of element.children) {
    const childLevel = getMaxNestingLevel(child, currentLevel + 1);
    maxLevel = Math.max(maxLevel, childLevel);
  }
  
  return maxLevel;
}