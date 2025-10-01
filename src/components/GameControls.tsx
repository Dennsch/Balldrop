import React, { useState, useEffect } from 'react';
import { getSoundManager } from '../utils/SoundManager.js';

interface GameControlsProps {
  onNewGame: () => void;
  onColumnsChange?: (columns: number) => void;
  currentColumns?: number;
}

const GameControls: React.FC<GameControlsProps> = ({
  onNewGame,
  onColumnsChange,
  currentColumns = 20
}) => {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [columns, setColumns] = useState(currentColumns);
  const soundManager = getSoundManager();

  useEffect(() => {
    setSoundEnabled(soundManager.isEnabled());
  }, [soundManager]);

  const handleSoundToggle = () => {
    const newSoundState = !soundEnabled;
    setSoundEnabled(newSoundState);
    soundManager.setEnabled(newSoundState);
    
    // Play a test sound when enabling
    if (newSoundState) {
      soundManager.playSound('click', 0.3);
    }
  };

  const handleNewGame = () => {
    soundManager.playSound('click', 0.3);
    onNewGame();
  };

  const handleColumnsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newColumns = parseInt(event.target.value, 10);
    setColumns(newColumns);
    if (onColumnsChange) {
      onColumnsChange(newColumns);
    }
  };

  return (
    <div className="game-controls">
      <button 
        id="new-game-btn" 
        className="btn btn-primary"
        onClick={handleNewGame}
      >
        New Game
      </button>
      
      <div className="control-group">
        <label htmlFor="columns-input">Columns:</label>
        <input
          id="columns-input"
          type="range"
          min="5"
          max="30"
          value={columns}
          onChange={handleColumnsChange}
          className="columns-slider"
        />
        <span className="columns-value">{columns}</span>
      </div>
      
      <button 
        className="btn btn-secondary"
        onClick={handleSoundToggle}
        title={soundEnabled ? 'Disable sounds' : 'Enable sounds'}
      >
        {soundEnabled ? '🔊' : '🔇'} Sound
      </button>
    </div>
  );
};

export default GameControls;