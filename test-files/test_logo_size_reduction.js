#!/usr/bin/env node

/**
 * Logo Size Reduction Verification Test
 * 
 * This script verifies that the logo has been successfully reduced in size
 * across all responsive breakpoints while maintaining proper structure.
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Logo Size Reduction Verification Test');
console.log('==========================================\n');

// Test results tracking
let testResults = [];
let allTestsPassed = true;

function addTestResult(testName, passed, message) {
    testResults.push({ testName, passed, message });
    if (!passed) allTestsPassed = false;
    
    const status = passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} ${testName}: ${message}`);
}

// 1. Verify CSS file contains updated logo sizes
console.log('1. Checking CSS file for updated logo dimensions...\n');

try {
    const cssPath = path.join(__dirname, 'styles.css');
    const cssContent = fs.readFileSync(cssPath, 'utf8');
    
    // Check desktop size (should be 50px, not 80px)
    const desktopLogoMatch = cssContent.match(/\.game-logo\s*{[^}]*max-width:\s*(\d+)px[^}]*}/);
    if (desktopLogoMatch) {
        const desktopSize = parseInt(desktopLogoMatch[1]);
        if (desktopSize === 50) {
            addTestResult('Desktop Logo Size', true, `Correctly set to ${desktopSize}px (reduced from 80px)`);
        } else {
            addTestResult('Desktop Logo Size', false, `Expected 50px, found ${desktopSize}px`);
        }
    } else {
        addTestResult('Desktop Logo Size', false, 'Could not find .game-logo CSS rule');
    }
    
    // Check tablet size (should be 40px, not 60px)
    const tabletMediaQuery = cssContent.match(/@media\s*\([^)]*max-width:\s*768px[^)]*\)[^{]*{[^}]*}[^}]*\.game-logo\s*{[^}]*max-width:\s*(\d+)px[^}]*}/s);
    if (tabletMediaQuery) {
        const tabletSize = parseInt(tabletMediaQuery[1]);
        if (tabletSize === 40) {
            addTestResult('Tablet Logo Size', true, `Correctly set to ${tabletSize}px (reduced from 60px)`);
        } else {
            addTestResult('Tablet Logo Size', false, `Expected 40px, found ${tabletSize}px`);
        }
    } else {
        // Alternative check - look for the tablet media query section
        const tabletSection = cssContent.match(/@media\s*\([^)]*max-width:\s*768px[^)]*\)[^{]*{([^}]*\.game-logo[^}]*max-width:\s*(\d+)px[^}]*)*}/s);
        if (tabletSection && tabletSection[2]) {
            const tabletSize = parseInt(tabletSection[2]);
            if (tabletSize === 40) {
                addTestResult('Tablet Logo Size', true, `Correctly set to ${tabletSize}px (reduced from 60px)`);
            } else {
                addTestResult('Tablet Logo Size', false, `Expected 40px, found ${tabletSize}px`);
            }
        } else {
            addTestResult('Tablet Logo Size', false, 'Could not find tablet media query logo size');
        }
    }
    
    // Check mobile size (should be 35px, not 50px)
    const mobileMediaQuery = cssContent.match(/@media\s*\([^)]*max-width:\s*480px[^)]*\)[^{]*{([^}]*\.game-logo[^}]*max-width:\s*(\d+)px[^}]*)*}/s);
    if (mobileMediaQuery && mobileMediaQuery[2]) {
        const mobileSize = parseInt(mobileMediaQuery[2]);
        if (mobileSize === 35) {
            addTestResult('Mobile Logo Size', true, `Correctly set to ${mobileSize}px (reduced from 50px)`);
        } else {
            addTestResult('Mobile Logo Size', false, `Expected 35px, found ${mobileSize}px`);
        }
    } else {
        addTestResult('Mobile Logo Size', false, 'Could not find mobile media query logo size');
    }
    
    // Verify logo hover effect is still present
    const hoverEffect = cssContent.includes('.game-logo:hover') && cssContent.includes('transform: scale(1.05)');
    addTestResult('Logo Hover Effect', hoverEffect, hoverEffect ? 'Hover scale effect preserved' : 'Hover effect missing or modified');
    
    // Verify other logo properties are intact
    const hasRoundedCorners = cssContent.includes('border-radius: 12px');
    const hasShadow = cssContent.includes('box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15)');
    const hasTransition = cssContent.includes('transition: transform var(--button-transition-duration) ease');
    
    addTestResult('Logo Border Radius', hasRoundedCorners, hasRoundedCorners ? 'Border radius preserved' : 'Border radius missing');
    addTestResult('Logo Shadow', hasShadow, hasShadow ? 'Box shadow preserved' : 'Box shadow missing');
    addTestResult('Logo Transition', hasTransition, hasTransition ? 'Transition effect preserved' : 'Transition missing');
    
} catch (error) {
    addTestResult('CSS File Access', false, `Error reading CSS file: ${error.message}`);
}

// 2. Verify HTML structure is intact
console.log('\n2. Checking HTML structure...\n');

try {
    const htmlPath = path.join(__dirname, 'index.html');
    const htmlContent = fs.readFileSync(htmlPath, 'utf8');
    
    // Check logo element exists with correct attributes
    const logoElement = htmlContent.includes('<img src="assets/icon.png" alt="Balldrop Game Logo" class="game-logo">');
    addTestResult('Logo HTML Element', logoElement, logoElement ? 'Logo element found with correct attributes' : 'Logo element missing or incorrect');
    
    // Check logo container structure
    const logoContainer = htmlContent.includes('<div class="logo-container">') && htmlContent.includes('</div>');
    addTestResult('Logo Container', logoContainer, logoContainer ? 'Logo container structure intact' : 'Logo container missing');
    
    // Check header structure
    const headerContent = htmlContent.includes('<div class="header-content">');
    addTestResult('Header Structure', headerContent, headerContent ? 'Header structure intact' : 'Header structure missing');
    
} catch (error) {
    addTestResult('HTML File Access', false, `Error reading HTML file: ${error.message}`);
}

// 3. Check for any existing verification scripts that might need updating
console.log('\n3. Checking existing verification scripts...\n');

const verificationFiles = [
    'verify_logo_integration.js',
    'test_logo_integration.js',
    'verify_icon_implementation.js'
];

verificationFiles.forEach(filename => {
    const filePath = path.join(__dirname, filename);
    if (fs.existsSync(filePath)) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            // Check if the file contains old size references that might need updating
            const hasOldSizes = content.includes('80px') || content.includes('60px') || (content.includes('50px') && filename.includes('logo'));
            
            if (hasOldSizes) {
                addTestResult(`${filename} Update Check`, false, 'May contain old logo size references - consider updating');
            } else {
                addTestResult(`${filename} Update Check`, true, 'No old size references found');
            }
        } catch (error) {
            addTestResult(`${filename} Access`, false, `Error reading file: ${error.message}`);
        }
    } else {
        addTestResult(`${filename} Existence`, true, 'File not found (optional)');
    }
});

// 4. Summary and recommendations
console.log('\n' + '='.repeat(50));
console.log('📊 TEST SUMMARY');
console.log('='.repeat(50));

const passedTests = testResults.filter(result => result.passed).length;
const totalTests = testResults.length;

console.log(`\nTests Passed: ${passedTests}/${totalTests}`);

if (allTestsPassed) {
    console.log('\n🎉 All tests passed! Logo size reduction implemented successfully.');
    console.log('\n📏 Logo Size Changes Summary:');
    console.log('   • Desktop: 80px → 50px (37.5% reduction)');
    console.log('   • Tablet:  60px → 40px (33.3% reduction)');
    console.log('   • Mobile:  50px → 35px (30% reduction)');
    console.log('\n✨ The logo should now take up significantly less space while maintaining visual quality.');
} else {
    console.log('\n⚠️  Some tests failed. Please review the issues above.');
    console.log('\nFailed tests:');
    testResults.filter(result => !result.passed).forEach(result => {
        console.log(`   • ${result.testName}: ${result.message}`);
    });
}

console.log('\n🔧 Next Steps:');
console.log('   1. Run "npm run build" to compile the project');
console.log('   2. Run "npm test" to ensure existing tests still pass');
console.log('   3. Open index.html in a browser to visually verify the changes');
console.log('   4. Test responsive behavior at different screen sizes');

// Exit with appropriate code
process.exit(allTestsPassed ? 0 : 1);