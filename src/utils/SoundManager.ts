export class SoundManager {
    private static instance: SoundManager;
    private sounds: Map<string, HTMLAudioElement> = new Map();
    private enabled: boolean = true;

    private constructor() {
        this.loadSounds();
    }

    public static getInstance(): SoundManager {
        if (!SoundManager.instance) {
            SoundManager.instance = new SoundManager();
        }
        return SoundManager.instance;
    }

    private loadSounds(): void {
        const soundFiles = {
            pop: '/assets/sounds/pop.mp3',
            impact: '/assets/sounds/impact.mp3',
            plop: '/assets/sounds/plop-sound-made-with-my-mouth-100690.mp3'
        };

        Object.entries(soundFiles).forEach(([name, path]) => {
            const audio = new Audio(path);
            audio.preload = 'auto';
            audio.volume = 0.5; // Set default volume to 50%
            this.sounds.set(name, audio);
        });
    }

    public playSound(soundName: string, volume: number = 0.5): void {
        if (!this.enabled) return;

        const sound = this.sounds.get(soundName);
        if (sound) {
            // Clone the audio to allow overlapping sounds
            const audioClone = sound.cloneNode() as HTMLAudioElement;
            audioClone.volume = Math.max(0, Math.min(1, volume));
            
            audioClone.play().catch(error => {
                console.warn(`Failed to play sound ${soundName}:`, error);
            });
        } else {
            console.warn(`Sound ${soundName} not found`);
        }
    }

    public setEnabled(enabled: boolean): void {
        this.enabled = enabled;
    }

    public isEnabled(): boolean {
        return this.enabled;
    }

    public setVolume(soundName: string, volume: number): void {
        const sound = this.sounds.get(soundName);
        if (sound) {
            sound.volume = Math.max(0, Math.min(1, volume));
        }
    }

    public setMasterVolume(volume: number): void {
        this.sounds.forEach(sound => {
            sound.volume = Math.max(0, Math.min(1, volume));
        });
    }
}