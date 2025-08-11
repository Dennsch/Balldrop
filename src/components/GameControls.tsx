import React, { useState, useEffect } from 'react';
import { getSoundManager } from '../utils/SoundManager.js';

interface GameControlsProps {
  onNewGame: () => void;
}

const GameControls: React.FC<GameControlsProps> = ({
  onNewGame
}) => {
  const [soundEnabled, setSoundEnabled] = useState(true);
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

  return (
    <div className="game-controls">
      <button 
        id="new-game-btn" 
        className="btn btn-primary"
        onClick={handleNewGame}
      >
        New Game
      </button>
      
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