// Test for exceptions in portal logic
const { Grid } = require('./src/Grid.js');
const { Game } = require('./src/Game.js');
const { CellType, Player } = require('./src/types.js');

console.log('=== Testing for Portal Exceptions ===\n');

// Test various edge cases that might throw exceptions

const testCases = [
    {
        name: "Portal at row 0 (teleport to -1)",
        setup: (grid) => {
            grid.setCell(1, 2, { type: CellType.PORTAL_1 });
            grid.setCell(0, 4, { type: CellType.PORTAL_1 });
        },
        dropColumn: 2
    },
    {
        name: "Portal at last row (teleport beyond grid)",
        setup: (grid) => {
            grid.setCell(2, 2, { type: CellType.PORTAL_1 });
            grid.setCell(4, 4, { type: CellType.PORTAL_1 }); // last row
        },
        dropColumn: 2
    },
    {
        name: "Single portal without pair",
        setup: (grid) => {
            grid.setCell(2, 2, { type: CellType.PORTAL_1 });
            // No matching portal
        },
        dropColumn: 2
    },
    {
        name: "Portal teleport to occupied cell",
        setup: (grid) => {
            grid.setCell(2, 2, { type: CellType.PORTAL_1 });
            grid.setCell(2, 4, { type: CellType.PORTAL_1 });
            // Block the teleport destination
            grid.setCell(1, 4, { type: CellType.BOX, direction: 'LEFT' });
        },
        dropColumn: 2
    },
    {
        name: "Portal at column boundary",
        setup: (grid) => {
            grid.setCell(2, 0, { type: CellType.PORTAL_1 }); // leftmost
            grid.setCell(2, 4, { type: CellType.PORTAL_1 }); // rightmost
        },
        dropColumn: 0
    }
];

testCases.forEach((testCase, index) => {
    console.log(`Test ${index + 1}: ${testCase.name}`);
    console.log('-'.repeat(40));
    
    try {
        const grid = new Grid(5);
        grid.clearGrid();
        
        // Set up the test case
        testCase.setup(grid);
        
        console.log(`Dropping ball in column ${testCase.dropColumn}`);
        
        // Test calculateBallPath directly
        const result = grid.calculateBallPath(testCase.dropColumn, Player.PLAYER1);
        
        if (result.finalPosition) {
            console.log('✓ SUCCESS: calculateBallPath completed');
            console.log(`  Final position: (${result.finalPosition.row}, ${result.finalPosition.col})`);
        } else {
            console.log('⚠ WARNING: calculateBallPath returned null');
        }
        
        // Test with Game class
        const game = new Game();
        const gameGrid = game.getGrid();
        gameGrid.clearGrid();
        testCase.setup(gameGrid);
        game.startNewGame();
        
        const canDrop = game.canDropInColumn(testCase.dropColumn);
        console.log(`  canDropInColumn: ${canDrop}`);
        
        if (canDrop) {
            const dropResult = game.dropBallSync(testCase.dropColumn);
            console.log(`  dropBallSync: ${dropResult}`);
        }
        
    } catch (error) {
        console.error('✗ EXCEPTION CAUGHT:');
        console.error(`  Message: ${error.message}`);
        console.error(`  Stack: ${error.stack}`);
    }
    
    console.log('');
});

// Test the random portal placement
console.log('Test: Random portal placement');
console.log('-'.repeat(40));

try {
    const game = new Game();
    game.startNewGame(); // This calls placeRandomBoxes which calls placePortalBlocks
    
    const grid = game.getGrid();
    const cells = grid.getCells();
    
    // Find all portals
    const portals = [];
    for (let row = 0; row < grid.getSize(); row++) {
        for (let col = 0; col < grid.getSize(); col++) {
            const cell = cells[row][col];
            if (cell.type === CellType.PORTAL_1 || cell.type === CellType.PORTAL_2) {
                portals.push({ row, col, type: cell.type });
            }
        }
    }
    
    console.log('Found portals:', portals);
    
    // Try to drop balls in columns that have portals
    for (const portal of portals) {
        console.log(`Testing column ${portal.col} with ${portal.type} at (${portal.row}, ${portal.col})`);
        
        const canDrop = game.canDropInColumn(portal.col);
        console.log(`  canDropInColumn(${portal.col}): ${canDrop}`);
        
        if (canDrop) {
            // Create a fresh game for each test
            const testGame = new Game();
            const testGrid = testGame.getGrid();
            
            // Copy the portal setup
            testGrid.clearGrid();
            for (const p of portals) {
                testGrid.setCell(p.row, p.col, { type: p.type });
            }
            testGame.startNewGame();
            
            const dropResult = testGame.dropBallSync(portal.col);
            console.log(`  dropBallSync(${portal.col}): ${dropResult}`);
        }
    }
    
} catch (error) {
    console.error('✗ EXCEPTION in random portal test:');
    console.error(`  Message: ${error.message}`);
    console.error(`  Stack: ${error.stack}`);
}

console.log('\n=== Exception Testing Complete ===');