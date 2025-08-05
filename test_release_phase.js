// Test script to verify the release phase behavior
const { Game } = require('./dist/Game.js');
const { GameMode, GameState, Player } = require('./dist/types.js');

console.log('Testing Hard Mode Release Phase...\n');

// Create a new game in hard mode
const game = new Game({ gameMode: GameMode.HARD_MODE, ballsPerPlayer: 3 });
game.startNewGame();

console.log('1. Initial state:', game.getState());
console.log('   Game mode:', game.getGameMode());

// Phase 1: Column Reservation
console.log('\n=== COLUMN RESERVATION PHASE ===');
console.log('Current player:', game.getCurrentPlayer());

// Player 1 reserves columns 0, 1, 2
console.log('Player 1 reserving columns 0, 1, 2...');
console.log('Reserve column 0:', game.reserveColumn(0));
console.log('Reserve column 1:', game.reserveColumn(1));
console.log('Reserve column 2:', game.reserveColumn(2));

// Player 2 reserves columns 3, 4, 5
console.log('Player 2 reserving columns 3, 4, 5...');
console.log('Reserve column 3:', game.reserveColumn(3));
console.log('Reserve column 4:', game.reserveColumn(4));
console.log('Reserve column 5:', game.reserveColumn(5));

console.log('State after reservation:', game.getState());
console.log('Player 1 reserved columns:', game.getReservedColumnsForPlayer(Player.PLAYER1));
console.log('Player 2 reserved columns:', game.getReservedColumnsForPlayer(Player.PLAYER2));

// Phase 2: Ball Placement
console.log('\n=== BALL PLACEMENT PHASE ===');
console.log('Current player:', game.getCurrentPlayer());

// Player 1 places balls in reserved columns
console.log('Player 1 placing balls...');
console.log('Place ball in column 0:', game.selectMove(0));
console.log('Place ball in column 1:', game.selectMove(1));
console.log('Place ball in column 2:', game.selectMove(2));

// Player 2 places balls in reserved columns
console.log('Player 2 placing balls...');
console.log('Place ball in column 3:', game.selectMove(3));
console.log('Place ball in column 4:', game.selectMove(4));
console.log('Place ball in column 5:', game.selectMove(5));

console.log('State after ball placement:', game.getState());
console.log('Player 1 balls remaining:', game.getBallsRemaining(Player.PLAYER1));
console.log('Player 2 balls remaining:', game.getBallsRemaining(Player.PLAYER2));

// Phase 3: Ball Release
console.log('\n=== BALL RELEASE PHASE ===');
console.log('Current state:', game.getState());

// Test that each ball can only be released once
console.log('\nTesting release restrictions...');

// Player 1 should be able to release from their reserved columns
console.log('Can Player 1 release from column 0?', game.canReleaseBall(0));
console.log('Can Player 1 release from column 3 (Player 2\'s)?', game.canReleaseBall(3));

// Release one ball from column 0
console.log('\nReleasing ball from column 0 (Player 1):', game.releaseBall(0));
console.log('Player 1 balls remaining after release:', game.getBallsRemaining(Player.PLAYER1));

// Try to release another ball from column 0 (should fail - each ball can only be released once)
console.log('Try to release another ball from column 0:', game.releaseBall(0));
console.log('Can still release from column 0?', game.canReleaseBall(0));

// Release remaining balls
console.log('\nReleasing remaining balls...');
console.log('Release from column 1:', game.releaseBall(1));
console.log('Release from column 2:', game.releaseBall(2));
console.log('Release from column 3:', game.releaseBall(3));
console.log('Release from column 4:', game.releaseBall(4));
console.log('Release from column 5:', game.releaseBall(5));

console.log('\nFinal state:', game.getState());
console.log('Player 1 balls remaining:', game.getBallsRemaining(Player.PLAYER1));
console.log('Player 2 balls remaining:', game.getBallsRemaining(Player.PLAYER2));

// Test reserved columns after releases
console.log('\nReserved columns after all releases:');
console.log('Player 1 reserved columns:', game.getReservedColumnsForPlayer(Player.PLAYER1));
console.log('Player 2 reserved columns:', game.getReservedColumnsForPlayer(Player.PLAYER2));

console.log('\n✅ Release phase test completed!');