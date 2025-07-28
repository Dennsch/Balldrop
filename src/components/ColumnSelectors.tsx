import React from 'react';
import { Game } from '../Game.js';

interface ColumnSelectorsProps {
  game: Game;
  onColumnClick: (column: number) => void;
  isAnimating: boolean;
}

const ColumnSelectors: React.FC<ColumnSelectorsProps> = ({
  game,
  onColumnClick,
  isAnimating
}) => {
  const gridSize = game.getGrid().getSize();
  const columns = Array.from({ length: gridSize }, (_, i) => i);

  const handleColumnClick = (column: number) => {
    if (!isAnimating) {
      onColumnClick(column);
    }
  };

  return (
    <div className="column-selectors" id="column-selectors">
      {columns.map(column => (
        <button
          key={column}
          className={`column-selector ${isAnimating ? 'disabled' : ''}`}
          onClick={() => handleColumnClick(column)}
          disabled={isAnimating}
          title={`Drop ball in column ${column + 1}`}
        >
          {column + 1}
        </button>
      ))}
    </div>
  );
};

export default ColumnSelectors;