// Test to verify ball drop completion is working
const { Game } = require('./dist/Game.js');
const { GameState, Player, GameMode } = require('./dist/types.js');

console.log('🧪 Testing Ball Drop Completion\n');

// Test 1: Create game and set up handlers
console.log('1. Setting up game with handlers...');
const game = new Game({
    gridSize: 20,
    ballsPerPlayer: 10,
    gameMode: GameMode.NORMAL
});

let ballDroppedCalled = false;
let stateChangeCalled = false;
let ballPath = null;

game.onBallDroppedHandler((path) => {
    ballDroppedCalled = true;
    ballPath = path;
    console.log(`   ✅ onBallDropped called for column ${path.startColumn}`);
    console.log(`   ✅ Ball path has ${path.steps.length} steps`);
    console.log(`   ✅ Final position: row ${path.finalPosition.row}, col ${path.finalPosition.col}`);
});

game.onStateChangeHandler((updatedGame) => {
    stateChangeCalled = true;
    console.log(`   ✅ onStateChange called - new state: ${updatedGame.getState()}`);
    console.log(`   ✅ Current player: ${updatedGame.getCurrentPlayer()}`);
});

game.startNewGame();
console.log(`   Game initialized - State: ${game.getState()}`);

// Test 2: Drop a ball
console.log('\n2. Dropping ball in column 0...');
const dropResult = game.dropBall(0);
console.log(`   Drop result: ${dropResult ? '✅ SUCCESS' : '❌ FAILED'}`);
console.log(`   Ball dropped handler called: ${ballDroppedCalled ? '✅ YES' : '❌ NO'}`);

if (ballPath) {
    console.log(`   Ball path start column: ${ballPath.startColumn}`);
    console.log(`   Ball path player: ${ballPath.player}`);
}

// Test 3: Check grid state before completion
console.log('\n3. Checking grid state before completion...');
const gridBefore = game.getGrid().getCells();
let ballFoundBefore = false;
for (let row = 0; row < 20; row++) {
    for (let col = 0; col < 20; col++) {
        if (gridBefore[row][col].type === 'BALL_P1' || gridBefore[row][col].type === 'BALL_P2') {
            ballFoundBefore = true;
            console.log(`   Ball found at row ${row}, col ${col}: ${gridBefore[row][col].type}`);
        }
    }
}
console.log(`   Ball found in grid before completion: ${ballFoundBefore ? '✅ YES' : '❌ NO'}`);

// Test 4: Complete the ball drop
if (ballPath) {
    console.log('\n4. Completing ball drop...');
    game.completeBallDrop(ballPath);
    
    // Check grid state after completion
    console.log('\n5. Checking grid state after completion...');
    const gridAfter = game.getGrid().getCells();
    let ballFoundAfter = false;
    for (let row = 0; row < 20; row++) {
        for (let col = 0; col < 20; col++) {
            if (gridAfter[row][col].type === 'BALL_P1' || gridAfter[row][col].type === 'BALL_P2') {
                ballFoundAfter = true;
                console.log(`   ✅ Ball found at row ${row}, col ${col}: ${gridAfter[row][col].type}`);
            }
        }
    }
    console.log(`   Ball found in grid after completion: ${ballFoundAfter ? '✅ YES' : '❌ NO'}`);
    
    // Check if column is now used
    console.log(`   Column 0 now used: ${!game.canDropInColumn(0) ? '✅ YES' : '❌ NO'}`);
    
    // Check current score
    const score = game.getCurrentScore();
    console.log(`   Current score - P1: ${score.player1Columns}, P2: ${score.player2Columns}`);
}

console.log('\n🎉 Ball drop completion test finished!');
console.log('\nExpected React behavior:');
console.log('1. Click column button → onBallDropped called');
console.log('2. After timeout → completeBallDrop called');
console.log('3. Grid re-renders → ball appears visually');
console.log('4. Column button shows ✓ and becomes disabled');