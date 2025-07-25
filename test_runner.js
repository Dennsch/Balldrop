const { execSync } = require('child_process');

try {
    console.log('Building project...');
    execSync('npm run build', { stdio: 'inherit', cwd: '/workspace' });
    
    console.log('\nRunning tests...');
    execSync('npm test', { stdio: 'inherit', cwd: '/workspace' });
    
    console.log('\nAll tests passed!');
} catch (error) {
    console.error('Error occurred:', error.message);
    process.exit(1);
}