#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔄 Testing React Conversion...\n');

// Test 1: Check if React dependencies are installed
console.log('1. Checking React dependencies...');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const hasDeps = packageJson.dependencies && 
                  packageJson.dependencies.react && 
                  packageJson.dependencies['react-dom'];
  const hasDevDeps = packageJson.devDependencies && 
                     packageJson.devDependencies['@types/react'] && 
                     packageJson.devDependencies['@types/react-dom'];
  
  if (hasDeps && hasDevDeps) {
    console.log('✅ React dependencies found');
  } else {
    console.log('❌ Missing React dependencies');
    process.exit(1);
  }
} catch (error) {
  console.log('❌ Error reading package.json:', error.message);
  process.exit(1);
}

// Test 2: Check if TypeScript config supports JSX
console.log('2. Checking TypeScript configuration...');
try {
  const tsConfig = JSON.parse(fs.readFileSync('tsconfig.json', 'utf8'));
  if (tsConfig.compilerOptions && tsConfig.compilerOptions.jsx) {
    console.log('✅ TypeScript JSX configuration found');
  } else {
    console.log('❌ TypeScript JSX configuration missing');
    process.exit(1);
  }
} catch (error) {
  console.log('❌ Error reading tsconfig.json:', error.message);
  process.exit(1);
}

// Test 3: Check if React components exist
console.log('3. Checking React components...');
const requiredFiles = [
  'src/App.tsx',
  'src/index.tsx',
  'src/components/GameHeader.tsx',
  'src/components/GameBoard.tsx',
  'src/components/GameControls.tsx',
  'src/components/GameStatus.tsx',
  'src/components/Grid.tsx',
  'src/components/Cell.tsx',
  'src/components/ColumnSelectors.tsx'
];

let allFilesExist = true;
for (const file of requiredFiles) {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file} exists`);
  } else {
    console.log(`❌ ${file} missing`);
    allFilesExist = false;
  }
}

if (!allFilesExist) {
  console.log('❌ Some React components are missing');
  process.exit(1);
}

// Test 4: Check if HTML has been updated for React
console.log('4. Checking HTML structure...');
try {
  const htmlContent = fs.readFileSync('index.html', 'utf8');
  if (htmlContent.includes('<div id="root">')) {
    console.log('✅ HTML updated for React root element');
  } else {
    console.log('❌ HTML missing React root element');
    process.exit(1);
  }
} catch (error) {
  console.log('❌ Error reading index.html:', error.message);
  process.exit(1);
}

// Test 5: Try to build the project
console.log('5. Testing TypeScript compilation...');
try {
  execSync('npm run build', { stdio: 'pipe' });
  console.log('✅ TypeScript compilation successful');
} catch (error) {
  console.log('❌ TypeScript compilation failed');
  console.log('Error output:', error.stdout?.toString() || error.message);
  process.exit(1);
}

// Test 6: Check if compiled files exist
console.log('6. Checking compiled output...');
const compiledFiles = [
  'dist/App.js',
  'dist/index.js',
  'dist/components/GameHeader.js',
  'dist/components/GameBoard.js'
];

let allCompiledExist = true;
for (const file of compiledFiles) {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file} compiled`);
  } else {
    console.log(`❌ ${file} not compiled`);
    allCompiledExist = false;
  }
}

if (!allCompiledExist) {
  console.log('❌ Some files failed to compile');
  process.exit(1);
}

console.log('\n🎉 React conversion test completed successfully!');
console.log('\nNext steps:');
console.log('1. Install dependencies: npm install');
console.log('2. Build the project: npm run build');
console.log('3. Test the application: npm run serve');
console.log('4. Run tests: npm test');