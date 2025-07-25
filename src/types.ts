export enum Direction {
    LEFT = 'LEFT',
    RIGHT = 'RIGHT'
}

export enum CellType {
    EMPTY = 'EMPTY',
    BOX = 'BOX',
    BALL_P1 = 'BALL_P1',
    BALL_P2 = 'BALL_P2'
}

export enum Player {
    PLAYER1 = 1,
    PLAYER2 = 2
}

export enum GameMode {
    NORMAL = 'NORMAL',
    HARD_MODE = 'HARD_MODE'
}

export enum GameState {
    SETUP = 'SETUP',
    PLAYING = 'PLAYING',
    SELECTING_MOVES = 'SELECTING_MOVES',
    EXECUTING_MOVES = 'EXECUTING_MOVES',
    FINISHED = 'FINISHED'
}

export enum AnimationSpeed {
    SLOW = 'SLOW',
    NORMAL = 'NORMAL',
    FAST = 'FAST',
    INSTANT = 'INSTANT'
}

export interface Position {
    row: number;
    col: number;
}

export interface Cell {
    type: CellType;
    direction?: Direction;
    player?: Player;
}

export interface GameConfig {
    gridSize: number;
    ballsPerPlayer: number;
    minBoxes: number;
    maxBoxes: number;
    gameMode: GameMode;
}

export interface PendingMove {
    player: Player;
    column: number;
    moveIndex: number; // Which ball this is for the player (0-based)
}

export interface MoveSelection {
    player1Moves: number[];
    player2Moves: number[];
    currentSelectionPlayer: Player;
    allMovesSelected: boolean;
}

export interface GameResult {
    winner: Player | null;
    player1Columns: number;
    player2Columns: number;
    isTie: boolean;
}

export interface BallPathStep {
    position: Position;
    action: 'fall' | 'redirect' | 'settle';
    hitBox?: boolean;
    boxDirection?: Direction;
    newBoxDirection?: Direction;
    boxPosition?: Position;
}

export interface BallPath {
    steps: BallPathStep[];
    finalPosition: Position;
    player: Player;
}