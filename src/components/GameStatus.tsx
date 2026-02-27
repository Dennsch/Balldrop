import React from 'react';

interface GameStatusProps {
  winnerMessage: string;
  gameMessage: string;
}

const GameStatus: React.FC<GameStatusProps> = ({
  winnerMessage,
  gameMessage
}) => {
  const getWinnerClass = () => {
    if (!winnerMessage) return '';
    if (winnerMessage.includes('Player 1')) return 'player1-wins';
    if (winnerMessage.includes('Player 2')) return 'player2-wins';
    if (winnerMessage.includes('tie')) return 'tie';
    return '';
  };

  const getWinnerIcon = () => {
    if (winnerMessage.includes('tie')) {
      return (
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42z"/>
        </svg>
      );
    }
    return (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5C7 4 7 7 7 7"/>
        <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5C17 4 17 7 17 7"/>
        <path d="M4 22h16"/>
        <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20 7 22"/>
        <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20 17 22"/>
        <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
      </svg>
    );
  };

  const getMessageIcon = () => {
    if (gameMessage.includes('turn') || gameMessage.includes('Drag')) {
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12 6 12 12 16 14"/>
        </svg>
      );
    }
    if (gameMessage.includes('reserve')) {
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
          <circle cx="12" cy="10" r="3"/>
        </svg>
      );
    }
    if (gameMessage.includes('release') || gameMessage.includes('Release')) {
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 2L11 13"/>
          <path d="M22 2L15 22l-4-9-9-4 20-7z"/>
        </svg>
      );
    }
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="16" x2="12" y2="12"/>
        <line x1="12" y1="8" x2="12.01" y2="8"/>
      </svg>
    );
  };

  return (
    <div className="game-status-container">
      {winnerMessage && (
        <div className={`winner-announcement ${getWinnerClass()}`}>
          <div className="winner-icon">{getWinnerIcon()}</div>
          <div className="winner-text">
            <div className="winner-title">Game Over</div>
            <div className="winner-details">{winnerMessage}</div>
          </div>
        </div>
      )}
      
      {gameMessage && (
        <div className="game-info-card">
          <div className="info-icon">{getMessageIcon()}</div>
          <div className="info-content">
            <div className="info-text">{gameMessage}</div>
            <div className="info-pulse"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameStatus;
