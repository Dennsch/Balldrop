import { Cell, CellType, Direction, Position, Player, BallPath, BallPathStep, DormantBall } from './types.js';

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

        // Place portal blocks after boxes
        this.placePortalBlocks();
    }

    public placePortalBlocks(): void {
        const availablePositions: Position[] = [];

        // Generate all possible positions (excluding first and last rows, and occupied cells)
        for (let row = 1; row < this.size - 1; row++) {
            for (let col = 0; col < this.size; col++) {
                if (this.cells[row][col].type === CellType.EMPTY) {
                    availablePositions.push({ row, col });
                }
            }
        }

        // Shuffle available positions
        for (let i = availablePositions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [availablePositions[i], availablePositions[j]] = [availablePositions[j], availablePositions[i]];
        }

        // Place exactly 4 portal blocks (2 pairs) if we have enough space
        if (availablePositions.length >= 4) {
            // Place first portal pair
            this.setCell(availablePositions[0].row, availablePositions[0].col, {
                type: CellType.PORTAL_1
            });
            this.setCell(availablePositions[1].row, availablePositions[1].col, {
                type: CellType.PORTAL_1
            });

            // Place second portal pair
            this.setCell(availablePositions[2].row, availablePositions[2].col, {
                type: CellType.PORTAL_2
            });
            this.setCell(availablePositions[3].row, availablePositions[3].col, {
                type: CellType.PORTAL_2
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

            // If next cell has a portal, teleport the ball
            if (nextCell.type === CellType.PORTAL_1 || nextCell.type === CellType.PORTAL_2) {
                // Find the other portal of the same type
                const portalType = nextCell.type;
                const otherPortalPosition = this.findOtherPortalPosition(portalType, { row: nextRow, col: currentCol });
                
                if (otherPortalPosition) {
                    // Add portal entry step
                    pathSteps.push({
                        position: { row: currentRow, col: currentCol },
                        action: 'redirect' // Using redirect action for portal teleportation
                    });
                    
                    // Teleport to the position above the other portal
                    currentRow = otherPortalPosition.row - 1;
                    currentCol = otherPortalPosition.col;
                    
                    // Check if the teleport destination is valid and empty
                    if (this.isValidPosition(currentRow, currentCol) && 
                        this.cells[currentRow][currentCol].type === CellType.EMPTY) {
                        // Add teleport arrival step
                        pathSteps.push({
                            position: { row: currentRow, col: currentCol },
                            action: 'fall'
                        });
                        // Continue falling from the new position
                        continue;
                    } else {
                        // If teleport destination is blocked, ball gets stuck at current position
                        break;
                    }
                } else {
                    // If other portal not found, treat as obstacle and stop
                    break;
                }
            }

            // If next cell has a ball (active or dormant), stop here
            if (nextCell.type === CellType.BALL_P1 || nextCell.type === CellType.BALL_P2 || 
                nextCell.type === CellType.DORMANT_BALL_P1 || nextCell.type === CellType.DORMANT_BALL_P2) {
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
            player,
            startColumn: col
        };

        return { finalPosition, ballPath };
    }

    public applyBallPath(ballPath: BallPath, isDormant: boolean = false): boolean {
        // Apply box direction changes from the path only if ball is not dormant
        if (!isDormant) {
            for (const step of ballPath.steps) {
                if (step.hitBox && step.boxPosition && step.newBoxDirection) {
                    const boxCell = this.getCell(step.boxPosition.row, step.boxPosition.col);
                    if (boxCell && boxCell.type === CellType.BOX) {
                        boxCell.direction = step.newBoxDirection;
                    }
                }
            }
        }

        // Place the ball at the final position
        let ballType: CellType;
        if (isDormant) {
            ballType = ballPath.player === Player.PLAYER1 ? CellType.DORMANT_BALL_P1 : CellType.DORMANT_BALL_P2;
        } else {
            ballType = ballPath.player === Player.PLAYER1 ? CellType.BALL_P1 : CellType.BALL_P2;
        }
        
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

        // Only count active balls that made it to the bottom row for points
        // Dormant balls don't count for scoring
        const bottomRow = this.size - 1;
        const cell = this.cells[bottomRow][col];
        
        if (cell.type === CellType.BALL_P1) {
            return Player.PLAYER1;
        }
        if (cell.type === CellType.BALL_P2) {
            return Player.PLAYER2;
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

    public activateDormantBall(position: Position): boolean {
        const cell = this.getCell(position.row, position.col);
        if (!cell) {
            return false;
        }

        // Convert dormant ball to active ball and apply box effects
        if (cell.type === CellType.DORMANT_BALL_P1) {
            cell.type = CellType.BALL_P1;
            this.applyDormantBallEffects(position, Player.PLAYER1);
            return true;
        } else if (cell.type === CellType.DORMANT_BALL_P2) {
            cell.type = CellType.BALL_P2;
            this.applyDormantBallEffects(position, Player.PLAYER2);
            return true;
        }

        return false;
    }

    private applyDormantBallEffects(ballPosition: Position, player: Player): void {
        // Recalculate the ball path to determine what box effects should be applied
        // We need to trace back how this ball got to its position and apply box changes
        
        // For now, we'll implement a simplified version that checks if the ball
        // is directly above a box and applies the effect
        const belowRow = ballPosition.row + 1;
        if (this.isValidPosition(belowRow, ballPosition.col)) {
            const belowCell = this.getCell(belowRow, ballPosition.col);
            if (belowCell && belowCell.type === CellType.BOX && belowCell.direction) {
                // Flip the box direction as if the ball had just hit it
                belowCell.direction = belowCell.direction === Direction.LEFT ? Direction.RIGHT : Direction.LEFT;
            }
        }
    }

    public getDormantBalls(): DormantBall[] {
        const dormantBalls: DormantBall[] = [];
        let ballIdCounter = 0;

        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {
                const cell = this.cells[row][col];
                if (cell.type === CellType.DORMANT_BALL_P1 || cell.type === CellType.DORMANT_BALL_P2) {
                    const player = cell.type === CellType.DORMANT_BALL_P1 ? Player.PLAYER1 : Player.PLAYER2;
                    dormantBalls.push({
                        position: { row, col },
                        player,
                        ballId: `ball_${player}_${ballIdCounter++}`
                    });
                }
            }
        }

        return dormantBalls;
    }

    public isDormantBall(row: number, col: number): boolean {
        const cell = this.getCell(row, col);
        return cell !== null && (cell.type === CellType.DORMANT_BALL_P1 || cell.type === CellType.DORMANT_BALL_P2);
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

    private findOtherPortalPosition(portalType: CellType, currentPortalPosition: Position): Position | null {
        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {
                if (this.cells[row][col].type === portalType && 
                    !(row === currentPortalPosition.row && col === currentPortalPosition.col)) {
                    return { row, col };
                }
            }
        }
        return null;
    }
}