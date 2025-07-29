#!/usr/bin/env node

/**
 * Test script to verify animation speed improvements
 * This script checks that animation timings have been reduced appropriately
 */

const fs = require('fs');
const path = require('path');

console.log('🎯 Testing Animation Speed Improvements...\n');

// Test CSS animation timings
function testCSSAnimations() {
    console.log('📋 Checking CSS Animation Timings:');
    
    const cssPath = path.join(__dirname, 'styles.css');
    const cssContent = fs.readFileSync(cssPath, 'utf8');
    
    const tests = [
        {
            name: 'Cell transition',
            pattern: /transition:\s*all\s+([\d.]+)s\s+ease/,
            expected: 0.15,
            description: 'Cell hover/state transitions'
        },
        {
            name: 'Animated ball transition',
            pattern: /\.animated-ball[\s\S]*?transition:\s*all\s+([\d.]+)s\s+ease-in-out/,
            expected: 0.35,
            description: 'Ball movement between positions'
        },
        {
            name: 'Fall animation',
            pattern: /animation:\s*fall\s+([\d.]+)s\s+ease-in/,
            expected: 0.25,
            description: 'Ball falling effect'
        },
        {
            name: 'Box hit animation',
            pattern: /animation:\s*boxHit\s+([\d.]+)s\s+ease-out/,
            expected: 0.3,
            description: 'Box collision effect'
        },
        {
            name: 'Arrow rotation',
            pattern: /animation:\s*arrowRotate\s+([\d.]+)s\s+ease-in-out/,
            expected: 0.2,
            description: 'Arrow direction change'
        },
        {
            name: 'Arrow transition',
            pattern: /\.arrow[\s\S]*?transition:\s*transform\s+([\d.]+)s\s+ease-in-out/,
            expected: 0.15,
            description: 'Arrow hover effects'
        }
    ];
    
    let passedTests = 0;
    
    tests.forEach(test => {
        const match = cssContent.match(test.pattern);
        if (match) {
            const actualValue = parseFloat(match[1]);
            if (Math.abs(actualValue - test.expected) < 0.01) {
                console.log(`   ✅ ${test.name}: ${actualValue}s (${test.description})`);
                passedTests++;
            } else {
                console.log(`   ❌ ${test.name}: Expected ${test.expected}s, got ${actualValue}s`);
            }
        } else {
            console.log(`   ❌ ${test.name}: Pattern not found in CSS`);
        }
    });
    
    console.log(`\n   CSS Tests: ${passedTests}/${tests.length} passed\n`);
    return passedTests === tests.length;
}

