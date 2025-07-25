# Balldrop Game

A TypeScript browser-based game where two players compete by dropping balls in a 20x20 grid with directional boxes that redirect the balls.

**Now available as desktop executables for Mac and Windows!**

## Game Rules

- **Grid**: 20x20 grid of cells
- **Players**: 2 players, each with 10 balls
- **Objective**: Control the most columns by having your ball at the bottom
- **Mechanics**: 
  - Each column acts like Connect 4 - balls fall to the bottom
  - Random boxes with arrows (← or →) are placed on the grid before the game starts
  - When a ball hits a box, it gets redirected in the arrow's direction
  - The box then changes its arrow direction
  - The player with the most columns (determined by the bottom-most ball) wins

## Installation

1. Clone or download this repository
2. Install dependencies:
   ```bash
   npm install
   ```

## Desktop Executables

### Quick Start - Download Executables

Build executable files for your platform:

```bash
# For macOS (creates .app and .dmg)
npm run dist:mac

# For Windows (creates .exe installer)  
npm run dist:win

# For current platform
npm run dist
```

Built executables will be in the `dist-electron/` folder.

### Desktop Development

```bash
# Run as desktop app during development
npm run electron:dev

# Test the Electron setup
node verify_electron_build.js
```

📖 **See [ELECTRON_PACKAGING.md](ELECTRON_PACKAGING.md) for detailed desktop packaging instructions.**

## Web Browser Version

### Building the Game
```bash
# Compile TypeScript to JavaScript
npm run build

# Watch for changes and auto-compile
npm run dev
```

### Running the Game
```bash
# Start a local server
npm run serve
```
Then open your browser to `http://localhost:8080`

Alternatively, you can open `index.html` directly in your browser after building.

### Running Tests
```bash
# Run all tests
npm test

# Run tests with coverage
npm test -- --coverage
```

## Project Structure

```
/
├── src/
│   ├── types.ts      # Type definitions and enums
│   ├── Grid.ts       # Grid management and ball physics
│   ├── Game.ts       # Game logic and state management
│   ├── GameUI.ts     # DOM manipulation and user interface
│   └── index.ts      # Main entry point
├── tests/
│   ├── Grid.test.ts  # Grid class tests
│   ├── Game.test.ts  # Game class tests
│   └── setup.ts      # Jest configuration
├── index.html        # Game interface
├── styles.css        # Game styling
└── package.json      # Dependencies and scripts
```

## How to Play

1. Click "New Game" to start
2. Random boxes with arrows will be placed on the grid
3. Player 1 goes first (red balls)
4. Click on a column number to drop your ball
5. Watch as balls fall and potentially get redirected by boxes
6. Players alternate turns until all balls are used
7. The player controlling the most columns wins!

## Features

- **Responsive Design**: Works on desktop and mobile devices
- **Visual Feedback**: Animated ball drops and clear visual indicators
- **Game State Management**: Proper turn management and game flow
- **Collision Detection**: Accurate ball physics with box interactions
- **Win Condition**: Clear winner determination based on column control

## Technical Details

- **TypeScript**: Strongly typed for better code quality
- **Modular Architecture**: Separated concerns with distinct classes
- **Event-Driven**: Reactive UI updates based on game state changes
- **Tested**: Comprehensive unit tests for game logic
- **Browser Compatible**: Works in all modern browsers

## Development Notes

The game uses a modular architecture:

- `Grid`: Manages the 20x20 cell grid and ball physics
- `Game`: Handles game state, player turns, and win conditions  
- `GameUI`: Manages DOM interactions and visual updates
- `types`: Defines interfaces and enums for type safety

The ball dropping algorithm simulates physics by:
1. Finding the first empty cell in the selected column
2. Simulating the ball falling down
3. Checking for collisions with boxes or other balls
4. Redirecting the ball if it hits a box with an arrow
5. Changing the box's arrow direction after collision
6. Placing the ball at its final resting position