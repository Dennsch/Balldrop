import { Cell, CellType, Direction, Position, Player, BallPath, BallPathStep } from './types.js';

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

    public calculateBallPath(col: number, player: Player): { finalPosition: Position | null, ballPath: BallPath | null } {
        if (!this.isValidPosition(0, col)) {
            return { finalPosition: null, ballPath: null };
        }

        let currentRow = 0;
        let currentCol = col;
        const pathSteps: BallPathStep[] = [];

        // Find the starting position (first empty cell in the column)
        while (currentRow < this.size && this.isValidPosition(currentRow, currentCol) && this.cells[currentRow][currentCol].type !== CellType.EMPTY) {
            currentRow++;
        }

        if (currentRow >= this.size) {
            return { finalPosition: null, ballPath: null }; // Column is full
        }

        // Add starting position to path
        pathSteps.push({
            position: { row: currentRow, col: currentCol },
            action: 'fall'
        });

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
                pathSteps.push({
                    position: { row: currentRow, col: currentCol },
                    action: 'fall'
                });
                continue;
            }

            // If next cell has a box, redirect the ball
            if (nextCell.type === CellType.BOX && nextCell.direction) {
                const originalDirection = nextCell.direction;
                
                // Redirect the ball based on the ORIGINAL direction (ball moves first)
                const redirectDirection = originalDirection === Direction.LEFT ? Direction.LEFT : Direction.RIGHT;
                const newCol = redirectDirection === Direction.LEFT ? currentCol - 1 : currentCol + 1;
                
                // Calculate new direction (arrow changes after ball moves)
                const newDirection = originalDirection === Direction.LEFT ? Direction.RIGHT : Direction.LEFT;

                // Add box hit step
                pathSteps.push({
                    position: { row: currentRow, col: currentCol },
                    action: 'redirect',
                    hitBox: true,
                    boxDirection: originalDirection,
                    newBoxDirection: newDirection,
                    boxPosition: { row: nextRow, col: currentCol }
                });

                // Check if the new column is valid and the target cell is empty
                if (this.isValidPosition(currentRow, newCol)) {
                    const targetCell = this.cells[currentRow][newCol];
                    
                    // Check if the target cell is empty
                    if (targetCell.type === CellType.EMPTY) {
                        currentCol = newCol;
                        // Add redirection step
                        pathSteps.push({
                            position: { row: currentRow, col: currentCol },
                            action: 'fall'
                        });
                        // Continue falling in the new column
                        continue;
                    } else {
                        // Target cell is occupied (by box or ball), ball gets stuck in current position
                        break;
                    }
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

        // Add final settling step
        pathSteps.push({
            position: { row: currentRow, col: currentCol },
            action: 'settle'
        });

        const finalPosition = { row: currentRow, col: currentCol };
        const ballPath: BallPath = {
            steps: pathSteps,
            finalPosition,
            player
        };

        return { finalPosition, ballPath };
    }

    public applyBallPath(ballPath: BallPath): boolean {
        // Apply box direction changes from the path
        for (const step of ballPath.steps) {
            if (step.hitBox && step.boxPosition && step.newBoxDirection) {
                const boxCell = this.getCell(step.boxPosition.row, step.boxPosition.col);
                if (boxCell && boxCell.type === CellType.BOX) {
                    boxCell.direction = step.newBoxDirection;
                }
            }
        }

        // Place the ball at the final position
        const ballType = ballPath.player === Player.PLAYER1 ? CellType.BALL_P1 : CellType.BALL_P2;
        return this.setCell(ballPath.finalPosition.row, ballPath.finalPosition.col, {
            type: ballType,
            player: ballPath.player
        });
    }

    public dropBallWithPath(col: number, player: Player): { finalPosition: Position | null, ballPath: BallPath | null } {
        const result = this.calculateBallPath(col, player);
        if (result.ballPath) {
            this.applyBallPath(result.ballPath);
        }
        return result;
    }

    public dropBall(col: number, player: Player): Position | null {
        const result = this.dropBallWithPath(col, player);
        return result.finalPosition;
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