import { GameMode } from '../types.js';

// Local storage key for game mode
const GAME_MODE_KEY = 'ballDropGameMode';

/**
 * Saves the game mode to local storage
 * @param gameMode - The game mode to save
 * @returns boolean indicating success
 */
export const saveGameMode = (gameMode: GameMode): boolean => {
  try {
    localStorage.setItem(GAME_MODE_KEY, gameMode);
    console.log(`Game mode saved to local storage: ${gameMode}`);
    return true;
  } catch (error) {
    console.warn('Failed to save game mode to local storage:', error);
    return false;
  }
};

/**
 * Loads the game mode from local storage
 * @returns The saved game mode or GameMode.NORMAL as fallback
 */
export const loadGameMode = (): GameMode => {
  try {
    const savedMode = localStorage.getItem(GAME_MODE_KEY);
    
    // If no saved mode, return default
    if (!savedMode) {
      console.log('No saved game mode found, using default: NORMAL');
      return GameMode.NORMAL;
    }
    
    // Validate that the saved mode is a valid GameMode enum value
    if (Object.values(GameMode).includes(savedMode as GameMode)) {
      console.log(`Loaded game mode from local storage: ${savedMode}`);
      return savedMode as GameMode;
    } else {
      console.warn(`Invalid game mode found in local storage: ${savedMode}, using default: NORMAL`);
      return GameMode.NORMAL;
    }
  } catch (error) {
    console.warn('Failed to load game mode from local storage:', error);
    return GameMode.NORMAL;
  }
};

/**
 * Clears the saved game mode from local storage
 * @returns boolean indicating success
 */
export const clearGameMode = (): boolean => {
  try {
    localStorage.removeItem(GAME_MODE_KEY);
    console.log('Game mode cleared from local storage');
    return true;
  } catch (error) {
    console.warn('Failed to clear game mode from local storage:', error);
    return false;
  }
};