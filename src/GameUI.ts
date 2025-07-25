import { Game } from './Game.js';
import { CellType, Direction, GameState, Player, Position, BallPath } from './types.js';

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
    private isAnimating: boolean = false;

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
        if (this.game.canDropInColumn(col) && !this.isAnimating) {
            this.game.dropBall(col);
        }
    }

    private handleGameStateChange(): void {
        this.updateUI();
    }

    private handleBallDropped(ballPath: BallPath): void {
        this.animateBallPath(ballPath);
    }

    private async animateBallPath(ballPath: BallPath): Promise<void> {
        this.isAnimating = true;
        this.updateColumnSelectors(); // Disable buttons during animation

        // Create animated ball element
        const animatedBall = this.createAnimatedBall(ballPath.player);
        this.gridElement.appendChild(animatedBall);

        try {
            // Animate through each step of the path
            for (let i = 0; i < ballPath.steps.length; i++) {
                const step = ballPath.steps[i];
                const isLastStep = i === ballPath.steps.length - 1;
                
                await this.animateToPosition(animatedBall, step.position, step.action, isLastStep);
                
                // Apply visual effects for special actions during animation
                if (step.hitBox && step.boxPosition && step.boxDirection && step.newBoxDirection) {
                    // Animate the box hit effect and arrow direction change simultaneously
                    const boxHitPromise = this.animateBoxHit(step.boxPosition, step.boxDirection);
                    const arrowChangePromise = this.animateBoxDirectionChange(
                        step.boxPosition, 
                        step.boxDirection, 
                        step.newBoxDirection
                    );
                    
                    // Wait for both animations to complete
                    await Promise.all([boxHitPromise, arrowChangePromise]);
                }

                // Apply bottom row visual effects when ball settles there
                if (step.action === 'settle' && step.position.row === this.game.getGrid().getSize() - 1) {
                    await this.animateBottomRowEffect(step.position);
                }
            }

            // Remove animated ball
            this.gridElement.removeChild(animatedBall);
            
            // Place the final ball in the grid visually
            await this.placeFinalBall(ballPath.finalPosition, ballPath.player);
            
            // Complete the ball drop in the game logic
            this.game.completeBallDrop(ballPath);
            
        } catch (error) {
            console.error('Animation error:', error);
            // Cleanup on error
            if (this.gridElement.contains(animatedBall)) {
                this.gridElement.removeChild(animatedBall);
            }
            // Still complete the ball drop even if animation fails
            this.game.completeBallDrop(ballPath);
        } finally {
            this.isAnimating = false;
            this.updateColumnSelectors(); // Re-enable buttons
        }
    }

    private createAnimatedBall(player: Player): HTMLElement {
        const ball = document.createElement('div');
        ball.className = `animated-ball ${player === Player.PLAYER1 ? 'player1' : 'player2'}`;
        ball.textContent = '●';
        
        // Position it initially off-screen
        ball.style.position = 'absolute';
        ball.style.zIndex = '1000';
        ball.style.fontSize = '20px';
        ball.style.fontWeight = 'bold';
        ball.style.width = '32px';
        ball.style.height = '32px';
        ball.style.display = 'flex';
        ball.style.alignItems = 'center';
        ball.style.justifyContent = 'center';
        ball.style.borderRadius = '50%';
        ball.style.transition = 'all 0.35s ease-in-out';
        ball.style.border = '2px solid rgba(255, 255, 255, 0.8)';
        ball.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3), 0 0 20px rgba(255, 255, 255, 0.5)';
        
        if (player === Player.PLAYER1) {
            ball.style.backgroundColor = '#ff6b6b';
            ball.style.color = 'white';
        } else {
            ball.style.backgroundColor = '#4ecdc4';
            ball.style.color = 'white';
        }
        
        return ball;
    }

    private async animateToPosition(ball: HTMLElement, position: Position, action: string, isLastStep: boolean): Promise<void> {
        return new Promise((resolve) => {
            const cellElement = this.getCellElement(position.row, position.col);
            if (!cellElement) {
                resolve();
                return;
            }

            const rect = cellElement.getBoundingClientRect();
            const gridRect = this.gridElement.getBoundingClientRect();
            
            // Calculate position relative to grid (updated for new ball size)
            const left = rect.left - gridRect.left + (rect.width - 32) / 2;
            const top = rect.top - gridRect.top + (rect.height - 32) / 2;
            
            ball.style.left = `${left}px`;
            ball.style.top = `${top}px`;

            // Add visual effects based on action
            if (action === 'redirect') {
                ball.style.transform = 'scale(1.3) rotate(360deg)';
                ball.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3), 0 0 30px rgba(255, 255, 0, 0.8)';
                setTimeout(() => {
                    ball.style.transform = 'scale(1)';
                    ball.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3), 0 0 20px rgba(255, 255, 255, 0.5)';
                }, 120);
            } else if (action === 'fall') {
                // Add subtle bounce effect for falling
                ball.style.transform = 'scale(1.05)';
                setTimeout(() => {
                    ball.style.transform = 'scale(1)';
                }, 40);
            } else if (action === 'settle') {
                // Add settling effect
                ball.style.transform = 'scale(1.1)';
                setTimeout(() => {
                    ball.style.transform = 'scale(1)';
                }, 80);
            }

            // Adjust timing based on action - faster for better responsiveness
            const duration = action === 'settle' ? 250 : (action === 'redirect' ? 400 : 350);
            
            setTimeout(resolve, duration);
        });
    }

    private async animateBoxHit(position: Position, boxDirection?: Direction): Promise<void> {
        return new Promise((resolve) => {
            const cellElement = this.getCellElement(position.row, position.col);
            if (cellElement) {
                cellElement.classList.add('box-hit');
                setTimeout(() => {
                    cellElement.classList.remove('box-hit');
                    resolve();
                }, 300);
            } else {
                resolve();
            }
        });
    }

    private async animateBoxDirectionChange(boxPosition: Position, oldDirection: Direction, newDirection: Direction): Promise<void> {
        return new Promise((resolve) => {
            const cellElement = this.getCellElement(boxPosition.row, boxPosition.col);
            if (!cellElement) {
                resolve();
                return;
            }

            const arrowElement = cellElement.querySelector('.arrow') as HTMLElement;
            if (!arrowElement) {
                resolve();
                return;
            }

            // Add rotation animation class
            arrowElement.classList.add('arrow-changing');
            
            // Change the arrow text after a brief delay to show the rotation effect
            setTimeout(() => {
                arrowElement.textContent = newDirection === Direction.LEFT ? '←' : '→';
                
                // Remove animation class after animation completes
                setTimeout(() => {
                    arrowElement.classList.remove('arrow-changing');
                    resolve();
                }, 120);
            }, 60);
        });
    }

    private async animateBottomRowEffect(position: Position): Promise<void> {
        return new Promise((resolve) => {
            const cellElement = this.getCellElement(position.row, position.col);
            if (cellElement) {
                // Add bottom row highlight effect
                cellElement.classList.add('bottom-row-effect');
                setTimeout(() => {
                    cellElement.classList.remove('bottom-row-effect');
                    resolve();
                }, 800);
            } else {
                resolve();
            }
        });
    }

    private async placeFinalBall(position: Position, player: Player): Promise<void> {
        return new Promise((resolve) => {
            const cellElement = this.getCellElement(position.row, position.col);
            if (cellElement) {
                // Clear any existing content
                cellElement.innerHTML = '';
                cellElement.className = 'cell';
                
                // Add the ball with a placement animation
                const ballClass = player === Player.PLAYER1 ? 'has-ball-p1' : 'has-ball-p2';
                cellElement.classList.add(ballClass, 'ball-placing');
                cellElement.textContent = '●';
                
                // Remove placement animation class after animation
                setTimeout(() => {
                    cellElement.classList.remove('ball-placing');
                    resolve();
                }, 400);
            } else {
                resolve();
            }
        });
    }

    private updateBoxCell(position: Position, newDirection: Direction): void {
        const cellElement = this.getCellElement(position.row, position.col);
        if (cellElement) {
            const arrowElement = cellElement.querySelector('.arrow') as HTMLElement;
            if (arrowElement) {
                arrowElement.textContent = newDirection === Direction.LEFT ? '←' : '→';
            }
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
            buttonElement.disabled = !this.game.canDropInColumn(col) || this.isAnimating;
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