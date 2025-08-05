// Let's create a simple test to debug the portal issue
// We'll use the existing test structure

const { Grid } = require('./src/Grid.js');
const { CellType, Player } = require('./src/types.js');

console.log('Debugging portal issue...');

// Test 1: Normal portal placement (should work)
console.log('\n=== Test 1: Normal portal placement ===');
try {
    const grid = new Grid(5);
    grid.clearGrid();
    
    // Place portals in valid positions (not in first or last row)
    grid.setCell(2, 1, { type: CellType.PORTAL_1 });
    grid.setCell(2, 3, { type: CellType.PORTAL_1 });
    
    console.log('Portals placed at (2,1) and (2,3)');
    
    // Try to drop a ball in column 1
    const result = grid.calculateBallPath(1, Player.PLAYER1);
    console.log('calculateBallPath result:', result);
    
    if (result.finalPosition) {
        console.log('SUCCESS: Ball path calculated successfully');
        console.log('Final position:', result.finalPosition);
    } else {
        console.log('FAILED: calculateBallPath returned null');
    }
} catch (error) {
    console.error('ERROR in Test 1:', error.message);
    console.error('Stack:', error.stack);
}

// Test 2: Portal at row 0 (edge case that might cause issues)
console.log('\n=== Test 2: Portal at row 0 (edge case) ===');
try {
    const grid = new Grid(5);
    grid.clearGrid();
    
    // Place one portal at row 0 and another at row 2
    grid.setCell(0, 1, { type: CellType.PORTAL_1 });
    grid.setCell(2, 3, { type: CellType.PORTAL_1 });
    
    console.log('Portals placed at (0,1) and (2,3)');
    
    // Try to drop a ball in column 1
    const result = grid.calculateBallPath(1, Player.PLAYER1);
    console.log('calculateBallPath result:', result);
    
    if (result.finalPosition) {
        console.log('SUCCESS: Ball path calculated successfully');
        console.log('Final position:', result.finalPosition);
    } else {
        console.log('FAILED: calculateBallPath returned null');
    }
} catch (error) {
    console.error('ERROR in Test 2:', error.message);
    console.error('Stack:', error.stack);
}

// Test 3: Portal in column but ball dropped in different column
console.log('\n=== Test 3: Portal in column, ball in different column ===');
try {
    const grid = new Grid(5);
    grid.clearGrid();
    
    // Place portals in column 2
    grid.setCell(2, 2, { type: CellType.PORTAL_1 });
    grid.setCell(3, 4, { type: CellType.PORTAL_1 });
    
    console.log('Portals placed at (2,2) and (3,4)');
    
    // Try to drop a ball in column 1 (no portal)
    const result1 = grid.calculateBallPath(1, Player.PLAYER1);
    console.log('Ball in column 1 (no portal):', result1.finalPosition);
    
    // Try to drop a ball in column 2 (has portal)
    const result2 = grid.calculateBallPath(2, Player.PLAYER1);
    console.log('Ball in column 2 (has portal):', result2.finalPosition);
    
} catch (error) {
    console.error('ERROR in Test 3:', error.message);
    console.error('Stack:', error.stack);
}

// Test 4: Check isColumnFull with portals
console.log('\n=== Test 4: isColumnFull with portals ===');
try {
    const grid = new Grid(5);
    grid.clearGrid();
    
    // Place portal in column 2
    grid.setCell(2, 2, { type: CellType.PORTAL_1 });
    grid.setCell(3, 4, { type: CellType.PORTAL_1 });
    
    console.log('isColumnFull(2) with portal:', grid.isColumnFull(2));
    console.log('isColumnFull(1) without portal:', grid.isColumnFull(1));
    
    // Fill column 2 from top
    grid.setCell(0, 2, { type: CellType.BALL_P1, player: Player.PLAYER1 });
    console.log('After placing ball at top of column 2:');
    console.log('isColumnFull(2):', grid.isColumnFull(2));
    
} catch (error) {
    console.error('ERROR in Test 4:', error.message);
    console.error('Stack:', error.stack);
}

console.log('\n=== Debug complete ===');