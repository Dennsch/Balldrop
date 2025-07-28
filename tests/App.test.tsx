import React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../src/App.js';

describe('App Component', () => {
  test('renders game container', () => {
    render(<App />);
    
    // Check if the main game container is rendered
    const gameContainer = screen.getByRole('main');
    expect(gameContainer).toBeInTheDocument();
  });

  test('renders game header with player information', () => {
    render(<App />);
    
    // Check if player information is displayed
    expect(screen.getByText('Player 1')).toBeInTheDocument();
    expect(screen.getByText('Player 2')).toBeInTheDocument();
    expect(screen.getByText(/Player \d+'s Turn/)).toBeInTheDocument();
  });

  test('renders game controls', () => {
    render(<App />);
    
    // Check if game control buttons are rendered
    expect(screen.getByText('New Game')).toBeInTheDocument();
    expect(screen.getByText('Reset')).toBeInTheDocument();
    expect(screen.getByText('Animation Speed:')).toBeInTheDocument();
  });

  test('renders game grid', () => {
    render(<App />);
    
    // Check if the game grid is rendered
    const grid = screen.getByRole('main').querySelector('.grid');
    expect(grid).toBeInTheDocument();
  });
});