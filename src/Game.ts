import { Grid } from './Grid.js';
import { GameConfig, GameState, Player, GameResult, Position, BallPath, GameMode, MoveSelection, ExecutionDirection, BallReleaseSelection, DormantBall } from './types.js';

export class Game {
    private grid: Grid;
    private config: GameConfig;
    private state: GameState;
    private currentPlayer: Player;
    private ballsRemaining: Map<Player, number>;
    private moveSelection: MoveSelection;
    private ballReleaseSelection: BallReleaseSelection;
    private usedColumns: Set<number>; // Track which columns have been used (universal restriction)
    private columnOwners: Map<number, Player>; // Track which player clicked each column (for normal mode)
    private onStateChange?: (game: Game) => void;
    private onBallDropped?: (ballPath: BallPath) => void;
    private onMovesExecuted?: (ballPaths: BallPath[]) => void;

    constructor(config: Partial<GameConfig> = {}) {
        this.config = {
            gridSize: 20,
            ballsPerPlayer: 10,
            minBoxes: 15,
            maxBoxes: 30,
            gameMode: GameMode.NORMAL,
            ...config
        };

        this.grid = new Grid(this.config.gridSize);
        this.state = GameState.SETUP;
        this.currentPlayer = Player.PLAYER1;
        this.ballsRemaining = new Map();
        this.ballsRemaining.set(Player.PLAYER1, this.config.ballsPerPlayer);
        this.ballsRemaining.set(Player.PLAYER2, this.config.ballsPerPlayer);
        
        this.moveSelection = {
            player1Moves: [],
            player2Moves: [],
            currentSelectionPlayer: Player.PLAYER1,
            allMovesSelected: false,
            columnOwners: new Map<number, Player>()
        };
        
        this.ballReleaseSelection = {
            player1ReleasedBalls: new Set<string>(),
            player2ReleasedBalls: new Set<string>(),
            currentReleasePlayer: Player.PLAYER1,
            allBallsReleased: false,
            dormantBalls: new Map<string, DormantBall>()
        };
        
        this.usedColumns = new Set<number>();
        this.columnOwners = new Map<number, Player>();
    }

    public startNewGame(): void {
        this.grid.clearGrid();
        this.grid.placeRandomBoxes(this.config.minBoxes, this.config.maxBoxes);
        
        if (this.config.gameMode === GameMode.HARD_MODE) {
            this.state = GameState.BALL_PLACEMENT_PHASE;
        } else {
            this.state = GameState.PLAYING;
        }
        
        this.currentPlayer = Player.PLAYER1;
        this.ballsRemaining.set(Player.PLAYER1, this.config.ballsPerPlayer);
        this.ballsRemaining.set(Player.PLAYER2, this.config.ballsPerPlayer);
        
        // Reset move selection
        this.moveSelection = {
            player1Moves: [],
            player2Moves: [],
            currentSelectionPlayer: Player.PLAYER1,
            allMovesSelected: false,
            columnOwners: new Map<number, Player>()
        };
        
        // Reset ball release selection
        this.ballReleaseSelection = {
            player1ReleasedBalls: new Set<string>(),
            player2ReleasedBalls: new Set<string>(),
            currentReleasePlayer: Player.PLAYER1,
            allBallsReleased: false,
            dormantBalls: new Map<string, DormantBall>()
        };
        
        // Reset used columns tracking
        this.usedColumns = new Set<number>();
        this.columnOwners = new Map<number, Player>();
        
        this.notifyStateChange();
    }

    public dropBall(col: number): boolean {
        if (this.config.gameMode === GameMode.HARD_MODE) {
            return this.selectMove(col);
        }
        
        if (this.state !== GameState.PLAYING) {
            return false;
        }

        if (this.grid.isColumnFull(col)) {
            return false;
        }

        // Check if column has already been used (universal restriction)
        if (this.usedColumns.has(col)) {
            return false;
        }

        const ballsLeft = this.ballsRemaining.get(this.currentPlayer) || 0;
        if (ballsLeft <= 0) {
            return false;
        }

        // Calculate the ball path without applying changes to the grid yet
        const result = this.grid.calculateBallPath(col, this.currentPlayer);
        if (result.finalPosition && result.ballPath) {
            this.ballsRemaining.set(this.currentPlayer, ballsLeft - 1);
            
            // Mark column as used and track ownership
            this.usedColumns.add(col);
            this.columnOwners.set(col, this.currentPlayer);
            
            if (this.onBallDropped) {
                // Use the detailed ball path from the grid
                this.onBallDropped(result.ballPath);
            }

            return true;
        }

        return false;
    }