// Test JavaScript animation timings
function testJavaScriptAnimations() {
    console.log('📋 Checking JavaScript Animation Timings:');
    
    const jsPath = path.join(__dirname, 'src', 'GameUI.ts');
    const jsContent = fs.readFileSync(jsPath, 'utf8');
    
    const tests = [
        {
            name: 'Ball transition CSS',
            pattern: /ball\.style\.transition\s*=\s*['"]all\s+([\d.]+)s\s+ease-in-out['"]/,
            expected: 0.35,
            description: 'Animated ball CSS transition'
        },
        {
            name: 'Redirect effect timeout',
            pattern: /}, (\d+)\);\s*} else if \(action === ['"]fall['"]/,
            expected: 120,
            description: 'Ball redirect visual effect duration'
        },
        {
            name: 'Fall effect timeout',
            pattern: /}, (\d+)\);\s*} else if \(action === ['"]settle['"]/,
            expected: 40,
            description: 'Ball fall bounce effect duration'
        },
        {
            name: 'Settle effect timeout',
            pattern: /}, (\d+)\);\s*}\s*\/\/ Adjust timing based on action/,
            expected: 80,
            description: 'Ball settle effect duration'
        },
        {
            name: 'Box hit timeout',
            pattern: /}, (\d+)\);\s*} else {\s*resolve\(\);\s*}\s*}\);\s*}\s*private async animateBoxDirectionChange/,
            expected: 300,
            description: 'Box hit animation duration'
        },
        {
            name: 'Arrow change first timeout',
            pattern: /}, (\d+)\);\s*}\);\s*}\s*private updateBoxCell/,
            expected: 60,
            description: 'Arrow direction change first phase'
        },
        {
            name: 'Arrow change second timeout',
            pattern: /}, (\d+)\);\s*}, \d+\);/,
            expected: 120,
            description: 'Arrow direction change second phase'
        }
    ];
    
    let passedTests = 0;
    
    tests.forEach(test => {
        const match = jsContent.match(test.pattern);
        if (match) {
            const actualValue = parseFloat(match[1]);
            if (actualValue === test.expected) {
                console.log(`   ✅ ${test.name}: ${actualValue}${test.expected < 1 ? 's' : 'ms'} (${test.description})`);
                passedTests++;
            } else {
                console.log(`   ❌ ${test.name}: Expected ${test.expected}, got ${actualValue}`);
            }
        } else {
            console.log(`   ❌ ${test.name}: Pattern not found in JavaScript`);
        }
    });
    
    // Test animation duration calculations
    const durationPattern = /const duration = action === ['"]settle['"] \? (\d+) : \(action === ['"]redirect['"] \? (\d+) : (\d+)\)/;
    const durationMatch = jsContent.match(durationPattern);
    
    if (durationMatch) {
        const settleTime = parseInt(durationMatch[1]);
        const redirectTime = parseInt(durationMatch[2]);
        const fallTime = parseInt(durationMatch[3]);
        
        if (settleTime === 250 && redirectTime === 400 && fallTime === 350) {
            console.log(`   ✅ Animation durations: settle=${settleTime}ms, redirect=${redirectTime}ms, fall=${fallTime}ms`);
            passedTests++;
        } else {
            console.log(`   ❌ Animation durations: Expected settle=250, redirect=400, fall=350, got settle=${settleTime}, redirect=${redirectTime}, fall=${fallTime}`);
        }
    } else {
        console.log(`   ❌ Animation duration calculation: Pattern not found`);
    }
    
    console.log(`\n   JavaScript Tests: ${passedTests}/${tests.length + 1} passed\n`);
    return passedTests === tests.length + 1;
}

// Calculate speed improvement
function calculateSpeedImprovement() {
    console.log('📊 Speed Improvement Analysis:');
    
    const improvements = [
        { name: 'Ball movement', old: 800, new: 350, unit: 'ms' },
        { name: 'Box hit effect', old: 600, new: 300, unit: 'ms' },
        { name: 'Arrow rotation', old: 450, new: 200, unit: 'ms' },
        { name: 'Cell transitions', old: 300, new: 150, unit: 'ms' },
        { name: 'Ball CSS transition', old: 800, new: 350, unit: 'ms' }
    ];
    
    let totalOldTime = 0;
    let totalNewTime = 0;
    
    improvements.forEach(item => {
        const improvement = ((item.old - item.new) / item.old * 100).toFixed(1);
        console.log(`   📈 ${item.name}: ${item.old}${item.unit} → ${item.new}${item.unit} (${improvement}% faster)`);
        totalOldTime += item.old;
        totalNewTime += item.new;
    });
    
    const overallImprovement = ((totalOldTime - totalNewTime) / totalOldTime * 100).toFixed(1);
    console.log(`\n   🚀 Overall speed improvement: ${overallImprovement}% faster`);
    console.log(`   ⏱️  Total animation time reduced from ${totalOldTime}ms to ${totalNewTime}ms\n`);
}

// Run all tests
function runTests() {
    const cssTestsPassed = testCSSAnimations();
    const jsTestsPassed = testJavaScriptAnimations();
    
    calculateSpeedImprovement();
    
    if (cssTestsPassed && jsTestsPassed) {
        console.log('🎉 All animation speed tests passed!');
        console.log('✨ Animations are now significantly faster and more responsive');
        console.log('🎮 Players will experience reduced wait times between turns\n');
        
        console.log('📝 Next Steps:');
        console.log('   1. Build the project: npm run build');
        console.log('   2. Test the game: npm run serve');
        console.log('   3. Run unit tests: npm test');
        console.log('   4. Verify gameplay feels more responsive\n');
        
        return true;
    } else {
        console.log('❌ Some animation speed tests failed');
        console.log('🔧 Please check the implementation and try again\n');
        return false;
    }
}

// Execute tests
if (require.main === module) {
    const success = runTests();
    process.exit(success ? 0 : 1);
}

module.exports = { runTests, testCSSAnimations, testJavaScriptAnimations };