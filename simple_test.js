const { execSync } = require('child_process');

try {
    console.log('Running a single portal test...');
    const testOutput = execSync('npm test -- --testNamePattern="should place exactly 4 portal blocks"', { 
        encoding: 'utf8',
        cwd: '/workspace'
    });
    console.log('Test output:', testOutput);
} catch (error) {
    console.error('Error occurred:', error.message);
    if (error.stdout) {
        console.log('STDOUT:', error.stdout);
    }
    if (error.stderr) {
        console.log('STDERR:', error.stderr);
    }
}