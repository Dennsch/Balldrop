import React, { useEffect, useRef, useState } from 'react';
import { BallPath, Player } from '../types.js';

interface AnimatedBallProps {
  ballPath: BallPath;
  onAnimationComplete: () => void;
}

const AnimatedBall: React.FC<AnimatedBallProps> = ({
  ballPath,
  onAnimationComplete
}) => {
  const ballRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(true);

  // Fixed fast animation timing
  const ANIMATION_MULTIPLIER = 0.5; // Fast speed
  const CSS_MULTIPLIER = 0.5;

  const getAnimatedDuration = (baseDuration: number): number => {
    return baseDuration * ANIMATION_MULTIPLIER;
  };

  const getCellElement = (row: number, col: number): HTMLElement | null => {
    return document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
  };

  const animateToPosition = async (
    ball: HTMLElement,
    row: number,
    col: number,
    action: string,
    portalType?: string,
    portalPosition?: { row: number; col: number }
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
      
      let left = rect.left - containerRect.left - borderLeft - paddingLeft + (rect.width - 32) / 2;
      let top = rect.top - containerRect.top - borderTop - paddingTop + (rect.height - 32) / 2;

      // Special positioning for portal entry and exit
      if (action === 'portal_entry') {
        // Position ball at the top center of the portal for entry
        top = rect.top - containerRect.top - borderTop - paddingTop + 2; // Near top of cell
        ball.style.transform = 'scale(0.8)'; // Slightly smaller as it enters
      } else if (action === 'portal_exit') {
        // Position ball at the bottom center of the portal for exit
        top = rect.top - containerRect.top - borderTop - paddingTop + rect.height - 34; // Near bottom of cell
        ball.style.transform = 'scale(0.8)'; // Start small and grow
        setTimeout(() => {
          ball.style.transform = 'scale(1)'; // Grow back to normal size
        }, getAnimatedDuration(100));
      }

      ball.style.left = `${left}px`;
      ball.style.top = `${top}px`;

      // Add visual effects based on action
      if (action === 'portal_entry') {
        ball.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15), 0 0 24px rgba(155, 127, 212, 0.6)';
        ball.style.transform = 'scale(0.8) rotate(360deg)';
        
        // Add portal glow effect to the portal cell
        if (portalPosition) {
          const portalElement = getCellElement(portalPosition.row, portalPosition.col);
          if (portalElement) {
            portalElement.style.boxShadow = '0 0 16px rgba(155, 127, 212, 0.7), inset 0 0 16px rgba(155, 127, 212, 0.2)';
            portalElement.style.transform = 'scale(1.1)';
            setTimeout(() => {
              portalElement.style.boxShadow = '0 0 8px rgba(155, 127, 212, 0.3)';
              portalElement.style.transform = 'scale(1)';
            }, getAnimatedDuration(300));
          }
        }
        
        setTimeout(() => {
          ball.style.transform = 'scale(0.6)';
          ball.style.opacity = '0.3';
        }, getAnimatedDuration(200));
      } else if (action === 'portal_exit') {
        ball.style.opacity = '0.3';
        ball.style.transform = 'scale(0.6)';
        ball.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15), 0 0 24px rgba(155, 127, 212, 0.6)';
        
        // Add portal glow effect to the exit portal
        if (portalPosition) {
          const portalElement = getCellElement(portalPosition.row, portalPosition.col);
          if (portalElement) {
            portalElement.style.boxShadow = '0 0 16px rgba(155, 127, 212, 0.7), inset 0 0 16px rgba(155, 127, 212, 0.2)';
            portalElement.style.transform = 'scale(1.1)';
            setTimeout(() => {
              portalElement.style.boxShadow = '0 0 8px rgba(155, 127, 212, 0.3)';
              portalElement.style.transform = 'scale(1)';
            }, getAnimatedDuration(300));
          }
        }
        
        setTimeout(() => {
          ball.style.opacity = '1';
          ball.style.transform = 'scale(1)';
          ball.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1), 0 0 12px rgba(0, 0, 0, 0.06)';
        }, getAnimatedDuration(150));
      } else if (action === 'redirect') {
        ball.style.transform = 'scale(1.3) rotate(360deg)';
        ball.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15), 0 0 24px rgba(232, 164, 74, 0.5)';
        setTimeout(() => {
          ball.style.transform = 'scale(1)';
          ball.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1), 0 0 12px rgba(0, 0, 0, 0.06)';
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
      const baseDuration = action === 'settle' ? 250 : 
                          action === 'redirect' ? 400 : 
                          action === 'portal_entry' ? 500 :
                          action === 'portal_exit' ? 400 : 350;
      const duration = getAnimatedDuration(baseDuration);

      setTimeout(resolve, duration);
    });
  };

  useEffect(() => {
    const animateBall = async () => {
      const ball = ballRef.current;
      if (!ball) return;

      console.log(`🎬 Starting ball animation for column ${ballPath.startColumn} (fast speed)`);
      
      
      try {
        // Animate through each step of the path
        for (let i = 0; i < ballPath.steps.length; i++) {
          const step = ballPath.steps[i];
          await animateToPosition(
            ball,
            step.position.row,
            step.position.col,
            step.action,
            step.portalType?.toString(),
            step.portalPosition
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
  }, [ballPath, onAnimationComplete]);

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
    transition: `all ${0.35 * CSS_MULTIPLIER}s ease-in-out`,
    border: '2px solid rgba(255, 255, 255, 0.6)',
    boxShadow: ballPath.player === Player.PLAYER1 
      ? '0 4px 12px rgba(224, 108, 94, 0.4), 0 0 16px rgba(224, 108, 94, 0.2)' 
      : '0 4px 12px rgba(74, 158, 194, 0.4), 0 0 16px rgba(74, 158, 194, 0.2)',
    backgroundColor: ballPath.player === Player.PLAYER1 ? '#E06C5E' : '#4A9EC2',
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