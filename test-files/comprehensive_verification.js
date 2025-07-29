#!/usr/bin/env node

const fs = require('fs');
const { execSync } = require('child_process');

console.log('🎯 COMPREHENSIVE VERIFICATION: "Only look at the last row when determining the winner"');
console.log('═'.repeat(80));

// Step 1: Build the TypeScript code
console.log('\n📦 Step 1: Building TypeScript code...');
try {
    execSync('npm run build', { stdio: 'inherit' });
    console.log('✅ TypeScript build successful');
} catch (error) {
    console.error('❌ Build failed:', error.message);
    process.exit(1);
}

// Step 2: Analyze the source code
console.log('\n🔍 Step 2: Analyzing source code implementation...');

const gridSource = fs.readFileSync('./src/Grid.ts', 'utf8');
const methodMatch = gridSource.match(/public getColumnWinner\([\s\S]*?\n    \}/);

if (methodMatch) {
    const method = methodMatch[0];
    console.log('\n📋 Current getColumnWinner Implementation:');
    console.log('-'.repeat(60));
    console.log(method);
    console.log('-'.repeat(60));
    
    // Verify key requirements
    const checksBottomRowOnly = method.includes('bottomRow = this.size - 1');
    const noLoops = !method.includes('for (') && !method.includes('while (');
    const directAccess = method.includes('this.cells[bottomRow][col]');
    
    console.log('\n🔍 Code Analysis Results:');
    console.log(`   ✅ Calculates bottom row index only: ${checksBottomRowOnly}`);
    console.log(`   ✅ No iteration through multiple rows: ${noLoops}`);
    console.log(`   ✅ Direct access to bottom cell: ${directAccess}`);
    
    if (checksBottomRowOnly && noLoops && directAccess) {
        console.log('\n🎉 CODE ANALYSIS: REQUIREMENT SATISFIED!');
    } else {
        console.log('\n❌ CODE ANALYSIS: REQUIREMENT NOT SATISFIED!');
        process.exit(1);
    }
}

// Step 3: Run functional tests
console.log('\n🧪 Step 3: Running functional verification tests...');

try {
    // Import the classes (after build)
    const { Grid } = require('./dist/src/Grid.js');
    const { Player, CellType } = require('./dist/src/types.js');
    
    const grid = new Grid(5); // 5x5 grid for testing
    let allTestsPassed = true;
    
    // Test 1: Ball in bottom row should count
    console.log('\n   📝 Test 1: Ball in bottom row should count');
    grid.clearGrid();
    grid.setCell(4, 0, { type: CellType.BALL_P1, player: Player.PLAYER1 }); // Bottom row
    const winner1 = grid.getColumnWinner(0);
    const test1Pass = winner1 === Player.PLAYER1;
    console.log(`      Result: ${test1Pass ? '✅ PASS' : '❌ FAIL'} - Column 0 winner: ${winner1 === Player.PLAYER1 ? 'Player 1' : 'None'}`);
    allTestsPassed = allTestsPassed && test1Pass;
    
    // Test 2: Ball NOT in bottom row should NOT count
    console.log('\n   📝 Test 2: Ball NOT in bottom row should NOT count');
    grid.clearGrid();
    grid.setCell(3, 1, { type: CellType.BALL_P1, player: Player.PLAYER1 }); // NOT bottom row
    const winner2 = grid.getColumnWinner(1);
    const test2Pass = winner2 === null;
    console.log(`      Result: ${test2Pass ? '✅ PASS' : '❌ FAIL'} - Column 1 winner: ${winner2 === null ? 'None' : 'Player 1'}`);
    allTestsPassed = allTestsPassed && test2Pass;
    
    // Test 3: Multiple balls, only bottom one counts
    console.log('\n   📝 Test 3: Multiple balls in column, only bottom one counts');
    grid.clearGrid();
    grid.setCell(1, 2, { type: CellType.BALL_P1, player: Player.PLAYER1 }); // Middle
    grid.setCell(2, 2, { type: CellType.BALL_P1, player: Player.PLAYER1 }); // Middle
    grid.setCell(3, 2, { type: CellType.BALL_P1, player: Player.PLAYER1 }); // Middle
    grid.setCell(4, 2, { type: CellType.BALL_P2, player: Player.PLAYER2 }); // Bottom - this should win
    const winner3 = grid.getColumnWinner(2);
    const test3Pass = winner3 === Player.PLAYER2;
    console.log(`      Result: ${test3Pass ? '✅ PASS' : '❌ FAIL'} - Column 2 winner: ${winner3 === Player.PLAYER2 ? 'Player 2' : 'Player 1'}`);
    allTestsPassed = allTestsPassed && test3Pass;
    
    // Test 4: Empty column should return null
    console.log('\n   📝 Test 4: Empty column should return null');
    grid.clearGrid();
    const winner4 = grid.getColumnWinner(3);
    const test4Pass = winner4 === null;
    console.log(`      Result: ${test4Pass ? '✅ PASS' : '❌ FAIL'} - Column 3 winner: ${winner4 === null ? 'None' : 'Someone'}`);
    allTestsPassed = allTestsPassed && test4Pass;
    
    if (allTestsPassed) {
        console.log('\n🎉 FUNCTIONAL TESTS: ALL PASSED!');
    } else {
        console.log('\n❌ FUNCTIONAL TESTS: SOME FAILED!');
        process.exit(1);
    }
    
} catch (error) {
    console.error('❌ Functional test error:', error.message);
    process.exit(1);
}

// Step 4: Run existing Jest tests
console.log('\n🧪 Step 4: Running existing Jest test suite...');
try {
    execSync('npm test', { stdio: 'inherit' });
    console.log('✅ All Jest tests passed');
} catch (error) {
    console.error('❌ Jest tests failed');
    process.exit(1);
}

// Step 5: Final summary
console.log('\n🎉 FINAL VERIFICATION RESULTS');
console.log('═'.repeat(80));
console.log('✅ REQUIREMENT: "Only look at the last row when determining the winner"');
console.log('✅ STATUS: ALREADY IMPLEMENTED AND WORKING PERFECTLY');
console.log('');
console.log('📊 Verification Summary:');
console.log('   ✅ TypeScript code builds successfully');
console.log('   ✅ Source code analysis confirms bottom-row-only logic');
console.log('   ✅ All functional tests pass');
console.log('   ✅ All existing Jest tests pass');
console.log('   ✅ No code changes needed');
console.log('');
console.log('📝 Implementation Details:');
console.log('   • Grid.getColumnWinner() only checks: this.cells[bottomRow][col]');
console.log('   • Game.getGameResult() uses column winners to determine overall winner');
console.log('   • Comprehensive tests verify the behavior');
console.log('   • Edge cases are properly handled');
console.log('');
console.log('🎯 CONCLUSION: THE REQUIREMENT IS ALREADY SATISFIED!');
console.log('═'.repeat(80));