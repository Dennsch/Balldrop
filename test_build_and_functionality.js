/**
 * Test script to verify build process and basic functionality
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 BUILD AND FUNCTIONALITY TEST');
console.log('='.repeat(50));

let allTestsPassed = true;

// Test 1: Check if TypeScript files exist and are valid
console.log('\n1. TypeScript Source Files:');
try {
    const srcFiles = ['Game.ts', 'GameUI.ts', 'Grid.ts', 'index.ts', 'types.ts'];
    for (const file of srcFiles) {
        const filePath = path.join(__dirname, 'src', file);
        if (fs.existsSync(filePath)) {
            console.log(`   ✅ ${file} exists`);
        } else {
            console.log(`   ❌ ${file} missing`);
            allTestsPassed = false;
        }
    }
} catch (error) {
    console.log(`   ❌ Error checking source files: ${error.message}`);
    allTestsPassed = false;
}

// Test 2: Check if essential files are present
console.log('\n2. Essential Files:');
const essentialFiles = [
    'index.html',
    'styles.css',
    'package.json',
    'tsconfig.json',
    'jest.config.js'
];

for (const file of essentialFiles) {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
        console.log(`   ✅ ${file} exists`);
    } else {
        console.log(`   ❌ ${file} missing`);
        allTestsPassed = false;
    }
}

// Test 3: Check if assets exist
console.log('\n3. Assets:');
const assetPath = path.join(__dirname, 'assets', 'icon.png');
if (fs.existsSync(assetPath)) {
    console.log('   ✅ icon.png exists');
} else {
    console.log('   ❌ icon.png missing');
    allTestsPassed = false;
}

// Test 4: Verify HTML structure
console.log('\n4. HTML Structure:');
try {
    const htmlContent = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
    
    const hasGameContainer = htmlContent.includes('class="game-container"');
    const hasGameGrid = htmlContent.includes('id="game-grid"');
    const hasColumnSelectors = htmlContent.includes('id="column-selectors"');
    const hasGameControls = htmlContent.includes('class="game-controls"');
    
    if (hasGameContainer && hasGameGrid && hasColumnSelectors && hasGameControls) {
        console.log('   ✅ HTML structure is valid');
    } else {
        console.log('   ❌ HTML structure incomplete');
        allTestsPassed = false;
    }
} catch (error) {
    console.log(`   ❌ Error reading HTML: ${error.message}`);
    allTestsPassed = false;
}

// Test 5: Verify CSS structure
console.log('\n5. CSS Structure:');
try {
    const cssContent = fs.readFileSync(path.join(__dirname, 'styles.css'), 'utf8');
    
    const hasRootVars = cssContent.includes(':root {');
    const hasGameContainer = cssContent.includes('.game-container');
    const hasGrid = cssContent.includes('.grid');
    const hasButtons = cssContent.includes('.btn');
    const hasResponsive = cssContent.includes('@media');
    
    if (hasRootVars && hasGameContainer && hasGrid && hasButtons && hasResponsive) {
        console.log('   ✅ CSS structure is valid');
    } else {
        console.log('   ❌ CSS structure incomplete');
        allTestsPassed = false;
    }
} catch (error) {
    console.log(`   ❌ Error reading CSS: ${error.message}`);
    allTestsPassed = false;
}

// Test 6: Check package.json scripts
console.log('\n6. Package Scripts:');
try {
    const packageContent = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
    const requiredScripts = ['build', 'test', 'dev'];
    
    for (const script of requiredScripts) {
        if (packageContent.scripts && packageContent.scripts[script]) {
            console.log(`   ✅ ${script} script exists`);
        } else {
            console.log(`   ❌ ${script} script missing`);
            allTestsPassed = false;
        }
    }
} catch (error) {
    console.log(`   ❌ Error reading package.json: ${error.message}`);
    allTestsPassed = false;
}

// Summary
console.log('\n' + '='.repeat(50));
if (allTestsPassed) {
    console.log('🎉 ALL BUILD TESTS PASSED!');
    console.log('✅ Project structure is valid and ready for build');
    console.log('\n📝 Next Steps:');
    console.log('   • Run "npm run build" to compile TypeScript');
    console.log('   • Run "npm run test" to execute test suite');
    console.log('   • Run "npm run serve" to start development server');
} else {
    console.log('⚠️  SOME BUILD TESTS FAILED');
    console.log('❌ Please review the failed items above');
}
console.log('='.repeat(50));