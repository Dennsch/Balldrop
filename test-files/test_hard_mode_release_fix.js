#!/usr/bin/env node

/**
 * Test script to verify the hard mode release phase fix
 * Tests that the release phase behaves like normal mode but with column restrictions
 */

const { execSync } = require('child_process');
const path = require('path');

console.log('🧪 Testing Hard Mode Release Phase Fix...\n');

try {
    // First, let's run the existing tests to see what breaks
    console.log('1. Running existing tests...');
    try {
        const testOutput = execSync('npm test', { 
            encoding: 'utf8', 
            cwd: path.resolve(__dirname, '..'),
            stdio: 'pipe'
        });
        console.log('✅ All existing tests pass');
    } catch (error) {
        console.log('❌ Some tests are failing:');
        console.log(error.stdout);
        console.log(error.stderr);
        
        // Let's specifically run the hard mode tests
        console.log('\n2. Running hard mode specific tests...');
        try {
            const hardModeTestOutput = execSync('npm test -- --testNamePattern="hard mode"', { 
                encoding: 'utf8', 
                cwd: path.resolve(__dirname, '..'),
                stdio: 'pipe'
            });
            console.log('✅ Hard mode tests pass');
            console.log(hardModeTestOutput);
        } catch (hardModeError) {
            console.log('❌ Hard mode tests are failing:');
            console.log(hardModeError.stdout);
            console.log(hardModeError.stderr);
        }
    }

    console.log('\n3. Testing the new release phase behavior manually...');
    
    // Import the Game class for manual testing
    const { Game } = require('../dist/Game.js');
    const { GameMode, GameState, Player } = require('../dist/types.js');
    
    // Create a hard mode game
    const game = new Game({
        gridSize: 5,
        ballsPerPlayer: 2,
        minBoxes: 1,
        maxBoxes: 3,
        gameMode: GameMode.HARD_MODE
    });
    
    console.log('   Creating hard mode game...');
    game.startNewGame();
    
    // Test column reservation phase
    console.log('   Testing column reservation phase...');
    console.log(`   Initial state: ${game.getState()}`);
    console.log(`   Current player: ${game.getCurrentPlayer()}`);
    
    // Reserve columns
    game.dropBall(0); // P1
    game.dropBall(1); // P2
    game.dropBall(2); // P1
    game.dropBall(3); // P2
    
    console.log(`   After reservations, state: ${game.getState()}`);
    
    // Test ball placement phase
    console.log('   Testing ball placement phase...');
    game.dropBall(0); // P1
    game.dropBall(1); // P2
    game.dropBall(2); // P1
    game.dropBall(3); // P2
    
    console.log(`   After placements, state: ${game.getState()}`);
    console.log(`   Current player: ${game.getCurrentPlayer()}`);
    
    // Test the new release phase behavior
    console.log('   Testing new release phase behavior...');
    
    // Test that both players can release balls from their reserved columns
    console.log('   Testing Player 1 can release from column 0...');
    const canP1Release0 = game.canDropInColumn(0);
    console.log(`   Player 1 can release from column 0: ${canP1Release0}`);
    
    console.log('   Testing Player 1 cannot release from column 1 (Player 2\'s)...');
    const canP1Release1 = game.canDropInColumn(1);
    console.log(`   Player 1 can release from column 1: ${canP1Release1}`);
    
    console.log('   Testing Player 2 can release from column 1...');
    const canP2Release1 = game.canDropInColumn(1);
    console.log(`   Player 2 can release from column 1: ${canP2Release1}`);
    
    // Test actual release
    console.log('   Testing actual ball release...');
    const initialPlayer = game.getCurrentPlayer();
    console.log(`   Initial current player: ${initialPlayer}`);
    
    // Release a ball from Player 1's column
    const releaseResult = game.releaseBall(0);
    console.log(`   Release from column 0 result: ${releaseResult}`);
    
    const afterReleasePlayer = game.getCurrentPlayer();
    console.log(`   Current player after release: ${afterReleasePlayer}`);
    
    // In the new system, the current player should not change after release
    if (initialPlayer === afterReleasePlayer) {
        console.log('   ✅ Current player did not change - non-turn-based behavior confirmed');
    } else {
        console.log('   ❌ Current player changed - still using turn-based behavior');
    }
    
    // Test that the column is now used
    const canReleaseAgain = game.canDropInColumn(0);
    console.log(`   Can release from column 0 again: ${canReleaseAgain}`);
    
    if (!canReleaseAgain) {
        console.log('   ✅ Column 0 is now unavailable - "each ball can only be released once" confirmed');
    } else {
        console.log('   ❌ Column 0 is still available - ball release tracking issue');
    }
    
    console.log('\n✅ Manual testing completed');
    
} catch (error) {
    console.error('❌ Error during testing:', error.message);
    console.error(error.stack);
    process.exit(1);
}

console.log('\n🎉 Hard Mode Release Phase Fix Testing Complete!');