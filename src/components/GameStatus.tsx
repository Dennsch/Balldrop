import React from 'react';

interface GameStatusProps {
  winnerMessage: string;
  gameMessage: string;
}

const GameStatus: React.FC<GameStatusProps> = ({
  winnerMessage,
  gameMessage
}) => {
  // Determine winner type for styling
  const getWinnerClass = () => {
    if (!winnerMessage) return '';
    if (winnerMessage.includes('Player 1')) return 'player1-wins';
    if (winnerMessage.includes('Player 2')) return 'player2-wins';
    if (winnerMessage.includes('tie')) return 'tie';
    return '';
  };

  // Get appropriate icon for the message
  const getMessageIcon = () => {
    if (winnerMessage) {
      if (winnerMessage.includes('Player 1')) return '🏆';
      if (winnerMessage.includes('Player 2')) return '🏆';
      if (winnerMessage.includes('tie')) return '🤝';
      return '🎉';
    }
    
    if (gameMessage.includes('turn')) return '⏳';
    if (gameMessage.includes('reserve')) return '📍';
    if (gameMessage.includes('release')) return '🚀';
    if (gameMessage.includes('finished')) return '✅';
    if (gameMessage.includes('executing')) return '⚡';
    return '🎮';
  };

  return (
    <div className="game-status-container">
      {winnerMessage && (
        <div className={`winner-announcement ${getWinnerClass()}`}>
          <div className="winner-icon">{getMessageIcon()}</div>
          <div className="winner-text">
            <div className="winner-title">Game Over!</div>
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