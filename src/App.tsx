import React, { useState, useEffect, useCallback } from "react";
import { Game } from "./Game.js";
import { GameState, Player, AnimationSpeed, BallPath } from "./types.js";
import GameHeader from "./components/GameHeader.js";
import GameBoard from "./components/GameBoard.js";
import GameControls from "./components/GameControls.js";
import GameStatus from "./components/GameStatus.js";

const App: React.FC = () => {
  const [game, setGame] = useState<Game | null>(null);
  const [gameState, setGameState] = useState<GameState>(GameState.SETUP);
  const [currentPlayer, setCurrentPlayer] = useState<Player>(Player.PLAYER1);
  const [player1Balls, setPlayer1Balls] = useState<number>(10);
  const [player2Balls, setPlayer2Balls] = useState<number>(10);
  const [winnerMessage, setWinnerMessage] = useState<string>("");
  const [gameMessage, setGameMessage] = useState<string>("");
  const [animationSpeed, setAnimationSpeed] = useState<AnimationSpeed>(
    AnimationSpeed.NORMAL
  );
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [gridKey, setGridKey] = useState<number>(0); // Force grid re-render

  // Initialize game
  useEffect(() => {
    const gameInstance = new Game({
      gridSize: 20,
      ballsPerPlayer: 10,
      minBoxes: 15,
      maxBoxes: 30,
    });

    // Set up game event listeners
    gameInstance.onStateChangeHandler((updatedGame) => {
      setGameState(updatedGame.getState());
      setCurrentPlayer(updatedGame.getCurrentPlayer());
      setPlayer1Balls(updatedGame.getBallsRemaining(Player.PLAYER1));
      setPlayer2Balls(updatedGame.getBallsRemaining(Player.PLAYER2));

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
      // Animation will be handled by the Grid component
    });

    gameInstance.onMovesExecutedHandler((ballPaths: BallPath[]) => {
      // Handle batch move execution
      setIsAnimating(false);
      setGridKey((prev) => prev + 1);
    });

    // Initialize the game
    gameInstance.startNewGame();
    setGame(gameInstance);

    // Make game available globally for debugging
    (window as any).game = gameInstance;

    return () => {
      // Cleanup if needed
    };
  }, []);

  const updateGameMessage = useCallback((gameInstance: Game) => {
    const state = gameInstance.getState();
    const currentPlayer = gameInstance.getCurrentPlayer();

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
      case GameState.BALL_PLACEMENT_PHASE:
        setGameMessage("Place your balls on the grid");
        break;
      case GameState.BALL_RELEASE_PHASE:
        setGameMessage("Release your balls to see them fall");
        break;
      case GameState.EXECUTING_MOVES:
        setGameMessage("Executing moves...");
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

  const handleReset = useCallback(() => {
    if (game) {
      game.reset();
      setWinnerMessage("");
      setGameMessage("");
      setGridKey((prev) => prev + 1);
    }
  }, [game]);

  const handleColumnClick = useCallback(
    (column: number) => {
      if (game && !isAnimating) {
        try {
          game.dropBall(column);
        } catch (error) {
          console.error("Error dropping ball:", error);
          setGameMessage(
            error instanceof Error ? error.message : "Error dropping ball"
          );
        }
      }
    },
    [game, isAnimating]
  );

  const handleAnimationSpeedChange = useCallback((speed: AnimationSpeed) => {
    setAnimationSpeed(speed);
  }, []);

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
      />

      <main>
        <GameBoard
          game={game}
          onColumnClick={handleColumnClick}
          animationSpeed={animationSpeed}
          isAnimating={isAnimating}
          gridKey={gridKey}
        />

        <GameControls
          onNewGame={handleNewGame}
          onReset={handleReset}
          animationSpeed={animationSpeed}
          onAnimationSpeedChange={handleAnimationSpeedChange}
        />

        <GameStatus winnerMessage={winnerMessage} gameMessage={gameMessage} />
      </main>
    </div>
  );
};

export default App;
