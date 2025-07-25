import { Grid } from './Grid.js';
import { GameConfig, GameState, Player, GameResult, Position, BallPath, GameMode, MoveSelection } from './types.js';

export class Game {
    private grid: Grid;
    private config: GameConfig;
    private state: GameState;
    private currentPlayer: Player;
    private ballsRemaining: Map<Player, number>;
    private moveSelection: MoveSelection;
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
            allMovesSelected: false
        };
    }

    public startNewGame(): void {
        this.grid.clearGrid();
        this.grid.placeRandomBoxes(this.config.minBoxes, this.config.maxBoxes);
        
        if (this.config.gameMode === GameMode.HARD_MODE) {
            this.state = GameState.SELECTING_MOVES;
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
            allMovesSelected: false
        };
        
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

        const ballsLeft = this.ballsRemaining.get(this.currentPlayer) || 0;
        if (ballsLeft <= 0) {
            return false;
        }

        // Calculate the ball path without applying changes to the grid yet
        const result = this.grid.calculateBallPath(col, this.currentPlayer);
        if (result.finalPosition && result.ballPath) {
            this.ballsRemaining.set(this.currentPlayer, ballsLeft - 1);
            
            if (this.onBallDropped) {
                // Use the detailed ball path from the grid
                this.onBallDropped(result.ballPath);
            }

            return true;
        }

        return false;
    }

    public selectMove(col: number): boolean {
        if (this.state !== GameState.SELECTING_MOVES) {
            return false;
        }

        if (this.grid.isColumnFull(col)) {
            return false;
        }

        const currentMoves = this.currentPlayer === Player.PLAYER1 
            ? this.moveSelection.player1Moves 
            : this.moveSelection.player2Moves;

        if (currentMoves.length >= this.config.ballsPerPlayer) {
            return false;
        }

        // Add the move
        currentMoves.push(col);

        // Check if current player has selected all moves
        if (currentMoves.length === this.config.ballsPerPlayer) {
            if (this.currentPlayer === Player.PLAYER1) {
                // Switch to player 2
                this.currentPlayer = Player.PLAYER2;
                this.moveSelection.currentSelectionPlayer = Player.PLAYER2;
            } else {
                // Both players have selected all moves
                this.moveSelection.allMovesSelected = true;
            }
        }

        this.notifyStateChange();
        return true;
    }

    public executeAllMoves(): boolean {
        if (this.state !== GameState.SELECTING_MOVES || !this.moveSelection.allMovesSelected) {
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

    public completeMovesExecution(ballPaths: BallPath[]): void {
        // Apply all ball paths to the grid
        for (const ballPath of ballPaths) {
            this.grid.applyBallPath(ballPath);
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

        const ballsLeft = this.ballsRemaining.get(this.currentPlayer) || 0;
        if (ballsLeft <= 0) {
            return false;
        }

        // Use the original synchronous method for testing
        const result = this.grid.dropBallWithPath(col, this.currentPlayer);
        if (result.finalPosition && result.ballPath) {
            this.ballsRemaining.set(this.currentPlayer, ballsLeft - 1);

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

        const ballsLeft = this.ballsRemaining.get(this.currentPlayer) || 0;
        return ballsLeft > 0 && !this.grid.isColumnFull(col);
    }

    public canSelectMove(col: number): boolean {
        if (this.state !== GameState.SELECTING_MOVES) {
            return false;
        }

        if (this.grid.isColumnFull(col)) {
            return false;
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
            allMovesSelected: false
        };
        
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
        return this.state === GameState.SELECTING_MOVES && this.moveSelection.allMovesSelected;
    }

    public getSelectedMovesCount(player: Player): number {
        return player === Player.PLAYER1 
            ? this.moveSelection.player1Moves.length 
            : this.moveSelection.player2Moves.length;
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