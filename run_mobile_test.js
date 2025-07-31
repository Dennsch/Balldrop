const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 Running Mobile Responsiveness Verification...');
console.log('================================================\n');

try {
    // Run the verification script
    const result = execSync('node test-files/verify_mobile_responsiveness.js', {
        cwd: '/workspace',
        encoding: 'utf8',
        stdio: 'inherit'
    });
    
    console.log('\n✅ Mobile responsiveness verification completed successfully!');
} catch (error) {
    console.error('❌ Error running mobile verification:', error.message);
    process.exit(1);
}