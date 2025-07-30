#!/usr/bin/env node

import { Game } from '../src/Game.js';
import { GameMode, GameState, Player } from '../src/types.js';

console.log('🔧 Verifying Hard Mode Phase Transition Fix');
console.log('='.repeat(50));

function testHardModePhaseTransitions() {
    console.log('\n📋 Testing Hard Mode Phase Transitions');
    
    const game = new Game({
        gridSize: 20,
        ballsPerPlayer: 2, // Use 2 balls per player for quick test
        gameMode: GameMode.HARD_MODE
    });
    
    console.log('1. Starting new game...');
    game.startNewGame();
    
    console.log(`   ✓ Initial state: ${game.getState()}`);
    console.log(`   ✓ Expected: ${GameState.COLUMN_RESERVATION_PHASE}`);
    console.log(`   ✓ Match: ${game.getState() === GameState.COLUMN_RESERVATION_PHASE ? '✅' : '❌'}`);
    
    console.log('\n2. Column Reservation Phase...');
    console.log('   Reserving columns for both players...');
    
    // Reserve columns alternating between players
    const reservations = [
        { player: 1, col: 0 },
        { player: 2, col: 1 },
        { player: 1, col: 2 },
        { player: 2, col: 3 }
    ];
    
    for (const reservation of reservations) {
        const currentPlayer = game.getCurrentPlayer();
        console.log(`   Player ${currentPlayer} reserving column ${reservation.col}...`);
        
        const success = game.dropBall(reservation.col);
        console.log(`   Result: ${success ? '✅' : '❌'}`);
        
        if (!success) {
            console.log('   ❌ Failed to reserve column!');
            return false;
        }
    }
    
    console.log(`   ✓ State after reservations: ${game.getState()}`);
    console.log(`   ✓ Expected: ${GameState.BALL_PLACEMENT_PHASE}`);
    console.log(`   ✓ Match: ${game.getState() === GameState.BALL_PLACEMENT_PHASE ? '✅' : '❌'}`);
    
    if (game.getState() !== GameState.BALL_PLACEMENT_PHASE) {
        console.log('   ❌ Failed to transition to BALL_PLACEMENT_PHASE!');
        return false;
    }
    
    console.log('\n3. Ball Placement Phase...');
    console.log('   Placing balls in reserved columns...');
    
    // Place balls in reserved columns
    const placements = [
        { player: 1, col: 0 },
        { player: 2, col: 1 },
        { player: 1, col: 2 },
        { player: 2, col: 3 }
    ];
    
    for (const placement of placements) {
        const currentPlayer = game.getCurrentPlayer();
        console.log(`   Player ${currentPlayer} placing ball in column ${placement.col}...`);
        
        const success = game.dropBall(placement.col);
        console.log(`   Result: ${success ? '✅' : '❌'}`);
        
        if (!success) {
            console.log('   ❌ Failed to place ball!');
            return false;
        }
    }
    
    console.log(`   ✓ State after placements: ${game.getState()}`);
    console.log(`   ✓ Expected: ${GameState.BALL_RELEASE_PHASE}`);
    console.log(`   ✓ Match: ${game.getState() === GameState.BALL_RELEASE_PHASE ? '✅' : '❌'}`);
    
    if (game.getState() !== GameState.BALL_RELEASE_PHASE) {
        console.log('   ❌ Failed to transition to BALL_RELEASE_PHASE!');
        return false;
    }
    
    console.log('\n4. Ball Release Phase...');
    console.log('   Verifying players can release their own balls...');
    
    // Check that players can release their own balls
    const currentPlayer = game.getCurrentPlayer();
    console.log(`   Current player: ${currentPlayer}`);
    
    // Player 1 should be able to release balls in columns 0 and 2
    // Player 2 should be able to release balls in columns 1 and 3
    const expectedColumns = currentPlayer === Player.PLAYER1 ? [0, 2] : [1, 3];
    const forbiddenColumns = currentPlayer === Player.PLAYER1 ? [1, 3] : [0, 2];
    
    console.log(`   Testing allowed columns: [${expectedColumns.join(', ')}]`);
    for (const col of expectedColumns) {
        const canRelease = game.canDropInColumn(col);
        console.log(`   Can release column ${col}: ${canRelease ? '✅' : '❌'}`);
        if (!canRelease) {
            console.log(`   ❌ Should be able to release column ${col}!`);
            return false;
        }
    }
    
    console.log(`   Testing forbidden columns: [${forbiddenColumns.join(', ')}]`);
    for (const col of forbiddenColumns) {
        const canRelease = game.canDropInColumn(col);
        console.log(`   Can release column ${col}: ${canRelease ? '❌ (should be false)' : '✅'}`);
        if (canRelease) {
            console.log(`   ❌ Should NOT be able to release column ${col}!`);
            return false;
        }
    }
    
    console.log('\n✅ All phase transitions working correctly!');
    return true;
}

function testErrorCases() {
    console.log('\n📋 Testing Error Cases');
    
    const game = new Game({
        gridSize: 20,
        ballsPerPlayer: 2,
        gameMode: GameMode.HARD_MODE
    });
    
    game.startNewGame();
    
    console.log('1. Testing column reservation conflicts...');
    
    // Player 1 reserves column 0
    game.dropBall(0);
    
    // Player 2 tries to reserve same column (should fail)
    const shouldFail = game.dropBall(0);
    console.log(`   Player 2 tries to reserve column 0: ${shouldFail ? '❌ (should fail)' : '✅'}`);
    
    if (shouldFail) {
        console.log('   ❌ Should not allow same column reservation!');
        return false;
    }
    
    console.log('2. Testing placement in wrong columns...');
    
    // Complete reservations to get to placement phase
    game.dropBall(1); // P2
    game.dropBall(2); // P1
    game.dropBall(3); // P2
    
    // Now in placement phase - Player 1 tries to place in Player 2's column
    const shouldFailPlacement = game.dropBall(1); // P1 tries to place in P2's column
    console.log(`   Player 1 tries to place in Player 2's column: ${shouldFailPlacement ? '❌ (should fail)' : '✅'}`);
    
    if (shouldFailPlacement) {
        console.log('   ❌ Should not allow placement in opponent\'s column!');
        return false;
    }
    
    console.log('\n✅ All error cases handled correctly!');
    return true;
}

// Run tests
async function runTests() {
    try {
        console.log('🚀 Starting Hard Mode Fix Verification...\n');
        
        const test1 = testHardModePhaseTransitions();
        const test2 = testErrorCases();
        
        if (test1 && test2) {
            console.log('\n🎉 SUCCESS: Hard Mode Fix Verification Complete!');
            console.log('\n✅ Key Features Verified:');
            console.log('  • Hard mode starts in COLUMN_RESERVATION_PHASE');
            console.log('  • Transitions to BALL_PLACEMENT_PHASE after all columns reserved');
            console.log('  • Transitions to BALL_RELEASE_PHASE after all balls placed');
            console.log('  • Players can only place balls in their reserved columns');
            console.log('  • Players can only release their own balls');
            console.log('  • Error cases are handled correctly');
            
            console.log('\n🔧 The issue "Hard mode doesn\'t switch to release phase" has been FIXED!');
        } else {
            console.log('\n❌ FAILURE: Some tests failed!');
            process.exit(1);
        }
        
    } catch (error) {
        console.error('\n💥 ERROR during testing:', error);
        process.exit(1);
    }
}

runTests();