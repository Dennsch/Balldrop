// Import from built files
const { Game } = require('./dist/Game.js');
const { Grid } = require('./dist/Grid.js');
const { CellType, Player } = require('./dist/types.js');

console.log('Testing portal column issue...');

try {
    // Create a game instance
    const game = new Game();
    
    // Get the grid
    const grid = game.getGrid();
    
    // Clear the grid and manually place a portal in column 2
    grid.clearGrid();
    grid.setCell(2, 2, { type: CellType.PORTAL_1 });
    grid.setCell(3, 4, { type: CellType.PORTAL_1 }); // Matching portal
    
    console.log('Grid setup complete. Portal 1 at (2,2) and (3,4)');
    
    // Try to drop a ball in column 2 (which has a portal)
    console.log('Attempting to drop ball in column 2 (has portal)...');
    
    const canDrop = game.canDropInColumn(2);
    console.log('Can drop in column 2:', canDrop);
    
    if (canDrop) {
        const success = game.dropBallSync(2);
        console.log('Drop ball success:', success);
        
        if (success) {
            console.log('Ball dropped successfully!');
            
            // Check where the ball ended up
            const cells = grid.getCells();
            for (let row = 0; row < grid.getSize(); row++) {
                for (let col = 0; col < grid.getSize(); col++) {
                    const cell = cells[row][col];
                    if (cell.type === CellType.BALL_P1) {
                        console.log(`Ball found at position (${row}, ${col})`);
                    }
                }
            }
        } else {
            console.log('Failed to drop ball');
        }
    } else {
        console.log('Cannot drop ball in column 2');
    }
    
    // Also test with calculateBallPath directly
    console.log('\nTesting calculateBallPath directly...');
    const pathResult = grid.calculateBallPath(2, Player.PLAYER1);
    console.log('Path result:', pathResult);
    
} catch (error) {
    console.error('Error occurred:', error);
    console.error('Stack trace:', error.stack);
}