import React from 'react';
import { AnimationSpeed } from '../types.js';

interface GameControlsProps {
  onNewGame: () => void;
  onReset: () => void;
  animationSpeed: AnimationSpeed;
  onAnimationSpeedChange: (speed: AnimationSpeed) => void;
}

const GameControls: React.FC<GameControlsProps> = ({
  onNewGame,
  onReset,
  animationSpeed,
  onAnimationSpeedChange
}) => {
  const handleSpeedChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const speed = event.target.value as AnimationSpeed;
    onAnimationSpeedChange(speed);
  };

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
      <div className="animation-speed-control">
        <label htmlFor="animation-speed-select">Animation Speed:</label>
        <select 
          id="animation-speed-select" 
          className="speed-select"
          value={animationSpeed}
          onChange={handleSpeedChange}
        >
          <option value={AnimationSpeed.SLOW}>Slow</option>
          <option value={AnimationSpeed.NORMAL}>Normal</option>
          <option value={AnimationSpeed.FAST}>Fast</option>
          <option value={AnimationSpeed.INSTANT}>Instant</option>
        </select>
      </div>
    </div>
  );
};

export default GameControls;