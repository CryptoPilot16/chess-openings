// localStorage persistence for user progress

import {
  ReviewCard,
  createReviewCard,
  calculateNextReview,
  accuracyToQuality,
  isDueForReview,
} from './spaced-repetition';
import {
  Achievement,
  calculateXPReward,
  checkAchievements,
  ACHIEVEMENTS,
} from './gamification';
import type { Opening } from '@/data/openings';

export interface OpeningProgress {
  openingId: string;
  completedCount: number;
  lastPracticed: string; // ISO date
  bestStreak: number;
  currentStreak: number;
  averageAccuracy: number; // 0-100
  totalMoves: number;
  correctMoves: number;
  reviewCard?: ReviewCard; // Spaced repetition data
}

export interface UserStats {
  totalSessions: number;
  totalMovesPlayed: number;
  correctMovesTotal: number;
  startedAt: string; // ISO date
  lastActive: string; // ISO date
  totalXP: number;
  totalCompletions: number;
  uniqueOpeningsCompleted: number;
  perfectRuns: number;
  currentStreak: number;
  bestStreak: number;
}

const STORAGE_KEYS = {
  openingProgress: 'chess-trainer-openings',
  userStats: 'chess-trainer-stats',
  settings: 'chess-trainer-settings',
  reviewCards: 'chess-trainer-reviews',
  achievements: 'chess-trainer-achievements',
};

/**
 * Get opening progress for a specific opening
 */
export function getOpeningProgress(openingId: string): OpeningProgress | null {
  if (typeof window === 'undefined') return null;

  try {
    const data = localStorage.getItem(STORAGE_KEYS.openingProgress);
    if (!data) return null;

    const allProgress: Record<string, OpeningProgress> = JSON.parse(data);
    return allProgress[openingId] || null;
  } catch (e) {
    console.error('Error reading opening progress:', e);
    return null;
  }
}

/**
 * Update opening progress
 */
export function updateOpeningProgress(
  openingId: string,
  updates: Partial<OpeningProgress>
): void {
  if (typeof window === 'undefined') return;

  try {
    const data = localStorage.getItem(STORAGE_KEYS.openingProgress);
    const allProgress: Record<string, OpeningProgress> = data ? JSON.parse(data) : {};

    const existing = allProgress[openingId] || {
      openingId,
      completedCount: 0,
      lastPracticed: new Date().toISOString(),
      bestStreak: 0,
      currentStreak: 0,
      averageAccuracy: 0,
      totalMoves: 0,
      correctMoves: 0,
    };

    allProgress[openingId] = {
      ...existing,
      ...updates,
      lastPracticed: new Date().toISOString(),
    };

    // Recalculate average accuracy
    if (allProgress[openingId].totalMoves > 0) {
      allProgress[openingId].averageAccuracy = Math.round(
        (allProgress[openingId].correctMoves / allProgress[openingId].totalMoves) * 100
      );
    }

    localStorage.setItem(STORAGE_KEYS.openingProgress, JSON.stringify(allProgress));
  } catch (e) {
    console.error('Error saving opening progress:', e);
  }
}

/**
 * Get all opening progress data
 */
export function getAllOpeningProgress(): Record<string, OpeningProgress> {
  if (typeof window === 'undefined') return {};

  try {
    const data = localStorage.getItem(STORAGE_KEYS.openingProgress);
    return data ? JSON.parse(data) : {};
  } catch (e) {
    console.error('Error reading all opening progress:', e);
    return {};
  }
}

/**
 * Get user stats
 */
export function getUserStats(): UserStats {
  const defaultStats: UserStats = {
    totalSessions: 0,
    totalMovesPlayed: 0,
    correctMovesTotal: 0,
    startedAt: new Date().toISOString(),
    lastActive: new Date().toISOString(),
    totalXP: 0,
    totalCompletions: 0,
    uniqueOpeningsCompleted: 0,
    perfectRuns: 0,
    currentStreak: 0,
    bestStreak: 0,
  };

  if (typeof window === 'undefined') {
    return defaultStats;
  }

  try {
    const data = localStorage.getItem(STORAGE_KEYS.userStats);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.userStats, JSON.stringify(defaultStats));
      return defaultStats;
    }

    // Merge with defaults to handle old data
    const stored = JSON.parse(data);
    return { ...defaultStats, ...stored };
  } catch (e) {
    console.error('Error reading user stats:', e);
    return defaultStats;
  }
}

/**
 * Update user stats
 */
export function updateUserStats(updates: Partial<UserStats>): void {
  if (typeof window === 'undefined') return;

  try {
    const existing = getUserStats();
    const newStats: UserStats = {
      ...existing,
      ...updates,
      lastActive: new Date().toISOString(),
    };

    localStorage.setItem(STORAGE_KEYS.userStats, JSON.stringify(newStats));
  } catch (e) {
    console.error('Error saving user stats:', e);
  }
}

/**
 * Record a completed training session
 */
