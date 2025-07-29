const { execSync } = require('child_process');

try {
    console.log('Running logo integration test...');
    execSync('node test_logo_integration.js', { stdio: 'inherit' });
} catch (error) {
    console.error('Test failed:', error.message);
    process.exit(1);
}