class AudioService {
  private context: AudioContext | null = null;
  private enabled: boolean = true;

  constructor() {
    // Initialize AudioContext on first user interaction
    this.initializeAudioContext();
  }

  private initializeAudioContext() {
    try {
      this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (error) {
      console.warn('Web Audio API not supported:', error);
    }
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  private createBeep(frequency: number, duration: number, volume: number = 0.1) {
    if (!this.context || !this.enabled) return;

    const oscillator = this.context.createOscillator();
    const gainNode = this.context.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.context.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = 'square';

    gainNode.gain.setValueAtTime(volume, this.context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + duration);

    oscillator.start(this.context.currentTime);
    oscillator.stop(this.context.currentTime + duration);
  }

  playTypingSound() {
    // Random frequency for typing effect
    const frequency = 800 + Math.random() * 400;
    this.createBeep(frequency, 0.05, 0.02);
  }

  playErrorSound() {
    // Low frequency error beep
    this.createBeep(200, 0.3, 0.1);
    setTimeout(() => this.createBeep(150, 0.3, 0.1), 100);
  }

  playSuccessSound() {
    // Rising tone for success
    this.createBeep(400, 0.2, 0.05);
    setTimeout(() => this.createBeep(600, 0.2, 0.05), 100);
    setTimeout(() => this.createBeep(800, 0.2, 0.05), 200);
  }

  playHackerSound() {
    // Matrix-style digital sound
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        const frequency = 1000 + Math.random() * 1000;
        this.createBeep(frequency, 0.1, 0.03);
      }, i * 50);
    }
  }

  playEasterEggSound() {
    // Special sound for easter egg discovery
    const notes = [523, 659, 784, 1047]; // C, E, G, C
    notes.forEach((note, index) => {
      setTimeout(() => this.createBeep(note, 0.3, 0.08), index * 150);
    });
  }
}

export const audioService = new AudioService();