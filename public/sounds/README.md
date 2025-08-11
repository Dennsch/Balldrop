# Sound Files

This directory should contain the following sound files for the game:

- `pop.mp3` - Sound when a ball is dropped
- `impact.mp3` - Sound when a ball hits the bottom or completes a move
- `win.mp3` - Sound when a player wins
- `click.mp3` - Sound for button clicks

## Current Implementation

The game currently uses Web Audio API to generate simple beep sounds as fallbacks when audio files are not available. The SoundManager will automatically fall back to synthesized sounds if the audio files cannot be loaded.

## Adding Sound Files

To add actual sound files:

1. Place the audio files (MP3 format recommended) in this directory
2. The SoundManager will automatically try to load them
3. If loading fails, it will fall back to synthesized beep sounds

## Sound Controls

Users can toggle sound on/off using the sound button in the game controls.