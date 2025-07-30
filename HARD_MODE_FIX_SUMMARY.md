# Hard Mode Phase Transition Fix

## Problem Description
Hard mode was not switching to the release phase after all balls were placed. The issue was caused by conflicting hard mode implementations that didn't work together properly.

## Root Cause Analysis
The game had two different hard mode workflows that were incomplete and conflicting:

1. **Column Reservation → Direct Ball Release** (partially implemented)
2. **Ball Placement → Ball Release** (expected by tests but not properly connected)

The specific issues were:
- Game started in `COLUMN_RESERVATION_PHASE` but never transitioned to `BALL_PLACEMENT_PHASE`
- `reserveColumn()` method transitioned directly to `BALL_RELEASE_PHASE`, skipping ball placement
- `selectMove()` method expected `BALL_PLACEMENT_PHASE` but there was no path to reach this state
- Test files expected ball placement workflow but game initialized with column reservation workflow

## Solution Implemented
Implemented a complete **three-phase hard mode workflow**:

### Phase 1: Column Reservation Phase
- Game starts in `COLUMN_RESERVATION_PHASE`
- Players alternate reserving columns using `dropBall()` → `reserveColumn()`
- Each player reserves `ballsPerPlayer` columns
- No duplicate reservations allowed
- Transitions to `BALL_PLACEMENT_PHASE` when all columns are reserved

### Phase 2: Ball Placement Phase  
- Players alternate placing balls using `dropBall()` → `selectMove()`
- Players can only place balls in their own reserved columns
- Dormant balls are created immediately upon placement
- Transitions to `BALL_RELEASE_PHASE` when all balls are placed

### Phase 3: Ball Release Phase
- Players alternate releasing their dormant balls
- Players can only release their own balls
- Game finishes when all balls are released

## Files Modified

### 1. `/src/Game.ts`
**Changes made:**

#### Fixed `reserveColumn()` method (lines 216-221):
```typescript
// OLD: Transitioned directly to BALL_RELEASE_PHASE
this.state = GameState.BALL_RELEASE_PHASE;
this.ballReleaseSelection.currentReleasePlayer = Player.PLAYER1;

// NEW: Transitions to BALL_PLACEMENT_PHASE first
this.state = GameState.BALL_PLACEMENT_PHASE;
this.moveSelection.currentSelectionPlayer = Player.PLAYER1;
```

#### Updated `dropBall()` method (lines 128-142):
```typescript
// Added explicit handling for BALL_PLACEMENT_PHASE
if (this.state === GameState.BALL_PLACEMENT_PHASE) {
  return this.selectMove(col);
}
```

#### Enhanced `selectMove()` method (lines 244-249):
```typescript
// Added hard mode logic to check reserved columns
if (this.config.gameMode === GameMode.HARD_MODE) {
  const columnOwner = this.columnReservation.reservedColumnOwners.get(col);
  if (columnOwner !== this.currentPlayer) {
    return false; // Player can only place balls in their own reserved columns
  }
}
```

#### Updated `canSelectMove()` method (lines 770-775):
```typescript
// Added same reserved column validation
if (this.config.gameMode === GameMode.HARD_MODE) {
  const columnOwner = this.columnReservation.reservedColumnOwners.get(col);
  if (columnOwner !== this.currentPlayer) {
    return false;
  }
}
```

#### Updated `canDropInColumn()` method (lines 699-701):
```typescript
// Added explicit routing for BALL_PLACEMENT_PHASE
} else if (this.state === GameState.BALL_PLACEMENT_PHASE) {
  return this.canSelectMove(col);
}
```

### 2. `/src/App.tsx`
**Changes made:**

#### Added `COLUMN_RESERVATION_PHASE` message handling (lines 138-149):
```typescript
case GameState.COLUMN_RESERVATION_PHASE:
  if (gameMode === GameMode.HARD_MODE) {
    const columnReservation = gameInstance.getColumnReservation();
    const totalReserved = columnReservation.player1ReservedColumns.length + columnReservation.player2ReservedColumns.length;
    const totalNeeded = gameInstance.getConfig().ballsPerPlayer * 2;
    setGameMessage(
      `Hard Mode - Player ${currentPlayer}'s turn to reserve a column (${totalReserved}/${totalNeeded} columns reserved)`
    );
  }
  break;
```

### 3. `/tests/Game.test.ts`
**Changes made:**

#### Completely rewrote hard mode tests (lines 211-447):
- Updated tests to expect `COLUMN_RESERVATION_PHASE` as starting state
- Added comprehensive tests for all three phases
- Added tests for phase transitions
- Added tests for column ownership validation
- Added tests for dormant ball creation and management
- Added backward compatibility tests for normal mode

## Test Files Created

### 1. `/test-files/test_hard_mode_fix.js`
- Comprehensive test of the complete three-phase workflow
- Tests column reservation → ball placement → ball release
- Tests error cases and validation

### 2. `/test-files/verify_hard_mode_fix.js`
- Verification script to confirm the fix works
- Tests all phase transitions
- Tests error handling
- Provides detailed output for debugging

## Key Features Implemented

### ✅ Phase Transitions
- `COLUMN_RESERVATION_PHASE` → `BALL_PLACEMENT_PHASE` → `BALL_RELEASE_PHASE`
- Proper player switching in each phase
- Correct state validation

### ✅ Column Ownership
- Players can only reserve available columns
- Players can only place balls in their reserved columns
- Players can only release their own balls

### ✅ Dormant Ball Management
- Balls are placed as dormant during placement phase
- Dormant balls don't count for scoring until released
- Proper tracking of dormant balls per player

### ✅ UI Integration
- Column selectors show reservation status
- Game messages reflect current phase and progress
- Proper visual feedback for each phase

### ✅ Backward Compatibility
- Normal mode functionality unchanged
- Existing APIs maintained
- No breaking changes to existing code

## Verification Steps

1. **Run the verification script:**
   ```bash
   node test-files/verify_hard_mode_fix.js
   ```

2. **Run the unit tests:**
   ```bash
   npm test
   ```

3. **Test in the UI:**
   - Start a new game in Hard Mode
   - Verify it starts in column reservation phase
   - Reserve columns for both players
   - Verify transition to ball placement phase
   - Place balls in reserved columns
   - Verify transition to ball release phase
   - Release balls and complete the game

## Result
The issue **"Hard mode doesn't switch to release phase"** has been completely resolved. Hard mode now follows a proper three-phase workflow with correct state transitions and validation at each step.