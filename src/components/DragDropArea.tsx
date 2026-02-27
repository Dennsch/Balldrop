import React, { useState, useRef, useCallback, useEffect } from "react";
import { Game } from "../Game.js";
import { Player, GameMode, GameState } from "../types.js";

interface DragDropAreaProps {
  game: Game;
  onColumnClick: (column: number) => void;
  isAnimating: boolean;
  onColumnHighlight?: (column: number | null) => void;
}

const DragDropArea: React.FC<DragDropAreaProps> = ({
  game,
  onColumnClick,
  isAnimating,
  onColumnHighlight,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [highlightedColumn, setHighlightedColumn] = useState<number | null>(null);
  const [dragStarted, setDragStarted] = useState(false);
  const dragAreaRef = useRef<HTMLDivElement>(null);
  const dragBallRef = useRef<HTMLDivElement>(null);

  const gridSize = game.getGrid().getSize();
  const gameMode = game.getGameMode();
  const gameState = game.getState();
  const currentPlayer = game.getCurrentPlayer();
  const columnWinners = game.getGrid().getColumnWinners();
  const columnReservation = game.getColumnReservation();

  // Calculate which column is under the cursor/touch point
  const getColumnFromPosition = useCallback((clientX: number): number | null => {
    if (!dragAreaRef.current) return null;
    
    const rect = dragAreaRef.current.getBoundingClientRect();
    const relativeX = clientX - rect.left;
    const columnWidth = rect.width / gridSize;
    const column = Math.floor(relativeX / columnWidth);
    
    return column >= 0 && column < gridSize ? column : null;
  }, [gridSize]);

  // Check if a column can accept a ball drop
  const canDropInColumn = useCallback((column: number): boolean => {
    return !isAnimating && game.canDropInColumn(column);
  }, [game, isAnimating]);

  // Handle drag start
  const handleDragStart = useCallback((e: React.DragEvent) => {
    if (isAnimating) {
      e.preventDefault();
      return;
    }
    
    setDragStarted(true);
    setIsDragging(true);
    
    // Set drag image to be the ball
    if (dragBallRef.current) {
      e.dataTransfer.setDragImage(dragBallRef.current, 16, 16);
    }
    
    e.dataTransfer.effectAllowed = "move";
  }, [isAnimating]);

  // Handle drag over the drop area
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    
    if (!isDragging) return;
    
    const column = getColumnFromPosition(e.clientX);
    if (column !== null && canDropInColumn(column)) {
      e.dataTransfer.dropEffect = "move";
      setHighlightedColumn(column);
      onColumnHighlight?.(column);
    } else {
      e.dataTransfer.dropEffect = "none";
      setHighlightedColumn(null);
      onColumnHighlight?.(null);
    }
  }, [isDragging, getColumnFromPosition, canDropInColumn, onColumnHighlight]);

  // Handle drag enter
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  // Handle drag leave
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    // Only clear highlight if we're leaving the drag area entirely
    if (!dragAreaRef.current?.contains(e.relatedTarget as Node)) {
      setHighlightedColumn(null);
      onColumnHighlight?.(null);
    }
  }, [onColumnHighlight]);

  // Handle drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    
    const column = getColumnFromPosition(e.clientX);
    if (column !== null && canDropInColumn(column)) {
      onColumnClick(column);
    }
    
    setIsDragging(false);
    setHighlightedColumn(null);
    onColumnHighlight?.(null);
    setDragStarted(false);
  }, [getColumnFromPosition, canDropInColumn, onColumnClick, onColumnHighlight]);

  // Handle drag end
  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    setHighlightedColumn(null);
    onColumnHighlight?.(null);
    setDragStarted(false);
  }, [onColumnHighlight]);

  // Touch event handlers for mobile support
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (isAnimating) return;
    
    setDragStarted(true);
    setIsDragging(true);
    e.preventDefault();
  }, [isAnimating]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging) return;
    
    e.preventDefault();
    const touch = e.touches[0];
    const column = getColumnFromPosition(touch.clientX);
    
    if (column !== null && canDropInColumn(column)) {
      setHighlightedColumn(column);
      onColumnHighlight?.(column);
    } else {
      setHighlightedColumn(null);
      onColumnHighlight?.(null);
    }
  }, [isDragging, getColumnFromPosition, canDropInColumn, onColumnHighlight]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!isDragging) return;
    
    e.preventDefault();
    const touch = e.changedTouches[0];
    const column = getColumnFromPosition(touch.clientX);
    
    if (column !== null && canDropInColumn(column)) {
      onColumnClick(column);
    }
    
    setIsDragging(false);
    setHighlightedColumn(null);
    onColumnHighlight?.(null);
    setDragStarted(false);
  }, [isDragging, getColumnFromPosition, canDropInColumn, onColumnClick, onColumnHighlight]);

  // Get the current player's ball visual
  const getCurrentPlayerBall = () => {
    const color = currentPlayer === Player.PLAYER1 ? "#FF6B6B" : "#4ECDC4";
    const highlight = currentPlayer === Player.PLAYER1 ? "#FF8A8A" : "#7EDDD7";
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" fill={color} />
        <circle cx="12" cy="12" r="7" fill={highlight} opacity="0.3" />
        <circle cx="9" cy="9" r="2.5" fill="white" opacity="0.25" />
      </svg>
    );
  };

  const getCurrentPlayerColor = () => {
    return currentPlayer === Player.PLAYER1 ? "var(--player-1-color)" : "var(--player-2-color)";
  };

  // Generate column indicators with appropriate styling
  const renderColumnIndicators = () => {
    const columns = Array.from({ length: gridSize }, (_, i) => i);
    
    return columns.map((column) => {
      const canDrop = canDropInColumn(column);
      const columnWinner = columnWinners[column];
      const isReserved = columnReservation.reservedColumnOwners.has(column);
      const reservedBy = columnReservation.reservedColumnOwners.get(column);
      const isHighlighted = highlightedColumn === column;

      let indicatorClasses = "column-indicator";
      let indicatorText = "";
      let titleText = `Column ${column + 1}`;

      if (isHighlighted && canDrop) {
        indicatorClasses += " highlighted";
        // Don't show ball emoji in indicator when highlighted - it will be shown in the grid cell
        indicatorText = "";
        titleText += " - Drop here!";
      } else if (gameMode === GameMode.HARD_MODE) {
        if (gameState === GameState.COLUMN_RESERVATION_PHASE && isReserved) {
          indicatorClasses += " reserved-column";
          if (reservedBy === Player.PLAYER1) {
            indicatorClasses += " reserved-by-player1";
            indicatorText = "🔴";
            titleText += " - Reserved by Player 1";
          } else if (reservedBy === Player.PLAYER2) {
            indicatorClasses += " reserved-by-player2";
            indicatorText = "🔵";
            titleText += " - Reserved by Player 2";
          }
        } else if (gameState === GameState.BALL_RELEASE_PHASE && isReserved) {
          indicatorClasses += " reserved-column";
          if (reservedBy === Player.PLAYER1) {
            indicatorClasses += " reserved-by-player1";
            indicatorText = "🔴";
            titleText += " - Player 1 ball ready to release";
            if (currentPlayer === Player.PLAYER1 && canDrop) {
              indicatorClasses += " current-player-turn";
              titleText += " - Your turn!";
            }
          } else if (reservedBy === Player.PLAYER2) {
            indicatorClasses += " reserved-by-player2";
            indicatorText = "🔵";
            titleText += " - Player 2 ball ready to release";
            if (currentPlayer === Player.PLAYER2 && canDrop) {
              indicatorClasses += " current-player-turn";
              titleText += " - Your turn!";
            }
          }
        } else if (columnWinner !== null) {
          indicatorClasses += " secured-column";
          indicatorText = "✓";
          if (columnWinner === Player.PLAYER1) {
            indicatorClasses += " secured-by-player1";
            titleText += " - Secured by Player 1";
          } else if (columnWinner === Player.PLAYER2) {
            indicatorClasses += " secured-by-player2";
            titleText += " - Secured by Player 2";
          }
        }
      } else {
        // Normal mode
        if (columnWinner !== null) {
          indicatorClasses += " secured-column";
          indicatorText = "✓";
          if (columnWinner === Player.PLAYER1) {
            indicatorClasses += " secured-by-player1";
            titleText += " - Secured by Player 1";
          } else if (columnWinner === Player.PLAYER2) {
            indicatorClasses += " secured-by-player2";
            titleText += " - Secured by Player 2";
          }
        }
      }

      if (!canDrop && !isHighlighted) {
        indicatorClasses += " disabled";
      }

      return (
        <div key={column} className="column-indicator-wrapper">
          <div className={indicatorClasses} title={titleText}>
            {indicatorText}
          </div>
          <div className="column-number">{column + 1}</div>
        </div>
      );
    });
  };

  // Don't render drag area if game is not in a playable state
  const isPlayableState = gameState === GameState.PLAYING || 
                         gameState === GameState.BALL_RELEASE_PHASE ||
                         gameState === GameState.COLUMN_RESERVATION_PHASE ||
                         gameState === GameState.BALL_PLACEMENT_PHASE;

  if (!isPlayableState) {
    return (
      <div className="drag-drop-area-container">
        <div className="drag-drop-area disabled">
          <div className="drag-instructions">Game not ready for ball placement</div>
        </div>
      </div>
    );
  }

  return (
    <div className="drag-drop-area-container">
      <div
        ref={dragAreaRef}
        className={`drag-drop-area ${isDragging ? 'dragging' : ''} ${isAnimating ? 'disabled' : ''}`}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Draggable ball element */}
        <div
          ref={dragBallRef}
          className={`draggable-ball player${currentPlayer}`}
          draggable={!isAnimating}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onTouchStart={handleTouchStart}
          style={{ backgroundColor: getCurrentPlayerColor() }}
        >
          {getCurrentPlayerBall()}
        </div>

        {/* Instructions */}
        <div className="drag-instructions">
          {isAnimating 
            ? "Animation in progress..." 
            : `Drag the ${currentPlayer === Player.PLAYER1 ? 'red' : 'blue'} ball to a column to drop it`
          }
        </div>

        {/* Column indicators */}
        <div className="column-indicators">
          {renderColumnIndicators()}
        </div>
      </div>
    </div>
  );
};

export default DragDropArea;