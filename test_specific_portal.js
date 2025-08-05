const { execSync } = require('child_process');

try {
    console.log('Running specific portal test...');
    const output = execSync('npm test -- --testNamePattern="should teleport ball bidirectionally between portal pair 1"', { 
        encoding: 'utf8',
        cwd: '/workspace'
    });
    console.log(output);
} catch (error) {
    console.error('Test failed:', error.message);
    if (error.stdout) {
        console.log('STDOUT:', error.stdout);
    }
    if (error.stderr) {
        console.log('STDERR:', error.stderr);
    }
}