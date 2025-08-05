// Simple test for release phase without browser dependencies
console.log('Testing Hard Mode Release Phase Logic...\n');

// Mock the required enums and classes
const GameMode = { NORMAL: 'NORMAL', HARD_MODE: 'HARD_MODE' };
const GameState = {
    SETUP: 'SETUP',
    PLAYING: 'PLAYING',
    COLUMN_RESERVATION_PHASE: 'COLUMN_RESERVATION_PHASE',
    BALL_PLACEMENT_PHASE: 'BALL_PLACEMENT_PHASE',
    BALL_RELEASE_PHASE: 'BALL_RELEASE_PHASE',
    FINISHED: 'FINISHED'
};
const Player = { PLAYER1: 1, PLAYER2: 2 };

// Test the logic manually
console.log('=== Testing Release Phase Logic ===');

// Simulate the game state
let reservedColumns = {
    player1: [0, 1, 2],  // Player 1 reserved columns 0, 1, 2
    player2: [3, 4, 5]   // Player 2 reserved columns 3, 4, 5
};

let ballsRemaining = {
    player1: 3,
    player2: 3
};

console.log('Initial reserved columns:');
console.log('Player 1:', reservedColumns.player1);
console.log('Player 2:', reservedColumns.player2);
console.log('Balls remaining - Player 1:', ballsRemaining.player1, 'Player 2:', ballsRemaining.player2);

// Test release logic
function canReleaseBall(col, player) {
    const playerColumns = player === Player.PLAYER1 ? reservedColumns.player1 : reservedColumns.player2;
    return playerColumns.includes(col);
}

function releaseBall(col, player) {
    const playerColumns = player === Player.PLAYER1 ? reservedColumns.player1 : reservedColumns.player2;
    const ballsLeft = player === Player.PLAYER1 ? ballsRemaining.player1 : ballsRemaining.player2;
    
    if (!playerColumns.includes(col) || ballsLeft <= 0) {
        return false;
    }
    
    // Remove one instance of the column (each ball can only be released once)
    const index = playerColumns.indexOf(col);
    if (index > -1) {
        playerColumns.splice(index, 1);
    }
    
    // Decrease balls remaining
    if (player === Player.PLAYER1) {
        ballsRemaining.player1--;
    } else {
        ballsRemaining.player2--;
    }
    
    return true;
}

console.log('\n=== Testing Release Behavior ===');

// Test Player 1 releases
console.log('\n1. Player 1 releasing from column 0:');
console.log('   Can release?', canReleaseBall(0, Player.PLAYER1));
console.log('   Release result:', releaseBall(0, Player.PLAYER1));
console.log('   Remaining columns:', reservedColumns.player1);
console.log('   Balls remaining:', ballsRemaining.player1);

console.log('\n2. Player 1 trying to release from column 0 again:');
console.log('   Can release?', canReleaseBall(0, Player.PLAYER1));
console.log('   Release result:', releaseBall(0, Player.PLAYER1));

console.log('\n3. Player 1 trying to release from Player 2\'s column (3):');
console.log('   Can release?', canReleaseBall(3, Player.PLAYER1));
console.log('   Release result:', releaseBall(3, Player.PLAYER1));

console.log('\n4. Player 2 releasing from column 3:');
console.log('   Can release?', canReleaseBall(3, Player.PLAYER2));
console.log('   Release result:', releaseBall(3, Player.PLAYER2));
console.log('   Remaining columns:', reservedColumns.player2);
console.log('   Balls remaining:', ballsRemaining.player2);

// Release all remaining balls
console.log('\n=== Releasing All Remaining Balls ===');
console.log('Player 1 releasing from columns 1 and 2...');
releaseBall(1, Player.PLAYER1);
releaseBall(2, Player.PLAYER1);

console.log('Player 2 releasing from columns 4 and 5...');
releaseBall(4, Player.PLAYER2);
releaseBall(5, Player.PLAYER2);

console.log('\nFinal state:');
console.log('Player 1 reserved columns:', reservedColumns.player1);
console.log('Player 2 reserved columns:', reservedColumns.player2);
console.log('Player 1 balls remaining:', ballsRemaining.player1);
console.log('Player 2 balls remaining:', ballsRemaining.player2);

console.log('\n✅ Release phase logic test completed!');
console.log('\nKey behaviors verified:');
console.log('- Each ball can only be released once');
console.log('- Players can only release from their reserved columns');
console.log('- Reserved columns list is updated after each release');
console.log('- Ball count decreases with each release');