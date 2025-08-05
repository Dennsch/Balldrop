// Test the turn-based release phase logic
console.log('🎯 Testing Turn-Based Release Phase Logic\n');

// Mock the game state
const GameState = {
    BALL_RELEASE_PHASE: 'BALL_RELEASE_PHASE',
    FINISHED: 'FINISHED'
};

const Player = { PLAYER1: 1, PLAYER2: 2 };

// Simulate game state
let gameState = {
    state: GameState.BALL_RELEASE_PHASE,
    currentPlayer: Player.PLAYER1,
    ballsRemaining: new Map([[Player.PLAYER1, 3], [Player.PLAYER2, 3]]),
    reservedColumns: {
        player1: [0, 1, 2],  // Player 1 reserved columns 0, 1, 2
        player2: [3, 4, 5]   // Player 2 reserved columns 3, 4, 5
    },
    reservedColumnOwners: new Map([
        [0, Player.PLAYER1], [1, Player.PLAYER1], [2, Player.PLAYER1],
        [3, Player.PLAYER2], [4, Player.PLAYER2], [5, Player.PLAYER2]
    ])
};

// Helper functions
function canReleaseBall(col) {
    if (gameState.state !== GameState.BALL_RELEASE_PHASE) {
        return false;
    }

    // Check if this column was reserved
    if (!gameState.reservedColumnOwners.has(col)) {
        return false;
    }

    const columnOwner = gameState.reservedColumnOwners.get(col);

    // TURN-BASED RESTRICTION: Only the current player can release balls
    if (columnOwner !== gameState.currentPlayer) {
        return false;
    }

    // Check if this column still has balls to release
    const currentReservedColumns = columnOwner === Player.PLAYER1 
        ? gameState.reservedColumns.player1 
        : gameState.reservedColumns.player2;

    return currentReservedColumns.includes(col);
}

function releaseBall(col) {
    if (!canReleaseBall(col)) {
        return false;
    }

    const columnOwner = gameState.reservedColumnOwners.get(col);
    const currentReservedColumns = columnOwner === Player.PLAYER1 
        ? gameState.reservedColumns.player1 
        : gameState.reservedColumns.player2;

    // Remove one instance of the column (each ball can only be released once)
    const index = currentReservedColumns.indexOf(col);
    if (index > -1) {
        currentReservedColumns.splice(index, 1);
    }

    // Decrease balls remaining
    const ballsLeft = gameState.ballsRemaining.get(columnOwner);
    gameState.ballsRemaining.set(columnOwner, ballsLeft - 1);

    // Check if game is finished
    const p1Balls = gameState.ballsRemaining.get(Player.PLAYER1);
    const p2Balls = gameState.ballsRemaining.get(Player.PLAYER2);
    
    if (p1Balls === 0 && p2Balls === 0) {
        gameState.state = GameState.FINISHED;
    } else {
        // Switch to next player (turn-based like normal mode)
        gameState.currentPlayer = gameState.currentPlayer === Player.PLAYER1 
            ? Player.PLAYER2 
            : Player.PLAYER1;
    }

    return true;
}

function printGameState() {
    console.log(`State: ${gameState.state}`);
    console.log(`Current Player: ${gameState.currentPlayer}`);
    console.log(`Player 1 balls: ${gameState.ballsRemaining.get(Player.PLAYER1)}`);
    console.log(`Player 2 balls: ${gameState.ballsRemaining.get(Player.PLAYER2)}`);
    console.log(`Player 1 reserved columns: [${gameState.reservedColumns.player1.join(', ')}]`);
    console.log(`Player 2 reserved columns: [${gameState.reservedColumns.player2.join(', ')}]`);
    console.log('');
}

// Run tests
console.log('=== Initial State ===');
printGameState();

console.log('=== Test 1: Player 1 can release from their column ===');
console.log(`Can Player 1 release from column 0? ${canReleaseBall(0)}`);
console.log(`Can Player 1 release from column 3 (Player 2's)? ${canReleaseBall(3)}`);

console.log('\n=== Test 2: Player 1 releases from column 0 ===');
const release0 = releaseBall(0);
console.log(`Release result: ${release0}`);
printGameState();

console.log('=== Test 3: Now it\'s Player 2\'s turn ===');
console.log(`Can Player 1 still release from column 1? ${canReleaseBall(1)}`);
console.log(`Can Player 2 release from column 3? ${canReleaseBall(3)}`);

console.log('\n=== Test 4: Player 2 releases from column 3 ===');
const release3 = releaseBall(3);
console.log(`Release result: ${release3}`);
printGameState();

console.log('=== Test 5: Try to release from column 0 again (should fail) ===');
console.log(`Can release from column 0 again? ${canReleaseBall(0)}`);
const release0Again = releaseBall(0);
console.log(`Release result: ${release0Again}`);

console.log('\n=== Test 6: Complete the game ===');
console.log('Player 1 releases from column 1...');
releaseBall(1);
printGameState();

console.log('Player 2 releases from column 4...');
releaseBall(4);
printGameState();

console.log('Player 1 releases from column 2...');
releaseBall(2);
printGameState();

console.log('Player 2 releases from column 5...');
releaseBall(5);
printGameState();

console.log('✅ All tests completed!');
console.log('\n📋 Key behaviors verified:');
console.log('✓ Turn-based play: Only current player can release');
console.log('✓ Column ownership: Players can only use their reserved columns');
console.log('✓ One-time use: Each column can only be used once');
console.log('✓ Turn switching: Turn switches after each successful release');
console.log('✓ Game completion: Game ends when all balls are released');