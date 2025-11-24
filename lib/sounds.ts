// Shared audio context for better performance
let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (!audioContext) {
    try {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (error) {
      console.debug('Audio context not available:', error);
      return null;
    }
  }
  // Resume context if suspended (required by some browsers)
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
  return audioContext;
}

// Track active oscillators to stop them if needed
const activeOscillators = new Set<OscillatorNode>();

// Generate a chip-like sound effect using Web Audio API
export function playChipSound(frequency: number = 800, duration: number = 50) {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    // Thinner sound: lower frequency and use triangle wave for softer sound
    oscillator.frequency.value = frequency;
    oscillator.type = 'triangle'; // Thinner, softer sound than sine

    // Shorter, sharper attack and decay for thinner sound
    const now = ctx.currentTime;
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.15, now + 0.001); // Quick attack
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration / 1000); // Quick decay

    oscillator.start(now);
    oscillator.stop(now + duration / 1000);

    // Track and clean up
    activeOscillators.add(oscillator);
    oscillator.onended = () => {
      activeOscillators.delete(oscillator);
    };
  } catch (error) {
    console.debug('Error playing chip sound:', error);
  }
}

// Stop all active sounds
export function stopAllChipSounds() {
  activeOscillators.forEach(oscillator => {
    try {
      oscillator.stop();
    } catch (e) {
      // Ignore errors when stopping
    }
  });
  activeOscillators.clear();
}

// Different chip sounds for different interactions - thinner sounds
export const chipSounds = {
  hover: () => playChipSound(500, 20), // Thinner: lower frequency, shorter duration
  click: () => playChipSound(650, 30),
  navigate: () => playChipSound(550, 25),
  select: () => playChipSound(700, 35),
};


