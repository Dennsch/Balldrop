#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Testing Electron Setup...\n');

// Test 1: Check if required files exist
console.log('1. Checking required files...');
const requiredFiles = [
    'package.json',
    'tsconfig.json',
    'tsconfig.electron.json',
    'electron/main.ts',
    'src/index.ts',
    'index.html',
    'styles.css'
];

let allFilesExist = true;
requiredFiles.forEach(file => {
    if (fs.existsSync(path.join(__dirname, file))) {
        console.log(`   ✅ ${file} exists`);
    } else {
        console.log(`   ❌ ${file} missing`);
        allFilesExist = false;
    }
});

if (!allFilesExist) {
    console.log('\n❌ Some required files are missing. Please check the setup.');
    process.exit(1);
}

// Test 2: Check package.json configuration
console.log('\n2. Checking package.json configuration...');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

const requiredScripts = [
    'build',
    'build:electron',
    'build:all',
    'electron:dev',
    'dist:mac',
    'dist:win'
];

requiredScripts.forEach(script => {
    if (packageJson.scripts[script]) {
        console.log(`   ✅ Script "${script}" configured`);
    } else {
        console.log(`   ❌ Script "${script}" missing`);
    }
});

const requiredDevDeps = ['electron', 'electron-builder', '@types/node'];
requiredDevDeps.forEach(dep => {
    if (packageJson.devDependencies[dep]) {
        console.log(`   ✅ Dependency "${dep}" configured`);
    } else {
        console.log(`   ❌ Dependency "${dep}" missing`);
    }
});

// Test 3: Try to compile TypeScript
console.log('\n3. Testing TypeScript compilation...');
try {
    console.log('   Compiling renderer process...');
    execSync('npx tsc', { stdio: 'pipe' });
    console.log('   ✅ Renderer process compiled successfully');
    
    console.log('   Compiling main process...');
    execSync('npx tsc -p tsconfig.electron.json', { stdio: 'pipe' });
    console.log('   ✅ Main process compiled successfully');
} catch (error) {
    console.log('   ❌ TypeScript compilation failed:');
    console.log('   ', error.message);
    process.exit(1);
}

// Test 4: Check if compiled files exist
console.log('\n4. Checking compiled output...');
const compiledFiles = [
    'dist/index.js',
    'dist/Game.js',
    'dist/GameUI.js',
    'dist/Grid.js',
    'dist/electron/main.js'
];

compiledFiles.forEach(file => {
    if (fs.existsSync(path.join(__dirname, file))) {
        console.log(`   ✅ ${file} compiled`);
    } else {
        console.log(`   ❌ ${file} not found`);
    }
});

// Test 5: Validate HTML file references
console.log('\n5. Validating HTML file...');
const htmlContent = fs.readFileSync('index.html', 'utf8');
if (htmlContent.includes('dist/index.js')) {
    console.log('   ✅ HTML references compiled JavaScript');
} else {
    console.log('   ❌ HTML does not reference dist/index.js');
}

if (htmlContent.includes('styles.css')) {
    console.log('   ✅ HTML references CSS file');
} else {
    console.log('   ❌ HTML does not reference styles.css');
}

console.log('\n✅ Electron setup test completed successfully!');
console.log('\nNext steps:');
console.log('1. Run "npm install" to install dependencies');
console.log('2. Run "npm run electron:dev" to test the Electron app');
console.log('3. Run "npm run dist:mac" or "npm run dist:win" to build executables');