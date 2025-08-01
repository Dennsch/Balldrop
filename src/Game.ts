import { Grid } from "./Grid.js";
import {
  GameConfig,
  GameState,
  Player,
  GameResult,
  Position,
  BallPath,
  GameMode,
  MoveSelection,
  ExecutionDirection,
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
        // In release phase, this method shouldn't be called directly
        // Ball release is handled by releaseBall method with row/col coordinates
        return false;
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
      // All columns reserved - transition to ball placement phase
      this.columnReservation.allColumnsReserved = true;
      this.state = GameState.BALL_PLACEMENT_PHASE;
      this.currentPlayer = Player.PLAYER1; // Reset to player 1 for ball placement phase
      this.moveSelection.currentSelectionPlayer = Player.PLAYER1;
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

  public releaseBall(col: number): boolean {
    if (this.state !== GameState.BALL_RELEASE_PHASE) {
      return false;
    }

    // Check if this column was reserved by the current player
    if (!this.columnReservation.reservedColumnOwners.has(col)) {
      return false; // Column was not reserved
    }

    const columnOwner = this.columnReservation.reservedColumnOwners.get(col);
    if (columnOwner !== this.currentPlayer) {
      return false; // Players can only release their own reserved balls
    }

    // Check if column is full
    if (this.grid.isColumnFull(col)) {
      return false;
    }

    // Calculate and place the ball immediately (not as dormant)
    const result = this.grid.calculateBallPath(col, this.currentPlayer);
    if (result.finalPosition && result.ballPath) {
      // Apply the ball path immediately (active ball, not dormant)
      this.grid.applyBallPath(result.ballPath, false);

      // Decrease balls remaining
      const ballsLeft = this.ballsRemaining.get(this.currentPlayer) || 0;
      this.ballsRemaining.set(this.currentPlayer, ballsLeft - 1);

      // Remove the column from reserved columns
      const currentReservedColumns =
        this.currentPlayer === Player.PLAYER1
          ? this.columnReservation.player1ReservedColumns
          : this.columnReservation.player2ReservedColumns;

      const columnIndex = currentReservedColumns.indexOf(col);
      if (columnIndex > -1) {
        currentReservedColumns.splice(columnIndex, 1);
      }

      // Mark column as used
      this.usedColumns.add(col);
      this.columnOwners.set(col, this.currentPlayer);

      // Check if all balls have been released
      const totalBallsReleased =
        this.config.ballsPerPlayer -
        this.ballsRemaining.get(Player.PLAYER1)! +
        (this.config.ballsPerPlayer - this.ballsRemaining.get(Player.PLAYER2)!);
      const totalBalls = this.config.ballsPerPlayer * 2;

      if (totalBallsReleased >= totalBalls) {
        this.state = GameState.FINISHED;
      } else {
        // Switch to the other player
        this.currentPlayer =
          this.currentPlayer === Player.PLAYER1
            ? Player.PLAYER2
            : Player.PLAYER1;
        this.ballReleaseSelection.currentReleasePlayer = this.currentPlayer;
      }

      // Play pop sound when ball is released
      this.soundManager.playSound("pop", 0.6);

      // Trigger ball dropped callback for animation
      if (this.onBallDropped) {
        this.onBallDropped(result.ballPath);
      }

      this.notifyStateChange();
      return true;
    }

    return false;
  }

  // Legacy method for backward compatibility - now redirects to column-based release
  public releaseBallAtPosition(row: number, col: number): boolean {
    // For the new system, we release balls by column, not by position
    // This method is kept for backward compatibility but redirects to the new system
    return this.releaseBall(col);
  }

  public executeAllMoves(): boolean {
    if (
      (this.state !== GameState.SELECTING_MOVES &&
        this.state !== GameState.BALL_PLACEMENT_PHASE) ||
      !this.moveSelection.allMovesSelected
    ) {
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
        // Play pop sound for each ball dropped
        this.soundManager.playSound("pop", 0.5);
      }
    }

    // Execute player 2 moves
    for (const col of this.moveSelection.player2Moves) {
      const result = this.grid.calculateBallPath(col, Player.PLAYER2);
      if (result.ballPath) {
        allBallPaths.push(result.ballPath);
        // Play pop sound for each ball dropped
        this.soundManager.playSound("pop", 0.5);
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
    if (
      (this.state !== GameState.SELECTING_MOVES &&
        this.state !== GameState.BALL_PLACEMENT_PHASE) ||
      !this.moveSelection.allMovesSelected
    ) {
      return false;
    }

    this.state = GameState.EXECUTING_MOVES;
    this.notifyStateChange();

    // Get all selected columns and sort them based on execution direction
    const allColumns: Array<{ col: number; player: Player }> = [];

    // Add player 1 moves
    for (const col of this.moveSelection.player1Moves) {
      allColumns.push({ col, player: Player.PLAYER1 });
    }

    // Add player 2 moves
    for (const col of this.moveSelection.player2Moves) {
      allColumns.push({ col, player: Player.PLAYER2 });
    }

    // Sort columns based on execution direction
    if (direction === ExecutionDirection.LEFT_TO_RIGHT) {
      allColumns.sort((a, b) => a.col - b.col); // Ascending order (left to right)
    } else {
      allColumns.sort((a, b) => b.col - a.col); // Descending order (right to left)
    }

    // Execute moves in the specified order
    const allBallPaths: BallPath[] = [];
    for (const { col, player } of allColumns) {
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

  // Sound control methods
  public setSoundEnabled(enabled: boolean): void {
    this.soundManager.setEnabled(enabled);
  }

  public isSoundEnabled(): boolean {
    return this.soundManager.isEnabled();
  }

  public setSoundVolume(volume: number): void {
    this.soundManager.setMasterVolume(volume);
  }

  public getCurrentScore(): { player1Columns: number; player2Columns: number } {
    const columnWinners = this.grid.getColumnWinners();
    let player1Columns = 0;
    let player2Columns = 0;

    columnWinners.forEach((winner) => {
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

    columnWinners.forEach((winner) => {
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

    // Check if this column was reserved by the current player
    if (!this.columnReservation.reservedColumnOwners.has(col)) {
      return false; // Column was not reserved
    }

    const columnOwner = this.columnReservation.reservedColumnOwners.get(col);
    if (columnOwner !== this.currentPlayer) {
      return false; // Players can only release their own reserved balls
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
