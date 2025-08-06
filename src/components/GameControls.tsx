import React from 'react';

interface GameControlsProps {
  onNewGame: () => void;
}

const GameControls: React.FC<GameControlsProps> = ({
  onNewGame
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
    </div>
  );
};

export default GameControls;