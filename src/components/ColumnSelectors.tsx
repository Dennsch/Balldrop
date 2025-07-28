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
    console.log(`🔘 Column ${column} clicked!`);
    console.log(`   - isAnimating: ${isAnimating}`);
    console.log(`   - game.canDropInColumn(${column}): ${game.canDropInColumn(column)}`);
    console.log(`   - game.getState(): ${game.getState()}`);
    console.log(`   - game.getCurrentPlayer(): ${game.getCurrentPlayer()}`);
    
    if (!isAnimating && game.canDropInColumn(column)) {
      console.log(`✅ Calling onColumnClick(${column})`);
      onColumnClick(column);
    } else {
      console.log(`❌ Click blocked - animating: ${isAnimating}, canDrop: ${game.canDropInColumn(column)}`);
    }
  };

  return (
    <div className="column-selectors" id="column-selectors">
      {columns.map(column => {
        const canDrop = game.canDropInColumn(column);
        const isDisabled = isAnimating || !canDrop;
        
        return (
          <button
            key={column}
            className={`column-selector ${isDisabled ? 'disabled' : ''} ${!canDrop ? 'used-column' : ''}`}
            onClick={() => handleColumnClick(column)}
            disabled={isDisabled}
            title={`Drop ball in column ${column + 1}${!canDrop ? ' (unavailable)' : ''}`}
          >
            {column + 1}{!canDrop ? ' ✓' : ''}
          </button>
        );
      })}
    </div>
  );
};

export default ColumnSelectors;