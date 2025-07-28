import React from 'react';

interface GameStatusProps {
  winnerMessage: string;
  gameMessage: string;
}

const GameStatus: React.FC<GameStatusProps> = ({
  winnerMessage,
  gameMessage
}) => {
  return (
    <div className="game-status">
      <div 
        id="winner-message" 
        className={`winner-message ${winnerMessage ? '' : 'hidden'}`}
      >
        {winnerMessage}
      </div>
      <div id="game-message" className="game-message">
        {gameMessage}
      </div>
    </div>
  );
};

export default GameStatus;