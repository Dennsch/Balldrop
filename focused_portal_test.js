// Focused test to identify the exact portal issue
const { Grid } = require('./src/Grid.js');
const { Game } = require('./src/Game.js');
const { CellType, Player } = require('./src/types.js');

console.log('=== Focused Portal Issue Test ===\n');

// Test the specific scenario: column with portal at row 0
console.log('Test: Portal at row 0 causing issues');

try {
    const grid = new Grid(5);
    grid.clearGrid();
    
    // This is the problematic scenario - portal at row 0
    grid.setCell(0, 2, { type: CellType.PORTAL_1 });
    grid.setCell(2, 4, { type: CellType.PORTAL_1 });
    
    console.log('Setup: Portal 1 at (0,2) and (2,4)');
    
    // Test calculateBallPath directly
    console.log('\nTesting calculateBallPath...');
    const result = grid.calculateBallPath(2, Player.PLAYER1);
    
    console.log('Result:', result);
    
    if (result.finalPosition) {
        console.log('✓ calculateBallPath succeeded');
        console.log('Final position:', result.finalPosition);
        
        // Test the path steps
        if (result.ballPath && result.ballPath.steps) {
            console.log('Path steps:');
            result.ballPath.steps.forEach((step, index) => {
                console.log(`  ${index}: ${step.action} at (${step.position.row}, ${step.position.col})`);
            });
        }
    } else {
        console.log('✗ calculateBallPath failed - returned null');
    }
    
} catch (error) {
    console.error('✗ ERROR:', error.message);
    console.error('Stack:', error.stack);
}

// Test the scenario where portal teleportation would go to row -1
console.log('\n' + '='.repeat(50));
console.log('Test: Portal teleportation to invalid position');

try {
    const grid = new Grid(5);
    grid.clearGrid();
    
    // Ball falls in column 2, hits portal at (1,2)
    // Other portal is at (0,4) - teleportation would try to go to (-1,4)
    grid.setCell(1, 2, { type: CellType.PORTAL_1 });
    grid.setCell(0, 4, { type: CellType.PORTAL_1 });
    
    console.log('Setup: Portal 1 at (1,2) and (0,4)');
    console.log('Ball in column 2 should hit portal at (1,2)');
    console.log('Teleportation would try to go to (-1,4) which is invalid');
    
    const result = grid.calculateBallPath(2, Player.PLAYER1);
    
    if (result.finalPosition) {
        console.log('✓ calculateBallPath handled invalid teleportation gracefully');
        console.log('Final position:', result.finalPosition);
        
        // The ball should stay in column 2 since teleportation failed
        if (result.finalPosition.col === 2) {
            console.log('✓ Ball stayed in original column as expected');
        } else {
            console.log('✗ Ball ended up in unexpected column');
        }
    } else {
        console.log('✗ calculateBallPath failed completely');
    }
    
} catch (error) {
    console.error('✗ ERROR:', error.message);
    console.error('Stack:', error.stack);
}

// Test with Game class integration
console.log('\n' + '='.repeat(50));
console.log('Test: Game class integration with portal columns');

try {
    const game = new Game();
    const grid = game.getGrid();
    
    // Clear and set up a controlled scenario
    grid.clearGrid();
    grid.setCell(2, 1, { type: CellType.PORTAL_1 });
    grid.setCell(2, 3, { type: CellType.PORTAL_1 });
    
    console.log('Setup: Portal 1 at (2,1) and (2,3)');
    
    // Start the game
    game.startNewGame();
    
    console.log('Game started, state:', game.getState());
    
    // Test canDropInColumn
    const canDrop = game.canDropInColumn(1);
    console.log('canDropInColumn(1):', canDrop);
    
    if (canDrop) {
        // Test dropBallSync
        console.log('Attempting dropBallSync(1)...');
        const success = game.dropBallSync(1);
        console.log('dropBallSync result:', success);
        
        if (success) {
            console.log('✓ Game successfully handled portal column');
        } else {
            console.log('✗ Game failed to drop ball in portal column');
        }
    } else {
        console.log('✗ Game says cannot drop in portal column');
    }
    
} catch (error) {
    console.error('✗ ERROR in Game integration:', error.message);
    console.error('Stack:', error.stack);
}

console.log('\n=== Test Complete ===');