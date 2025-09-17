import React, { useState, useEffect, useCallback } from "react";
import { Game } from "./Game.js";
import { GameState, Player, BallPath, GameMode } from "./types.js";
import GameHeader from "./components/GameHeader.js";
import GameBoard from "./components/GameBoard.js";
import GameControls from "./components/GameControls.js";
import GameStatus from "./components/GameStatus.js";
import GameModeSwitch from "./components/GameModeSwitch.js";
import { loadGameMode, saveGameMode } from "./utils/localStorage.js";

const App: React.FC = () => {
  const [game, setGame] = useState<Game | null>(null);
  const [gameState, setGameState] = useState<GameState>(GameState.SETUP);
  const [currentPlayer, setCurrentPlayer] = useState<Player>(Player.PLAYER1);
  const [player1Balls, setPlayer1Balls] = useState<number>(10);
  const [player2Balls, setPlayer2Balls] = useState<number>(10);
  const [winnerMessage, setWinnerMessage] = useState<string>("");
  const [gameMessage, setGameMessage] = useState<string>("");

  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [gridKey, setGridKey] = useState<number>(0); // Force grid re-render
  const [gameMode, setGameMode] = useState<GameMode>(loadGameMode());
  const [player1Score, setPlayer1Score] = useState<number>(0);
  const [player2Score, setPlayer2Score] = useState<number>(0);
  const [animatedBalls, setAnimatedBalls] = useState<BallPath[]>([]);

  // Initialize game
  useEffect(() => {
    const initialGameMode = loadGameMode();
    const gameInstance = new Game({
      gridSize: 20,
      ballsPerPlayer: 10,
      minBoxes: 15,
      maxBoxes: 30,
      gameMode: initialGameMode,
    });

    // Set up game event listeners
    gameInstance.onStateChangeHandler((updatedGame) => {
      setGameState(updatedGame.getState());
      setCurrentPlayer(updatedGame.getCurrentPlayer());
      setPlayer1Balls(updatedGame.getBallsRemaining(Player.PLAYER1));
      setPlayer2Balls(updatedGame.getBallsRemaining(Player.PLAYER2));

      // Update current score
      const currentScore = updatedGame.getCurrentScore();
      setPlayer1Score(currentScore.player1Columns);
      setPlayer2Score(currentScore.player2Columns);

      // Update game mode
      setGameMode(updatedGame.getGameMode());

      // Update game message based on state
      updateGameMessage(updatedGame);

      // Check for winner
      if (updatedGame.getState() === GameState.FINISHED) {
        const result = updatedGame.getGameResult();
        if (result) {
          if (result.isTie) {
            setWinnerMessage(
              "It's a tie! Both players have the same number of columns."
            );
          } else {
            setWinnerMessage(
              `Player ${result.winner} wins with ${
                result.winner === Player.PLAYER1
                  ? result.player1Columns
                  : result.player2Columns
              } columns!`
            );
          }
        }
      } else {
        setWinnerMessage("");
      }

      // Force grid re-render to show updates
      setGridKey((prev) => prev + 1);
    });

    gameInstance.onBallDroppedHandler((ballPath: BallPath) => {
      // Handle individual ball drop animation
      setIsAnimating(true);
      console.log(
        "🎬 App: Ball dropped callback received, starting animation for column:",
        ballPath.startColumn,
        "Player:",
        ballPath.player,
        "Game state:",
        gameInstance.getState()
      );

      // Add the ball to animated balls state to trigger animation
      setAnimatedBalls((prev) => {
        const newBalls = [...prev, ballPath];
        console.log("🎬 App: Updated animated balls count:", newBalls.length);
        return newBalls;
      });
    });

    gameInstance.onMovesExecutedHandler((ballPaths: BallPath[]) => {
      // Handle batch move execution
      setIsAnimating(false);
      setGridKey((prev) => prev + 1);
      console.log("Moves executed, re-enabling interactions");
    });

    // Initialize the game
    gameInstance.startNewGame();
    setGame(gameInstance);

    // Make game available globally for debugging
    (window as any).game = gameInstance;

    // Debug logging
    console.log("Game initialized:", {
      state: gameInstance.getState(),
      mode: gameInstance.getGameMode(),
      currentPlayer: gameInstance.getCurrentPlayer(),
      canDropCol0: gameInstance.canDropInColumn(0),
      canDropCol1: gameInstance.canDropInColumn(1),
    });

    // Force reset animation state to ensure it's not stuck
    setIsAnimating(false);

    return () => {
      // Cleanup if needed
    };
  }, []);

  const updateGameMessage = useCallback((gameInstance: Game) => {
    const state = gameInstance.getState();
    const currentPlayer = gameInstance.getCurrentPlayer();
    const gameMode = gameInstance.getGameMode();

    switch (state) {
      case GameState.SETUP:
        setGameMessage("Setting up the game...");
        break;
      case GameState.PLAYING:
        setGameMessage(
          `Player ${currentPlayer}'s turn - Click a column to drop a ball`
        );
        break;
      case GameState.SELECTING_MOVES:
        setGameMessage("Select your moves for this round");
        break;
      case GameState.COLUMN_RESERVATION_PHASE:
        if (gameMode === GameMode.HARD_MODE) {
          const columnReservation = gameInstance.getColumnReservation();
          const totalReserved =
            columnReservation.player1ReservedColumns.length +
            columnReservation.player2ReservedColumns.length;
          const totalNeeded = gameInstance.getConfig().ballsPerPlayer * 2;
          setGameMessage(
            `Hard Mode - Player ${currentPlayer}'s turn to reserve a column (${totalReserved}/${totalNeeded} columns reserved)`
          );
        } else {
          setGameMessage("Reserve your columns");
        }
        break;
      case GameState.BALL_PLACEMENT_PHASE:
        if (gameMode === GameMode.HARD_MODE) {
          const moveSelection = gameInstance.getMoveSelection();
          const totalPlaced =
            moveSelection.player1Moves.length +
            moveSelection.player2Moves.length;
          const totalNeeded = gameInstance.getConfig().ballsPerPlayer * 2;
          setGameMessage(
            `Hard Mode - Player ${currentPlayer}'s turn to place a ball (${totalPlaced}/${totalNeeded} balls placed)`
          );
        } else {
          setGameMessage("Place your balls on the grid");
        }
        break;
      case GameState.BALL_RELEASE_PHASE:
        setGameMessage(
          "Release Phase - Click your reserved columns to release balls"
        );
        break;
      case GameState.FINISHED:
        setGameMessage("Game finished!");
        break;
      default:
        setGameMessage("");
    }
  }, []);

  const handleNewGame = useCallback(() => {
    if (game) {
      game.startNewGame();
      setWinnerMessage("");
      setGameMessage("");
      setGridKey((prev) => prev + 1);
    }
  }, [game]);

  const handleColumnClick = useCallback(
    (column: number) => {
      if (game && !isAnimating) {
        try {
          console.log(
            `Attempting to drop ball in column ${column}, game state: ${game.getState()}, can drop: ${game.canDropInColumn(
              column
            )}`
          );
          const success =
            game.getState() === GameState.BALL_RELEASE_PHASE
              ? game.releaseBall(column)
              : game.dropBall(column);
          console.log(`Drop result: ${success}`);
          if (!success) {
            setGameMessage(`Cannot drop ball in column ${column + 1}`);
          }
        } catch (error) {
          console.error("Error dropping ball:", error);
          setGameMessage(
            error instanceof Error ? error.message : "Error dropping ball"
          );
        }
      } else {
        console.log(
          `Column click blocked - game: ${!!game}, isAnimating: ${isAnimating}`
        );
      }
    },
    [game, isAnimating]
  );

  const handleCellClick = useCallback(
    (row: number, col: number) => {
      if (game && !isAnimating) {
        try {
          console.log(
            `Attempting to release ball at row ${row}, col ${col}, game state: ${game.getState()}`
          );
          const success = game.releaseBall(col);
          console.log(`Release result: ${success}`);
          if (!success) {
            setGameMessage(`Cannot release ball in column ${col + 1}`);
          }
        } catch (error) {
          console.error("Error releasing ball:", error);
          setGameMessage(
            error instanceof Error ? error.message : "Error releasing ball"
          );
        }
      } else {
        console.log(
          `Cell click blocked - game: ${!!game}, isAnimating: ${isAnimating}`
        );
      }
    },
    [game, isAnimating]
  );

  const handleGameModeChange = useCallback(
    (mode: GameMode) => {
      if (game) {
        console.log(`Changing game mode to: ${mode}`);
        game.setGameMode(mode);
        setGameMode(mode);

        // Save the new game mode to local storage
        saveGameMode(mode);

        // Automatically start a new game when switching modes
        game.startNewGame();

        // Reset animation state
        setIsAnimating(false);
        setAnimatedBalls([]);

        // Force grid re-render
        setGridKey((prev) => prev + 1);

        console.log(`New game started in ${mode} mode`);
      }
    },
    [game]
  );

  const handleAnimationComplete = useCallback(
    (ballPath: BallPath) => {
      if (game) {
        const currentState = game.getState();
        console.log(
          "🎬 App: Animation completed for column:",
          ballPath.startColumn,
          "Game state:",
          currentState
        );

        // Complete the ball drop/release in the game logic based on current state
        if (currentState === GameState.BALL_RELEASE_PHASE) {
          console.log("🎬 App: Calling completeBallRelease");
          game.completeBallRelease(ballPath);
        } else {
          console.log("🎬 App: Calling completeBallDrop");
          game.completeBallDrop(ballPath);
        }

        // Remove this ball from animated balls
        setAnimatedBalls((prev) => prev.filter((ball) => ball !== ballPath));

        // Re-enable interactions if no more balls are animating
        setAnimatedBalls((prev) => {
          if (prev.length <= 1) {
            // Will be 0 after filter above
            setIsAnimating(false);
          }
          return prev.filter((ball) => ball !== ballPath);
        });
      }
    },
    [game]
  );

  if (!game) {
    return (
      <div className="game-container">
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
            fontSize: "18px",
          }}
        >
          Loading game...
        </div>
      </div>
    );
  }

  return (
    <div className="game-container">
      <GameHeader
        currentPlayer={currentPlayer}
        player1Balls={player1Balls}
        player2Balls={player2Balls}
        player1Score={player1Score}
        player2Score={player2Score}
      />

      <main>
        <GameBoard
          game={game}
          onColumnClick={handleColumnClick}
          onCellClick={handleCellClick}
          isAnimating={isAnimating}
          gridKey={gridKey}
          animatedBalls={animatedBalls}
          onAnimationComplete={handleAnimationComplete}
        />

        <GameModeSwitch
          gameMode={gameMode}
          onGameModeChange={handleGameModeChange}
        />

        <GameControls onNewGame={handleNewGame} />

        <GameStatus winnerMessage={winnerMessage} gameMessage={gameMessage} />
      </main>
    </div>
  );
};

export default App;
