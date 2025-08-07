import { Grid } from "./Grid";
import {
  GameConfig,
  GameState,
  Player,
  GameResult,
  Position,
  BallPath,
  GameMode,
  MoveSelection,
  BallReleaseSelection,
  DormantBall,
  ColumnReservation,
} from "./types.js";
import { SoundManager } from "./utils/SoundManager.js";

export class Game {
  private grid: Grid;
  private config: GameConfig;
  private state: GameState;
  private currentPlayer: Player;
  private ballsRemaining: Map<Player, number>;
  private moveSelection: MoveSelection;
  private soundManager: SoundManager;
  private ballReleaseSelection: BallReleaseSelection;
  private columnReservation: ColumnReservation;
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
      ...config,
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
      columnOwners: new Map<number, Player>(),
    };

    this.ballReleaseSelection = {
      player1ReleasedBalls: new Set<string>(),
      player2ReleasedBalls: new Set<string>(),
      currentReleasePlayer: Player.PLAYER1,
      allBallsReleased: false,
      dormantBalls: new Map<string, DormantBall>(),
    };

    this.columnReservation = {
      player1ReservedColumns: [],
      player2ReservedColumns: [],
      currentReservationPlayer: Player.PLAYER1,
      allColumnsReserved: false,
      reservedColumnOwners: new Map<number, Player>(),
    };

    this.usedColumns = new Set<number>();
    this.columnOwners = new Map<number, Player>();
    this.soundManager = SoundManager.getInstance();
  }

  public startNewGame(): void {
    console.log("new");
    this.grid.clearGrid();
    this.grid.placeRandomBoxes(this.config.minBoxes, this.config.maxBoxes);

    if (this.config.gameMode === GameMode.HARD_MODE) {
      this.state = GameState.COLUMN_RESERVATION_PHASE;
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
      columnOwners: new Map<number, Player>(),
    };

    // Reset ball release selection
    this.ballReleaseSelection = {
      player1ReleasedBalls: new Set<string>(),
      player2ReleasedBalls: new Set<string>(),
      currentReleasePlayer: Player.PLAYER1,
      allBallsReleased: false,
      dormantBalls: new Map<string, DormantBall>(),
    };

    // Reset column reservation
    this.columnReservation = {
      player1ReservedColumns: [],
      player2ReservedColumns: [],
      currentReservationPlayer: Player.PLAYER1,
      allColumnsReserved: false,
      reservedColumnOwners: new Map<number, Player>(),
    };

    // Reset used columns tracking
    this.usedColumns = new Set<number>();
    this.columnOwners = new Map<number, Player>();

    this.notifyStateChange();
  }

  public dropBall(col: number): boolean {
    if (this.config.gameMode === GameMode.HARD_MODE) {
      // In hard mode, handle different phases differently
      if (this.state === GameState.COLUMN_RESERVATION_PHASE) {
        return this.reserveColumn(col);
      } else if (this.state === GameState.BALL_PLACEMENT_PHASE) {
        return this.selectMove(col);
      } else if (this.state === GameState.BALL_RELEASE_PHASE) {
        // In release phase, use the releaseBall method
        return this.releaseBall(col);
      } else {
        return this.selectMove(col);
      }
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
    try {
      const result = this.grid.calculateBallPath(col, this.currentPlayer);
      if (result.finalPosition && result.ballPath) {
        this.ballsRemaining.set(this.currentPlayer, ballsLeft - 1);

        // Mark column as used and track ownership
        this.usedColumns.add(col);
        this.columnOwners.set(col, this.currentPlayer);

        // Play pop sound when ball is dropped
        this.soundManager.playSound("pop", 0.6);

        if (this.onBallDropped) {
          // Use the detailed ball path from the grid
          this.onBallDropped(result.ballPath);
        }

        return true;
      }
    } catch (error) {
      console.error("Error calculating ball path:", error);
      // Return false to indicate the drop failed
    }

    return false;
  }

  public reserveColumn(col: number): boolean {
    if (this.state !== GameState.COLUMN_RESERVATION_PHASE) {
      return false;
    }

    if (this.grid.isColumnFull(col)) {
      return false;
    }

    // Hard mode rule: only one ball per column is allowed
    if (this.columnReservation.reservedColumnOwners.has(col)) {
      return false; // Column already reserved by a player
    }

    const currentReservedColumns =
      this.currentPlayer === Player.PLAYER1
        ? this.columnReservation.player1ReservedColumns
        : this.columnReservation.player2ReservedColumns;

    if (currentReservedColumns.length >= this.config.ballsPerPlayer) {
      return false;
    }

    // Reserve the column (don't place ball yet)
    currentReservedColumns.push(col);
    this.columnReservation.reservedColumnOwners.set(col, this.currentPlayer);

    // Check if all columns have been reserved by both players
    const totalColumnsReserved =
      this.columnReservation.player1ReservedColumns.length +
      this.columnReservation.player2ReservedColumns.length;
    const totalColumnsNeeded = this.config.ballsPerPlayer * 2;

    if (totalColumnsReserved >= totalColumnsNeeded) {
      // All columns reserved - transition directly to ball release phase
      this.columnReservation.allColumnsReserved = true;
      this.state = GameState.BALL_RELEASE_PHASE;
      this.currentPlayer = Player.PLAYER1; // Reset to player 1 for ball release phase
      this.ballReleaseSelection.currentReleasePlayer = Player.PLAYER1;
    } else {
      // Switch to the other player for next column reservation
      this.currentPlayer =
        this.currentPlayer === Player.PLAYER1 ? Player.PLAYER2 : Player.PLAYER1;
      this.columnReservation.currentReservationPlayer = this.currentPlayer;
    }

    this.notifyStateChange();
    return true;
  }

  public selectMove(col: number): boolean {
    if (this.state !== GameState.BALL_PLACEMENT_PHASE) {
      return false;
    }

    if (this.grid.isColumnFull(col)) {
      return false;
    }

    // In hard mode, players can only place balls in columns they reserved
    if (this.config.gameMode === GameMode.HARD_MODE) {
      const columnOwner = this.columnReservation.reservedColumnOwners.get(col);
      if (columnOwner !== this.currentPlayer) {
        return false; // Player can only place balls in their own reserved columns
      }
    } else {
      // Hard mode rule: only one ball per column is allowed
      if (this.moveSelection.columnOwners.has(col)) {
        return false; // Column already selected by a player
      }
    }

    const currentMoves =
      this.currentPlayer === Player.PLAYER1
        ? this.moveSelection.player1Moves
        : this.moveSelection.player2Moves;

    if (currentMoves.length >= this.config.ballsPerPlayer) {
      return false;
    }

    // Add the move and track column ownership
    currentMoves.push(col);
    this.moveSelection.columnOwners.set(col, this.currentPlayer);

    // Place the dormant ball immediately for this move
    this.placeSingleDormantBall(col, this.currentPlayer);

    // Check if all balls have been placed by both players
    const totalBallsPlaced =
      this.moveSelection.player1Moves.length +
      this.moveSelection.player2Moves.length;
    const totalBallsNeeded = this.config.ballsPerPlayer * 2;

    if (totalBallsPlaced >= totalBallsNeeded) {
      // All balls placed - transition to release phase
      this.moveSelection.allMovesSelected = true;
      this.state = GameState.BALL_RELEASE_PHASE;
      this.currentPlayer = Player.PLAYER1; // Reset to player 1 for release phase
      this.ballReleaseSelection.currentReleasePlayer = Player.PLAYER1;
    } else {
      // Switch to the other player for next ball placement
      this.currentPlayer =
        this.currentPlayer === Player.PLAYER1 ? Player.PLAYER2 : Player.PLAYER1;
      this.moveSelection.currentSelectionPlayer = this.currentPlayer;
    }

    this.notifyStateChange();
    return true;
  }

  private placeSingleDormantBall(col: number, player: Player): void {
    // Calculate and place a single dormant ball immediately
    try {
      const result = this.grid.calculateBallPath(col, player);
      if (result.ballPath) {
        this.grid.applyBallPath(result.ballPath, true); // true = dormant

        // Update dormant balls tracking
        const dormantBalls = this.grid.getDormantBalls();
        this.ballReleaseSelection.dormantBalls.clear();
        for (const ball of dormantBalls) {
          this.ballReleaseSelection.dormantBalls.set(ball.ballId, ball);
        }
      }
    } catch (error) {
      console.error("Error placing dormant ball:", error);
      // Continue execution - don't let portal errors break the game flow
    }
  }

  public releaseBall(col: number): boolean {
    if (this.state !== GameState.BALL_RELEASE_PHASE) {
      return false;
    }

    // Check if this column was reserved
    if (!this.columnReservation.reservedColumnOwners.has(col)) {
      return false; // Column was not reserved
    }

    const columnOwner = this.columnReservation.reservedColumnOwners.get(col);

    // TURN-BASED RESTRICTION: Only the current player can release balls
    if (columnOwner !== this.currentPlayer) {
      return false; // Not the current player's turn
    }

    // Check if column is full
    if (this.grid.isColumnFull(col)) {
      return false;
    }

    // Check if this column still has balls to release (each ball can only be released once)
    const currentReservedColumns =
      columnOwner === Player.PLAYER1
        ? this.columnReservation.player1ReservedColumns
        : this.columnReservation.player2ReservedColumns;

    if (!currentReservedColumns.includes(col)) {
      return false; // No more balls to release from this column
    }

    // Calculate the ball path without applying changes to the grid yet (like normal mode)
    const result = this.grid.calculateBallPath(col, columnOwner!);
    if (result.finalPosition && result.ballPath) {
      // Decrease balls remaining for the column owner
      const ballsLeft = this.ballsRemaining.get(columnOwner!) || 0;
      this.ballsRemaining.set(columnOwner!, ballsLeft - 1);

      // Remove ONE instance of this column from reserved columns (each ball can only be released once)
      const columnIndex = currentReservedColumns.indexOf(col);
      if (columnIndex > -1) {
        currentReservedColumns.splice(columnIndex, 1);
      }

      // Mark column as used
      this.usedColumns.add(col);
      this.columnOwners.set(col, columnOwner!);

      // Play pop sound when ball is released
      this.soundManager.playSound("pop", 0.6);

      // Trigger ball dropped callback for animation (like normal mode)
      console.log("🎬 releaseBall: About to trigger animation callback", {
        hasCallback: !!this.onBallDropped,
        ballPath: result.ballPath,
        startColumn: result.ballPath.startColumn,
        player: result.ballPath.player,
      });

      if (this.onBallDropped) {
        this.onBallDropped(result.ballPath);
        console.log(
          "🎬 releaseBall: Animation callback triggered successfully"
        );
      } else {
        console.warn("🎬 releaseBall: No animation callback registered!");
      }

      return true;
    }

    return false;
  }

  public completeBallRelease(ballPath: BallPath): void {
    console.log(
      "🎬 completeBallRelease: Animation completed, applying ball path",
      {
        startColumn: ballPath.startColumn,
        player: ballPath.player,
        finalPosition: ballPath.finalPosition,
      }
    );

    // Apply the ball path changes to the grid after animation completes (like normal mode)
    this.grid.applyBallPath(ballPath);

    // Play impact sound when ball reaches final position
    this.soundManager.playSound("impact", 0.4);

    // Check if game is finished
    if (this.isGameFinished()) {
      this.state = GameState.FINISHED;
    } else {
      // Switch to next player (turn-based like normal mode)
      this.currentPlayer =
        this.currentPlayer === Player.PLAYER1 ? Player.PLAYER2 : Player.PLAYER1;
    }

    this.notifyStateChange();
  }

  public completeMovesExecution(ballPaths: BallPath[]): void {
    // For directional execution, ball paths are already applied during execution
    // For simultaneous execution (executeAllMoves), we need to apply them here
    if (ballPaths.length > 0) {
      // Check if paths are already applied by looking at the grid
      const firstPath = ballPaths[0];
      const cell = this.grid.getCell(
        firstPath.finalPosition.row,
        firstPath.finalPosition.col
      );

      // If the cell doesn't have the expected ball, apply all paths
      const expectedBallType =
        firstPath.player === Player.PLAYER1 ? "BALL_P1" : "BALL_P2";
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
    try {
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
          this.currentPlayer =
            this.currentPlayer === Player.PLAYER1
              ? Player.PLAYER2
              : Player.PLAYER1;
        }

        this.notifyStateChange();
        return true;
      }
    } catch (error) {
      console.error("Error in dropBallSync:", error);
      // Return false to indicate the drop failed
    }

    return false;
  }

  public completeBallDrop(ballPath: BallPath): void {
    // Apply the ball path changes to the grid after animation completes
    this.grid.applyBallPath(ballPath);

    // Play impact sound when ball reaches final position
    this.soundManager.playSound("impact", 0.4);

    // Check if game is finished
    if (this.isGameFinished()) {
      this.state = GameState.FINISHED;
    } else {
      // Switch to next player
      this.currentPlayer =
        this.currentPlayer === Player.PLAYER1 ? Player.PLAYER2 : Player.PLAYER1;
    }

    this.notifyStateChange();
  }

  public isGameFinished(): boolean {
    const p1Balls = this.ballsRemaining.get(Player.PLAYER1) || 0;
    const p2Balls = this.ballsRemaining.get(Player.PLAYER2) || 0;
    return p1Balls === 0 && p2Balls === 0;
  }

  public getCurrentScore(): { player1Columns: number; player2Columns: number } {
    const columnWinners = this.grid.getColumnWinners();
    let player1Columns = 0;
    let player2Columns = 0;

    columnWinners.forEach((winner: Player | null) => {
      if (winner === Player.PLAYER1) {
        player1Columns++;
      } else if (winner === Player.PLAYER2) {
        player2Columns++;
      }
    });

    return { player1Columns, player2Columns };
  }

  public getGameResult(): GameResult {
    const columnWinners = this.grid.getColumnWinners();
    let player1Columns = 0;
    let player2Columns = 0;

    columnWinners.forEach((winner: Player | null) => {
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
      isTie,
    };
  }

  public canDropInColumn(col: number): boolean {
    if (this.config.gameMode === GameMode.HARD_MODE) {
      if (this.state === GameState.COLUMN_RESERVATION_PHASE) {
        return this.canReserveColumn(col);
      } else if (this.state === GameState.BALL_PLACEMENT_PHASE) {
        return this.canSelectMove(col);
      } else if (this.state === GameState.BALL_RELEASE_PHASE) {
        return this.canReleaseBall(col);
      } else {
        return this.canSelectMove(col);
      }
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

  public canReserveColumn(col: number): boolean {
    if (this.state !== GameState.COLUMN_RESERVATION_PHASE) {
      return false;
    }

    if (this.grid.isColumnFull(col)) {
      return false;
    }

    // Hard mode rule: only one ball per column is allowed
    if (this.columnReservation.reservedColumnOwners.has(col)) {
      return false; // Column already reserved by a player
    }

    const currentReservedColumns =
      this.currentPlayer === Player.PLAYER1
        ? this.columnReservation.player1ReservedColumns
        : this.columnReservation.player2ReservedColumns;

    return currentReservedColumns.length < this.config.ballsPerPlayer;
  }

  public canReleaseBall(col: number): boolean {
    if (this.state !== GameState.BALL_RELEASE_PHASE) {
      return false;
    }

    // Check if this column was reserved
    if (!this.columnReservation.reservedColumnOwners.has(col)) {
      return false; // Column was not reserved
    }

    const columnOwner = this.columnReservation.reservedColumnOwners.get(col);

    // TURN-BASED RESTRICTION: Only the current player can release balls
    if (columnOwner !== this.currentPlayer) {
      return false; // Not the current player's turn
    }

    // Check if this column still has balls to release (each ball can only be released once)
    const currentReservedColumns =
      columnOwner === Player.PLAYER1
        ? this.columnReservation.player1ReservedColumns
        : this.columnReservation.player2ReservedColumns;

    if (!currentReservedColumns.includes(col)) {
      return false; // No more balls to release from this column
    }

    // Check if column is full
    return !this.grid.isColumnFull(col);
  }

  public canSelectMove(col: number): boolean {
    if (this.state !== GameState.BALL_PLACEMENT_PHASE) {
      return false;
    }

    if (this.grid.isColumnFull(col)) {
      return false;
    }

    // In hard mode, players can only place balls in columns they reserved
    if (this.config.gameMode === GameMode.HARD_MODE) {
      const columnOwner = this.columnReservation.reservedColumnOwners.get(col);
      if (columnOwner !== this.currentPlayer) {
        return false; // Player can only place balls in their own reserved columns
      }
    } else {
      // Hard mode rule: only one ball per column is allowed
      if (this.moveSelection.columnOwners.has(col)) {
        return false; // Column already selected by a player
      }
    }

    const currentMoves =
      this.currentPlayer === Player.PLAYER1
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
      columnOwners: new Map<number, Player>(),
    };

    // Reset ball release selection
    this.ballReleaseSelection = {
      player1ReleasedBalls: new Set<string>(),
      player2ReleasedBalls: new Set<string>(),
      currentReleasePlayer: Player.PLAYER1,
      allBallsReleased: false,
      dormantBalls: new Map<string, DormantBall>(),
    };

    // Reset column reservation
    this.columnReservation = {
      player1ReservedColumns: [],
      player2ReservedColumns: [],
      currentReservationPlayer: Player.PLAYER1,
      allColumnsReserved: false,
      reservedColumnOwners: new Map<number, Player>(),
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
    return (
      (this.state === GameState.SELECTING_MOVES ||
        this.state === GameState.BALL_PLACEMENT_PHASE) &&
      this.moveSelection.allMovesSelected
    );
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
      player1ReleasedBalls: new Set(
        this.ballReleaseSelection.player1ReleasedBalls
      ),
      player2ReleasedBalls: new Set(
        this.ballReleaseSelection.player2ReleasedBalls
      ),
      currentReleasePlayer: this.ballReleaseSelection.currentReleasePlayer,
      allBallsReleased: this.ballReleaseSelection.allBallsReleased,
      dormantBalls: new Map(this.ballReleaseSelection.dormantBalls),
    };
  }

  public getColumnReservation(): ColumnReservation {
    return {
      player1ReservedColumns: [
        ...this.columnReservation.player1ReservedColumns,
      ],
      player2ReservedColumns: [
        ...this.columnReservation.player2ReservedColumns,
      ],
      currentReservationPlayer: this.columnReservation.currentReservationPlayer,
      allColumnsReserved: this.columnReservation.allColumnsReserved,
      reservedColumnOwners: new Map(
        this.columnReservation.reservedColumnOwners
      ),
    };
  }

  public getReservedColumnsCount(player: Player): number {
    return player === Player.PLAYER1
      ? this.columnReservation.player1ReservedColumns.length
      : this.columnReservation.player2ReservedColumns.length;
  }

  public getReservedColumnsForPlayer(player: Player): number[] {
    return player === Player.PLAYER1
      ? [...this.columnReservation.player1ReservedColumns]
      : [...this.columnReservation.player2ReservedColumns];
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

  public onMovesExecutedHandler(
    callback: (ballPaths: BallPath[]) => void
  ): void {
    this.onMovesExecuted = callback;
  }

  private notifyStateChange(): void {
    if (this.onStateChange) {
      this.onStateChange(this);
    }
  }
}
