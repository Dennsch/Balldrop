import React from "react";
import { Player, GameMode } from "../types.js";

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
              <div className="avatar-icon">🔴</div>
              {currentPlayer === Player.PLAYER1 && (
                <div className="active-indicator"></div>
              )}
            </div>
            <div className="player-details">
              <div className="player-name">Player 1</div>
              <div className="player-stats">
                <div className="stat-item">
                  <span className="stat-icon">⚽</span>
                  <span className="stat-value">{player1Balls}</span>
                  <span className="stat-label">balls</span>
                </div>
                <div className="stat-item">
                  <span className="stat-icon">🏆</span>
                  <span className="stat-value">{player1Score}</span>
                  <span className="stat-label">columns</span>
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
              <div className="avatar-icon">🔵</div>
              {currentPlayer === Player.PLAYER2 && (
                <div className="active-indicator"></div>
              )}
            </div>
            <div className="player-details">
              <div className="player-name">Player 2</div>
              <div className="player-stats">
                <div className="stat-item">
                  <span className="stat-icon">⚽</span>
                  <span className="stat-value">{player2Balls}</span>
                  <span className="stat-label">balls</span>
                </div>
                <div className="stat-item">
                  <span className="stat-icon">🏆</span>
                  <span className="stat-value">{player2Score}</span>
                  <span className="stat-label">columns</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="game-mode-selector">
        <div className="mode-switch-container">
          <span
            className={`mode-switch-label ${
              gameMode === GameMode.NORMAL ? "active" : ""
            }`}
          >
            Normal
          </span>
          <div className="mode-switch-wrapper">
            <input
              type="checkbox"
              id="mode-switch"
              className="mode-switch-input"
              checked={gameMode === GameMode.HARD_MODE}
              onChange={(e) =>
                onGameModeChange(
                  e.target.checked ? GameMode.HARD_MODE : GameMode.NORMAL
                )
              }
            />
            <label htmlFor="mode-switch" className="mode-switch">
              <span className="mode-switch-slider"></span>
            </label>
          </div>
          <span
            className={`mode-switch-label ${
              gameMode === GameMode.HARD_MODE ? "active" : ""
            }`}
          >
            Hard
          </span>
        </div>
      </div>
    </header>
  );
};

export default GameHeader;
