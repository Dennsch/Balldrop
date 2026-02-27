import React from "react";
import { GameMode } from "../types.js";

interface GameModeSwitchProps {
  gameMode: GameMode;
  onGameModeChange: (mode: GameMode) => void;
}

const GameModeSwitch: React.FC<GameModeSwitchProps> = ({
  gameMode,
  onGameModeChange,
}) => {
  return (
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
  );
};

export default GameModeSwitch;
