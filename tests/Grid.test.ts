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

        it('should not place boxes on the first or last row', () => {
            grid.placeRandomBoxes(5, 10);
            
            const cells = grid.getCells();
            const gridSize = grid.getSize();
            
            // Check first row (row 0) - should have no boxes
            for (let col = 0; col < gridSize; col++) {
                expect(cells[0][col].type).not.toBe(CellType.BOX);
            }
            
            // Check last row (row gridSize-1) - should have no boxes
            for (let col = 0; col < gridSize; col++) {
                expect(cells[gridSize - 1][col].type).not.toBe(CellType.BOX);
            }
            
            // Verify that boxes can still be placed in middle rows
            let boxCount = 0;
            for (let row = 1; row < gridSize - 1; row++) {
                for (let col = 0; col < gridSize; col++) {
                    if (cells[row][col].type === CellType.BOX) {
                        boxCount++;
                    }
                }
            }
            
            // Should have at least some boxes in the middle rows
            expect(boxCount).toBeGreaterThan(0);
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

        it('should redirect ball based on original box direction, then change arrow', () => {
            // Test with RIGHT arrow box
            grid.setCell(3, 2, { type: CellType.BOX, direction: Direction.RIGHT });
            
            const result = grid.dropBallWithPath(2, Player.PLAYER1);
            
            // Ball should be redirected RIGHT (to column 3) based on original direction
            expect(result.finalPosition?.col).toBe(3);
            
            // Box direction should have changed to LEFT after ball moved
            expect(grid.getCell(3, 2)?.direction).toBe(Direction.LEFT);
            
            // Check path tracking shows correct sequence
            const steps = result.ballPath?.steps || [];
            const redirectStep = steps.find(step => step.action === 'redirect');
            expect(redirectStep?.boxDirection).toBe(Direction.RIGHT); // Original direction
            expect(redirectStep?.newBoxDirection).toBe(Direction.LEFT); // New direction
            
            // Clear and test with LEFT arrow box
            grid.clearGrid();
            grid.setCell(3, 2, { type: CellType.BOX, direction: Direction.LEFT });
            
            const result2 = grid.dropBallWithPath(2, Player.PLAYER2);
            
            // Ball should be redirected LEFT (to column 1) based on original direction
            expect(result2.finalPosition?.col).toBe(1);
            
            // Box direction should have changed to RIGHT after ball moved
            expect(grid.getCell(3, 2)?.direction).toBe(Direction.RIGHT);
            
            // Check path tracking shows correct sequence
            const steps2 = result2.ballPath?.steps || [];
            const redirectStep2 = steps2.find(step => step.action === 'redirect');
            expect(redirectStep2?.boxDirection).toBe(Direction.LEFT); // Original direction
            expect(redirectStep2?.newBoxDirection).toBe(Direction.RIGHT); // New direction
        });

        it('should handle ball going out of bounds during redirection', () => {
            // Place a box with left arrow at position (3, 0) - leftmost column
            grid.setCell(3, 0, { type: CellType.BOX, direction: Direction.LEFT });
            
            // Drop ball in column 0
            const position = grid.dropBall(0, Player.PLAYER1);
            
            // Ball should stay in column 0 since it can't go further left
            expect(position?.col).toBe(0);
        });

        it('should handle ball getting stuck when target cell is occupied by a box', () => {
            // Place a box with right arrow at position (3, 2)
            grid.setCell(3, 2, { type: CellType.BOX, direction: Direction.RIGHT });
            
            // Place another box at the target position (3, 3) where the ball would be redirected
            grid.setCell(3, 3, { type: CellType.BOX, direction: Direction.LEFT });
            
            // Drop ball in column 2
            const position = grid.dropBall(2, Player.PLAYER1);
            
            // Ball should stay in column 2 at row 2 (above the arrow box) since target cell is occupied
            expect(position).toEqual({ row: 2, col: 2 });
            expect(grid.getCell(2, 2)?.type).toBe(CellType.BALL_P1);
            
            // The arrow box should still change direction even though ball couldn't move
            expect(grid.getCell(3, 2)?.direction).toBe(Direction.LEFT);
        });

        it('should handle ball getting stuck when target cell is occupied by another ball', () => {
            // Place a box with left arrow at position (3, 2)
            grid.setCell(3, 2, { type: CellType.BOX, direction: Direction.LEFT });
            
            // Place a ball at the target position (3, 1) where the ball would be redirected
            grid.setCell(3, 1, { type: CellType.BALL_P2, player: Player.PLAYER2 });
            
            // Drop ball in column 2
            const position = grid.dropBall(2, Player.PLAYER1);
            
            // Ball should stay in column 2 at row 2 (above the arrow box) since target cell is occupied
            expect(position).toEqual({ row: 2, col: 2 });
            expect(grid.getCell(2, 2)?.type).toBe(CellType.BALL_P1);
            
            // The arrow box should still change direction even though ball couldn't move
            expect(grid.getCell(3, 2)?.direction).toBe(Direction.RIGHT);
            
            // The existing ball should remain unchanged
            expect(grid.getCell(3, 1)?.type).toBe(CellType.BALL_P2);
        });

        it('should track path correctly when ball gets stuck due to occupied target cell', () => {
            // Place a box with right arrow at position (3, 2)
            grid.setCell(3, 2, { type: CellType.BOX, direction: Direction.RIGHT });
            
            // Place another box at the target position (3, 3)
            grid.setCell(3, 3, { type: CellType.BOX, direction: Direction.LEFT });
            
            // Drop ball with path tracking
            const result = grid.dropBallWithPath(2, Player.PLAYER1);
            
            // Ball should stay in column 2 at row 2
            expect(result.finalPosition).toEqual({ row: 2, col: 2 });
            expect(result.ballPath).toBeDefined();
            
            const steps = result.ballPath?.steps || [];
            
            // Should have a redirect step that shows the box was hit
            const redirectStep = steps.find(step => step.action === 'redirect');
            expect(redirectStep).toBeDefined();
            expect(redirectStep?.hitBox).toBe(true);
            expect(redirectStep?.boxDirection).toBe(Direction.RIGHT);
            expect(redirectStep?.newBoxDirection).toBe(Direction.LEFT);
            
            // Should not have any steps in column 3 since ball couldn't move there
            const column3Steps = steps.filter(step => step.position.col === 3);
            expect(column3Steps.length).toBe(0);
            
            // All steps should be in column 2
            const column2Steps = steps.filter(step => step.position.col === 2);
            expect(column2Steps.length).toBeGreaterThan(0);
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

    describe('ball path tracking', () => {
        it('should track simple ball drop path', () => {
            const result = grid.dropBallWithPath(2, Player.PLAYER1);
            
            expect(result.finalPosition).toEqual({ row: 4, col: 2 });
            expect(result.ballPath).toBeDefined();
            expect(result.ballPath?.player).toBe(Player.PLAYER1);
            expect(result.ballPath?.finalPosition).toEqual({ row: 4, col: 2 });
            
            // Should have steps for falling and settling
            const steps = result.ballPath?.steps || [];
            expect(steps.length).toBeGreaterThan(1);
            expect(steps[0].action).toBe('fall');
            expect(steps[steps.length - 1].action).toBe('settle');
        });

        it('should track ball redirection path when hitting a box', () => {
            // Place a box with right arrow at position (3, 2)
            grid.setCell(3, 2, { type: CellType.BOX, direction: Direction.RIGHT });
            
            const result = grid.dropBallWithPath(2, Player.PLAYER1);
            
            expect(result.finalPosition?.col).toBe(3); // Ball should be redirected to column 3
            expect(result.ballPath).toBeDefined();
            
            const steps = result.ballPath?.steps || [];
            
            // Should have a redirect step
            const redirectStep = steps.find(step => step.action === 'redirect');
            expect(redirectStep).toBeDefined();
            expect(redirectStep?.hitBox).toBe(true);
            expect(redirectStep?.boxDirection).toBe(Direction.RIGHT);
            expect(redirectStep?.newBoxDirection).toBe(Direction.LEFT); // Box direction should flip
            expect(redirectStep?.boxPosition).toEqual({ row: 3, col: 2 }); // Box position should be recorded
            
            // Should have steps in both columns
            const column2Steps = steps.filter(step => step.position.col === 2);
            const column3Steps = steps.filter(step => step.position.col === 3);
            expect(column2Steps.length).toBeGreaterThan(0);
            expect(column3Steps.length).toBeGreaterThan(0);
        });

        it('should track path when ball goes out of bounds', () => {
            // Place a box with left arrow at position (3, 0) - leftmost column
            grid.setCell(3, 0, { type: CellType.BOX, direction: Direction.LEFT });
            
            const result = grid.dropBallWithPath(0, Player.PLAYER1);
            
            expect(result.finalPosition?.col).toBe(0); // Ball should stay in column 0
            expect(result.ballPath).toBeDefined();
            
            const steps = result.ballPath?.steps || [];
            const redirectStep = steps.find(step => step.action === 'redirect');
            expect(redirectStep).toBeDefined();
            expect(redirectStep?.hitBox).toBe(true);
        });

        it('should return null for invalid column', () => {
            const result = grid.dropBallWithPath(-1, Player.PLAYER1);
            
            expect(result.finalPosition).toBeNull();
            expect(result.ballPath).toBeNull();
        });

        it('should return null for full column', () => {
            // Fill the column
            for (let i = 0; i < 5; i++) {
                grid.dropBall(2, Player.PLAYER1);
            }
            
            const result = grid.dropBallWithPath(2, Player.PLAYER1);
            
            expect(result.finalPosition).toBeNull();
            expect(result.ballPath).toBeNull();
        });

        it('should maintain consistency between dropBall and dropBallWithPath', () => {
            // Test with simple drop
            const simpleResult = grid.dropBall(1, Player.PLAYER1);
            grid.clearGrid();
            
            const pathResult = grid.dropBallWithPath(1, Player.PLAYER1);
            
            expect(pathResult.finalPosition).toEqual(simpleResult);
            
            // Test with box redirection
            grid.clearGrid();
            grid.setCell(3, 2, { type: CellType.BOX, direction: Direction.RIGHT });
            
            const simpleRedirectResult = grid.dropBall(2, Player.PLAYER2);
            grid.clearGrid();
            grid.setCell(3, 2, { type: CellType.BOX, direction: Direction.RIGHT });
            
            const pathRedirectResult = grid.dropBallWithPath(2, Player.PLAYER2);
            
            expect(pathRedirectResult.finalPosition).toEqual(simpleRedirectResult);
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