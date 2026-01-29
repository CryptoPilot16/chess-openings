// Sound effects system with Web Audio API

export type SoundEffect = 'move' | 'correct' | 'incorrect' | 'levelup' | 'achievement';

const STORAGE_KEY = 'chess-trainer-sounds-enabled';

/**
 * Check if sounds are enabled
 */
export function areSoundsEnabled(): boolean {
  if (typeof window === 'undefined') return false;

  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored !== null) {
    return stored === 'true';
  }

  // Default to true (enabled)
  localStorage.setItem(STORAGE_KEY, 'true');
  return true;
}

/**
 * Toggle sound effects
 */
export function toggleSounds(): boolean {
  const enabled = !areSoundsEnabled();
  localStorage.setItem(STORAGE_KEY, String(enabled));
  return enabled;
}

/**
 * Play a sound effect using Web Audio API
 */
export function playSound(effect: SoundEffect): void {
  if (!areSoundsEnabled()) return;

  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

    const now = audioContext.currentTime;
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();

    oscillator.connect(gain);
    gain.connect(audioContext.destination);

    // Set up sound based on type
    switch (effect) {
      case 'move':
        // Short beep for regular move
        oscillator.frequency.value = 600;
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        oscillator.start(now);
        oscillator.stop(now + 0.1);
        break;

      case 'correct':
        // Ascending two-note chord for correct move
        oscillator.frequency.setValueAtTime(523.25, now); // C5
        oscillator.frequency.setValueAtTime(659.25, now + 0.1); // E5
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        oscillator.start(now);
        oscillator.stop(now + 0.3);
        break;

      case 'incorrect':
        // Low buzzer for incorrect move
        oscillator.frequency.value = 300;
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        oscillator.start(now);
        oscillator.stop(now + 0.3);
        break;

      case 'levelup':
        // Ascending three-note fanfare
        const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
        let time = now;
        notes.forEach((freq, i) => {
          const osc = audioContext.createOscillator();
          const g = audioContext.createGain();
          osc.connect(g);
          g.connect(audioContext.destination);
          osc.frequency.value = freq;
          g.gain.setValueAtTime(0.15, time);
          g.gain.exponentialRampToValueAtTime(0.01, time + 0.2);
          osc.start(time);
          osc.stop(time + 0.2);
          time += 0.15;
        });
        break;

      case 'achievement':
        // Celebratory chord
        const achNotes = [523.25, 659.25, 783.99]; // C5, E5, G5
        achNotes.forEach(freq => {
          const osc = audioContext.createOscillator();
          const g = audioContext.createGain();
          osc.connect(g);
          g.connect(audioContext.destination);
          osc.frequency.value = freq;
          g.gain.setValueAtTime(0.15, now);
          g.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
          osc.start(now);
          osc.stop(now + 0.5);
        });
        break;
    }
  } catch (e) {
    console.warn('Could not play sound:', e);
  }
}

/**
 * Trigger haptic feedback (mobile vibration)
 */
export function triggerHaptic(pattern: 'success' | 'error' | 'light'): void {
  if (!('vibrate' in navigator)) return;

  const patterns = {
    success: [100, 50, 100], // Short-pause-short vibration
    error: [200, 100, 200], // Longer vibration
    light: [50], // Quick tap
  };

  navigator.vibrate(patterns[pattern]);
}
