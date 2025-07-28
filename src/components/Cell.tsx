import React from 'react';
import { Cell as CellType, CellType as CellTypeEnum, Direction } from '../types.js';

interface CellProps {
  row: number;
  col: number;
  cell: CellType;
}

const Cell: React.FC<CellProps> = ({ row, col, cell }) => {
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
        break;
      case CellTypeEnum.DORMANT_BALL_P2:
        classes.push('has-dormant-ball-p2');
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
      default:
        return null;
    }
  };

  return (
    <div 
      className={getCellClasses()}
      data-row={row}
      data-col={col}
    >
      {getCellContent()}
    </div>
  );
};

export default Cell;