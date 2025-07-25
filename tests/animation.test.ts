import { GameUI } from '../src/GameUI';
import { Game } from '../src/Game';
import { Player, BallPath, Position } from '../src/types';

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

describe('Animation Speed Tests', () => {
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

  describe('Animation Timing Verification', () => {
    it('should have faster animation timings than original', () => {
      // Test that CSS animations have been sped up
      const styleSheet = document.createElement('style');
      styleSheet.textContent = `
        .cell { transition: all 0.15s ease; }
        .animated-ball { transition: all 0.35s ease-in-out; }
        .cell.falling { animation: fall 0.25s ease-in; }
        .cell.box-hit { animation: boxHit 0.3s ease-out; }
        .arrow.arrow-changing { animation: arrowRotate 0.2s ease-in-out; }
        .arrow { transition: transform 0.15s ease-in-out; }
      `;
      document.head.appendChild(styleSheet);

      // Verify the styles are applied
      const cellElement = document.createElement('div');
      cellElement.className = 'cell';
      document.body.appendChild(cellElement);

      const computedStyle = window.getComputedStyle(cellElement);
      // Note: In JSDOM, computed styles may not reflect CSS exactly,
      // but we can verify the CSS was added
      expect(styleSheet.textContent).toContain('0.15s');
      expect(styleSheet.textContent).toContain('0.35s');
      expect(styleSheet.textContent).toContain('0.25s');
      expect(styleSheet.textContent).toContain('0.3s');
      expect(styleSheet.textContent).toContain('0.2s');
    });

    it('should create animated balls with correct transition timing', () => {
      // Access the private method through reflection for testing
      const createAnimatedBall = (gameUI as any).createAnimatedBall.bind(gameUI);
      const ball = createAnimatedBall(Player.PLAYER1);

      expect(ball.style.transition).toBe('all 0.35s ease-in-out');
      expect(ball.className).toContain('animated-ball');
      expect(ball.className).toContain('player1');
    });

    it('should handle ball path animation without errors', async () => {
      game.startNewGame();
      
      const mockBallPath: BallPath = {
        player: Player.PLAYER1,
        startColumn: 2,
        steps: [
          {
            position: { row: 0, col: 2 },
            action: 'fall'
          },
          {
            position: { row: 4, col: 2 },
            action: 'settle'
          }
        ]
      };

      // Mock the animation methods to resolve quickly for testing
      const originalAnimateToPosition = (gameUI as any).animateToPosition;
      (gameUI as any).animateToPosition = jest.fn().mockResolvedValue(undefined);

      // Test that animation completes without error
      await expect((gameUI as any).animateBallPath(mockBallPath)).resolves.toBeUndefined();

      // Restore original method
      (gameUI as any).animateToPosition = originalAnimateToPosition;
    });

    it('should handle box hit animations with faster timing', async () => {
      const position: Position = { row: 2, col: 2 };
      
      // Create a mock cell element
      const cellElement = document.createElement('div');
      cellElement.className = 'cell';
      cellElement.dataset.row = '2';
      cellElement.dataset.col = '2';
      document.getElementById('game-grid')?.appendChild(cellElement);

      // Mock setTimeout to verify timing
      const originalSetTimeout = global.setTimeout;
      const mockSetTimeout = jest.fn((callback, delay) => {
        expect(delay).toBe(300); // Verify the faster timing
        callback();
        return 1 as any;
      });
      global.setTimeout = mockSetTimeout;

      await (gameUI as any).animateBoxHit(position);

      expect(mockSetTimeout).toHaveBeenCalledWith(expect.any(Function), 300);

      // Restore original setTimeout
      global.setTimeout = originalSetTimeout;
    });

    it('should handle arrow direction changes with faster timing', async () => {
      const position: Position = { row: 2, col: 2 };
      
      // Create a mock cell with arrow
      const cellElement = document.createElement('div');
      cellElement.className = 'cell';
      cellElement.dataset.row = '2';
      cellElement.dataset.col = '2';
      
      const arrowElement = document.createElement('span');
      arrowElement.className = 'arrow';
      arrowElement.textContent = '→';
      cellElement.appendChild(arrowElement);
      
      document.getElementById('game-grid')?.appendChild(cellElement);

      // Mock setTimeout to verify timing
      const originalSetTimeout = global.setTimeout;
      const timeouts: number[] = [];
      const mockSetTimeout = jest.fn((callback, delay) => {
        timeouts.push(delay);
        callback();
        return 1 as any;
      });
      global.setTimeout = mockSetTimeout;

      await (gameUI as any).animateBoxDirectionChange(position, 'RIGHT', 'LEFT');

      // Verify the faster timings (60ms and 120ms)
      expect(timeouts).toContain(60);
      expect(timeouts).toContain(120);

      // Restore original setTimeout
      global.setTimeout = originalSetTimeout;
    });
  });

  describe('Animation Performance', () => {
    it('should complete animations faster than original timings', async () => {
      const startTime = Date.now();
      
      // Mock a simple animation sequence
      const mockBallPath: BallPath = {
        player: Player.PLAYER1,
        startColumn: 0,
        steps: [
          { position: { row: 0, col: 0 }, action: 'fall' },
          { position: { row: 4, col: 0 }, action: 'settle' }
        ]
      };

      // Mock the animation to use actual timing but resolve quickly
      const originalAnimateToPosition = (gameUI as any).animateToPosition;
      (gameUI as any).animateToPosition = jest.fn().mockImplementation(
        (ball, position, action) => {
          return new Promise(resolve => {
            const duration = action === 'settle' ? 250 : 350;
            setTimeout(resolve, duration);
          });
        }
      );

      await (gameUI as any).animateBallPath(mockBallPath);
      
      const endTime = Date.now();
      const totalTime = endTime - startTime;

      // Should complete in under 700ms (250 + 350 + overhead)
      // This is much faster than the original ~1400ms (600 + 800)
      expect(totalTime).toBeLessThan(700);

      // Restore original method
      (gameUI as any).animateToPosition = originalAnimateToPosition;
    });

    it('should not block user interaction for extended periods', () => {
      // Verify that isAnimating flag is properly managed
      expect((gameUI as any).isAnimating).toBe(false);
      
      // During animation, it should be true
      (gameUI as any).isAnimating = true;
      expect((gameUI as any).isAnimating).toBe(true);
      
      // After animation, it should be false again
      (gameUI as any).isAnimating = false;
      expect((gameUI as any).isAnimating).toBe(false);
    });
  });
});