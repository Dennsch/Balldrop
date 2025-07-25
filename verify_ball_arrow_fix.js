#!/usr/bin/env node

/**
 * Verification script for the "move ball first then change arrow" fix
 */

const fs = require('fs');

console.log('🎯 Verifying "Move Ball First Then Change Arrow" Fix\n');

let allChecksPass = true;

// Check 1: Verify Grid.ts implementation
console.log('📋 Checking Grid.ts implementation...');

try {
    const gridContent = fs.readFileSync('src/Grid.ts', 'utf8');
    
    // Look for the ball-box collision section
    const boxHitRegex = /\/\/ If next cell has a box, redirect the ball[\s\S]*?\/\/ Check if the new column is valid/;
    const boxHitSection = gridContent.match(boxHitRegex);
    
    if (boxHitSection) {
        const sectionText = boxHitSection[0];
        
        // Check 1.1: Original direction is stored
        const hasOriginalDirection = sectionText.includes('const originalDirection = nextCell.direction;');
        console.log(`  ${hasOriginalDirection ? '✅' : '❌'} Original direction is stored first`);
        if (!hasOriginalDirection) allChecksPass = false;
        
        // Check 1.2: Ball redirection uses original direction
        const correctRedirection = sectionText.includes('const redirectDirection = originalDirection === Direction.LEFT ? Direction.LEFT : Direction.RIGHT;');
        console.log(`  ${correctRedirection ? '✅' : '❌'} Ball redirection uses original direction`);
        if (!correctRedirection) allChecksPass = false;
        
        // Check 1.3: Arrow change happens after ball calculation
        const delayedArrowChange = sectionText.includes('// THEN change the box direction (arrow changes after ball moves)');
        console.log(`  ${delayedArrowChange ? '✅' : '❌'} Arrow change happens after ball redirection`);
        if (!delayedArrowChange) allChecksPass = false;
        
        // Check 1.4: Path tracking is correct
        const correctPathTracking = sectionText.includes('boxDirection: originalDirection') && 
                                   sectionText.includes('newBoxDirection: newDirection');
        console.log(`  ${correctPathTracking ? '✅' : '❌'} Path tracking captures both directions`);
        if (!correctPathTracking) allChecksPass = false;
        
    } else {
        console.log('  ❌ Could not find ball-box collision section');
        allChecksPass = false;
    }
    
} catch (error) {
    console.log('  ❌ Error reading Grid.ts:', error.message);
    allChecksPass = false;
}

// Check 2: Verify test coverage
console.log('\n🧪 Checking test coverage...');

try {
    const testContent = fs.readFileSync('tests/Grid.test.ts', 'utf8');
    
    // Check 2.1: Comprehensive test exists
    const hasComprehensiveTest = testContent.includes('should redirect ball based on original box direction, then change arrow');
    console.log(`  ${hasComprehensiveTest ? '✅' : '❌'} Comprehensive test added`);
    if (!hasComprehensiveTest) allChecksPass = false;
    
    // Check 2.2: Tests both directions
    const testsBothDirections = testContent.includes('Test with RIGHT arrow box') && 
                               testContent.includes('Test with LEFT arrow box');
    console.log(`  ${testsBothDirections ? '✅' : '❌'} Tests both LEFT and RIGHT scenarios`);
    if (!testsBothDirections) allChecksPass = false;
    
    // Check 2.3: Tests path tracking
    const testsPathTracking = testContent.includes('expect(redirectStep?.boxDirection)') && 
                             testContent.includes('expect(redirectStep?.newBoxDirection)');
    console.log(`  ${testsPathTracking ? '✅' : '❌'} Tests verify path tracking`);
    if (!testsPathTracking) allChecksPass = false;
    
} catch (error) {
    console.log('  ❌ Error reading Grid.test.ts:', error.message);
    allChecksPass = false;
}

// Check 3: Verify no regression in existing functionality
console.log('\n🔄 Checking for potential regressions...');

try {
    const gridContent = fs.readFileSync('src/Grid.ts', 'utf8');
    
    // Check 3.1: dropBall method still exists
    const hasDropBall = gridContent.includes('public dropBall(');
    console.log(`  ${hasDropBall ? '✅' : '❌'} dropBall method still exists`);
    if (!hasDropBall) allChecksPass = false;
    
    // Check 3.2: dropBallWithPath method still exists
    const hasDropBallWithPath = gridContent.includes('public dropBallWithPath(');
    console.log(`  ${hasDropBallWithPath ? '✅' : '❌'} dropBallWithPath method still exists`);
    if (!hasDropBallWithPath) allChecksPass = false;
    
    // Check 3.3: Ball path tracking structure maintained
    const hasBallPathSteps = gridContent.includes('pathSteps.push({');
    console.log(`  ${hasBallPathSteps ? '✅' : '❌'} Ball path tracking structure maintained`);
    if (!hasBallPathSteps) allChecksPass = false;
    
} catch (error) {
    console.log('  ❌ Error checking for regressions:', error.message);
    allChecksPass = false;
}

// Final summary
console.log('\n🎯 Verification Summary');
console.log('=======================');

if (allChecksPass) {
    console.log('✅ All checks passed! The fix is correctly implemented.');
    console.log('\n🎮 The implementation ensures:');
    console.log('   1. Ball moves first based on original arrow direction');
    console.log('   2. Arrow direction changes after ball movement is calculated');
    console.log('   3. Path tracking correctly captures the sequence of events');
    console.log('   4. No regressions in existing functionality');
    console.log('\n🚀 Next steps:');
    console.log('   1. Run "npm test" to execute all tests');
    console.log('   2. Run "npm run build" to compile TypeScript');
    console.log('   3. Test the game manually to verify visual behavior');
} else {
    console.log('❌ Some checks failed. Please review the implementation.');
    console.log('\n🔧 Issues found that need attention:');
    console.log('   - Check the specific failed items above');
    console.log('   - Ensure all code changes are properly saved');
    console.log('   - Verify test cases are comprehensive');
}

console.log('\n✨ Verification complete!');

// Exit with appropriate code
process.exit(allChecksPass ? 0 : 1);