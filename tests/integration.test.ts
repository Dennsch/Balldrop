import { Game } from '../src/Game';
import { GameUI } from '../src/GameUI';
import { Player, GameState } from '../src/types';

// Mock DOM elements for testing
const createMockDOM = () => {
  document.body.innerHTML = `
    <div id="game-grid"></div>
    <div id="column-selectors"></div>
    <span id="player1-balls">10</span>
    <span id="player2-balls">10</span>
    <span id="current-player">Player 1's Turn</span>
    <div id="winner-message" class="hidden"></div>
    <div id="game-message"></div>
    <button id="new-game-btn">New Game</button>
    <button id="reset-btn">Reset</button>
  `;
};

describe('Integration Tests', () => {
  let game: Game;
  let gameUI: GameUI;

  beforeEach(() => {
    createMockDOM();
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

  describe('Game and UI Integration', () => {
    it('should initialize UI elements correctly', () => {
      expect(document.getElementById('game-grid')).toBeTruthy();
      expect(document.getElementById('column-selectors')).toBeTruthy();
      expect(document.getElementById('player1-balls')).toBeTruthy();
      expect(document.getElementById('player2-balls')).toBeTruthy();
    });

    it('should create grid cells in the DOM', () => {
      const gridElement = document.getElementById('game-grid');
      const cells = gridElement?.querySelectorAll('.cell');
      
      // Should have 5x5 = 25 cells for our test grid
      expect(cells?.length).toBe(25);
    });

    it('should create column selector buttons', () => {
      const selectorsElement = document.getElementById('column-selectors');
      const buttons = selectorsElement?.querySelectorAll('.column-selector');
      
      // Should have 5 buttons for our test grid
      expect(buttons?.length).toBe(5);
    });

    it('should update UI when game state changes', () => {
      const player1BallsElement = document.getElementById('player1-balls');
      const currentPlayerElement = document.getElementById('current-player');
      
      // Start game
      game.startNewGame();
      
      // Drop a ball
      game.dropBall(0);
      
      // Check if UI reflects the change
      expect(player1BallsElement?.textContent).toBe('2'); // Should have 2 balls left
      expect(currentPlayerElement?.textContent).toBe("Player 2's Turn");
    });

    it('should handle new game button click', () => {
      const newGameButton = document.getElementById('new-game-btn') as HTMLButtonElement;
      
      expect(game.getState()).toBe(GameState.SETUP);
      
      // Simulate button click
      newGameButton.click();
      
      expect(game.getState()).toBe(GameState.PLAYING);
    });

    it('should handle reset button click', () => {
      // Start and play a bit
      game.startNewGame();
      game.dropBall(0);
      
      const resetButton = document.getElementById('reset-btn') as HTMLButtonElement;
      
      // Simulate button click
      resetButton.click();
      
      expect(game.getState()).toBe(GameState.SETUP);
      expect(game.getBallsRemaining(Player.PLAYER1)).toBe(3);
      expect(game.getBallsRemaining(Player.PLAYER2)).toBe(3);
    });

    it('should handle column selector clicks', () => {
      game.startNewGame();
      
      const selectorsElement = document.getElementById('column-selectors');
      const firstButton = selectorsElement?.querySelector('[data-col="0"]') as HTMLButtonElement;
      
      expect(game.getBallsRemaining(Player.PLAYER1)).toBe(3);
      
      // Simulate column button click
      firstButton.click();
      
      expect(game.getBallsRemaining(Player.PLAYER1)).toBe(2);
    });

    it('should disable column buttons when column is full', () => {
      game.startNewGame();
      
      const selectorsElement = document.getElementById('column-selectors');
      const firstButton = selectorsElement?.querySelector('[data-col="0"]') as HTMLButtonElement;
      
      // Fill the column (5 cells in our test grid)
      for (let i = 0; i < 5; i++) {
        game.dropBall(0);
      }
      
      // Button should be disabled
      expect(firstButton.disabled).toBe(true);
    });

    it('should show winner message when game finishes', () => {
      game.startNewGame();
      
      // Play a complete game
      for (let i = 0; i < 6; i++) { // 3 balls per player
        game.dropBall(i % 5);
      }
      
      const winnerMessage = document.getElementById('winner-message');
      expect(winnerMessage?.classList.contains('hidden')).toBe(false);
    });

    it('should update grid visually when balls are dropped', () => {
      game.startNewGame();
      
      // Drop a ball
      game.dropBall(0);
      
      // Check if grid cell has the correct class
      const gridElement = document.getElementById('game-grid');
      const bottomCell = gridElement?.querySelector('[data-row="4"][data-col="0"]');
      
      expect(bottomCell?.classList.contains('has-ball-p1')).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle missing DOM elements gracefully', () => {
      // Remove a required element
      const element = document.getElementById('game-grid');
      element?.remove();
      
      // Creating GameUI should throw an error
      expect(() => {
        new GameUI(game);
      }).toThrow();
    });
  });

  describe('Game Flow Integration', () => {
    it('should complete a full game cycle', () => {
      // Start game
      game.startNewGame();
      expect(game.getState()).toBe(GameState.PLAYING);
      
      // Play alternating turns
      let currentPlayer = game.getCurrentPlayer();
      game.dropBall(0);
      expect(game.getCurrentPlayer()).not.toBe(currentPlayer);
      
      currentPlayer = game.getCurrentPlayer();
      game.dropBall(1);
      expect(game.getCurrentPlayer()).not.toBe(currentPlayer);
      
      // Continue until game ends
      game.dropBall(2);
      game.dropBall(3);
      game.dropBall(4);
      game.dropBall(0); // This should finish the game
      
      expect(game.getState()).toBe(GameState.FINISHED);
      
      // Should be able to get game result
      const result = game.getGameResult();
      expect(result).toBeDefined();
      expect(typeof result.player1Columns).toBe('number');
      expect(typeof result.player2Columns).toBe('number');
    });
  });
});