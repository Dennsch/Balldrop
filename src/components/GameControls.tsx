import React from 'react';

interface GameControlsProps {
  onNewGame: () => void;
  onReset: () => void;
}

const GameControls: React.FC<GameControlsProps> = ({
  onNewGame,
  onReset
}) => {

  return (
    <div className="game-controls">
      <button 
        id="new-game-btn" 
        className="btn btn-primary"
        onClick={onNewGame}
      >
        New Game
      </button>
      <button 
        id="reset-btn" 
        className="btn btn-secondary"
        onClick={onReset}
      >
        Reset
      </button>

    </div>
  );
};

export default GameControls;