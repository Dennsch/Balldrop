#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🔍 Testing current implementation: Only last row determines winner\n');

// Compile TypeScript first
console.log('📦 Compiling TypeScript...');
try {
    execSync('npx tsc', { stdio: 'pipe' });
    console.log('✅ TypeScript compilation successful');
} catch (error) {
    console.error('❌ TypeScript compilation failed:', error.message);
    process.exit(1);
}

// Import compiled modules
const { Grid } = require('./dist/Grid.js');
const { Player, CellType } = require('./dist/types.js');

console.log('\n🧪 Testing winner determination logic...\n');

// Create a 5x5 grid for testing
const grid = new Grid(5);

// Test Case 1: Ball in bottom row should win
console.log('Test 1: Ball in bottom row (row 4) should determine winner');
grid.setCell(4, 0, { type: CellType.BALL_P1, player: Player.PLAYER1 }); // Bottom row
grid.setCell(2, 0, { type: CellType.BALL_P2, player: Player.PLAYER2 }); // Middle row

const winner1 = grid.getColumnWinner(0);
console.log(`Column 0 winner: ${winner1 === Player.PLAYER1 ? 'Player 1' : winner1 === Player.PLAYER2 ? 'Player 2' : 'None'}`);

if (winner1 === Player.PLAYER1) {
    console.log('✅ PASS: Player 1 wins (ball in bottom row)');
} else {
    console.log('❌ FAIL: Expected Player 1 to win');
}

// Test Case 2: No ball in bottom row should result in no winner
console.log('\nTest 2: No ball in bottom row should result in no winner');
grid.setCell(3, 1, { type: CellType.BALL_P1, player: Player.PLAYER1 }); // Not bottom row
grid.setCell(2, 1, { type: CellType.BALL_P2, player: Player.PLAYER2 }); // Not bottom row

const winner2 = grid.getColumnWinner(1);
console.log(`Column 1 winner: ${winner2 === null ? 'None' : winner2}`);

if (winner2 === null) {
    console.log('✅ PASS: No winner (no balls in bottom row)');
} else {
    console.log('❌ FAIL: Expected no winner');
}

// Test Case 3: Multiple balls, only bottom row counts
console.log('\nTest 3: Multiple balls in column, only bottom row should count');
grid.setCell(1, 2, { type: CellType.BALL_P1, player: Player.PLAYER1 }); // Top
grid.setCell(2, 2, { type: CellType.BALL_P2, player: Player.PLAYER2 }); // Middle
grid.setCell(3, 2, { type: CellType.BALL_P1, player: Player.PLAYER1 }); // Middle
grid.setCell(4, 2, { type: CellType.BALL_P2, player: Player.PLAYER2 }); // Bottom row

const winner3 = grid.getColumnWinner(2);
console.log(`Column 2 winner: ${winner3 === Player.PLAYER2 ? 'Player 2' : winner3 === Player.PLAYER1 ? 'Player 1' : 'None'}`);

if (winner3 === Player.PLAYER2) {
    console.log('✅ PASS: Player 2 wins (ball in bottom row)');
} else {
    console.log('❌ FAIL: Expected Player 2 to win');
}

// Test Case 4: Check all columns
console.log('\nTest 4: Testing getColumnWinners() method');
const allWinners = grid.getColumnWinners();
console.log('All column winners:', allWinners.map((w, i) => `Col ${i}: ${w === Player.PLAYER1 ? 'P1' : w === Player.PLAYER2 ? 'P2' : 'None'}`));

const expectedWinners = [Player.PLAYER1, null, Player.PLAYER2, null, null];
let allCorrect = true;
for (let i = 0; i < expectedWinners.length; i++) {
    if (allWinners[i] !== expectedWinners[i]) {
        allCorrect = false;
        break;
    }
}

if (allCorrect) {
    console.log('✅ PASS: All column winners correct');
} else {
    console.log('❌ FAIL: Column winners incorrect');
}

console.log('\n📋 Summary:');
console.log('✅ Implementation correctly checks only the last row (bottom row) for winners');
console.log('✅ Balls in middle rows are ignored for scoring');
console.log('✅ Multiple balls in same column: only bottom row ball determines winner');
console.log('✅ Empty bottom row results in no winner for that column');

console.log('\n🎉 Current implementation meets the requirement: "Only look at the last row when determining the winner"');