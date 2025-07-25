#!/usr/bin/env node
const { execSync } = require('child_process');
const fs = require('fs');

console.log('🔧 Testing Animation Speed Implementation...\n');

try {
    // Build the project
    console.log('1. Building TypeScript project...');
    execSync('npm run build', { stdio: 'inherit' });
    console.log('✅ Build successful\n');

    // Check if the compiled files exist
    console.log('2. Checking compiled files...');
    const requiredFiles = [
        'dist/index.js',
        'dist/Game.js',
        'dist/GameUI.js',
        'dist/Grid.js',
        'dist/types.js'
    ];

    let allFilesExist = true;
    for (const file of requiredFiles) {
        if (fs.existsSync(file)) {
            console.log(`   ✅ ${file} exists`);
        } else {
            console.log(`   ❌ ${file} missing`);
            allFilesExist = false;
        }
    }

    if (!allFilesExist) {
        throw new Error('Some compiled files are missing');
    }

    console.log('\n3. Checking AnimationSpeed enum in compiled types.js...');
    const typesContent = fs.readFileSync('dist/types.js', 'utf8');
    
    const animationSpeedChecks = [
        'AnimationSpeed',
        'SLOW',
        'NORMAL', 
        'FAST',
        'INSTANT'
    ];

    let enumFound = true;
    for (const check of animationSpeedChecks) {
        if (typesContent.includes(check)) {
            console.log(`   ✅ Found ${check} in types.js`);
        } else {
            console.log(`   ❌ Missing ${check} in types.js`);
            enumFound = false;
        }
    }

    if (!enumFound) {
        throw new Error('AnimationSpeed enum not properly compiled');
    }

    console.log('\n4. Checking GameUI.js for animation speed functionality...');
    const gameUIContent = fs.readFileSync('dist/GameUI.js', 'utf8');
    
    const gameUIChecks = [
        'animationSpeedSelect',
        'currentAnimationSpeed',
        'animationTimings',
        'handleAnimationSpeedChange',
        'updateAnimationTiming',
        'getAnimatedDuration'
    ];

    let gameUIComplete = true;
    for (const check of gameUIChecks) {
        if (gameUIContent.includes(check)) {
            console.log(`   ✅ Found ${check} in GameUI.js`);
        } else {
            console.log(`   ❌ Missing ${check} in GameUI.js`);
            gameUIComplete = false;
        }
    }

    if (!gameUIComplete) {
        throw new Error('GameUI animation speed functionality not properly compiled');
    }

    console.log('\n5. Checking HTML for animation speed dropdown...');
    const htmlContent = fs.readFileSync('index.html', 'utf8');
    
    const htmlChecks = [
        'animation-speed-select',
        'Animation Speed:',
        'value="SLOW"',
        'value="NORMAL"',
        'value="FAST"',
        'value="INSTANT"'
    ];

    let htmlComplete = true;
    for (const check of htmlChecks) {
        if (htmlContent.includes(check)) {
            console.log(`   ✅ Found ${check} in HTML`);
        } else {
            console.log(`   ❌ Missing ${check} in HTML`);
            htmlComplete = false;
        }
    }

    if (!htmlComplete) {
        throw new Error('HTML dropdown not properly implemented');
    }

    console.log('\n6. Checking CSS for animation speed styles...');
    const cssContent = fs.readFileSync('styles.css', 'utf8');
    
    const cssChecks = [
        'animation-speed-control',
        'speed-select',
        '--ball-transition-duration',
        '--cell-transition-duration',
        'var(--ball-transition-duration)',
        'var(--cell-transition-duration)'
    ];

    let cssComplete = true;
    for (const check of cssChecks) {
        if (cssContent.includes(check)) {
            console.log(`   ✅ Found ${check} in CSS`);
        } else {
            console.log(`   ❌ Missing ${check} in CSS`);
            cssComplete = false;
        }
    }

    if (!cssComplete) {
        throw new Error('CSS animation speed styles not properly implemented');
    }

    console.log('\n🎉 Animation Speed Implementation Test PASSED!');
    console.log('\n📋 Summary:');
    console.log('   ✅ TypeScript compilation successful');
    console.log('   ✅ AnimationSpeed enum properly defined');
    console.log('   ✅ GameUI animation speed functionality implemented');
    console.log('   ✅ HTML dropdown control added');
    console.log('   ✅ CSS styles and variables implemented');
    
    console.log('\n🚀 Next Steps:');
    console.log('   1. Open index.html in a browser');
    console.log('   2. Start a new game');
    console.log('   3. Test different animation speeds from the dropdown');
    console.log('   4. Verify that animations speed up/slow down accordingly');
    console.log('   5. Test instant mode for immediate ball placement');

} catch (error) {
    console.error('\n❌ Animation Speed Implementation Test FAILED!');
    console.error('Error:', error.message);
    process.exit(1);
}