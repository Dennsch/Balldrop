const { execSync } = require('child_process');

try {
    console.log('Running Grid tests to verify portal implementation...');
    const output = execSync('npm test -- --testPathPattern=Grid.test.ts', { 
        encoding: 'utf8',
        cwd: '/workspace'
    });
    console.log(output);
} catch (error) {
    console.error('Test failed:', error.stdout || error.message);
    process.exit(1);
}