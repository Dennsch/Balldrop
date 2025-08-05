const { execSync } = require('child_process');

try {
    console.log('Building the project...');
    execSync('npm run build', { 
        encoding: 'utf8',
        cwd: '/workspace',
        stdio: 'inherit'
    });
    
    console.log('Running portal tests...');
    const output = execSync('npm test -- --testPathPattern=Grid.test.ts --testNamePattern="portal"', { 
        encoding: 'utf8',
        cwd: '/workspace'
    });
    console.log(output);
} catch (error) {
    console.error('Test failed:', error.stdout || error.message);
    if (error.stderr) {
        console.log('STDERR:', error.stderr);
    }
    process.exit(1);
}