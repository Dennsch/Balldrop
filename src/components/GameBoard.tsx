import React from 'react';
import { Game } from '../Game.js';
import { AnimationSpeed } from '../types.js';
import Grid from './Grid.js';
import ColumnSelectors from './ColumnSelectors.js';

interface GameBoardProps {
  game: Game;
  onColumnClick: (column: number) => void;
  animationSpeed: AnimationSpeed;
  isAnimating: boolean;
  gridKey: number;
}

const GameBoard: React.FC<GameBoardProps> = ({
  game,
  onColumnClick,
  animationSpeed,
  isAnimating,
  gridKey
}) => {
  return (
    <div className="game-board">
      <ColumnSelectors
        game={game}
        onColumnClick={onColumnClick}
        isAnimating={isAnimating}
      />
      <div className="grid-container">
        <Grid
          key={gridKey}
          game={game}
          animationSpeed={animationSpeed}
        />
      </div>
    </div>
  );
};

export default GameBoard;