    public selectMove(col: number): boolean {
        if (this.state !== GameState.BALL_PLACEMENT_PHASE) {
            return false;
        }

        if (this.grid.isColumnFull(col)) {
            return false;
        }

        // Hard mode rule: only one ball per column is allowed
        if (this.moveSelection.columnOwners.has(col)) {
            return false; // Column already selected by a player
        }

        const currentMoves = this.currentPlayer === Player.PLAYER1 
            ? this.moveSelection.player1Moves 
            : this.moveSelection.player2Moves;

        if (currentMoves.length >= this.config.ballsPerPlayer) {
            return false;
        }

        // Add the move and track column ownership
        currentMoves.push(col);
        this.moveSelection.columnOwners.set(col, this.currentPlayer);

        // Check if current player has selected all moves
        if (currentMoves.length === this.config.ballsPerPlayer) {
            if (this.currentPlayer === Player.PLAYER1) {
                // Switch to player 2
                this.currentPlayer = Player.PLAYER2;
                this.moveSelection.currentSelectionPlayer = Player.PLAYER2;
            } else {
                // Both players have selected all moves - place dormant balls and transition to release phase
                this.moveSelection.allMovesSelected = true;
                this.placeDormantBalls();
                this.state = GameState.BALL_RELEASE_PHASE;
                this.currentPlayer = Player.PLAYER1; // Reset to player 1 for release phase
                this.ballReleaseSelection.currentReleasePlayer = Player.PLAYER1;
            }
        }

        this.notifyStateChange();
        return true;
    }

    private placeDormantBalls(): void {
        // Place all selected balls as dormant balls
        const allBallPaths: BallPath[] = [];
        
        // Place player 1 balls as dormant
        for (const col of this.moveSelection.player1Moves) {
            const result = this.grid.calculateBallPath(col, Player.PLAYER1);
            if (result.ballPath) {
                this.grid.applyBallPath(result.ballPath, true); // true = dormant
                allBallPaths.push(result.ballPath);
            }
        }
        
        // Place player 2 balls as dormant
        for (const col of this.moveSelection.player2Moves) {
            const result = this.grid.calculateBallPath(col, Player.PLAYER2);
            if (result.ballPath) {
                this.grid.applyBallPath(result.ballPath, true); // true = dormant
                allBallPaths.push(result.ballPath);
            }
        }

        // Update dormant balls tracking
        const dormantBalls = this.grid.getDormantBalls();
        this.ballReleaseSelection.dormantBalls.clear();
        for (const ball of dormantBalls) {
            this.ballReleaseSelection.dormantBalls.set(ball.ballId, ball);
        }

        // Set balls remaining to 0 for both players (they're all placed now)
        this.ballsRemaining.set(Player.PLAYER1, 0);
        this.ballsRemaining.set(Player.PLAYER2, 0);
    }

    public releaseBall(row: number, col: number): boolean {
        if (this.state !== GameState.BALL_RELEASE_PHASE) {
            return false;
        }

        // Check if there's a dormant ball at this position
        if (!this.grid.isDormantBall(row, col)) {
            return false;
        }

        // Find the dormant ball at this position
        let targetBallId: string | null = null;
        for (const [ballId, ball] of this.ballReleaseSelection.dormantBalls) {
            if (ball.position.row === row && ball.position.col === col) {
                // Check if this ball belongs to the current player
                if (ball.player !== this.currentPlayer) {
                    return false; // Players can only release their own balls
                }
                targetBallId = ballId;
                break;
            }
        }

        if (!targetBallId) {
            return false;
        }

        // Release the ball (activate it)
        if (this.grid.activateDormantBall({ row, col })) {
            // Track that this ball has been released
            if (this.currentPlayer === Player.PLAYER1) {
                this.ballReleaseSelection.player1ReleasedBalls.add(targetBallId);
            } else {
                this.ballReleaseSelection.player2ReleasedBalls.add(targetBallId);
            }

            // Remove from dormant balls tracking
            this.ballReleaseSelection.dormantBalls.delete(targetBallId);

            // Check if all balls have been released
            const totalBalls = this.config.ballsPerPlayer * 2;
            const releasedBalls = this.ballReleaseSelection.player1ReleasedBalls.size + 
                                this.ballReleaseSelection.player2ReleasedBalls.size;
            
            if (releasedBalls >= totalBalls) {
                this.ballReleaseSelection.allBallsReleased = true;
                this.state = GameState.FINISHED;
            } else {
                // Switch to the other player
                this.currentPlayer = this.currentPlayer === Player.PLAYER1 ? Player.PLAYER2 : Player.PLAYER1;
                this.ballReleaseSelection.currentReleasePlayer = this.currentPlayer;
            }

            this.notifyStateChange();
            return true;
        }

        return false;
    }

