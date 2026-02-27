import React from "react";
import { Player } from "../types.js";

interface GameHeaderProps {
  currentPlayer: Player;
  player1Balls: number;
  player2Balls: number;
  player1Score: number;
  player2Score: number;
}

const GameHeader: React.FC<GameHeaderProps> = ({
  currentPlayer,
  player1Balls,
  player2Balls,
  player1Score,
  player2Score,
}) => {
  return (
    <header>
      <div className="header-content">
        <div className="logo-container">
          <img src="/icon.png" alt="Dropple Game Logo" className="game-logo" />
        </div>
      </div>

      <div className="player-info-redesigned">
        <div className="players-container">
          <div
            className={`player-card player-1-card ${
              currentPlayer === Player.PLAYER1 ? "active-player" : ""
            }`}
          >
            <div className="player-avatar">
              <div className="avatar-icon">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                  <circle cx="16" cy="16" r="14" fill="#FF6B6B" />
                  <circle cx="16" cy="16" r="10" fill="#FF8A8A" opacity="0.4" />
                  <circle cx="12" cy="12" r="3" fill="white" opacity="0.3" />
                </svg>
              </div>
              {currentPlayer === Player.PLAYER1 && (
                <div className="active-indicator"></div>
              )}
            </div>
            <div className="player-details">
              <div className="player-name">Player 1</div>
              <div className="player-stats">
                <div className="stat-item">
                  <span className="stat-value">{player1Balls}</span>
                  <span className="stat-label">balls</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{player1Score}</span>
                  <span className="stat-label">cols</span>
                </div>
              </div>
            </div>
          </div>

          <div
            className={`player-card player-2-card ${
              currentPlayer === Player.PLAYER2 ? "active-player" : ""
            }`}
          >
            <div className="player-avatar">
              <div className="avatar-icon">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                  <circle cx="16" cy="16" r="14" fill="#4ECDC4" />
                  <circle cx="16" cy="16" r="10" fill="#7EDDD7" opacity="0.4" />
                  <circle cx="12" cy="12" r="3" fill="white" opacity="0.3" />
                </svg>
              </div>
              {currentPlayer === Player.PLAYER2 && (
                <div className="active-indicator"></div>
              )}
            </div>
            <div className="player-details">
              <div className="player-name">Player 2</div>
              <div className="player-stats">
                <div className="stat-item">
                  <span className="stat-value">{player2Balls}</span>
                  <span className="stat-label">balls</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{player2Score}</span>
                  <span className="stat-label">cols</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default GameHeader;
