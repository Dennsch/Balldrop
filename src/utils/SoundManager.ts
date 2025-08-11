export class SoundManager {
  private static instance: SoundManager;
  private sounds: Map<string, HTMLAudioElement> = new Map();
  private enabled: boolean = true;
  private volume: number = 0.5;

  private constructor() {
    this.initializeSounds();
  }

  public static getInstance(): SoundManager {
    if (!SoundManager.instance) {
      SoundManager.instance = new SoundManager();
    }
    return SoundManager.instance;
  }

  private initializeSounds() {
    // Initialize sound files
    const soundFiles = {
      'pop': '/sounds/pop.mp3',
      'impact': '/sounds/impact.mp3',
      'win': '/sounds/win.mp3',
      'click': '/sounds/click.mp3',
    };

    console.log('🔊 Initializing sound files...');

    Object.entries(soundFiles).forEach(([soundType, filePath]) => {
      try {
        const audio = new Audio(filePath);
        audio.volume = this.volume;
        audio.preload = 'auto';
        
        // Handle successful loading
        audio.addEventListener('canplaythrough', () => {
          console.log(`✅ Sound loaded successfully: ${soundType} (${filePath})`);
        });
        
        // Handle loading errors gracefully
        audio.addEventListener('error', (e) => {
          console.warn(`❌ Could not load sound file: ${filePath}`, e);
        });
        
        this.sounds.set(soundType, audio);
      } catch (error) {
        console.warn(`Failed to initialize sound: ${soundType}`, error);
      }
    });
  }

  public playSound(soundType: string, volume: number = 0.5): void {
    if (!this.enabled) {
      console.log(`🔇 Sound disabled, not playing: ${soundType}`);
      return;
    }

    console.log(`🔊 Attempting to play sound: ${soundType}`);
    const sound = this.sounds.get(soundType);
    if (sound) {
      try {
        // Reset the sound to the beginning
        sound.currentTime = 0;
        sound.volume = Math.min(volume, this.volume);
        
        // Play the sound
        const playPromise = sound.play();
        
        // Handle play promise (required for some browsers)
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log(`✅ Successfully played sound: ${soundType}`);
            })
            .catch((error) => {
              console.warn(`❌ Could not play sound: ${soundType}`, error);
              // Fallback to beep sound
              this.playBeep(soundType, volume);
            });
        }
      } catch (error) {
        console.warn(`Error playing sound: ${soundType}`, error);
        // Fallback to beep sound
        this.playBeep(soundType, volume);
      }
    } else {
      console.log(`🎵 Sound file not found, using beep fallback: ${soundType}`);
      // Fallback: create a simple beep sound using Web Audio API
      this.playBeep(soundType, volume);
    }
  }

  private playBeep(soundType: string, volume: number): void {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Different frequencies for different sound types
      const frequencies: { [key: string]: number } = {
        'pop': 440,
        'impact': 660,
        'win': 880,
        'click': 220,
      };

      oscillator.frequency.setValueAtTime(frequencies[soundType] || 440, audioContext.currentTime);
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(volume * 0.1, audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.1);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    } catch (error) {
      console.warn('Could not create beep sound:', error);
    }
  }

  public setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
    this.sounds.forEach((sound) => {
      sound.volume = this.volume;
    });
  }

  public getVolume(): number {
    return this.volume;
  }
}

// Export the singleton instance getter
export const getSoundManager = () => SoundManager.getInstance();