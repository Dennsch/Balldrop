#!/usr/bin/env node

// Simple runner for the logo size reduction test
const { execSync } = require('child_process');

try {
    console.log('Running logo size reduction verification test...\n');
    execSync('node test_logo_size_reduction.js', { stdio: 'inherit', cwd: __dirname });
} catch (error) {
    console.error('Test execution failed:', error.message);
    process.exit(1);
}