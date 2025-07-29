#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('🔍 Running final requirement verification...\n');

try {
    const output = execSync('node final_requirement_check.js', { encoding: 'utf8' });
    console.log(output);
} catch (error) {
    console.error('Error running verification:', error.message);
}