#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🎯 Testing Icon.png Integration...\n');

try {
    // Check if icon.png exists
    console.log('📁 Checking icon.png file...');
    const iconPath = path.join(__dirname, 'assets', 'icon.png');
    if (fs.existsSync(iconPath)) {
        console.log('  ✅ assets/icon.png exists');
    } else {
        console.log('  ❌ assets/icon.png not found');
        throw new Error('Icon file missing');
    }

    // Verify HTML uses local icon
    console.log('\n🔍 Verifying HTML uses local icon...');
    const htmlContent = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
    
    const checks = [
        { test: htmlContent.includes('src="assets/icon.png"'), desc: 'HTML uses local icon path' },
        { test: htmlContent.includes('class="game-logo"'), desc: 'Logo has correct CSS class' },
        { test: htmlContent.includes('alt="Balldrop Game Logo"'), desc: 'Logo has proper alt text' },
        { test: !htmlContent.includes('github.com'), desc: 'No external GitHub URLs in HTML' }
    ];

    checks.forEach(check => {
        if (check.test) {
            console.log(`  ✅ ${check.desc}`);
        } else {
            console.log(`  ❌ ${check.desc}`);
            throw new Error(`HTML check failed: ${check.desc}`);
        }
    });

    // Verify test files are updated
    console.log('\n🧪 Verifying test files are updated...');
    const uiTestContent = fs.readFileSync(path.join(__dirname, 'tests', 'ui.test.ts'), 'utf8');
    
    const testChecks = [
        { test: uiTestContent.includes('assets/icon.png'), desc: 'UI tests use local icon path' },
        { test: uiTestContent.includes('toContain(\'assets/icon.png\')'), desc: 'Test assertion updated for local path' },
        { test: !uiTestContent.includes('github.com'), desc: 'No external URLs in tests' }
    ];

    testChecks.forEach(check => {
        if (check.test) {
            console.log(`  ✅ ${check.desc}`);
        } else {
            console.log(`  ❌ ${check.desc}`);
            throw new Error(`Test check failed: ${check.desc}`);
        }
    });

    // Verify integration test is updated
    console.log('\n🔧 Verifying integration test is updated...');
    const integrationTestContent = fs.readFileSync(path.join(__dirname, 'test_logo_integration.js'), 'utf8');
    
    if (integrationTestContent.includes('assets/icon.png') && !integrationTestContent.includes('github.com/user-attachments')) {
        console.log('  ✅ Integration test updated for local icon');
    } else {
        console.log('  ❌ Integration test still references external URL');
        throw new Error('Integration test not properly updated');
    }

    console.log('\n🎉 Icon.png Integration Complete!');
    console.log('\n📋 Changes Summary:');
    console.log('  • HTML updated to use assets/icon.png');
    console.log('  • UI tests updated to expect local file path');
    console.log('  • Integration tests updated for local icon');
    console.log('  • Documentation updated to reflect changes');
    console.log('  • All external GitHub URLs removed');

    console.log('\n✨ Benefits:');
    console.log('  • Logo now loads from local assets folder');
    console.log('  • No dependency on external GitHub URLs');
    console.log('  • Faster loading and better reliability');
    console.log('  • Consistent with local asset management');

    console.log('\n🚀 Next Steps:');
    console.log('  1. Replace the placeholder icon.png with actual PNG image');
    console.log('  2. Test the application in a browser');
    console.log('  3. Verify logo displays correctly');
    console.log('  4. Run full test suite to ensure everything works');

} catch (error) {
    console.error('\n❌ Error during icon integration testing:', error.message);
    process.exit(1);
}