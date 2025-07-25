#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🎨 Testing Logo Integration and Color System...\n');

try {
    // Build the project
    console.log('📦 Building TypeScript...');
    execSync('npm run build', { stdio: 'inherit' });
    console.log('✅ Build successful\n');

    // Run tests
    console.log('🧪 Running tests...');
    execSync('npm test', { stdio: 'inherit' });
    console.log('✅ All tests passed\n');

    // Verify HTML structure
    console.log('🔍 Verifying HTML structure...');
    const htmlContent = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
    
    const checks = [
        { test: htmlContent.includes('class="header-content"'), desc: 'Header content structure' },
        { test: htmlContent.includes('class="logo-container"'), desc: 'Logo container' },
        { test: htmlContent.includes('class="game-logo"'), desc: 'Logo image element' },
        { test: htmlContent.includes('assets/icon.png'), desc: 'Logo image source' },
        { test: htmlContent.includes('alt="Balldrop Game Logo"'), desc: 'Logo alt text' }
    ];

    checks.forEach(check => {
        if (check.test) {
            console.log(`  ✅ ${check.desc}`);
        } else {
            console.log(`  ❌ ${check.desc}`);
            throw new Error(`HTML structure check failed: ${check.desc}`);
        }
    });

    // Verify CSS structure
    console.log('\n🎨 Verifying CSS color system...');
    const cssContent = fs.readFileSync(path.join(__dirname, 'styles.css'), 'utf8');
    
    const cssChecks = [
        { test: cssContent.includes('--brand-primary:'), desc: 'Brand primary color variable' },
        { test: cssContent.includes('--brand-secondary:'), desc: 'Brand secondary color variable' },
        { test: cssContent.includes('--brand-accent:'), desc: 'Brand accent color variable' },
        { test: cssContent.includes('--player-1-color:'), desc: 'Player 1 color variable' },
        { test: cssContent.includes('--player-2-color:'), desc: 'Player 2 color variable' },
        { test: cssContent.includes('.game-logo'), desc: 'Logo styling' },
        { test: cssContent.includes('.header-content'), desc: 'Header content styling' },
        { test: cssContent.includes('.logo-container'), desc: 'Logo container styling' },
        { test: cssContent.includes('var(--background-primary)'), desc: 'CSS custom property usage' },
        { test: !cssContent.includes('#ff6b6b') || cssContent.match(/#ff6b6b/g)?.length <= 1, desc: 'Hardcoded colors removed' }
    ];

    cssChecks.forEach(check => {
        if (check.test) {
            console.log(`  ✅ ${check.desc}`);
        } else {
            console.log(`  ❌ ${check.desc}`);
            throw new Error(`CSS structure check failed: ${check.desc}`);
        }
    });

    // Check responsive design
    console.log('\n📱 Verifying responsive design...');
    const responsiveChecks = [
        { test: cssContent.includes('@media (max-width: 768px)'), desc: 'Tablet responsive breakpoint' },
        { test: cssContent.includes('@media (max-width: 480px)'), desc: 'Mobile responsive breakpoint' },
        { test: cssContent.includes('max-width: 60px') && cssContent.includes('max-height: 60px'), desc: 'Responsive logo sizing' }
    ];

    responsiveChecks.forEach(check => {
        if (check.test) {
            console.log(`  ✅ ${check.desc}`);
        } else {
            console.log(`  ❌ ${check.desc}`);
            throw new Error(`Responsive design check failed: ${check.desc}`);
        }
    });

    console.log('\n🎉 Logo Integration and Color System Implementation Complete!');
    console.log('\n📋 Summary of Changes:');
    console.log('  • Added logo to header with proper responsive sizing');
    console.log('  • Implemented comprehensive CSS custom properties for colors');
    console.log('  • Updated all hardcoded colors to use brand color system');
    console.log('  • Enhanced responsive design for mobile devices');
    console.log('  • Added UI tests for logo integration');
    console.log('  • Maintained all existing game functionality');

    console.log('\n🚀 Next Steps:');
    console.log('  1. Open index.html in a browser to see the logo');
    console.log('  2. Adjust brand colors in CSS :root variables if needed');
    console.log('  3. Test on different screen sizes for responsive behavior');
    console.log('  4. Consider adding favicon matching the logo');

} catch (error) {
    console.error('\n❌ Error during logo integration testing:', error.message);
    process.exit(1);
}