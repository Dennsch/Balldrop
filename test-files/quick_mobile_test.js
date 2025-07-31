#!/usr/bin/env node

/**
 * Quick Mobile Responsiveness Test
 * Verifies key mobile improvements are in place
 */

const fs = require('fs');
const path = require('path');

console.log('📱 Quick Mobile Responsiveness Check\n');

// Check if styles.css has mobile improvements
function checkMobileCSS() {
    const cssPath = path.join(__dirname, '..', 'styles.css');
    const cssContent = fs.readFileSync(cssPath, 'utf8');
    
    const checks = [
        { name: 'Responsive breakpoints', pattern: '@media (max-width: 480px)' },
        { name: 'Touch targets', pattern: 'min-height: 44px' },
        { name: 'Flexbox selectors', pattern: 'display: flex' },
        { name: 'Viewport units', pattern: 'min(95vw,' },
        { name: 'Fluid typography', pattern: 'clamp(' },
        { name: 'Touch optimization', pattern: '-webkit-tap-highlight-color' }
    ];
    
    let passed = 0;
    checks.forEach(check => {
        if (cssContent.includes(check.pattern)) {
            console.log(`✅ ${check.name}`);
            passed++;
        } else {
            console.log(`❌ ${check.name}`);
        }
    });
    
    return passed === checks.length;
}

// Check if test files exist
function checkTestFiles() {
    const files = [
        'test-mobile-responsiveness.html',
        'tests/mobile-responsiveness.test.ts',
        'MOBILE_RESPONSIVENESS_SUMMARY.md'
    ];
    
    let allExist = true;
    files.forEach(file => {
        const filePath = path.join(__dirname, '..', file);
        if (fs.existsSync(filePath)) {
            console.log(`✅ ${file} exists`);
        } else {
            console.log(`❌ ${file} missing`);
            allExist = false;
        }
    });
    
    return allExist;
}

// Run checks
console.log('🔍 Checking CSS improvements...');
const cssOk = checkMobileCSS();

console.log('\n📄 Checking test files...');
const filesOk = checkTestFiles();

console.log('\n📊 Summary:');
if (cssOk && filesOk) {
    console.log('🎉 All mobile responsiveness improvements are in place!');
    console.log('📱 The game should now work much better on mobile devices.');
    console.log('\n🧪 To test:');
    console.log('1. Open test-mobile-responsiveness.html on a mobile device');
    console.log('2. Try tapping the column selector buttons');
    console.log('3. Check that the grid scales properly');
    console.log('4. Test in both portrait and landscape orientations');
} else {
    console.log('⚠️  Some mobile improvements may be missing.');
}

console.log('\n📖 See MOBILE_RESPONSIVENESS_SUMMARY.md for full details.');