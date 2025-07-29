const { execSync } = require('child_process');

console.log('Running ball stuck fix test...');

try {
    execSync('node test_ball_stuck_fix.js', { stdio: 'inherit' });
} catch (error) {
    console.error('Test failed:', error.message);
    process.exit(1);
}