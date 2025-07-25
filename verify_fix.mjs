// Simple verification script to test the ball redirection fix
import { Grid } from './dist/Grid.js';
import { Direction, Player, CellType } from './dist/types.js';

console.log('Testing ball redirection fix...\n');

// Test 1: Ball hits RIGHT arrow box
console.log('Test 1: Ball hits RIGHT arrow box');
const grid1 = new Grid(5);
grid1.setCell(3, 1, { type: CellType.BOX, direction: Direction.RIGHT });

console.log('Before: Box at (3,1) has RIGHT arrow');
const position1 = grid1.dropBall(1, Player.PLAYER1);
console.log(`Ball dropped in column 1, ended up in column ${position1.col}`);
console.log(`Box direction after hit: ${grid1.getCell(3, 1).direction}`);
console.log(`Expected: Ball in column 2, Box direction LEFT`);
console.log(`Result: ${position1.col === 2 && grid1.getCell(3, 1).direction === Direction.LEFT ? 'PASS' : 'FAIL'}\n`);

// Test 2: Ball hits LEFT arrow box
console.log('Test 2: Ball hits LEFT arrow box');
const grid2 = new Grid(5);
grid2.setCell(3, 2, { type: CellType.BOX, direction: Direction.LEFT });

console.log('Before: Box at (3,2) has LEFT arrow');
const position2 = grid2.dropBall(2, Player.PLAYER1);
console.log(`Ball dropped in column 2, ended up in column ${position2.col}`);
console.log(`Box direction after hit: ${grid2.getCell(3, 2).direction}`);
console.log(`Expected: Ball in column 1, Box direction RIGHT`);
console.log(`Result: ${position2.col === 1 && grid2.getCell(3, 2).direction === Direction.RIGHT ? 'PASS' : 'FAIL'}\n`);

// Test 3: Ball hits LEFT arrow at edge (should stay in same column)
console.log('Test 3: Ball hits LEFT arrow at left edge');
const grid3 = new Grid(5);
grid3.setCell(3, 0, { type: CellType.BOX, direction: Direction.LEFT });

console.log('Before: Box at (3,0) has LEFT arrow');
const position3 = grid3.dropBall(0, Player.PLAYER1);
console.log(`Ball dropped in column 0, ended up in column ${position3.col}`);
console.log(`Expected: Ball stays in column 0 (can't go further left)`);
console.log(`Result: ${position3.col === 0 ? 'PASS' : 'FAIL'}\n`);

console.log('All tests completed!');