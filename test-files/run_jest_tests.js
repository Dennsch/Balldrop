#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

console.log('🧪 Running Jest Tests...\n');

try {
    // Run Jest tests
    console.log('Running Jest tests...');
    const testOutput = execSync('npm test', { 
        encoding: 'utf8', 
        cwd: path.resolve(__dirname, '..'),
        stdio: 'pipe'
    });
    
    console.log('✅ All tests passed!');
    console.log('\nTest output:');
    console.log(testOutput);
    
} catch (error) {
    console.log('❌ Some tests failed:');
    console.log('\nSTDOUT:');
    console.log(error.stdout);
    console.log('\nSTDERR:');
    console.log(error.stderr);
    
    // Check if it's specifically hard mode tests failing
    if (error.stdout && error.stdout.includes('hard mode')) {
        console.log('\n🔍 Hard mode tests are failing - this is expected due to our changes');
        console.log('The failing tests need to be updated to reflect the new behavior');
    }
    
    process.exit(1);
}

console.log('\n🎉 Jest Testing Complete!');