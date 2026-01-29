// Data export/import functionality for backing up and restoring progress

import {
  getAllOpeningProgress,
  getAllReviewCards,
  getUserStats,
  getAchievements,
  updateOpeningProgress,
  updateReviewCard,
  updateUserStats,
  saveAchievements,
} from './storage';
import type { OpeningProgress } from './storage';
import type { ReviewCard } from './spaced-repetition';
import type { Achievement } from './gamification';
import type { UserStats } from './storage';

export interface ExportData {
  version: '1.0';
  exportedAt: string;
  openingProgress: Record<string, OpeningProgress>;
  userStats: UserStats;
  reviewCards: Record<string, ReviewCard>;
  achievements: Achievement[];
}

/**
 * Export all user data as JSON
 */
export function exportData(): ExportData {
  const allProgress = getAllOpeningProgress();
  const stats = getUserStats();
  const cards = getAllReviewCards();
  const achievements = getAchievements();

  // Convert cards array to object for easier export
  const cardsObj: Record<string, ReviewCard> = {};
  cards.forEach(card => {
    cardsObj[card.openingId] = card;
  });

  return {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    openingProgress: allProgress,
    userStats: stats,
    reviewCards: cardsObj,
    achievements,
  };
}

/**
 * Export data as JSON file download
 */
export function downloadExportFile(): void {
  const data = exportData();
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `chess-opening-trainer-backup-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Import data from JSON
 */
export function importData(data: ExportData): { success: boolean; message: string } {
  try {
    // Validate version
    if (data.version !== '1.0') {
      return {
        success: false,
        message: 'Invalid or unsupported backup version',
      };
    }

    // Restore opening progress
    Object.entries(data.openingProgress).forEach(([openingId, progress]) => {
      updateOpeningProgress(openingId, progress);
    });

    // Restore user stats
    updateUserStats(data.userStats);

    // Restore review cards
    Object.entries(data.reviewCards).forEach(([, card]) => {
      updateReviewCard(card);
    });

    // Restore achievements
    saveAchievements(data.achievements);

    return {
      success: true,
      message: 'Data imported successfully!',
    };
  } catch (e) {
    console.error('Error importing data:', e);
    return {
      success: false,
      message: `Error importing data: ${e instanceof Error ? e.message : 'Unknown error'}`,
    };
  }
}

/**
 * Handle file input for importing data
 */
export function importFromFile(file: File): Promise<{ success: boolean; message: string }> {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        const result = importData(json);
        resolve(result);
      } catch (error) {
        resolve({
          success: false,
          message: 'Invalid JSON file',
        });
      }
    };

    reader.onerror = () => {
      resolve({
        success: false,
        message: 'Error reading file',
      });
    };

    reader.readAsText(file);
  });
}
