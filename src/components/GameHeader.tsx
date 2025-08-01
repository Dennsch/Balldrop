import React from 'react';
import { Player, GameMode } from '../types.js';

interface GameHeaderProps {
  currentPlayer: Player;
  player1Balls: number;
  player2Balls: number;
  gameMode: GameMode;
  onGameModeChange: (mode: GameMode) => void;
  player1Score: number;
  player2Score: number;
}

const GameHeader: React.FC<GameHeaderProps> = ({
  currentPlayer,
  player1Balls,
  player2Balls,
  gameMode,
  onGameModeChange,
  player1Score,
  player2Score
}) => {
  const handleModeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onGameModeChange(event.target.value as GameMode);
  };

  return (
    <header>
      <div className="header-content">
        <div className="logo-container">
          <img src="assets/icon.png" alt="Dropple Game Logo" className="game-logo" />
        </div>
      </div>
      <div className="game-info">
        <div className="player-info">
          <div className="player player-1">
            <span className="player-name">Player 1</span>
            <span className="balls-remaining">
              Balls: <span id="player1-balls">{player1Balls}</span>
            </span>
          </div>
          <div className="current-turn">
            <span id="current-player">Player {currentPlayer}'s Turn</span>
          </div>
          <div className="player player-2">
            <span className="player-name">Player 2</span>
            <span className="balls-remaining">
              Balls: <span id="player2-balls">{player2Balls}</span>
            </span>
          </div>
        </div>
        
        <div className="score-display">
          <div className="score-title">Current Score</div>
          <div className="score-info">
            <div className="player-score player-1-score">
              <span className="score-label">Player 1:</span>
              <span id="player1-score" className="score-value">{player1Score}</span>
              <span className="score-unit">columns</span>
            </div>
            <div className="score-separator">-</div>
            <div className="player-score player-2-score">
              <span className="score-label">Player 2:</span>
              <span id="player2-score" className="score-value">{player2Score}</span>
              <span className="score-unit">columns</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="game-mode-selector">
        <label>Game Mode: </label>
        <label style={{ marginRight: '15px' }}>
          <input
            type="radio"
            name="gameMode"
            value={GameMode.NORMAL}
            checked={gameMode === GameMode.NORMAL}
            onChange={handleModeChange}
          />
          Normal
        </label>
        <label>
          <input
            type="radio"
            name="gameMode"
            value={GameMode.HARD_MODE}
            checked={gameMode === GameMode.HARD_MODE}
            onChange={handleModeChange}
          />
          Hard Mode
        </label>
      </div>
    </header>
  );
};

export default GameHeader;