    public executeAllMoves(): boolean {
        if ((this.state !== GameState.SELECTING_MOVES && this.state !== GameState.BALL_PLACEMENT_PHASE) || 
            !this.moveSelection.allMovesSelected) {
            return false;
        }

        this.state = GameState.EXECUTING_MOVES;
        this.notifyStateChange();

        // Execute all moves simultaneously
        const allBallPaths: BallPath[] = [];
        
        // Execute player 1 moves
        for (const col of this.moveSelection.player1Moves) {
            const result = this.grid.calculateBallPath(col, Player.PLAYER1);
            if (result.ballPath) {
                allBallPaths.push(result.ballPath);
            }
        }
        
        // Execute player 2 moves
        for (const col of this.moveSelection.player2Moves) {
            const result = this.grid.calculateBallPath(col, Player.PLAYER2);
            if (result.ballPath) {
                allBallPaths.push(result.ballPath);
            }
        }

        // Set balls remaining to 0 for both players
        this.ballsRemaining.set(Player.PLAYER1, 0);
        this.ballsRemaining.set(Player.PLAYER2, 0);

        if (this.onMovesExecuted) {
            this.onMovesExecuted(allBallPaths);
        }

        return true;
    }

    public executeMovesLeftToRight(): boolean {
        return this.executeMovesDirectional(ExecutionDirection.LEFT_TO_RIGHT);
    }

    public executeMovesRightToLeft(): boolean {
        return this.executeMovesDirectional(ExecutionDirection.RIGHT_TO_LEFT);
    }

    private executeMovesDirectional(direction: ExecutionDirection): boolean {
        if ((this.state !== GameState.SELECTING_MOVES && this.state !== GameState.BALL_PLACEMENT_PHASE) || 
            !this.moveSelection.allMovesSelected) {
            return false;
        }

        this.state = GameState.EXECUTING_MOVES;
        this.notifyStateChange();

        // Get all selected columns and sort them based on execution direction
        const allColumns: Array<{col: number, player: Player}> = [];
        
        // Add player 1 moves
        for (const col of this.moveSelection.player1Moves) {
            allColumns.push({col, player: Player.PLAYER1});
        }
        
        // Add player 2 moves
        for (const col of this.moveSelection.player2Moves) {
            allColumns.push({col, player: Player.PLAYER2});
        }

        // Sort columns based on execution direction
        if (direction === ExecutionDirection.LEFT_TO_RIGHT) {
            allColumns.sort((a, b) => a.col - b.col); // Ascending order (left to right)
        } else {
            allColumns.sort((a, b) => b.col - a.col); // Descending order (right to left)
        }

        // Execute moves in the specified order
        const allBallPaths: BallPath[] = [];
        for (const {col, player} of allColumns) {
            const result = this.grid.calculateBallPath(col, player);
            if (result.ballPath) {
                allBallPaths.push(result.ballPath);
                // Apply the ball path immediately to affect subsequent ball calculations
                this.grid.applyBallPath(result.ballPath);
            }
        }

        // Set balls remaining to 0 for both players
        this.ballsRemaining.set(Player.PLAYER1, 0);
        this.ballsRemaining.set(Player.PLAYER2, 0);

        if (this.onMovesExecuted) {
            this.onMovesExecuted(allBallPaths);
        }

        return true;
    }

    public completeMovesExecution(ballPaths: BallPath[]): void {
        // For directional execution, ball paths are already applied during execution
        // For simultaneous execution (executeAllMoves), we need to apply them here
        if (ballPaths.length > 0) {
            // Check if paths are already applied by looking at the grid
            const firstPath = ballPaths[0];
            const cell = this.grid.getCell(firstPath.finalPosition.row, firstPath.finalPosition.col);
            
            // If the cell doesn't have the expected ball, apply all paths
            const expectedBallType = firstPath.player === Player.PLAYER1 ? 'BALL_P1' : 'BALL_P2';
            if (!cell || cell.type !== expectedBallType) {
                for (const ballPath of ballPaths) {
                    this.grid.applyBallPath(ballPath);
                }
            }
        }

        this.state = GameState.FINISHED;
        this.notifyStateChange();
    }

