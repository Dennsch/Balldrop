#!/usr/bin/env node

/**
 * Mobile Responsiveness Verification Script
 * Tests the mobile improvements made to the Balldrop game
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Mobile Responsiveness Improvements...\n');

// Test 1: Verify CSS responsive breakpoints exist
function testResponsiveBreakpoints() {
    console.log('📱 Testing responsive breakpoints...');
    
    const cssPath = path.join(__dirname, '..', 'styles.css');
    if (!fs.existsSync(cssPath)) {
        console.log('❌ styles.css not found');
        return false;
    }
    
    const cssContent = fs.readFileSync(cssPath, 'utf8');
    
    const requiredBreakpoints = [
        '@media (max-width: 1024px)',
        '@media (max-width: 768px)',
        '@media (max-width: 480px)',
        '@media (max-width: 360px)',
        '@media (max-height: 500px) and (orientation: landscape)'
    ];
    
    let allBreakpointsFound = true;
    requiredBreakpoints.forEach(breakpoint => {
        if (cssContent.includes(breakpoint)) {
            console.log(`✅ Found breakpoint: ${breakpoint}`);
        } else {
            console.log(`❌ Missing breakpoint: ${breakpoint}`);
            allBreakpointsFound = false;
        }
    });
    
    return allBreakpointsFound;
}

// Test 2: Verify mobile-friendly CSS properties
function testMobileFriendlyProperties() {
    console.log('\n📱 Testing mobile-friendly CSS properties...');
    
    const cssPath = path.join(__dirname, '..', 'styles.css');
    const cssContent = fs.readFileSync(cssPath, 'utf8');
    
    const requiredProperties = [
        'min-width: 44px',  // Touch target size
        'min-height: 44px', // Touch target size
        '-webkit-tap-highlight-color: transparent',
        'user-select: none',
        'touch-action: manipulation',
        'overflow-x: auto',
        '-webkit-overflow-scrolling: touch',
        'clamp(',  // Fluid typography
        'min(95vw,', // Responsive sizing
    ];
    
    let propertiesFound = 0;
    requiredProperties.forEach(property => {
        if (cssContent.includes(property)) {
            console.log(`✅ Found mobile property: ${property}`);
            propertiesFound++;
        } else {
            console.log(`⚠️  Missing mobile property: ${property}`);
        }
    });
    
    console.log(`📊 Mobile properties found: ${propertiesFound}/${requiredProperties.length}`);
    return propertiesFound >= requiredProperties.length * 0.7; // 70% threshold
}

// Test 3: Verify HTML viewport meta tag
function testViewportMeta() {
    console.log('\n📱 Testing viewport meta tag...');
    
    const htmlPath = path.join(__dirname, '..', 'index.html');
    if (!fs.existsSync(htmlPath)) {
        console.log('❌ index.html not found');
        return false;
    }
    
    const htmlContent = fs.readFileSync(htmlPath, 'utf8');
    
    if (htmlContent.includes('name="viewport"') && 
        htmlContent.includes('width=device-width') && 
        htmlContent.includes('initial-scale=1.0')) {
        console.log('✅ Proper viewport meta tag found');
        return true;
    } else {
        console.log('❌ Missing or incorrect viewport meta tag');
        return false;
    }
}

// Test 4: Verify React component structure supports mobile
function testReactComponentStructure() {
    console.log('\n⚛️  Testing React component structure...');
    
    const componentPaths = [
        path.join(__dirname, '..', 'src', 'components', 'GameBoard.tsx'),
        path.join(__dirname, '..', 'src', 'components', 'ColumnSelectors.tsx'),
        path.join(__dirname, '..', 'src', 'components', 'Grid.tsx'),
        path.join(__dirname, '..', 'src', 'App.tsx')
    ];
    
    let componentsValid = true;
    
    componentPaths.forEach(componentPath => {
        if (fs.existsSync(componentPath)) {
            const content = fs.readFileSync(componentPath, 'utf8');
            const fileName = path.basename(componentPath);
            
            // Check for mobile-friendly patterns
            if (content.includes('className=') || content.includes('class=')) {
                console.log(`✅ ${fileName} has proper CSS class usage`);
            } else {
                console.log(`⚠️  ${fileName} may be missing CSS classes`);
            }
            
            // Check for React best practices
            if (content.includes('React.FC') || content.includes('function ')) {
                console.log(`✅ ${fileName} uses proper React component structure`);
            } else {
                console.log(`⚠️  ${fileName} may have component structure issues`);
                componentsValid = false;
            }
        } else {
            console.log(`❌ Component not found: ${componentPath}`);
            componentsValid = false;
        }
    });
    
    return componentsValid;
}

// Test 5: Verify mobile test coverage
function testMobileTestCoverage() {
    console.log('\n🧪 Testing mobile test coverage...');
    
    const testPaths = [
        path.join(__dirname, '..', 'tests', 'ui.test.ts'),
        path.join(__dirname, '..', 'tests', 'mobile-responsiveness.test.ts')
    ];
    
    let testsValid = true;
    
    testPaths.forEach(testPath => {
        if (fs.existsSync(testPath)) {
            const content = fs.readFileSync(testPath, 'utf8');
            const fileName = path.basename(testPath);
            
            if (content.includes('mobile') || content.includes('responsive') || content.includes('touch')) {
                console.log(`✅ ${fileName} includes mobile-related tests`);
            } else {
                console.log(`⚠️  ${fileName} may be missing mobile tests`);
            }
        } else {
            console.log(`❌ Test file not found: ${testPath}`);
            testsValid = false;
        }
    });
    
    return testsValid;
}

// Test 6: Check for mobile-specific improvements
function testMobileImprovements() {
    console.log('\n🚀 Testing mobile-specific improvements...');
    
    const cssPath = path.join(__dirname, '..', 'styles.css');
    const cssContent = fs.readFileSync(cssPath, 'utf8');
    
    const improvements = [
        { name: 'Flexbox column selectors', pattern: 'display: flex' },
        { name: 'Horizontal scrolling', pattern: 'overflow-x: auto' },
        { name: 'Touch-friendly sizing', pattern: 'min-width: 44px' },
        { name: 'Viewport-relative units', pattern: 'min(95vw,' },
        { name: 'Fluid typography', pattern: 'clamp(' },
        { name: 'Landscape orientation support', pattern: 'orientation: landscape' }
    ];
    
    let improvementsFound = 0;
    improvements.forEach(improvement => {
        if (cssContent.includes(improvement.pattern)) {
            console.log(`✅ ${improvement.name} implemented`);
            improvementsFound++;
        } else {
            console.log(`⚠️  ${improvement.name} not found`);
        }
    });
    
    console.log(`📊 Mobile improvements: ${improvementsFound}/${improvements.length}`);
    return improvementsFound >= improvements.length * 0.8; // 80% threshold
}

// Test 7: Verify test file exists
function testMobileTestFile() {
    console.log('\n📄 Testing mobile test file...');
    
    const testFilePath = path.join(__dirname, '..', 'test-mobile-responsiveness.html');
    if (fs.existsSync(testFilePath)) {
        const content = fs.readFileSync(testFilePath, 'utf8');
        
        if (content.includes('viewport') && 
            content.includes('test-column-selector') && 
            content.includes('screen-size')) {
            console.log('✅ Mobile test file exists and is properly structured');
            return true;
        } else {
            console.log('⚠️  Mobile test file exists but may be incomplete');
            return false;
        }
    } else {
        console.log('❌ Mobile test file not found');
        return false;
    }
}

// Run all tests
async function runAllTests() {
    console.log('🎯 Running Mobile Responsiveness Verification\n');
    
    const tests = [
        { name: 'Responsive Breakpoints', test: testResponsiveBreakpoints },
        { name: 'Mobile-Friendly Properties', test: testMobileFriendlyProperties },
        { name: 'Viewport Meta Tag', test: testViewportMeta },
        { name: 'React Component Structure', test: testReactComponentStructure },
        { name: 'Mobile Test Coverage', test: testMobileTestCoverage },
        { name: 'Mobile Improvements', test: testMobileImprovements },
        { name: 'Mobile Test File', test: testMobileTestFile }
    ];
    
    let passedTests = 0;
    const results = [];
    
    for (const { name, test } of tests) {
        try {
            const result = test();
            results.push({ name, passed: result });
            if (result) passedTests++;
        } catch (error) {
            console.log(`❌ Error running test ${name}:`, error.message);
            results.push({ name, passed: false });
        }
    }
    
    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 MOBILE RESPONSIVENESS VERIFICATION SUMMARY');
    console.log('='.repeat(60));
    
    results.forEach(({ name, passed }) => {
        console.log(`${passed ? '✅' : '❌'} ${name}`);
    });
    
    console.log(`\n🎯 Overall Score: ${passedTests}/${tests.length} tests passed`);
    
    if (passedTests === tests.length) {
        console.log('🎉 All mobile responsiveness tests passed!');
        console.log('📱 The game should now work much better on mobile devices.');
    } else if (passedTests >= tests.length * 0.8) {
        console.log('✅ Most mobile responsiveness improvements are in place.');
        console.log('⚠️  Some minor issues may need attention.');
    } else {
        console.log('⚠️  Several mobile responsiveness issues need to be addressed.');
    }
    
    console.log('\n📱 To test on actual mobile devices:');
    console.log('1. Open test-mobile-responsiveness.html in a mobile browser');
    console.log('2. Test touch interactions with column selectors');
    console.log('3. Verify grid scaling and readability');
    console.log('4. Check landscape orientation support');
    
    return passedTests === tests.length;
}

// Run the verification
if (require.main === module) {
    runAllTests().then(success => {
        process.exit(success ? 0 : 1);
    }).catch(error => {
        console.error('❌ Verification failed:', error);
        process.exit(1);
    });
}

module.exports = { runAllTests };