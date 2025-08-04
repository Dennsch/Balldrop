import React from 'react';
import { Cell as CellType, CellType as CellTypeEnum, Direction } from '../types.js';

interface CellProps {
  row: number;
  col: number;
  cell: CellType;
  onCellClick?: (row: number, col: number) => void;
}

const Cell: React.FC<CellProps> = ({ row, col, cell, onCellClick }) => {
  const getCellClasses = () => {
    const classes = ['cell'];
    
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
      case CellTypeEnum.PORTAL_ENTRY_1:
        classes.push('has-portal-entry-1');
        break;
      case CellTypeEnum.PORTAL_EXIT_1:
        classes.push('has-portal-exit-1');
        break;
      case CellTypeEnum.PORTAL_ENTRY_2:
        classes.push('has-portal-entry-2');
        break;
      case CellTypeEnum.PORTAL_EXIT_2:
        classes.push('has-portal-exit-2');
        break;
      default:
        // Empty cell - no additional classes
        break;
    }
    
    return classes.join(' ');
  };

  const getCellContent = () => {
    switch (cell.type) {
      case CellTypeEnum.BOX:
        return (
          <span className="arrow">
            {cell.direction === Direction.LEFT ? '←' : '→'}
          </span>
        );
      case CellTypeEnum.BALL_P1:
      case CellTypeEnum.BALL_P2:
      case CellTypeEnum.DORMANT_BALL_P1:
      case CellTypeEnum.DORMANT_BALL_P2:
        return '●';
      case CellTypeEnum.PORTAL_ENTRY_1:
        return '⚪';
      case CellTypeEnum.PORTAL_EXIT_1:
        return '⚫';
      case CellTypeEnum.PORTAL_ENTRY_2:
        return '🔵';
      case CellTypeEnum.PORTAL_EXIT_2:
        return '🔴';
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