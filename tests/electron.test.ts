/**
 * Electron-specific tests
 * These tests verify that the Electron packaging setup is correct
 */

import * as fs from 'fs';
import * as path from 'path';

describe('Electron Setup', () => {
    const projectRoot = path.join(__dirname, '..');

    test('should have required Electron files', () => {
        const requiredFiles = [
            'electron/main.ts',
            'tsconfig.electron.json',
            'assets/icon.png'
        ];

        requiredFiles.forEach(file => {
            const filePath = path.join(projectRoot, file);
            expect(fs.existsSync(filePath)).toBe(true);
        });
    });

    test('should have correct package.json configuration', () => {
        const packageJsonPath = path.join(projectRoot, 'package.json');
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

        // Check main entry point
        expect(packageJson.main).toBe('dist/electron/main.js');

        // Check required scripts
        const requiredScripts = [
            'build:electron',
            'build:all',
            'electron:dev',
            'dist:mac',
            'dist:win'
        ];

        requiredScripts.forEach(script => {
            expect(packageJson.scripts).toHaveProperty(script);
        });

        // Check required dependencies
        const requiredDevDeps = ['electron', 'electron-builder', '@types/node'];
        requiredDevDeps.forEach(dep => {
            expect(packageJson.devDependencies).toHaveProperty(dep);
        });

        // Check build configuration
        expect(packageJson.build).toBeDefined();
        expect(packageJson.build.appId).toBe('com.balldropgame.app');
        expect(packageJson.build.productName).toBe('Balldrop Game');
    });

    test('should have valid TypeScript configuration for Electron', () => {
        const tsConfigPath = path.join(projectRoot, 'tsconfig.electron.json');
        const tsConfig = JSON.parse(fs.readFileSync(tsConfigPath, 'utf8'));

        expect(tsConfig.compilerOptions.target).toBe('ES2020');
        expect(tsConfig.compilerOptions.module).toBe('CommonJS');
        expect(tsConfig.compilerOptions.outDir).toBe('./dist/electron');
        expect(tsConfig.compilerOptions.rootDir).toBe('./electron');
        expect(tsConfig.include).toContain('electron/**/*');
    });

    test('should have valid Electron main process structure', () => {
        const mainTsPath = path.join(projectRoot, 'electron/main.ts');
        const mainTsContent = fs.readFileSync(mainTsPath, 'utf8');

        // Check for required Electron imports
        expect(mainTsContent).toContain("import { app, BrowserWindow");
        
        // Check for main window creation
        expect(mainTsContent).toContain('createWindow');
        expect(mainTsContent).toContain('new BrowserWindow');
        
        // Check for security settings
        expect(mainTsContent).toContain('nodeIntegration: false');
        expect(mainTsContent).toContain('contextIsolation: true');
        
        // Check for app lifecycle handlers
        expect(mainTsContent).toContain('app.whenReady');
        expect(mainTsContent).toContain('window-all-closed');
    });

    test('should have proper file structure for packaging', () => {
        const packageJsonPath = path.join(projectRoot, 'package.json');
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

        const expectedFiles = packageJson.build.files;
        expect(expectedFiles).toContain('dist/**/*');
        expect(expectedFiles).toContain('index.html');
        expect(expectedFiles).toContain('styles.css');
        expect(expectedFiles).toContain('package.json');
    });

    test('should have platform-specific build configurations', () => {
        const packageJsonPath = path.join(projectRoot, 'package.json');
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

        // Mac configuration
        expect(packageJson.build.mac).toBeDefined();
        expect(packageJson.build.mac.category).toBe('public.app-category.games');
        expect(packageJson.build.mac.target).toBeDefined();

        // Windows configuration
        expect(packageJson.build.win).toBeDefined();
        expect(packageJson.build.win.target).toBeDefined();

        // Check for multi-architecture support on Mac
        const macTarget = packageJson.build.mac.target[0];
        expect(macTarget.arch).toContain('x64');
        expect(macTarget.arch).toContain('arm64');
    });
});

describe('Electron Integration', () => {
    test('should maintain compatibility with existing game code', () => {
        // Verify that the existing game files are still accessible
        const projectRoot = path.join(__dirname, '..');
        const gameFiles = [
            'src/Game.ts',
            'src/GameUI.ts',
            'src/Grid.ts',
            'src/index.ts',
            'src/types.ts'
        ];

        gameFiles.forEach(file => {
            const filePath = path.join(projectRoot, file);
            expect(fs.existsSync(filePath)).toBe(true);
        });
    });

    test('should have HTML file that works with Electron', () => {
        const projectRoot = path.join(__dirname, '..');
        const htmlPath = path.join(projectRoot, 'index.html');
        const htmlContent = fs.readFileSync(htmlPath, 'utf8');

        // Check that HTML references the compiled JavaScript
        expect(htmlContent).toContain('dist/index.js');
        
        // Check that HTML has proper structure for Electron
        expect(htmlContent).toContain('<html');
        expect(htmlContent).toContain('<head>');
        expect(htmlContent).toContain('<body>');
        expect(htmlContent).toContain('styles.css');
    });

    test('should preserve existing build process', () => {
        const projectRoot = path.join(__dirname, '..');
        const packageJsonPath = path.join(projectRoot, 'package.json');
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

        // Verify original scripts still exist
        expect(packageJson.scripts.build).toBeDefined();
        expect(packageJson.scripts.test).toBeDefined();
        expect(packageJson.scripts.serve).toBeDefined();
        
        // Verify TypeScript config for renderer still exists
        const tsConfigPath = path.join(projectRoot, 'tsconfig.json');
        expect(fs.existsSync(tsConfigPath)).toBe(true);
    });
});