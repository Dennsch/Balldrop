# Electron Packaging Guide

This document explains how to package the Balldrop Game as executable files for Mac and Windows using Electron.

## Overview

The Balldrop Game has been configured to run as a desktop application using Electron. This allows the web-based TypeScript game to be packaged as native executables for different operating systems.

## Prerequisites

- Node.js (version 16 or higher)
- npm (comes with Node.js)
- For Mac builds: macOS (cross-compilation possible but not recommended)
- For Windows builds: Windows or cross-compilation tools

## Installation

1. Install dependencies:
```bash
npm install
```

## Development

### Running in Development Mode

To run the game in Electron during development:

```bash
npm run electron:dev
```

This will:
1. Compile the TypeScript source code
2. Compile the Electron main process
3. Launch the Electron application

### Development Scripts

- `npm run build` - Compile renderer process TypeScript
- `npm run build:electron` - Compile main process TypeScript  
- `npm run build:all` - Compile both renderer and main process
- `npm run electron:dev` - Build and run in development mode

## Building Executables

### Build for Current Platform

```bash
npm run dist
```

### Build for Mac

```bash
npm run dist:mac
```

This creates:
- `.app` bundle for macOS
- `.dmg` installer for distribution
- Supports both Intel (x64) and Apple Silicon (arm64) architectures

### Build for Windows

```bash
npm run dist:win
```

This creates:
- `.exe` installer using NSIS
- Supports x64 architecture

### Build Output

Built executables are placed in the `dist-electron/` directory:

```
dist-electron/
├── mac/
│   ├── Balldrop Game.app
│   └── Balldrop Game-1.0.0.dmg
└── win-unpacked/
    └── Balldrop Game Setup 1.0.0.exe
```

## Project Structure

```
├── electron/           # Electron main process source
│   └── main.ts        # Main Electron application file
├── src/               # Game source code (renderer process)
├── dist/              # Compiled renderer process
├── dist/electron/     # Compiled main process
├── dist-electron/     # Built executables
├── assets/            # Application assets (icons, etc.)
├── tsconfig.json      # TypeScript config for renderer
├── tsconfig.electron.json  # TypeScript config for main process
└── package.json       # Dependencies and build configuration
```

## Configuration

### Application Settings

The application is configured in `package.json` under the `build` section:

- **App ID**: `com.balldropgame.app`
- **Product Name**: `Balldrop Game`
- **Category**: Games (macOS)
- **Window Size**: 1200x900 (resizable, minimum 800x600)

### Electron Main Process

The main process (`electron/main.ts`) handles:
- Window creation and management
- Application menu
- Security settings
- Platform-specific behavior

### Security

The Electron app is configured with security best practices:
- Node integration disabled in renderer
- Context isolation enabled
- Remote module disabled
- Web security enabled

## Features

### Application Menu

The desktop app includes a native menu with:
- **Game**: New Game, Reset, Quit
- **View**: Reload, Developer Tools, Zoom controls
- **Help**: About dialog

### Keyboard Shortcuts

- `Cmd/Ctrl + N`: New Game
- `Cmd/Ctrl + R`: Reset Game
- `Cmd/Ctrl + Shift + R`: Reload Application
- `Cmd/Ctrl + I`: Toggle Developer Tools
- `Cmd/Ctrl + 0`: Reset Zoom
- `Cmd/Ctrl + Plus`: Zoom In
- `Cmd/Ctrl + Minus`: Zoom Out

## Testing

Test the Electron setup:

```bash
node test_electron_setup.js
```

This validates:
- Required files exist
- TypeScript compilation works
- Package.json configuration is correct
- HTML file references are valid

## Troubleshooting

### Common Issues

1. **Build fails with "electron not found"**
   - Run `npm install` to install dependencies

2. **TypeScript compilation errors**
   - Check that all source files are valid TypeScript
   - Run `npm run build` to see detailed errors

3. **App window doesn't open**
   - Check the console for errors
   - Ensure `index.html` and `styles.css` exist
   - Verify compiled JavaScript files are in `dist/`

4. **Menu items don't work**
   - Ensure the game objects are available globally
   - Check browser console for JavaScript errors

### Platform-Specific Issues

**macOS:**
- Code signing may be required for distribution
- Gatekeeper may block unsigned apps
- Use `xattr -cr "Balldrop Game.app"` to remove quarantine

**Windows:**
- Windows Defender may flag unsigned executables
- Consider code signing for production distribution

## Distribution

### For Development/Testing
- Share the built `.app` or `.exe` files directly
- Recipients may need to bypass security warnings for unsigned apps

### For Production
- Consider code signing certificates
- Set up proper app notarization (macOS)
- Create proper installers with license agreements

## Web Version

The original web version remains available:
- `npm run serve` - Start development server
- Open `http://localhost:8080` in browser

Both versions share the same game code and functionality.

## Advanced Configuration

### Custom Icons
Replace `assets/icon.png` with your custom application icon:
- macOS: 512x512 PNG recommended
- Windows: ICO format with multiple sizes recommended

### Build Options
Modify the `build` section in `package.json` to customize:
- Target platforms and architectures
- Installer options
- File associations
- Auto-updater configuration

### Environment Variables
- `NODE_ENV=development` - Enables developer tools by default
- Custom environment variables can be added to the main process

## Support

For issues specific to Electron packaging, check:
- [Electron Documentation](https://www.electronjs.org/docs)
- [Electron Builder Documentation](https://www.electron.build/)
- Game-specific issues should be reported to the main project repository