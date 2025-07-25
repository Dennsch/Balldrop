import { Game } from './Game.js';
import { GameUI } from './GameUI.js';

// Initialize the game when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    try {
        // Create game instance with default configuration
        const game = new Game({
            gridSize: 20,
            ballsPerPlayer: 10,
            minBoxes: 15,
            maxBoxes: 30
        });

        // Create UI controller
        const gameUI = new GameUI(game);

        // Make game available globally for debugging
        (window as any).game = game;
        (window as any).gameUI = gameUI;

        console.log('Dropple game initialized successfully!');
    } catch (error) {
        console.error('Failed to initialize game:', error);
        
        // Show error message to user
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #ff6b6b;
            color: white;
            padding: 20px;
            border-radius: 10px;
            text-align: center;
            z-index: 1000;
        `;
        
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        errorDiv.innerHTML = `
            <h3>Game Initialization Error</h3>
            <p>Failed to start the game. Please refresh the page and try again.</p>
            <p><small>${errorMessage}</small></p>
        `;
        document.body.appendChild(errorDiv);
    }
});

// Export classes for potential external use
export { Game } from './Game.js';
export { GameUI } from './GameUI.js';
export { Grid } from './Grid.js';
export * from './types.js';