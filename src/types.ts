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

export enum GameState {
    SETUP = 'SETUP',
    PLAYING = 'PLAYING',
    FINISHED = 'FINISHED'
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
}

export interface BallPath {
    steps: BallPathStep[];
    finalPosition: Position;
    player: Player;
}