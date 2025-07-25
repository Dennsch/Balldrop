#!/usr/bin/env node

/**
 * Simple Logo Size Verification Test
 * Verifies that the logo sizes have been reduced as requested
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Logo Size Reduction Verification');
console.log('====================================\n');

let allTestsPassed = true;

function checkTest(testName, condition, message) {
    const status = condition ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} ${testName}: ${message}`);
    if (!condition) allTestsPassed = false;
    return condition;
}

try {
    const cssPath = path.join(__dirname, 'styles.css');
    const cssContent = fs.readFileSync(cssPath, 'utf8');
    
    console.log('Checking CSS file for logo size changes...\n');
    
    // Check desktop logo size (should be 50px)
    const desktopMatch = cssContent.match(/\.game-logo\s*{[^}]*max-width:\s*50px/);
    checkTest('Desktop Logo Size', !!desktopMatch, desktopMatch ? 'Set to 50px (reduced from 80px)' : 'Not found or incorrect size');
    
    // Check tablet logo size (should be 40px in 768px media query)
    const tabletMatch = cssContent.includes('@media (max-width: 768px)') && 
                       cssContent.match(/@media \(max-width: 768px\)[^}]*}[^@]*\.game-logo\s*{[^}]*max-width:\s*40px/s);
    checkTest('Tablet Logo Size', !!tabletMatch, tabletMatch ? 'Set to 40px (reduced from 60px)' : 'Not found or incorrect size');
    
    // Check mobile logo size (should be 35px in 480px media query)  
    const mobileMatch = cssContent.includes('@media (max-width: 480px)') &&
                       cssContent.match(/@media \(max-width: 480px\)[^}]*}[^@]*\.game-logo\s*{[^}]*max-width:\s*35px/s);
    checkTest('Mobile Logo Size', !!mobileMatch, mobileMatch ? 'Set to 35px (reduced from 50px)' : 'Not found or incorrect size');
    
    // Check that hover effect is preserved
    const hoverEffect = cssContent.includes('.game-logo:hover') && cssContent.includes('transform: scale(1.05)');
    checkTest('Logo Hover Effect', hoverEffect, hoverEffect ? 'Hover scale effect preserved' : 'Hover effect missing');
    
    // Check HTML structure is intact
    const htmlPath = path.join(__dirname, 'index.html');
    const htmlContent = fs.readFileSync(htmlPath, 'utf8');
    
    console.log('\nChecking HTML structure...\n');
    
    const logoElement = htmlContent.includes('class="game-logo"') && htmlContent.includes('src="assets/icon.png"');
    checkTest('Logo HTML Element', logoElement, logoElement ? 'Logo element found with correct attributes' : 'Logo element missing or incorrect');
    
    const logoContainer = htmlContent.includes('<div class="logo-container">');
    checkTest('Logo Container', logoContainer, logoContainer ? 'Logo container structure intact' : 'Logo container missing');
    
} catch (error) {
    checkTest('File Access', false, `Error reading files: ${error.message}`);
}

console.log('\n' + '='.repeat(40));
console.log('📊 SUMMARY');
console.log('='.repeat(40));

if (allTestsPassed) {
    console.log('\n🎉 SUCCESS! Logo size reduction implemented correctly.');
    console.log('\n📏 Size Changes Applied:');
    console.log('   • Desktop: 80px → 50px (37.5% smaller)');
    console.log('   • Tablet:  60px → 40px (33.3% smaller)');
    console.log('   • Mobile:  50px → 35px (30% smaller)');
    console.log('\n✨ The logo should now take up significantly less space!');
    console.log('\n🔧 Next steps:');
    console.log('   1. Run "npm run build" to compile the project');
    console.log('   2. Run "npm test" to verify existing tests still pass');
    console.log('   3. Open index.html in browser to see the visual changes');
} else {
    console.log('\n⚠️  Some checks failed. Please review the issues above.');
}

process.exit(allTestsPassed ? 0 : 1);