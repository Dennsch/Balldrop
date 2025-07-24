import { Game } from './Game.js';
import { CellType, Direction, GameState, Player, Position } from './types.js';

export class GameUI {
    private game: Game;
    private gridElement!: HTMLElement;
    private columnSelectorsElement!: HTMLElement;
    private player1BallsElement!: HTMLElement;
    private player2BallsElement!: HTMLElement;
    private currentPlayerElement!: HTMLElement;
    private winnerMessageElement!: HTMLElement;
    private gameMessageElement!: HTMLElement;
    private newGameButton!: HTMLElement;
    private resetButton!: HTMLElement;

    constructor(game: Game) {
        this.game = game;
        this.initializeElements();
        this.setupEventListeners();
        this.game.onStateChangeHandler(this.handleGameStateChange.bind(this));
        this.game.onBallDroppedHandler(this.handleBallDropped.bind(this));
    }

    private initializeElements(): void {
        this.gridElement = this.getElement('game-grid');
        this.columnSelectorsElement = this.getElement('column-selectors');
        this.player1BallsElement = this.getElement('player1-balls');
        this.player2BallsElement = this.getElement('player2-balls');
        this.currentPlayerElement = this.getElement('current-player');
        this.winnerMessageElement = this.getElement('winner-message');
        this.gameMessageElement = this.getElement('game-message');
        this.newGameButton = this.getElement('new-game-btn');
        this.resetButton = this.getElement('reset-btn');

        this.createGrid();
        this.createColumnSelectors();
        this.updateUI();
    }

    private getElement(id: string): HTMLElement {
        const element = document.getElementById(id);
        if (!element) {
            throw new Error(`Element with id '${id}' not found`);
        }
        return element;
    }

    private createGrid(): void {
        this.gridElement.innerHTML = '';
        const gridSize = this.game.getGrid().getSize();

        for (let row = 0; row < gridSize; row++) {
            for (let col = 0; col < gridSize; col++) {
                const cellElement = document.createElement('div');
                cellElement.className = 'cell';
                cellElement.dataset.row = row.toString();
                cellElement.dataset.col = col.toString();
                this.gridElement.appendChild(cellElement);
            }
        }
    }

    private createColumnSelectors(): void {
        this.columnSelectorsElement.innerHTML = '';
        const gridSize = this.game.getGrid().getSize();

        for (let col = 0; col < gridSize; col++) {
            const button = document.createElement('button');
            button.className = 'column-selector';
            button.textContent = (col + 1).toString();
            button.dataset.col = col.toString();
            button.addEventListener('click', () => this.handleColumnClick(col));
            this.columnSelectorsElement.appendChild(button);
        }
    }

    private setupEventListeners(): void {
        this.newGameButton.addEventListener('click', () => {
            this.game.startNewGame();
        });

        this.resetButton.addEventListener('click', () => {
            this.game.reset();
        });
    }

    private handleColumnClick(col: number): void {
        if (this.game.canDropInColumn(col)) {
            this.game.dropBall(col);
        }
    }

    private handleGameStateChange(): void {
        this.updateUI();
    }

    private handleBallDropped(position: Position, player: Player): void {
        // Add animation class to the cell
        const cellElement = this.getCellElement(position.row, position.col);
        if (cellElement) {
            cellElement.classList.add('falling');
            setTimeout(() => {
                cellElement.classList.remove('falling');
            }, 500);
        }
    }

    private updateUI(): void {
        this.updateGrid();
        this.updatePlayerInfo();
        this.updateColumnSelectors();
        this.updateGameStatus();
    }

    private updateGrid(): void {
        const grid = this.game.getGrid();
        const cells = grid.getCells();
        const gridSize = grid.getSize();

        for (let row = 0; row < gridSize; row++) {
            for (let col = 0; col < gridSize; col++) {
                const cellElement = this.getCellElement(row, col);
                const cell = cells[row][col];

                if (cellElement) {
                    // Reset classes
                    cellElement.className = 'cell';
                    cellElement.innerHTML = '';

                    // Set content based on cell type
                    switch (cell.type) {
                        case CellType.EMPTY:
                            break;
                        case CellType.BOX:
                            cellElement.classList.add('has-box');
                            const arrow = document.createElement('span');
                            arrow.className = 'arrow';
                            arrow.textContent = cell.direction === Direction.LEFT ? '←' : '→';
                            cellElement.appendChild(arrow);
                            break;
                        case CellType.BALL_P1:
                            cellElement.classList.add('has-ball-p1');
                            cellElement.textContent = '●';
                            break;
                        case CellType.BALL_P2:
                            cellElement.classList.add('has-ball-p2');
                            cellElement.textContent = '●';
                            break;
                    }
                }
            }
        }
    }

    private updatePlayerInfo(): void {
        const player1Balls = this.game.getBallsRemaining(Player.PLAYER1);
        const player2Balls = this.game.getBallsRemaining(Player.PLAYER2);
        const currentPlayer = this.game.getCurrentPlayer();

        this.player1BallsElement.textContent = player1Balls.toString();
        this.player2BallsElement.textContent = player2Balls.toString();

        if (this.game.getState() === GameState.PLAYING) {
            this.currentPlayerElement.textContent = `Player ${currentPlayer}'s Turn`;
        } else if (this.game.getState() === GameState.SETUP) {
            this.currentPlayerElement.textContent = 'Click "New Game" to start';
        }
    }

    private updateColumnSelectors(): void {
        const buttons = this.columnSelectorsElement.querySelectorAll('.column-selector');
        buttons.forEach((button, col) => {
            const buttonElement = button as HTMLButtonElement;
            buttonElement.disabled = !this.game.canDropInColumn(col);
        });
    }

    private updateGameStatus(): void {
        const state = this.game.getState();

        if (state === GameState.FINISHED) {
            const result = this.game.getGameResult();
            this.winnerMessageElement.classList.remove('hidden');
            this.winnerMessageElement.className = 'winner-message';

            if (result.isTie) {
                this.winnerMessageElement.classList.add('tie');
                this.winnerMessageElement.textContent = `It's a tie! Both players control ${this.sanitizeInput(result.player1Columns)} columns`;
            } else if (result.winner === Player.PLAYER1) {
                this.winnerMessageElement.classList.add('player1-wins');
                this.winnerMessageElement.textContent = `Player 1 wins! Controls ${this.sanitizeInput(result.player1Columns)} columns vs ${this.sanitizeInput(result.player2Columns)}`;
            } else if (result.winner === Player.PLAYER2) {
                this.winnerMessageElement.classList.add('player2-wins');
                this.winnerMessageElement.textContent = `Player 2 wins! Controls ${this.sanitizeInput(result.player2Columns)} columns vs ${this.sanitizeInput(result.player1Columns)}`;
            }

            this.gameMessageElement.textContent = 'Game finished! Click "New Game" to play again.';
        } else {
            this.winnerMessageElement.classList.add('hidden');
            
            if (state === GameState.SETUP) {
                this.gameMessageElement.textContent = 'Welcome to Balldrop! Click "New Game" to start playing.';
            } else if (state === GameState.PLAYING) {
                this.gameMessageElement.textContent = 'Drop your balls in columns. Boxes will redirect them!';
            }
        }
    }

    // Helper method to sanitize input
    private sanitizeInput(input: any): string {
        return String(input).replace(/[^\w\s]/gi, '');
    }

    private getCellElement(row: number, col: number): HTMLElement | null {
        return this.gridElement.querySelector(`[data-row="${row}"][data-col="${col}"]`);
    }
}