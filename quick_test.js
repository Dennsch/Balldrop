// Quick test to verify the ball stuck fix
const { execSync } = require('child_process');

console.log('Building project...');
try {
    execSync('npm run build', { stdio: 'inherit' });
} catch (error) {
    console.error('Build failed');
    process.exit(1);
}

console.log('\nRunning tests...');
try {
    execSync('npm test -- --testNamePattern="ball getting stuck"', { stdio: 'inherit' });
    console.log('\n✅ Ball stuck tests passed!');
} catch (error) {
    console.error('\n❌ Tests failed');
    process.exit(1);
}