import React, { useEffect, useRef, useState } from 'react';
import { BallPath, Player, AnimationSpeed } from '../types.js';

interface AnimatedBallProps {
  ballPath: BallPath;
  animationSpeed: AnimationSpeed;
  onAnimationComplete: () => void;
}

const AnimatedBall: React.FC<AnimatedBallProps> = ({
  ballPath,
  animationSpeed,
  onAnimationComplete
}) => {
  const ballRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(true);

  // Animation timing configurations
  const animationTimings = {
    [AnimationSpeed.SLOW]: { multiplier: 2.0, cssMultiplier: 2.0 },
    [AnimationSpeed.NORMAL]: { multiplier: 1.0, cssMultiplier: 1.0 },
    [AnimationSpeed.FAST]: { multiplier: 0.5, cssMultiplier: 0.5 },
    [AnimationSpeed.INSTANT]: { multiplier: 0, cssMultiplier: 0.01 },
  };

  const getAnimatedDuration = (baseDuration: number): number => {
    const timing = animationTimings[animationSpeed];
    return baseDuration * timing.multiplier;
  };

  const getCellElement = (row: number, col: number): HTMLElement | null => {
    return document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
  };

  const animateToPosition = async (
    ball: HTMLElement,
    row: number,
    col: number,
    action: string
  ): Promise<void> => {
    return new Promise((resolve) => {
      const cellElement = getCellElement(row, col);
      if (!cellElement) {
        resolve();
        return;
      }

      const rect = cellElement.getBoundingClientRect();
      const gridContainer = cellElement.closest('.grid-container');
      if (!gridContainer) {
        resolve();
        return;
      }
      const containerRect = gridContainer.getBoundingClientRect();

      // Calculate position relative to grid container
      // Account for grid container border (3px) and any padding
      const containerStyle = window.getComputedStyle(gridContainer);
      const borderLeft = parseInt(containerStyle.borderLeftWidth) || 0;
      const borderTop = parseInt(containerStyle.borderTopWidth) || 0;
      const paddingLeft = parseInt(containerStyle.paddingLeft) || 0;
      const paddingTop = parseInt(containerStyle.paddingTop) || 0;
      
      const left = rect.left - containerRect.left - borderLeft - paddingLeft + (rect.width - 32) / 2;
      const top = rect.top - containerRect.top - borderTop - paddingTop + (rect.height - 32) / 2;

      ball.style.left = `${left}px`;
      ball.style.top = `${top}px`;

      // Add visual effects based on action
      if (action === 'redirect') {
        ball.style.transform = 'scale(1.3) rotate(360deg)';
        ball.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3), 0 0 30px rgba(255, 255, 0, 0.8)';
        setTimeout(() => {
          ball.style.transform = 'scale(1)';
          ball.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3), 0 0 20px rgba(255, 255, 255, 0.5)';
        }, getAnimatedDuration(120));
      } else if (action === 'fall') {
        ball.style.transform = 'scale(1.05)';
        setTimeout(() => {
          ball.style.transform = 'scale(1)';
        }, getAnimatedDuration(40));
      } else if (action === 'settle') {
        ball.style.transform = 'scale(1.1)';
        setTimeout(() => {
          ball.style.transform = 'scale(1)';
        }, getAnimatedDuration(80));
      }

      // Adjust timing based on action
      const baseDuration = action === 'settle' ? 250 : action === 'redirect' ? 400 : 350;
      const duration = getAnimatedDuration(baseDuration);

      setTimeout(resolve, duration);
    });
  };

  useEffect(() => {
    const animateBall = async () => {
      const ball = ballRef.current;
      if (!ball) return;

      console.log(`🎬 Starting ball animation for column ${ballPath.startColumn}`);
      
      try {
        // Animate through each step of the path
        for (let i = 0; i < ballPath.steps.length; i++) {
          const step = ballPath.steps[i];
          await animateToPosition(
            ball,
            step.position.row,
            step.position.col,
            step.action
          );
        }

        console.log('🎬 Ball animation completed');
        
        // Hide the animated ball
        setIsVisible(false);
        
        // Notify completion
        onAnimationComplete();
      } catch (error) {
        console.error('Ball animation error:', error);
        setIsVisible(false);
        onAnimationComplete();
      }
    };

    // Start animation after a brief delay
    const timer = setTimeout(animateBall, 50);
    return () => clearTimeout(timer);
  }, [ballPath, animationSpeed, onAnimationComplete]);

  if (!isVisible) return null;

  const ballStyle: React.CSSProperties = {
    position: 'absolute',
    zIndex: 1000,
    fontSize: '20px',
    fontWeight: 'bold',
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    transition: `all ${0.35 * animationTimings[animationSpeed].cssMultiplier}s ease-in-out`,
    border: '2px solid rgba(255, 255, 255, 0.8)',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3), 0 0 20px rgba(255, 255, 255, 0.5)',
    backgroundColor: ballPath.player === Player.PLAYER1 ? '#ff6b6b' : '#4ecdc4',
    color: 'white',
    // Start off-screen
    left: '-100px',
    top: '-100px',
  };

  return (
    <div
      ref={ballRef}
      style={ballStyle}
      className={`animated-ball ${ballPath.player === Player.PLAYER1 ? 'player1' : 'player2'}`}
    >
      ●
    </div>
  );
};

export default AnimatedBall;