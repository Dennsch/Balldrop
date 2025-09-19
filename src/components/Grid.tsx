import React, { useEffect, useState } from "react";
import { Game } from "../Game.js";
import Cell from "./Cell.js";

interface GridProps {
  game: Game;
  onCellClick?: (row: number, col: number) => void;
  highlightedColumn?: number | null;
}

const Grid: React.FC<GridProps> = ({ game, onCellClick, highlightedColumn }) => {
  const [gridData, setGridData] = useState(game.getGrid().getCells());
  const gridSize = game.getGrid().getSize();

  // Set fixed fast animation timing CSS variables
  useEffect(() => {
    const CSS_MULTIPLIER = 0.5; // Fast speed
    const root = document.documentElement;

    // Update CSS custom properties for fast animations
    root.style.setProperty(
      "--ball-transition-duration",
      `${0.35 * CSS_MULTIPLIER}s`
    );
    root.style.setProperty(
      "--cell-transition-duration",
      `${0.15 * CSS_MULTIPLIER}s`
    );
    root.style.setProperty(
      "--button-transition-duration",
      `${0.2 * CSS_MULTIPLIER}s`
    );
    root.style.setProperty(
      "--fall-animation-duration",
      `${0.25 * CSS_MULTIPLIER}s`
    );
    root.style.setProperty(
      "--box-hit-animation-duration",
      `${0.3 * CSS_MULTIPLIER}s`
    );
    root.style.setProperty(
      "--arrow-rotate-duration",
      `${0.2 * CSS_MULTIPLIER}s`
    );
    root.style.setProperty(
      "--arrow-transition-duration",
      `${0.15 * CSS_MULTIPLIER}s`
    );
    root.style.setProperty(
      "--bottom-row-effect-duration",
      `${0.8 * CSS_MULTIPLIER}s`
    );
    root.style.setProperty(
      "--ball-place-animation-duration",
      `${0.4 * CSS_MULTIPLIER}s`
    );
  }, []); // Run once on mount

  // Update grid data when game state changes
  useEffect(() => {
    setGridData(game.getGrid().getCells());
  }, [game]);

  // Create grid cells
  const cells = [];
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      const isHighlighted = highlightedColumn === col && row === 0;
      cells.push(
        <Cell
          key={`${row}-${col}`}
          row={row}
          col={col}
          cell={gridData[row][col]}
          onCellClick={onCellClick}
          isHighlighted={isHighlighted}
          currentPlayer={game.getCurrentPlayer()}
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
