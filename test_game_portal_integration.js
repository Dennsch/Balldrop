// Test the integration between Game.ts and Grid.ts for portal handling
const { Game } = require('./src/Game.js');
const { CellType, Player, GameState } = require('./src/types.js');

console.log('Testing Game-Grid portal integration...');

// Test 1: Normal game flow with portals
console.log('\n=== Test 1: Normal game with portals ===');
try {
    const game = new Game();
    const grid = game.getGrid();
    
    // Start a new game (this will place random boxes and portals)
    game.startNewGame();
    
    console.log('Game state:', game.getState());
    console.log('Current player:', game.getCurrentPlayer());
    
    // Find a column that has a portal
    const cells = grid.getCells();
    let portalColumn = -1;
    let portalRow = -1;
    
    for (let col = 0; col < grid.getSize(); col++) {
        for (let row = 0; row < grid.getSize(); row++) {
            const cell = cells[row][col];
            if (cell.type === CellType.PORTAL_1 || cell.type === CellType.PORTAL_2) {
                portalColumn = col;
                portalRow = row;
                console.log(`Found portal at (${row}, ${col}) of type ${cell.type}`);
                break;
            }
        }
        if (portalColumn !== -1) break;
    }
    
    if (portalColumn !== -1) {
        console.log(`Attempting to drop ball in column ${portalColumn} (has portal)`);
        
        // Check if we can drop in this column
        const canDrop = game.canDropInColumn(portalColumn);
        console.log('canDropInColumn result:', canDrop);
        
        if (canDrop) {
            // Try to drop the ball
            const success = game.dropBallSync(portalColumn);
            console.log('dropBallSync result:', success);
            
            if (success) {
                console.log('SUCCESS: Ball dropped in portal column');
                
                // Check where the ball ended up
                const updatedCells = grid.getCells();
                for (let row = 0; row < grid.getSize(); row++) {
                    for (let col = 0; col < grid.getSize(); col++) {
                        const cell = updatedCells[row][col];
                        if (cell.type === CellType.BALL_P1 || cell.type === CellType.BALL_P2) {
                            console.log(`Ball found at (${row}, ${col})`);
                        }
                    }
                }
            } else {
                console.log('FAILED: Could not drop ball');
            }
        } else {
            console.log('Cannot drop ball in portal column');
        }
    } else {
        console.log('No portals found in the grid');
    }
    
} catch (error) {
    console.error('ERROR in Test 1:', error.message);
    console.error('Stack:', error.stack);
}

// Test 2: Manually create a problematic scenario
console.log('\n=== Test 2: Manually created portal scenario ===');
try {
    const game = new Game();
    const grid = game.getGrid();
    
    // Clear and manually set up the grid
    grid.clearGrid();
    
    // Place portals in a way that might cause issues
    grid.setCell(1, 2, { type: CellType.PORTAL_1 });
    grid.setCell(1, 4, { type: CellType.PORTAL_1 });
    
    console.log('Manually placed portals at (1,2) and (1,4)');
    
    // Start the game
    game.startNewGame();
    
    console.log('Game state after startNewGame:', game.getState());
    
    // Try to drop ball in column 2
    console.log('Attempting to drop ball in column 2...');
    
    const canDrop = game.canDropInColumn(2);
    console.log('canDropInColumn(2):', canDrop);
    
    if (canDrop) {
        const success = game.dropBallSync(2);
        console.log('dropBallSync(2):', success);
    }
    
} catch (error) {
    console.error('ERROR in Test 2:', error.message);
    console.error('Stack:', error.stack);
}

console.log('\n=== Integration test complete ===');