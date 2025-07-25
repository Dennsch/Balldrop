import { Cell, CellType, Direction, Position, Player } from './types.js';

export class Grid {
    private cells: Cell[][];
    private readonly size: number;

    constructor(size: number = 20) {
        this.size = size;
        this.cells = this.initializeGrid();
    }

    private initializeGrid(): Cell[][] {
        const grid: Cell[][] = [];
        for (let row = 0; row < this.size; row++) {
            grid[row] = [];
            for (let col = 0; col < this.size; col++) {
                grid[row][col] = { type: CellType.EMPTY };
            }
        }
        return grid;
    }

    public getCell(row: number, col: number): Cell | null {
        if (this.isValidPosition(row, col)) {
            return this.cells[row][col];
        }
        return null;
    }

    public setCell(row: number, col: number, cell: Cell): boolean {
        if (this.isValidPosition(row, col)) {
            this.cells[row][col] = cell;
            return true;
        }
        return false;
    }

    public isValidPosition(row: number, col: number): boolean {
        return row >= 0 && row < this.size && col >= 0 && col < this.size;
    }

    public placeRandomBoxes(minBoxes: number, maxBoxes: number): void {
        this.clearGrid();
        const numBoxes = Math.floor(Math.random() * (maxBoxes - minBoxes + 1)) + minBoxes;
        const positions: Position[] = [];

        // Generate all possible positions (excluding first and last rows)
        for (let row = 1; row < this.size - 1; row++) {
            for (let col = 0; col < this.size; col++) {
                positions.push({ row, col });
            }
        }

        // Shuffle positions and select random ones for boxes
        for (let i = positions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [positions[i], positions[j]] = [positions[j], positions[i]];
        }

        // Place boxes at random positions
        for (let i = 0; i < numBoxes && i < positions.length; i++) {
            const { row, col } = positions[i];
            const direction = Math.random() < 0.5 ? Direction.LEFT : Direction.RIGHT;
            this.setCell(row, col, {
                type: CellType.BOX,
                direction: direction
            });
        }
    }

    public dropBall(col: number, player: Player): Position | null {
        if (!this.isValidPosition(0, col)) {
            return null;
        }

        let currentRow = 0;
        let currentCol = col;

        // Find the starting position (first empty cell in the column)
        while (currentRow < this.size && this.isValidPosition(currentRow, currentCol) && this.cells[currentRow][currentCol].type !== CellType.EMPTY) {
            currentRow++;
        }

        if (currentRow >= this.size) {
            return null; // Column is full
        }

        // Simulate ball falling
        while (currentRow < this.size) {
            const nextRow = currentRow + 1;

            // Check if we've reached the bottom
            if (nextRow >= this.size) {
                break;
            }

            if (!this.isValidPosition(nextRow, currentCol)) {
                break;
            }

            const nextCell = this.cells[nextRow][currentCol];

            // If next cell is empty, continue falling
            if (nextCell.type === CellType.EMPTY) {
                currentRow = nextRow;
                continue;
            }

            // If next cell has a box, redirect the ball
            if (nextCell.type === CellType.BOX && nextCell.direction) {
                // Change the box direction
                nextCell.direction = nextCell.direction === Direction.LEFT ? Direction.RIGHT : Direction.LEFT;

                // Redirect the ball
                const redirectDirection = nextCell.direction === Direction.LEFT ? Direction.RIGHT : Direction.LEFT;
                const newCol = redirectDirection === Direction.LEFT ? currentCol - 1 : currentCol + 1;

                // Check if the new column is valid
                if (this.isValidPosition(currentRow, newCol)) {
                    currentCol = newCol;
                    // Continue falling in the new column
                    continue;
                } else {
                    // Ball goes out of bounds, place it in current position
                    break;
                }
            }

            // If next cell has a ball, stop here
            if (nextCell.type === CellType.BALL_P1 || nextCell.type === CellType.BALL_P2) {
                break;
            }
        }

        // Place the ball at the final position
        const ballType = player === Player.PLAYER1 ? CellType.BALL_P1 : CellType.BALL_P2;
        this.setCell(currentRow, currentCol, {
            type: ballType,
            player: player
        });

        return { row: currentRow, col: currentCol };
    }

    public getColumnWinner(col: number): Player | null {
        if (!this.isValidPosition(0, col)) {
            return null;
        }

        // Find the bottom-most ball in the column
        for (let row = this.size - 1; row >= 0; row--) {
            const cell = this.cells[row][col];
            if (cell.type === CellType.BALL_P1) {
                return Player.PLAYER1;
            }
            if (cell.type === CellType.BALL_P2) {
                return Player.PLAYER2;
            }
        }

        return null;
    }

    public getColumnWinners(): (Player | null)[] {
        const winners: (Player | null)[] = [];
        for (let col = 0; col < this.size; col++) {
            winners.push(this.getColumnWinner(col));
        }
        return winners;
    }

    public clearGrid(): void {
        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {
                this.cells[row][col] = { type: CellType.EMPTY };
            }
        }
    }

    public getSize(): number {
        return this.size;
    }

    public getCells(): Cell[][] {
        return this.cells;
    }

    public isColumnFull(col: number): boolean {
        if (!this.isValidPosition(0, col)) {
            return true;
        }
        return this.cells[0][col].type !== CellType.EMPTY;
    }
}