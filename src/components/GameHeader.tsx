import React from 'react';
import { Player } from '../types.js';

interface GameHeaderProps {
  currentPlayer: Player;
  player1Balls: number;
  player2Balls: number;
}

const GameHeader: React.FC<GameHeaderProps> = ({
  currentPlayer,
  player1Balls,
  player2Balls
}) => {
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
      </div>
    </header>
  );
};

export default GameHeader;