export function recordSession(
  openingId: string,
  movesPlayed: number,
  correctMoves: number,
  completed: boolean,
  opening?: Opening
): { xpEarned: number; newAchievements: Achievement[] } {
  const stats = getUserStats();
  const currentProgress = getOpeningProgress(openingId);
  const accuracy = movesPlayed > 0 ? (correctMoves / movesPlayed) * 100 : 0;
  const isPerfect = accuracy === 100;

  // Calculate XP (only for completed sessions)
  let xpEarned = 0;
  if (completed && opening) {
    xpEarned = calculateXPReward(movesPlayed, correctMoves, true, opening.difficulty);
  }

  // Update opening progress
  const isFirstCompletion = (currentProgress?.completedCount || 0) === 0;
  const newStreak = completed ? (currentProgress?.currentStreak || 0) + 1 : 0;

  updateOpeningProgress(openingId, {
    completedCount: (currentProgress?.completedCount || 0) + (completed ? 1 : 0),
    currentStreak: newStreak,
    bestStreak: Math.max(newStreak, currentProgress?.bestStreak || 0),
    totalMoves: (currentProgress?.totalMoves || 0) + movesPlayed,
    correctMoves: (currentProgress?.correctMoves || 0) + correctMoves,
  });

  // Update spaced repetition card (only for completed sessions)
  if (completed) {
    let card = getReviewCard(openingId);
    if (!card) {
      card = createReviewCard(openingId);
    }

    const quality = accuracyToQuality(accuracy);
    const updatedCard = calculateNextReview(quality, card);
    updateReviewCard(updatedCard);
  }

  // Calculate unique openings completed
  const allProgress = getAllOpeningProgress();
  const uniqueCompleted = Object.values(allProgress).filter(p => p.completedCount > 0).length;

  // Update global stats
  const previousStats = { ...stats };
  const newGlobalStreak = completed ? stats.currentStreak + 1 : 0;

  updateUserStats({
    totalSessions: stats.totalSessions + 1,
    totalMovesPlayed: stats.totalMovesPlayed + movesPlayed,
    correctMovesTotal: stats.correctMovesTotal + correctMoves,
    totalXP: stats.totalXP + xpEarned,
    totalCompletions: stats.totalCompletions + (completed ? 1 : 0),
    uniqueOpeningsCompleted: uniqueCompleted,
    perfectRuns: stats.perfectRuns + (isPerfect && completed ? 1 : 0),
    currentStreak: newGlobalStreak,
    bestStreak: Math.max(newGlobalStreak, stats.bestStreak),
  });

  // Check for new achievements
  const newStats = getUserStats();
  const currentAchievements = getAchievements();
  const newAchievements = checkAchievements(previousStats, newStats, currentAchievements);

  if (newAchievements.length > 0) {
    saveAchievements([...currentAchievements, ...newAchievements]);
  }

  return { xpEarned, newAchievements };
}

/**
 * Get review card for an opening
 */
export function getReviewCard(openingId: string): ReviewCard | null {
  if (typeof window === 'undefined') return null;

  try {
    const data = localStorage.getItem(STORAGE_KEYS.reviewCards);
    if (!data) return null;

    const allCards: Record<string, ReviewCard> = JSON.parse(data);
    return allCards[openingId] || null;
  } catch (e) {
    console.error('Error reading review card:', e);
    return null;
  }
}

/**
 * Update review card
 */
export function updateReviewCard(card: ReviewCard): void {
  if (typeof window === 'undefined') return;

  try {
    const data = localStorage.getItem(STORAGE_KEYS.reviewCards);
    const allCards: Record<string, ReviewCard> = data ? JSON.parse(data) : {};
    allCards[card.openingId] = card;
    localStorage.setItem(STORAGE_KEYS.reviewCards, JSON.stringify(allCards));
  } catch (e) {
    console.error('Error saving review card:', e);
  }
}

/**
 * Get all review cards
 */
export function getAllReviewCards(): ReviewCard[] {
  if (typeof window === 'undefined') return [];

  try {
    const data = localStorage.getItem(STORAGE_KEYS.reviewCards);
    if (!data) return [];

    const allCards: Record<string, ReviewCard> = JSON.parse(data);
    return Object.values(allCards);
  } catch (e) {
    console.error('Error reading review cards:', e);
    return [];
  }
}

/**
 * Get openings due for review
 */
export function getDueOpenings(): string[] {
  const cards = getAllReviewCards();
  return cards.filter(isDueForReview).map(card => card.openingId);
}

/**
 * Get all achievements
 */
export function getAchievements(): Achievement[] {
  if (typeof window === 'undefined') return [];

  try {
    const data = localStorage.getItem(STORAGE_KEYS.achievements);
    if (!data) return [];
    return JSON.parse(data);
  } catch (e) {
    console.error('Error reading achievements:', e);
    return [];
  }
}

/**
 * Save achievements
 */
export function saveAchievements(achievements: Achievement[]): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEYS.achievements, JSON.stringify(achievements));
  } catch (e) {
    console.error('Error saving achievements:', e);
  }
}

/**
 * Reset all progress (for testing or user request)
 */
export function resetAllProgress(): void {
  if (typeof window === 'undefined') return;

  localStorage.removeItem(STORAGE_KEYS.openingProgress);
  localStorage.removeItem(STORAGE_KEYS.userStats);
  localStorage.removeItem(STORAGE_KEYS.reviewCards);
  localStorage.removeItem(STORAGE_KEYS.achievements);
}
