// Gamification system: XP, levels, achievements

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon?: string;
  emoji?: string;
  unlockedAt?: string; // ISO date
  progress?: number; // 0-100
  target?: number; // Target value to unlock
}

export interface UserLevel {
  level: number;
  currentXP: number;
  xpForNextLevel: number;
  totalXP: number;
}

// XP formula: Each level requires more XP (exponential growth)
export function getXPForLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.5, level - 1));
}

// Calculate level from total XP
export function getLevelFromXP(totalXP: number): UserLevel {
  let level = 1;
  let xpSoFar = 0;

  while (true) {
    const xpNeeded = getXPForLevel(level);
    if (xpSoFar + xpNeeded > totalXP) {
      return {
        level,
        currentXP: totalXP - xpSoFar,
        xpForNextLevel: xpNeeded,
        totalXP,
      };
    }
    xpSoFar += xpNeeded;
    level++;
  }
}

// Award XP based on performance
export function calculateXPReward(
  movesPlayed: number,
  correctMoves: number,
  completed: boolean,
  difficulty: 'beginner' | 'intermediate' | 'advanced'
): number {
  if (!completed) return 0;

  const accuracy = correctMoves / movesPlayed;
  let baseXP = 50; // Base XP for completing an opening

  // Difficulty multiplier
  const difficultyMultiplier = {
    beginner: 1.0,
    intermediate: 1.5,
    advanced: 2.0,
  }[difficulty];

  // Accuracy bonus
  let accuracyBonus = 0;
  if (accuracy >= 0.95) accuracyBonus = 50; // Perfect
  else if (accuracy >= 0.85) accuracyBonus = 30; // Excellent
  else if (accuracy >= 0.75) accuracyBonus = 15; // Good

  // First time bonus
  const firstTimeBonus = 0; // Calculated elsewhere based on completion count

  return Math.floor((baseXP + accuracyBonus) * difficultyMultiplier);
}

// Define all achievements
export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-opening',
    name: 'First Steps',
    description: 'Complete your first opening',
    emoji: '🎯',
    target: 1,
  },
  {
    id: 'five-openings',
    name: 'Opening Explorer',
    description: 'Complete 5 different openings',
    emoji: '🗺️',
    target: 5,
  },
  {
    id: 'perfect-run',
    name: 'Perfectionist',
    description: 'Complete an opening with 100% accuracy',
    emoji: '💎',
    target: 1,
  },
  {
    id: 'streak-5',
    name: 'On Fire',
    description: 'Maintain a 5-session streak',
    emoji: '🔥',
    target: 5,
  },
  {
    id: 'streak-10',
    name: 'Unstoppable',
    description: 'Maintain a 10-session streak',
    emoji: '⚡',
    target: 10,
  },
  {
    id: 'advanced-master',
    name: 'Grandmaster',
    description: 'Complete all advanced openings',
    emoji: '👑',
    target: 1,
  },
  {
    id: 'speed-demon',
    name: 'Speed Demon',
    description: 'Complete an opening in under 2 minutes',
    emoji: '🚀',
    target: 1,
  },
  {
    id: 'level-5',
    name: 'Apprentice',
    description: 'Reach level 5',
    emoji: '⭐',
    target: 5,
  },
  {
    id: 'level-10',
    name: 'Expert',
    description: 'Reach level 10',
    emoji: '🌟',
    target: 10,
  },
  {
    id: 'level-20',
    name: 'Master',
    description: 'Reach level 20',
    emoji: '✨',
    target: 20,
  },
];

// Check which achievements are newly unlocked
export function checkAchievements(
  previousStats: any,
  newStats: any,
  previousAchievements: Achievement[]
): Achievement[] {
  const newlyUnlocked: Achievement[] = [];
  const now = new Date().toISOString();

  for (const template of ACHIEVEMENTS) {
    const existing = previousAchievements.find(a => a.id === template.id);
    
    // Skip if already unlocked
    if (existing?.unlockedAt) continue;

    let shouldUnlock = false;
    let progress = 0;

    switch (template.id) {
      case 'first-opening':
        progress = Math.min(newStats.totalCompletions || 0, 1);
        shouldUnlock = (newStats.totalCompletions || 0) >= 1;
        break;

      case 'five-openings':
        progress = Math.min(newStats.uniqueOpeningsCompleted || 0, 5);
        shouldUnlock = (newStats.uniqueOpeningsCompleted || 0) >= 5;
        break;

      case 'perfect-run':
        progress = newStats.perfectRuns || 0;
        shouldUnlock = progress >= 1;
        break;

      case 'streak-5':
        progress = Math.min(newStats.currentStreak || 0, 5);
        shouldUnlock = (newStats.currentStreak || 0) >= 5;
        break;

      case 'streak-10':
        progress = Math.min(newStats.currentStreak || 0, 10);
        shouldUnlock = (newStats.currentStreak || 0) >= 10;
        break;

      case 'level-5':
        const level5 = getLevelFromXP(newStats.totalXP || 0);
        progress = Math.min(level5.level, 5);
        shouldUnlock = level5.level >= 5;
        break;

      case 'level-10':
        const level10 = getLevelFromXP(newStats.totalXP || 0);
        progress = Math.min(level10.level, 10);
        shouldUnlock = level10.level >= 10;
        break;

      case 'level-20':
        const level20 = getLevelFromXP(newStats.totalXP || 0);
        progress = Math.min(level20.level, 20);
        shouldUnlock = level20.level >= 20;
        break;

      default:
        continue;
    }

    if (shouldUnlock) {
      newlyUnlocked.push({
        ...template,
        progress: 100,
        unlockedAt: now,
      });
    }
  }

  return newlyUnlocked;
}

// Get title based on level
export function getLevelTitle(level: number): string {
  if (level < 5) return 'Novice';
  if (level < 10) return 'Apprentice';
  if (level < 15) return 'Intermediate';
  if (level < 20) return 'Advanced';
  if (level < 30) return 'Expert';
  if (level < 50) return 'Master';
  return 'Grandmaster';
}
