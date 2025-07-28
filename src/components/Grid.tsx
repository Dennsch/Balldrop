import React, { useEffect, useState } from 'react';
import { Game } from '../Game.js';
import { AnimationSpeed } from '../types.js';
import Cell from './Cell.js';

interface GridProps {
  game: Game;
  animationSpeed: AnimationSpeed;
}

const Grid: React.FC<GridProps> = ({ game, animationSpeed }) => {
  const [gridData, setGridData] = useState(game.getGrid().getCells());
  const gridSize = game.getGrid().getSize();

  // Update animation timing CSS variables
  useEffect(() => {
    const animationTimings = {
      [AnimationSpeed.SLOW]: {
        multiplier: 2.0,
        cssMultiplier: 2.0,
      },
      [AnimationSpeed.NORMAL]: {
        multiplier: 1.0,
        cssMultiplier: 1.0,
      },
      [AnimationSpeed.FAST]: {
        multiplier: 0.5,
        cssMultiplier: 0.5,
      },
      [AnimationSpeed.INSTANT]: {
        multiplier: 0,
        cssMultiplier: 0.01,
      },
    };

    const timing = animationTimings[animationSpeed];
    const root = document.documentElement;

    // Update CSS custom properties for animations
    root.style.setProperty(
      "--ball-transition-duration",
      `${0.35 * timing.cssMultiplier}s`
    );
    root.style.setProperty(
      "--cell-transition-duration",
      `${0.15 * timing.cssMultiplier}s`
    );
    root.style.setProperty(
      "--button-transition-duration",
      `${0.2 * timing.cssMultiplier}s`
    );
    root.style.setProperty(
      "--fall-animation-duration",
      `${0.25 * timing.cssMultiplier}s`
    );
    root.style.setProperty(
      "--box-hit-animation-duration",
      `${0.3 * timing.cssMultiplier}s`
    );
    root.style.setProperty(
      "--arrow-rotate-duration",
      `${0.2 * timing.cssMultiplier}s`
    );
    root.style.setProperty(
      "--arrow-transition-duration",
      `${0.15 * timing.cssMultiplier}s`
    );
    root.style.setProperty(
      "--bottom-row-effect-duration",
      `${0.8 * timing.cssMultiplier}s`
    );
    root.style.setProperty(
      "--ball-place-animation-duration",
      `${0.4 * timing.cssMultiplier}s`
    );
  }, [animationSpeed]);

  // Update grid data when game state changes
  useEffect(() => {
    setGridData(game.getGrid().getCells());
  }, [game]);

  // Create grid cells
  const cells = [];
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      cells.push(
        <Cell
          key={`${row}-${col}`}
          row={row}
          col={col}
          cell={gridData[row][col]}
        />
      );
    }
  }

  return (
    <div className="grid" id="game-grid">
      {cells}
    </div>
  );
};

export default Grid;