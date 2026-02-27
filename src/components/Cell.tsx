import React from 'react';
import { Cell as CellType, CellType as CellTypeEnum, Direction, Player } from '../types.js';

interface CellProps {
  row: number;
  col: number;
  cell: CellType;
  onCellClick?: (row: number, col: number) => void;
  isHighlighted?: boolean;
  currentPlayer?: Player;
}

const Cell: React.FC<CellProps> = ({ row, col, cell, onCellClick, isHighlighted, currentPlayer }) => {
  const getCellClasses = () => {
    const classes = ['cell'];
    
    if (isHighlighted) {
      classes.push('highlighted-drop-target');
      if (currentPlayer === Player.PLAYER1) {
        classes.push('highlighted-player1');
      } else if (currentPlayer === Player.PLAYER2) {
        classes.push('highlighted-player2');
      }
    }
    
    switch (cell.type) {
      case CellTypeEnum.BOX:
        classes.push('has-box');
        break;
      case CellTypeEnum.BALL_P1:
        classes.push('has-ball-p1');
        break;
      case CellTypeEnum.BALL_P2:
        classes.push('has-ball-p2');
        break;
      case CellTypeEnum.DORMANT_BALL_P1:
        classes.push('has-dormant-ball-p1');
        if (onCellClick) classes.push('clickable');
        break;
      case CellTypeEnum.DORMANT_BALL_P2:
        classes.push('has-dormant-ball-p2');
        if (onCellClick) classes.push('clickable');
        break;
      case CellTypeEnum.PORTAL_1:
        classes.push('has-portal');
        break;
      case CellTypeEnum.PORTAL_2:
        classes.push('has-portal');
        break;
      default:
        break;
    }
    
    return classes.join(' ');
  };

  const getCellContent = () => {
    if (isHighlighted && cell.type === CellTypeEnum.EMPTY) {
      const color = currentPlayer === Player.PLAYER1 ? '#E06C5E' : '#4A9EC2';
      return (
        <svg width="70%" height="70%" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="7" fill={color} opacity="0.6" />
        </svg>
      );
    }
    
    switch (cell.type) {
      case CellTypeEnum.BOX:
        return (
          <span className="arrow">
            {cell.direction === Direction.LEFT ? '\u2190' : '\u2192'}
          </span>
        );
      case CellTypeEnum.BALL_P1:
      case CellTypeEnum.BALL_P2:
      case CellTypeEnum.DORMANT_BALL_P1:
      case CellTypeEnum.DORMANT_BALL_P2:
        return '\u25CF';
      case CellTypeEnum.PORTAL_1:
      case CellTypeEnum.PORTAL_2:
        return (
          <svg width="70%" height="70%" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.7" />
            <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.5" />
            <circle cx="8" cy="8" r="1" fill="currentColor" opacity="0.8" />
          </svg>
        );
      default:
        return null;
    }
  };

  const handleClick = () => {
    if (onCellClick && (cell.type === CellTypeEnum.DORMANT_BALL_P1 || cell.type === CellTypeEnum.DORMANT_BALL_P2)) {
      onCellClick(row, col);
    }
  };

  return (
    <div 
      className={getCellClasses()}
      data-row={row}
      data-col={col}
      onClick={handleClick}
      style={{ cursor: (cell.type === CellTypeEnum.DORMANT_BALL_P1 || cell.type === CellTypeEnum.DORMANT_BALL_P2) && onCellClick ? 'pointer' : 'default' }}
    >
      {getCellContent()}
    </div>
  );
};

export default Cell;
