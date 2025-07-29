import React from 'react';
import { Game } from '../Game.js';
import { Player, GameMode } from '../types.js';

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
    if (!isAnimating && game.canDropInColumn(column)) {
      onColumnClick(column);
    }
  };

  const gameMode = game.getGameMode();
  const columnWinners = game.getGrid().getColumnWinners();

  return (
    <div className="column-selectors" id="column-selectors">
      {columns.map(column => {
        const canDrop = game.canDropInColumn(column);
        const isDisabled = isAnimating || !canDrop;
        const columnWinner = columnWinners[column];
        
        // Determine button styling based on game mode and column status
        let buttonClasses = 'column-selector';
        let buttonText = (column + 1).toString();
        let titleText = `Drop ball in column ${column + 1}`;
        
        if (isDisabled) {
          buttonClasses += ' disabled';
        }
        
        if (!canDrop) {
          buttonClasses += ' used-column';
          buttonText += ' ✓';
          titleText += ' (unavailable)';
        }
        
        // In Hard Mode, show which player secured the column
        if (gameMode === GameMode.HARD_MODE && columnWinner !== null) {
          if (columnWinner === Player.PLAYER1) {
            buttonClasses += ' secured-by-player1';
            titleText += ' - Secured by Player 1';
          } else if (columnWinner === Player.PLAYER2) {
            buttonClasses += ' secured-by-player2';
            titleText += ' - Secured by Player 2';
          }
        }
        
        return (
          <button
            key={column}
            className={buttonClasses}
            onClick={() => handleColumnClick(column)}
            disabled={isDisabled}
            title={titleText}
          >
            {buttonText}
          </button>
        );
      })}
    </div>
  );
};

export default ColumnSelectors;