    // Synchronous version for testing - immediately applies the ball drop
    public dropBallSync(col: number): boolean {
        if (this.state !== GameState.PLAYING) {
            return false;
        }

        if (this.grid.isColumnFull(col)) {
            return false;
        }

        // Check if column has already been used (universal restriction)
        if (this.usedColumns.has(col)) {
            return false;
        }

        const ballsLeft = this.ballsRemaining.get(this.currentPlayer) || 0;
        if (ballsLeft <= 0) {
            return false;
        }

        // Use the original synchronous method for testing
        const result = this.grid.dropBallWithPath(col, this.currentPlayer);
        if (result.finalPosition && result.ballPath) {
            this.ballsRemaining.set(this.currentPlayer, ballsLeft - 1);

            // Mark column as used
            this.usedColumns.add(col);

            // Check if game is finished
            if (this.isGameFinished()) {
                this.state = GameState.FINISHED;
            } else {
                // Switch to next player
                this.currentPlayer = this.currentPlayer === Player.PLAYER1 ? Player.PLAYER2 : Player.PLAYER1;
            }

            this.notifyStateChange();
            return true;
        }

        return false;
    }

    public completeBallDrop(ballPath: BallPath): void {
        // Apply the ball path changes to the grid after animation completes
        this.grid.applyBallPath(ballPath);

        // Check if game is finished
        if (this.isGameFinished()) {
            this.state = GameState.FINISHED;
        } else {
            // Switch to next player
            this.currentPlayer = this.currentPlayer === Player.PLAYER1 ? Player.PLAYER2 : Player.PLAYER1;
        }

        this.notifyStateChange();
    }

    public isGameFinished(): boolean {
        const p1Balls = this.ballsRemaining.get(Player.PLAYER1) || 0;
        const p2Balls = this.ballsRemaining.get(Player.PLAYER2) || 0;
        return p1Balls === 0 && p2Balls === 0;
    }

    public getGameResult(): GameResult {
        const columnWinners = this.grid.getColumnWinners();
        let player1Columns = 0;
        let player2Columns = 0;

        columnWinners.forEach(winner => {
            if (winner === Player.PLAYER1) {
                player1Columns++;
            } else if (winner === Player.PLAYER2) {
                player2Columns++;
            }
        });

        let winner: Player | null = null;
        let isTie = false;

        if (player1Columns > player2Columns) {
            winner = Player.PLAYER1;
        } else if (player2Columns > player1Columns) {
            winner = Player.PLAYER2;
        } else {
            isTie = true;
        }

        return {
            winner,
            player1Columns,
            player2Columns,
            isTie
        };
    }

    public canDropInColumn(col: number): boolean {
        if (this.config.gameMode === GameMode.HARD_MODE) {
            return this.canSelectMove(col);
        }
        
        if (this.state !== GameState.PLAYING) {
            return false;
        }

        // Check if column has already been used (universal restriction)
        if (this.usedColumns.has(col)) {
            return false;
        }

        const ballsLeft = this.ballsRemaining.get(this.currentPlayer) || 0;
        return ballsLeft > 0 && !this.grid.isColumnFull(col);
    }

    public canSelectMove(col: number): boolean {
        if (this.state !== GameState.BALL_PLACEMENT_PHASE) {
            return false;
        }

        if (this.grid.isColumnFull(col)) {
            return false;
        }

        // Hard mode rule: only one ball per column is allowed
        if (this.moveSelection.columnOwners.has(col)) {
            return false; // Column already selected by a player
        }

        const currentMoves = this.currentPlayer === Player.PLAYER1 
            ? this.moveSelection.player1Moves 
            : this.moveSelection.player2Moves;

        return currentMoves.length < this.config.ballsPerPlayer;
    }

