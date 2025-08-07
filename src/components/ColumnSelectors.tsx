import React from 'react';
import { Game } from '../Game.js';
import { Player, GameMode, GameState } from '../types.js';

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
  const gameState = game.getState();
  const columnWinners = game.getGrid().getColumnWinners();
  const columnReservation = game.getColumnReservation();

  return (
    <div className="column-selectors" id="column-selectors">
      {columns.map(column => {
        const canDrop = game.canDropInColumn(column);
        const isDisabled = isAnimating || !canDrop;
        const columnWinner = columnWinners[column];
        const isReserved = columnReservation.reservedColumnOwners.has(column);
        const reservedBy = columnReservation.reservedColumnOwners.get(column);
        
        // Determine button styling based on game mode and column status
        let buttonClasses = 'column-selector';
        let buttonText = '⬇️';
        let titleText = `Drop ball in column ${column + 1}`;
        
        if (isDisabled) {
          buttonClasses += ' disabled';
        }
        
        // Handle different states for hard mode
        if (gameMode === GameMode.HARD_MODE) {
          if (gameState === GameState.COLUMN_RESERVATION_PHASE && isReserved) {
            // Show reserved columns with hovering ball indicator
            buttonClasses += ' reserved-column';
            if (reservedBy === Player.PLAYER1) {
              buttonClasses += ' reserved-by-player1';
              buttonText = '🔴'; // Red ball hovering
              titleText = `Column ${column + 1} - Reserved by Player 1`;
            } else if (reservedBy === Player.PLAYER2) {
              buttonClasses += ' reserved-by-player2';
              buttonText = '🔵'; // Blue ball hovering
              titleText = `Column ${column + 1} - Reserved by Player 2`;
            }
          } else if (gameState === GameState.BALL_RELEASE_PHASE && isReserved) {
            // Show reserved columns that can be released
            buttonClasses += ' reserved-column';
            const currentPlayer = game.getCurrentPlayer();
            
            if (reservedBy === Player.PLAYER1) {
              buttonClasses += ' reserved-by-player1';
              buttonText = '🔴'; // Red ball ready to release
              titleText = `Column ${column + 1} - Player 1 ball ready to release`;
              
              // Highlight if it's Player 1's turn and they can release from this column
              if (currentPlayer === Player.PLAYER1 && canDrop) {
                buttonClasses += ' current-player-turn';
                titleText += ' - Your turn!';
              } else if (currentPlayer !== Player.PLAYER1) {
                buttonClasses += ' not-current-turn';
                titleText += ' - Wait for your turn';
              }
            } else if (reservedBy === Player.PLAYER2) {
              buttonClasses += ' reserved-by-player2';
              buttonText = '🔵'; // Blue ball ready to release
              titleText = `Column ${column + 1} - Player 2 ball ready to release`;
              
              // Highlight if it's Player 2's turn and they can release from this column
              if (currentPlayer === Player.PLAYER2 && canDrop) {
                buttonClasses += ' current-player-turn';
                titleText += ' - Your turn!';
              } else if (currentPlayer !== Player.PLAYER2) {
                buttonClasses += ' not-current-turn';
                titleText += ' - Wait for your turn';
              }
            }
            
            // Add pulsing animation for columns available to current player
            if (canDrop) {
              buttonClasses += ' can-release';
            }
          } else if (columnWinner !== null) {
            // Show completed columns
            buttonClasses += ' used-column';
            buttonText = '✓';
            if (columnWinner === Player.PLAYER1) {
              buttonClasses += ' secured-by-player1';
              titleText = `Column ${column + 1} - Secured by Player 1`;
            } else if (columnWinner === Player.PLAYER2) {
              buttonClasses += ' secured-by-player2';
              titleText = `Column ${column + 1} - Secured by Player 2`;
            }
          }
        } else {
          // Normal mode behavior
          if (!canDrop) {
            buttonClasses += ' used-column';
            buttonText = '✓';
            titleText += ' (unavailable)';
          }
          
          if (columnWinner !== null) {
            if (columnWinner === Player.PLAYER1) {
              buttonClasses += ' secured-by-player1';
              titleText += ' - Secured by Player 1';
            } else if (columnWinner === Player.PLAYER2) {
              buttonClasses += ' secured-by-player2';
              titleText += ' - Secured by Player 2';
            }
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