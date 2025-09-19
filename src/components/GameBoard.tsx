import React from 'react';
import { Game } from '../Game.js';
import { BallPath } from '../types.js';
import Grid from './Grid.js';
import DragDropArea from './DragDropArea.js';
import AnimatedBall from './AnimatedBall.js';
import '../dragdrop.css';

interface GameBoardProps {
  game: Game;
  onColumnClick: (column: number) => void;
  onCellClick?: (row: number, col: number) => void;
  isAnimating: boolean;
  gridKey: number;
  animatedBalls: BallPath[];
  onAnimationComplete: (ballPath: BallPath) => void;
}

const GameBoard: React.FC<GameBoardProps> = ({
  game,
  onColumnClick,
  onCellClick,
  isAnimating,
  gridKey,
  animatedBalls,
  onAnimationComplete
}) => {
  const [highlightedColumn, setHighlightedColumn] = React.useState<number | null>(null);

  return (
    <div className="game-board">
      <DragDropArea
        key={gridKey}
        game={game}
        onColumnClick={onColumnClick}
        isAnimating={isAnimating}
        onColumnHighlight={setHighlightedColumn}
      />
      <div className="grid-container" style={{ position: 'relative' }}>
        <Grid
          key={gridKey}
          game={game}
          onCellClick={onCellClick}
          highlightedColumn={highlightedColumn}
        />
        {/* Render animated balls inside grid container */}
        {animatedBalls.map((ballPath, index) => (
          <AnimatedBall
            key={`${ballPath.startColumn}-${ballPath.player}-${index}`}
            ballPath={ballPath}
            onAnimationComplete={() => onAnimationComplete(ballPath)}
          />
        ))}
      </div>
    </div>
  );
};

export default GameBoard;