    public reset(): void {
        this.grid.clearGrid();
        this.state = GameState.SETUP;
        this.currentPlayer = Player.PLAYER1;
        this.ballsRemaining.set(Player.PLAYER1, this.config.ballsPerPlayer);
        this.ballsRemaining.set(Player.PLAYER2, this.config.ballsPerPlayer);
        
        // Reset move selection
        this.moveSelection = {
            player1Moves: [],
            player2Moves: [],
            currentSelectionPlayer: Player.PLAYER1,
            allMovesSelected: false,
            columnOwners: new Map<number, Player>()
        };
        
        // Reset ball release selection
        this.ballReleaseSelection = {
            player1ReleasedBalls: new Set<string>(),
            player2ReleasedBalls: new Set<string>(),
            currentReleasePlayer: Player.PLAYER1,
            allBallsReleased: false,
            dormantBalls: new Map<string, DormantBall>()
        };
        
        // Reset used columns tracking
        this.usedColumns = new Set<number>();
        this.columnOwners = new Map<number, Player>();
        
        this.notifyStateChange();
    }

    // Getters
    public getGrid(): Grid {
        return this.grid;
    }

    public getState(): GameState {
        return this.state;
    }

    public getCurrentPlayer(): Player {
        return this.currentPlayer;
    }

    public getBallsRemaining(player: Player): number {
        return this.ballsRemaining.get(player) || 0;
    }

    public getConfig(): GameConfig {
        return { ...this.config };
    }

    public getMoveSelection(): MoveSelection {
        return { ...this.moveSelection };
    }

    public getGameMode(): GameMode {
        return this.config.gameMode;
    }

    public setGameMode(mode: GameMode): void {
        this.config.gameMode = mode;
        // Reset the game when mode changes
        this.reset();
    }

    public canExecuteAllMoves(): boolean {
        return (this.state === GameState.SELECTING_MOVES || this.state === GameState.BALL_PLACEMENT_PHASE) && 
               this.moveSelection.allMovesSelected;
    }

    public getSelectedMovesCount(player: Player): number {
        return player === Player.PLAYER1 
            ? this.moveSelection.player1Moves.length 
            : this.moveSelection.player2Moves.length;
    }

    public getColumnOwners(): Map<number, Player> {
        if (this.config.gameMode === GameMode.HARD_MODE) {
            return new Map(this.moveSelection.columnOwners);
        } else {
            return new Map(this.columnOwners);
        }
    }

    public getUsedColumns(): Set<number> {
        return new Set(this.usedColumns);
    }

    public getBallReleaseSelection(): BallReleaseSelection {
        return {
            player1ReleasedBalls: new Set(this.ballReleaseSelection.player1ReleasedBalls),
            player2ReleasedBalls: new Set(this.ballReleaseSelection.player2ReleasedBalls),
            currentReleasePlayer: this.ballReleaseSelection.currentReleasePlayer,
            allBallsReleased: this.ballReleaseSelection.allBallsReleased,
            dormantBalls: new Map(this.ballReleaseSelection.dormantBalls)
        };
    }

    public canReleaseBall(row: number, col: number): boolean {
        if (this.state !== GameState.BALL_RELEASE_PHASE) {
            return false;
        }

        // Check if there's a dormant ball at this position
        if (!this.grid.isDormantBall(row, col)) {
            return false;
        }

        // Find the dormant ball at this position and check if it belongs to current player
        for (const [ballId, ball] of this.ballReleaseSelection.dormantBalls) {
            if (ball.position.row === row && ball.position.col === col) {
                return ball.player === this.currentPlayer;
            }
        }

        return false;
    }

    public getDormantBallsForPlayer(player: Player): DormantBall[] {
        const playerBalls: DormantBall[] = [];
        for (const ball of this.ballReleaseSelection.dormantBalls.values()) {
            if (ball.player === player) {
                playerBalls.push(ball);
            }
        }
        return playerBalls;
    }

    public getReleasedBallsCount(player: Player): number {
        return player === Player.PLAYER1 
            ? this.ballReleaseSelection.player1ReleasedBalls.size
            : this.ballReleaseSelection.player2ReleasedBalls.size;
    }

    // Event handlers
    public onStateChangeHandler(callback: (game: Game) => void): void {
        this.onStateChange = callback;
    }

    public onBallDroppedHandler(callback: (ballPath: BallPath) => void): void {
        this.onBallDropped = callback;
    }

    public onMovesExecutedHandler(callback: (ballPaths: BallPath[]) => void): void {
        this.onMovesExecuted = callback;
    }

    private notifyStateChange(): void {
        if (this.onStateChange) {
            this.onStateChange(this);
        }
    }
}