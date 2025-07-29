#!/usr/bin/env node

/**
 * Electron Build Verification Script
 * This script verifies that the Electron packaging setup works correctly
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Verifying Electron Build Setup...\n');

let hasErrors = false;

function logError(message) {
    console.log(`❌ ${message}`);
    hasErrors = true;
}

function logSuccess(message) {
    console.log(`✅ ${message}`);
}

function logInfo(message) {
    console.log(`ℹ️  ${message}`);
}

// Step 1: Verify file structure
console.log('1. Verifying file structure...');
const requiredFiles = [
    { path: 'package.json', description: 'Package configuration' },
    { path: 'tsconfig.json', description: 'TypeScript config (renderer)' },
    { path: 'tsconfig.electron.json', description: 'TypeScript config (main)' },
    { path: 'electron/main.ts', description: 'Electron main process' },
    { path: 'src/index.ts', description: 'Game entry point' },
    { path: 'index.html', description: 'HTML template' },
    { path: 'styles.css', description: 'CSS styles' }
];

requiredFiles.forEach(({ path: filePath, description }) => {
    if (fs.existsSync(filePath)) {
        logSuccess(`${description} exists`);
    } else {
        logError(`${description} missing: ${filePath}`);
    }
});

// Step 2: Verify package.json configuration
console.log('\n2. Verifying package.json configuration...');
try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    
    // Check main entry point
    if (packageJson.main === 'dist/electron/main.js') {
        logSuccess('Main entry point configured correctly');
    } else {
        logError(`Main entry point should be 'dist/electron/main.js', got '${packageJson.main}'`);
    }
    
    // Check required scripts
    const requiredScripts = [
        'build:electron',
        'build:all', 
        'electron:dev',
        'dist:mac',
        'dist:win'
    ];
    
    requiredScripts.forEach(script => {
        if (packageJson.scripts && packageJson.scripts[script]) {
            logSuccess(`Script '${script}' configured`);
        } else {
            logError(`Script '${script}' missing`);
        }
    });
    
    // Check build configuration
    if (packageJson.build) {
        logSuccess('Electron builder configuration present');
        
        if (packageJson.build.appId) {
            logSuccess(`App ID configured: ${packageJson.build.appId}`);
        } else {
            logError('App ID not configured');
        }
        
        if (packageJson.build.productName) {
            logSuccess(`Product name configured: ${packageJson.build.productName}`);
        } else {
            logError('Product name not configured');
        }
    } else {
        logError('Electron builder configuration missing');
    }
    
} catch (error) {
    logError(`Failed to parse package.json: ${error.message}`);
}

// Step 3: Test TypeScript compilation
console.log('\n3. Testing TypeScript compilation...');
try {
    logInfo('Compiling renderer process...');
    execSync('npx tsc', { stdio: 'pipe' });
    logSuccess('Renderer process compiled successfully');
    
    logInfo('Compiling main process...');
    execSync('npx tsc -p tsconfig.electron.json', { stdio: 'pipe' });
    logSuccess('Main process compiled successfully');
    
} catch (error) {
    logError(`TypeScript compilation failed: ${error.message}`);
    if (error.stdout) {
        console.log('STDOUT:', error.stdout.toString());
    }
    if (error.stderr) {
        console.log('STDERR:', error.stderr.toString());
    }
}

// Step 4: Verify compiled output
console.log('\n4. Verifying compiled output...');
const expectedOutput = [
    { path: 'dist/index.js', description: 'Main game file' },
    { path: 'dist/Game.js', description: 'Game class' },
    { path: 'dist/GameUI.js', description: 'Game UI class' },
    { path: 'dist/Grid.js', description: 'Grid class' },
    { path: 'dist/electron/main.js', description: 'Electron main process' }
];

expectedOutput.forEach(({ path: filePath, description }) => {
    if (fs.existsSync(filePath)) {
        logSuccess(`${description} compiled`);
    } else {
        logError(`${description} not found: ${filePath}`);
    }
});

// Step 5: Validate HTML references
console.log('\n5. Validating HTML file...');
try {
    const htmlContent = fs.readFileSync('index.html', 'utf8');
    
    if (htmlContent.includes('dist/index.js')) {
        logSuccess('HTML references compiled JavaScript');
    } else {
        logError('HTML does not reference dist/index.js');
    }
    
    if (htmlContent.includes('styles.css')) {
        logSuccess('HTML references CSS file');
    } else {
        logError('HTML does not reference styles.css');
    }
    
    if (htmlContent.includes('type="module"')) {
        logSuccess('HTML uses ES modules');
    } else {
        logInfo('HTML does not use ES modules (this is okay)');
    }
    
} catch (error) {
    logError(`Failed to read HTML file: ${error.message}`);
}

// Step 6: Test basic Electron functionality (if possible)
console.log('\n6. Testing Electron setup...');
try {
    // Check if electron is available
    execSync('npx electron --version', { stdio: 'pipe' });
    logSuccess('Electron is available');
    
    // Note: We can't actually launch Electron in a headless environment
    logInfo('Electron app launch test skipped (requires display)');
    
} catch (error) {
    logError('Electron not available or not working');
}

// Summary
console.log('\n' + '='.repeat(50));
if (hasErrors) {
    console.log('❌ Build verification completed with errors!');
    console.log('\nPlease fix the issues above before proceeding.');
    console.log('\nCommon fixes:');
    console.log('- Run "npm install" to install dependencies');
    console.log('- Check that all required files exist');
    console.log('- Verify TypeScript configuration is correct');
    process.exit(1);
} else {
    console.log('✅ Build verification completed successfully!');
    console.log('\nYour Electron setup is ready!');
    console.log('\nNext steps:');
    console.log('1. Run "npm run electron:dev" to test the app');
    console.log('2. Run "npm run dist:mac" to build for macOS');
    console.log('3. Run "npm run dist:win" to build for Windows');
    console.log('4. Check the "dist-electron" folder for built executables');
}

console.log('\n📖 See ELECTRON_PACKAGING.md for detailed instructions');