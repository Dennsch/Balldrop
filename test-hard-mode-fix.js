#!/usr/bin/env node

// Quick test to verify the hard mode fix
import { Game } from './src/Game.js';
import { GameMode, GameState, Player } from './src/types.js';

console.log('🎮 Testing Hard Mode Column Reservation Fix');
console.log('='.repeat(50));

function testHardModeTransition() {
    console.log('\n📋 Test: Hard Mode Column Reservation → Ball Release Transition');
    
    const game = new Game({
        gridSize: 5,
        ballsPerPlayer: 2, // Use 2 balls per player for easier testing
        minBoxes: 1,
        maxBoxes: 3,
        gameMode: GameMode.HARD_MODE
    });
    
    game.startNewGame();
    
    console.log(`✓ Initial state: ${game.getState()}`);
    console.log(`✓ Current player: ${game.getCurrentPlayer()}`);
    
    if (game.getState() !== GameState.COLUMN_RESERVATION_PHASE) {
        console.error('❌ Game should start in COLUMN_RESERVATION_PHASE');
        return false;
    }
    
    // Reserve columns alternately
    console.log('\n🔄 Reserving columns...');
    
    console.log('🔴 Player 1 reserves column 0');
    const success1 = game.reserveColumn(0);
    console.log(`   Success: ${success1}, Current player: ${game.getCurrentPlayer()}`);
    
    console.log('🔵 Player 2 reserves column 1');
    const success2 = game.reserveColumn(1);
    console.log(`   Success: ${success2}, Current player: ${game.getCurrentPlayer()}`);
    
    console.log('🔴 Player 1 reserves column 2');
    const success3 = game.reserveColumn(2);
    console.log(`   Success: ${success3}, Current player: ${game.getCurrentPlayer()}`);
    
    console.log('🔵 Player 2 reserves column 3 (should trigger transition)');
    const success4 = game.reserveColumn(3);
    console.log(`   Success: ${success4}, Current player: ${game.getCurrentPlayer()}`);
    
    // Check final state
    console.log(`\n📊 Final game state: ${game.getState()}`);
    
    if (game.getState() !== GameState.BALL_RELEASE_PHASE) {
        console.error('❌ Game should be in BALL_RELEASE_PHASE after all columns reserved');
        return false;
    }
    
    // Check dormant balls
    const ballReleaseSelection = game.getBallReleaseSelection();
    console.log(`📊 Dormant balls count: ${ballReleaseSelection.dormantBalls.size}`);
    
    if (ballReleaseSelection.dormantBalls.size !== 4) {
        console.error(`❌ Expected 4 dormant balls, got ${ballReleaseSelection.dormantBalls.size}`);
        return false;
    }
    
    // Check balls remaining
    const p1Balls = game.getBallsRemaining(Player.PLAYER1);
    const p2Balls = game.getBallsRemaining(Player.PLAYER2);
    console.log(`📊 Player 1 balls remaining: ${p1Balls}`);
    console.log(`📊 Player 2 balls remaining: ${p2Balls}`);
    
    if (p1Balls !== 0 || p2Balls !== 0) {
        console.error(`❌ Expected 0 balls remaining for both players, got P1: ${p1Balls}, P2: ${p2Balls}`);
        return false;
    }
    
    // Check player-specific dormant balls
    const player1Balls = game.getDormantBallsForPlayer(Player.PLAYER1);
    const player2Balls = game.getDormantBallsForPlayer(Player.PLAYER2);
    console.log(`📊 Player 1 dormant balls: ${player1Balls.length}`);
    console.log(`📊 Player 2 dormant balls: ${player2Balls.length}`);
    
    if (player1Balls.length !== 2 || player2Balls.length !== 2) {
        console.error(`❌ Expected 2 dormant balls per player, got P1: ${player1Balls.length}, P2: ${player2Balls.length}`);
        return false;
    }
    
    console.log('\n✅ Column reservation phase transition test PASSED!');
    return true;
}

function testBallRelease() {
    console.log('\n📋 Test: Ball Release Functionality');
    
    const game = new Game({
        gridSize: 5,
        ballsPerPlayer: 2,
        minBoxes: 1,
        maxBoxes: 3,
        gameMode: GameMode.HARD_MODE
    });
    
    game.startNewGame();
    
    // Reserve all columns to get to release phase
    game.reserveColumn(0); // P1
    game.reserveColumn(1); // P2
    game.reserveColumn(2); // P1
    game.reserveColumn(3); // P2
    
    console.log(`✓ Game state: ${game.getState()}`);
    console.log(`✓ Current player: ${game.getCurrentPlayer()}`);
    
    // Test ball release
    console.log('\n🔄 Testing ball release...');
    
    console.log('🔴 Player 1 releases ball from column 0');
    const canRelease1 = game.canReleaseBall(0);
    const release1 = game.releaseBall(0);
    console.log(`   Can release: ${canRelease1}, Success: ${release1}, Current player: ${game.getCurrentPlayer()}`);
    
    if (!canRelease1 || !release1) {
        console.error('❌ Player 1 should be able to release ball from their reserved column 0');
        return false;
    }
    
    console.log('🔵 Player 2 releases ball from column 1');
    const canRelease2 = game.canReleaseBall(1);
    const release2 = game.releaseBall(1);
    console.log(`   Can release: ${canRelease2}, Success: ${release2}, Current player: ${game.getCurrentPlayer()}`);
    
    if (!canRelease2 || !release2) {
        console.error('❌ Player 2 should be able to release ball from their reserved column 1');
        return false;
    }
    
    // Test that players can't release opponent's balls
    console.log('🔴 Player 1 tries to release from column 3 (Player 2\'s column)');
    const canReleaseOpponent = game.canReleaseBall(3);
    const releaseOpponent = game.releaseBall(3);
    console.log(`   Can release: ${canReleaseOpponent}, Success: ${releaseOpponent}`);
    
    if (canReleaseOpponent || releaseOpponent) {
        console.error('❌ Player 1 should NOT be able to release ball from Player 2\'s reserved column');
        return false;
    }
    
    console.log('\n✅ Ball release functionality test PASSED!');
    return true;
}

async function runTests() {
    try {
        const test1 = testHardModeTransition();
        const test2 = testBallRelease();
        
        if (test1 && test2) {
            console.log('\n🎉 ALL TESTS PASSED!');
            console.log('\nKey fixes verified:');
            console.log('  ✓ Hard mode transitions from column reservation to ball release phase');
            console.log('  ✓ Dormant balls are properly placed during transition');
            console.log('  ✓ Ball counts are correctly updated');
            console.log('  ✓ Players can release their own reserved balls');
            console.log('  ✓ Players cannot release opponent\'s reserved balls');
            console.log('\n🚀 The hard mode second round issue has been FIXED!');
        } else {
            console.error('\n❌ Some tests failed. Please check the implementation.');
            process.exit(1);
        }
        
    } catch (error) {
        console.error('\n💥 Test failed with error:', error);
        process.exit(1);
    }
}

runTests();