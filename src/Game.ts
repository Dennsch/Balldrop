import { Grid } from './Grid.js';
import { GameConfig, GameState, Player, GameResult, Position } from './types.js';

export class Game {
    private grid: Grid;
    private config: GameConfig;
    private state: GameState;
    private currentPlayer: Player;
    private ballsRemaining: Map<Player, number>;
    private onStateChange?: (game: Game) => void;
    private onBallDropped?: (position: Position, player: Player) => void;

    constructor(config: Partial<GameConfig> = {}) {
        this.config = {
            gridSize: 20,
            ballsPerPlayer: 10,
            minBoxes: 15,
            maxBoxes: 30,
            ...config
        };

        this.grid = new Grid(this.config.gridSize);
        this.state = GameState.SETUP;
        this.currentPlayer = Player.PLAYER1;
        this.ballsRemaining = new Map();
        this.ballsRemaining.set(Player.PLAYER1, this.config.ballsPerPlayer);
        this.ballsRemaining.set(Player.PLAYER2, this.config.ballsPerPlayer);
    }

    public startNewGame(): void {
        this.grid.clearGrid();
        this.grid.placeRandomBoxes(this.config.minBoxes, this.config.maxBoxes);
        this.state = GameState.PLAYING;
        this.currentPlayer = Player.PLAYER1;
        this.ballsRemaining.set(Player.PLAYER1, this.config.ballsPerPlayer);
        this.ballsRemaining.set(Player.PLAYER2, this.config.ballsPerPlayer);
        this.notifyStateChange();
    }

    public dropBall(col: number): boolean {
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

        const position = this.grid.dropBall(col, this.currentPlayer);
        if (position) {
            this.ballsRemaining.set(this.currentPlayer, ballsLeft - 1);
            
            if (this.onBallDropped) {
                this.onBallDropped(position, this.currentPlayer);
            }

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
        if (this.state !== GameState.PLAYING) {
            return false;
        }

        const ballsLeft = this.ballsRemaining.get(this.currentPlayer) || 0;
        return ballsLeft > 0 && !this.grid.isColumnFull(col);
    }

    public reset(): void {
        this.grid.clearGrid();
        this.state = GameState.SETUP;
        this.currentPlayer = Player.PLAYER1;
        this.ballsRemaining.set(Player.PLAYER1, this.config.ballsPerPlayer);
        this.ballsRemaining.set(Player.PLAYER2, this.config.ballsPerPlayer);
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

    // Event handlers
    public onStateChangeHandler(callback: (game: Game) => void): void {
        this.onStateChange = callback;
    }

    public onBallDroppedHandler(callback: (position: Position, player: Player) => void): void {
        this.onBallDropped = callback;
    }

    private notifyStateChange(): void {
        if (this.onStateChange) {
            this.onStateChange(this);
        }
    }
}