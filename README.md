# Dropple Game

A React TypeScript game where players drop balls in a grid with directional boxes.

## Getting Started

### Prerequisites
- Node.js (version 16 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

### Development

Start the development server:
```bash
npm run dev
```

The game will be available at `http://localhost:3000`

### Building for Production

Build the project:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

## Game Rules

- Players take turns dropping balls into columns using drag and drop
- Drag the colored ball from the drop area above the grid to any column
- Column highlighting shows where the ball will be placed when you release it
- Balls fall down and interact with directional boxes
- The goal is to get your balls to the bottom row
- Two game modes available: Normal and Hard Mode
- Supports both mouse and touch interactions for mobile devices

## Technologies Used

- React 18
- TypeScript
- Vite
- CSS3

## Project Structure

```
src/
├── components/          # React components
├── types.ts            # TypeScript type definitions
├── Game.ts             # Game logic
├── App.tsx             # Main App component
├── index.tsx           # Entry point
└── styles.css          # Global styles
```