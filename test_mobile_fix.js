#!/usr/bin/env node

/**
 * Test script to verify mobile responsiveness fixes
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Testing Mobile Responsiveness Fixes...\n');

function testColumnSelectorFixes() {
    console.log('📱 Testing column selector improvements...');
    
    const cssPath = path.join(__dirname, 'styles.css');
    const cssContent = fs.readFileSync(cssPath, 'utf8');
    
    const fixes = [
        {
            name: 'Base column selector has max-width constraint',
            pattern: 'max-width: calc((100% - 38px) / 20)',
            description: 'Ensures buttons don\'t exceed available space'
        },
        {
            name: 'Tablet breakpoint has proper max-width',
            pattern: 'max-width: calc((100% - 19px) / 20)',
            description: 'Optimizes button sizing for tablet screens'
        },
        {
            name: 'Mobile breakpoint has reduced min-width',
            pattern: 'min-width: 36px',
            description: 'Allows buttons to scale down on mobile'
        },
        {
            name: 'Small mobile has further reduced min-width',
            pattern: 'min-width: 32px',
            description: 'Ensures buttons fit on smallest screens'
        },
        {
            name: 'Landscape mode has optimized sizing',
            pattern: 'min-width: 30px',
            description: 'Optimizes for landscape orientation'
        },
        {
            name: 'Flexible flex properties',
            pattern: 'flex: 1 1 auto',
            description: 'Allows buttons to grow and shrink as needed'
        }
    ];
    
    let passedFixes = 0;
    fixes.forEach(fix => {
        if (cssContent.includes(fix.pattern)) {
            console.log(`✅ ${fix.name}`);
            console.log(`   ${fix.description}`);
            passedFixes++;
        } else {
            console.log(`❌ ${fix.name}`);
            console.log(`   Missing: ${fix.pattern}`);
        }
    });
    
    console.log(`\n📊 Column selector fixes: ${passedFixes}/${fixes.length}`);
    return passedFixes === fixes.length;
}

function testResponsiveBreakpoints() {
    console.log('\n📱 Testing responsive breakpoints...');
    
    const cssPath = path.join(__dirname, 'styles.css');
    const cssContent = fs.readFileSync(cssPath, 'utf8');
    
    const breakpoints = [
        '@media (max-width: 1024px)',
        '@media (max-width: 768px)',
        '@media (max-width: 480px)',
        '@media (max-width: 360px)',
        '@media (max-height: 500px) and (orientation: landscape)'
    ];
    
    let foundBreakpoints = 0;
    breakpoints.forEach(breakpoint => {
        if (cssContent.includes(breakpoint)) {
            console.log(`✅ ${breakpoint}`);
            foundBreakpoints++;
        } else {
            console.log(`❌ ${breakpoint}`);
        }
    });
    
    console.log(`\n📊 Responsive breakpoints: ${foundBreakpoints}/${breakpoints.length}`);
    return foundBreakpoints === breakpoints.length;
}

function testGridAlignment() {
    console.log('\n🎯 Testing grid-column selector alignment...');
    
    const cssPath = path.join(__dirname, 'styles.css');
    const cssContent = fs.readFileSync(cssPath, 'utf8');
    
    // Extract grid and column-selector widths for each breakpoint
    const alignmentChecks = [
        {
            breakpoint: 'Base (desktop)',
            gridPattern: 'width: 600px;',
            selectorPattern: 'width: 600px;'
        },
        {
            breakpoint: '1024px',
            gridPattern: 'width: min(90vw, 500px);',
            selectorPattern: 'width: min(90vw, 500px);'
        },
        {
            breakpoint: '768px',
            gridPattern: 'width: min(95vw, 450px);',
            selectorPattern: 'width: min(95vw, 450px);'
        },
        {
            breakpoint: '480px',
            gridPattern: 'width: min(98vw, 350px);',
            selectorPattern: 'width: min(98vw, 350px);'
        },
        {
            breakpoint: '360px',
            gridPattern: 'width: min(99vw, 300px);',
            selectorPattern: 'width: min(99vw, 300px);'
        }
    ];
    
    let alignedBreakpoints = 0;
    alignmentChecks.forEach(check => {
        const hasGrid = cssContent.includes(check.gridPattern);
        const hasSelector = cssContent.includes(check.selectorPattern);
        
        if (hasGrid && hasSelector) {
            console.log(`✅ ${check.breakpoint}: Grid and selectors aligned`);
            alignedBreakpoints++;
        } else {
            console.log(`❌ ${check.breakpoint}: Alignment issue`);
            if (!hasGrid) console.log(`   Missing grid: ${check.gridPattern}`);
            if (!hasSelector) console.log(`   Missing selector: ${check.selectorPattern}`);
        }
    });
    
    console.log(`\n📊 Aligned breakpoints: ${alignedBreakpoints}/${alignmentChecks.length}`);
    return alignedBreakpoints === alignmentChecks.length;
}

// Run all tests
async function runTests() {
    console.log('🎯 Mobile Responsiveness Fix Verification\n');
    
    const columnSelectorOk = testColumnSelectorFixes();
    const breakpointsOk = testResponsiveBreakpoints();
    const alignmentOk = testGridAlignment();
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 MOBILE FIX VERIFICATION SUMMARY');
    console.log('='.repeat(60));
    
    console.log(`${columnSelectorOk ? '✅' : '❌'} Column Selector Improvements`);
    console.log(`${breakpointsOk ? '✅' : '❌'} Responsive Breakpoints`);
    console.log(`${alignmentOk ? '✅' : '❌'} Grid-Selector Alignment`);
    
    const allPassed = columnSelectorOk && breakpointsOk && alignmentOk;
    
    if (allPassed) {
        console.log('\n🎉 All mobile responsiveness fixes are in place!');
        console.log('📱 Column buttons should now scale properly on mobile devices.');
        console.log('🎯 Buttons should align correctly with grid columns.');
    } else {
        console.log('\n⚠️  Some mobile fixes may need attention.');
    }
    
    console.log('\n📱 To test the fixes:');
    console.log('1. Open the game on a mobile device or use browser dev tools');
    console.log('2. Test different screen sizes (360px, 480px, 768px)');
    console.log('3. Verify column buttons scale down and align with grid');
    console.log('4. Check that buttons remain touchable (44px minimum height)');
    
    return allPassed;
}

// Run the tests
if (require.main === module) {
    runTests().then(success => {
        process.exit(success ? 0 : 1);
    }).catch(error => {
        console.error('❌ Test failed:', error);
        process.exit(1);
    });
}

module.exports = { runTests };