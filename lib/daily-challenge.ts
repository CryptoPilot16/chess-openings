// Daily Challenge system

import { openings } from '@/data/openings';

export interface DailyChallenge {
  date: string; // ISO date (YYYY-MM-DD)
  openingId: string;
  attempts: number; // Max 3
  completed: boolean;
  xpBonus: number; // +100 XP if completed today
}

const STORAGE_KEY = 'chess-trainer-daily-challenge';

/**
 * Get today's daily challenge
 */
export function getDailyChallenge(): DailyChallenge {
  const today = new Date().toISOString().split('T')[0];

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const challenge = JSON.parse(stored) as DailyChallenge;
      if (challenge.date === today) {
        return challenge;
      }
    }
  } catch (e) {
    console.error('Error reading daily challenge:', e);
  }

  // Generate new daily challenge
  const randomIndex = Math.floor(new Date(today).getTime() / (24 * 60 * 60 * 1000)) % openings.length;
  const challenge: DailyChallenge = {
    date: today,
    openingId: openings[randomIndex].id,
    attempts: 3,
    completed: false,
    xpBonus: 100,
  };

  saveDailyChallenge(challenge);
  return challenge;
}

/**
 * Save daily challenge
 */
export function saveDailyChallenge(challenge: DailyChallenge): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(challenge));
  } catch (e) {
    console.error('Error saving daily challenge:', e);
  }
}

/**
 * Complete today's daily challenge
 */
export function completeDailyChallenge(): void {
  const challenge = getDailyChallenge();
  challenge.completed = true;
  saveDailyChallenge(challenge);
}

/**
 * Use one attempt on the daily challenge
 */
export function useAttempt(): void {
  const challenge = getDailyChallenge();
  if (challenge.attempts > 0) {
    challenge.attempts--;
    saveDailyChallenge(challenge);
  }
}

/**
 * Get opening name for daily challenge
 */
export function getDailyChallengeOpening() {
  const challenge = getDailyChallenge();
  return openings.find(o => o.id === challenge.openingId);
}

/**
 * Check if daily challenge is available
 */
export function isDailyChallengeAvailable(): boolean {
  const challenge = getDailyChallenge();
  return challenge.attempts > 0 && !challenge.completed;
}
