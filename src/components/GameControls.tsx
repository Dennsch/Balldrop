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
        {soundEnabled ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{display: 'inline-block', verticalAlign: 'middle', marginRight: '6px'}}>
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{display: 'inline-block', verticalAlign: 'middle', marginRight: '6px'}}>
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
            <line x1="23" y1="9" x2="17" y2="15"/>
            <line x1="17" y1="9" x2="23" y2="15"/>
          </svg>
        )}
        Sound
      </button>
    </div>
  );
};

export default GameControls;
