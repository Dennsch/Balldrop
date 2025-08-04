#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

console.log('🔨 Building project and running tests...\n');

try {
    // Build the project
    console.log('1. Building TypeScript...');
    execSync('npm run build', { 
        cwd: path.resolve(__dirname, '..'),
        stdio: 'inherit'
    });
    
    console.log('\n2. Running tests...');
    execSync('npm test', { 
        cwd: path.resolve(__dirname, '..'),
        stdio: 'inherit'
    });
    
    console.log('\n✅ Build and tests completed successfully!');
    
} catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
}