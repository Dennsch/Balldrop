import { Grid } from '../src/Grid';
import { CellType, Direction, Player } from '../src/types';

describe('Grid', () => {
    let grid: Grid;

    beforeEach(() => {
        grid = new Grid(5); // Use smaller grid for testing
    });

    describe('initialization', () => {
        it('should create a grid with the specified size', () => {
            expect(grid.getSize()).toBe(5);
        });

        it('should initialize all cells as empty', () => {
            const cells = grid.getCells();
            for (let row = 0; row < 5; row++) {
                for (let col = 0; col < 5; col++) {
                    expect(cells[row][col].type).toBe(CellType.EMPTY);
                }
            }
        });
    });

    describe('cell operations', () => {
        it('should get and set cells correctly', () => {
            const testCell = { type: CellType.BOX, direction: Direction.LEFT };
            
            expect(grid.setCell(2, 3, testCell)).toBe(true);
            const retrievedCell = grid.getCell(2, 3);
            
            expect(retrievedCell).toEqual(testCell);
        });

        it('should return null for invalid positions', () => {
            expect(grid.getCell(-1, 0)).toBeNull();
            expect(grid.getCell(0, -1)).toBeNull();
            expect(grid.getCell(5, 0)).toBeNull();
            expect(grid.getCell(0, 5)).toBeNull();
        });

        it('should return false when setting cells at invalid positions', () => {
            const testCell = { type: CellType.BOX, direction: Direction.LEFT };
            
            expect(grid.setCell(-1, 0, testCell)).toBe(false);
            expect(grid.setCell(5, 0, testCell)).toBe(false);
        });
    });

    describe('position validation', () => {
        it('should validate positions correctly', () => {
            expect(grid.isValidPosition(0, 0)).toBe(true);
            expect(grid.isValidPosition(4, 4)).toBe(true);
            expect(grid.isValidPosition(2, 3)).toBe(true);
            
            expect(grid.isValidPosition(-1, 0)).toBe(false);
            expect(grid.isValidPosition(0, -1)).toBe(false);
            expect(grid.isValidPosition(5, 0)).toBe(false);
            expect(grid.isValidPosition(0, 5)).toBe(false);
        });
    });

    describe('box placement', () => {
        it('should place random boxes within the specified range', () => {
            grid.placeRandomBoxes(3, 5);
            
            const cells = grid.getCells();
            let boxCount = 0;
            
            for (let row = 0; row < 5; row++) {
                for (let col = 0; col < 5; col++) {
                    if (cells[row][col].type === CellType.BOX) {
                        boxCount++;
                        expect(cells[row][col].direction).toBeDefined();
                        expect([Direction.LEFT, Direction.RIGHT]).toContain(cells[row][col].direction);
                    }
                }
            }
            
            expect(boxCount).toBeGreaterThanOrEqual(3);
            expect(boxCount).toBeLessThanOrEqual(5);
        });

        it('should clear the grid before placing new boxes', () => {
            // Place some initial content
            grid.setCell(0, 0, { type: CellType.BALL_P1, player: Player.PLAYER1 });
            
            grid.placeRandomBoxes(1, 2);
            
            // The ball should be gone
            expect(grid.getCell(0, 0)?.type).not.toBe(CellType.BALL_P1);
        });
    });

    describe('ball dropping', () => {
        it('should drop a ball to the bottom of an empty column', () => {
            const position = grid.dropBall(2, Player.PLAYER1);
            
            expect(position).toEqual({ row: 4, col: 2 });
            expect(grid.getCell(4, 2)?.type).toBe(CellType.BALL_P1);
            expect(grid.getCell(4, 2)?.player).toBe(Player.PLAYER1);
        });

        it('should stack balls on top of each other', () => {
            // Drop first ball
            const pos1 = grid.dropBall(2, Player.PLAYER1);
            expect(pos1).toEqual({ row: 4, col: 2 });
            
            // Drop second ball
            const pos2 = grid.dropBall(2, Player.PLAYER2);
            expect(pos2).toEqual({ row: 3, col: 2 });
            
            expect(grid.getCell(4, 2)?.type).toBe(CellType.BALL_P1);
            expect(grid.getCell(3, 2)?.type).toBe(CellType.BALL_P2);
        });

        it('should return null when dropping in a full column', () => {
            // Fill the column
            for (let i = 0; i < 5; i++) {
                grid.dropBall(2, Player.PLAYER1);
            }
            
            // Try to drop another ball
            const position = grid.dropBall(2, Player.PLAYER1);
            expect(position).toBeNull();
        });

        it('should redirect ball when hitting a box and change box direction', () => {
            // Place a box with right arrow at position (3, 2)
            grid.setCell(3, 2, { type: CellType.BOX, direction: Direction.RIGHT });
            
            // Drop ball in column 2
            const position = grid.dropBall(2, Player.PLAYER1);
            
            // Ball should be redirected to column 3
            expect(position?.col).toBe(3);
            
            // Box direction should have changed to LEFT
            expect(grid.getCell(3, 2)?.direction).toBe(Direction.LEFT);
        });

        it('should handle ball going out of bounds during redirection', () => {
            // Place a box with left arrow at position (3, 0) - leftmost column
            grid.setCell(3, 0, { type: CellType.BOX, direction: Direction.LEFT });
            
            // Drop ball in column 0
            const position = grid.dropBall(0, Player.PLAYER1);
            
            // Ball should stay in column 0 since it can't go further left
            expect(position?.col).toBe(0);
        });
    });

    describe('column analysis', () => {
        it('should identify column winner correctly', () => {
            // Place balls in column 2
            grid.setCell(4, 2, { type: CellType.BALL_P1, player: Player.PLAYER1 });
            grid.setCell(3, 2, { type: CellType.BALL_P2, player: Player.PLAYER2 });
            
            // Player 1 should win column 2 (bottom-most ball)
            expect(grid.getColumnWinner(2)).toBe(Player.PLAYER1);
        });

        it('should return null for empty columns', () => {
            expect(grid.getColumnWinner(2)).toBeNull();
        });

        it('should get winners for all columns', () => {
            // Set up some column winners
            grid.setCell(4, 0, { type: CellType.BALL_P1, player: Player.PLAYER1 });
            grid.setCell(4, 2, { type: CellType.BALL_P2, player: Player.PLAYER2 });
            
            const winners = grid.getColumnWinners();
            
            expect(winners).toHaveLength(5);
            expect(winners[0]).toBe(Player.PLAYER1);
            expect(winners[1]).toBeNull();
            expect(winners[2]).toBe(Player.PLAYER2);
            expect(winners[3]).toBeNull();
            expect(winners[4]).toBeNull();
        });

        it('should detect full columns correctly', () => {
            expect(grid.isColumnFull(2)).toBe(false);
            
            // Fill the column
            for (let i = 0; i < 5; i++) {
                grid.dropBall(2, Player.PLAYER1);
            }
            
            expect(grid.isColumnFull(2)).toBe(true);
        });
    });

    describe('grid management', () => {
        it('should clear the grid', () => {
            // Add some content
            grid.setCell(2, 2, { type: CellType.BOX, direction: Direction.LEFT });
            grid.setCell(3, 3, { type: CellType.BALL_P1, player: Player.PLAYER1 });
            
            grid.clearGrid();
            
            // All cells should be empty
            const cells = grid.getCells();
            for (let row = 0; row < 5; row++) {
                for (let col = 0; col < 5; col++) {
                    expect(cells[row][col].type).toBe(CellType.EMPTY);
                }
            }
        });
    });
});