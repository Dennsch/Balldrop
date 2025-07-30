import React from 'react';
import { Game } from '../Game.js';
import { AnimationSpeed, BallPath } from '../types.js';
import Grid from './Grid.js';
import ColumnSelectors from './ColumnSelectors.js';
import AnimatedBall from './AnimatedBall.js';

interface GameBoardProps {
  game: Game;
  onColumnClick: (column: number) => void;
  onCellClick?: (row: number, col: number) => void;
  animationSpeed: AnimationSpeed;
  isAnimating: boolean;
  gridKey: number;
  animatedBalls: BallPath[];
  onAnimationComplete: (ballPath: BallPath) => void;
}

const GameBoard: React.FC<GameBoardProps> = ({
  game,
  onColumnClick,
  onCellClick,
  animationSpeed,
  isAnimating,
  gridKey,
  animatedBalls,
  onAnimationComplete
}) => {
  return (
    <div className="game-board">
      <ColumnSelectors
        key={gridKey}
        game={game}
        onColumnClick={onColumnClick}
        isAnimating={isAnimating}
      />
      <div className="grid-container" style={{ position: 'relative' }}>
        <Grid
          key={gridKey}
          game={game}
          animationSpeed={animationSpeed}
          onCellClick={onCellClick}
        />
        {/* Render animated balls inside grid container */}
        {animatedBalls.map((ballPath, index) => (
          <AnimatedBall
            key={`${ballPath.startColumn}-${ballPath.player}-${index}`}
            ballPath={ballPath}
            animationSpeed={animationSpeed}
            onAnimationComplete={() => onAnimationComplete(ballPath)}
          />
        ))}
      </div>
    </div>
  );
};

export default GameBoard;