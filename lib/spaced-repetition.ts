// Spaced Repetition System (similar to SuperMemo/Anki SM-2 algorithm)

export interface ReviewCard {
  openingId: string;
  easeFactor: number; // 1.3 - 2.5 (higher = easier to remember)
  interval: number; // Days until next review
  repetitions: number; // Number of successful reviews
  nextReview: string; // ISO date
  lastReview: string; // ISO date
}

const MIN_EASE_FACTOR = 1.3;
const MAX_EASE_FACTOR = 2.5;
const INITIAL_EASE_FACTOR = 2.5;
const INITIAL_INTERVAL = 1; // 1 day

/**
 * Calculate next review date based on performance
 * @param quality 0-5 rating (0=complete fail, 5=perfect)
 * @param card Current card state
 * @returns Updated card
 */
export function calculateNextReview(
  quality: number,
  card: ReviewCard
): ReviewCard {
  // If quality < 3, reset the card (failed review)
  if (quality < 3) {
    return {
      ...card,
      interval: INITIAL_INTERVAL,
      repetitions: 0,
      easeFactor: Math.max(
        MIN_EASE_FACTOR,
        card.easeFactor - 0.2
      ),
      lastReview: new Date().toISOString(),
      nextReview: getDatePlusDays(INITIAL_INTERVAL).toISOString(),
    };
  }

  // Successful review
  let newInterval: number;
  let newRepetitions = card.repetitions + 1;

  if (newRepetitions === 1) {
    newInterval = 1; // 1 day
  } else if (newRepetitions === 2) {
    newInterval = 6; // 6 days
  } else {
    newInterval = Math.round(card.interval * card.easeFactor);
  }

  // Update ease factor based on performance
  const newEaseFactor = Math.max(
    MIN_EASE_FACTOR,
    Math.min(
      MAX_EASE_FACTOR,
      card.easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
    )
  );

  return {
    ...card,
    interval: newInterval,
    repetitions: newRepetitions,
    easeFactor: newEaseFactor,
    lastReview: new Date().toISOString(),
    nextReview: getDatePlusDays(newInterval).toISOString(),
  };
}

/**
 * Create a new review card for an opening
 */
export function createReviewCard(openingId: string): ReviewCard {
  return {
    openingId,
    easeFactor: INITIAL_EASE_FACTOR,
    interval: INITIAL_INTERVAL,
    repetitions: 0,
    nextReview: getDatePlusDays(INITIAL_INTERVAL).toISOString(),
    lastReview: new Date().toISOString(),
  };
}

/**
 * Check if a card is due for review
 */
export function isDueForReview(card: ReviewCard): boolean {
  const now = new Date();
  const nextReview = new Date(card.nextReview);
  return now >= nextReview;
}

/**
 * Get cards that are due for review
 */
export function getDueCards(cards: ReviewCard[]): ReviewCard[] {
  return cards.filter(isDueForReview);
}

/**
 * Convert accuracy percentage to quality rating (0-5)
 */
export function accuracyToQuality(accuracy: number): number {
  if (accuracy >= 95) return 5; // Perfect
  if (accuracy >= 85) return 4; // Good
  if (accuracy >= 75) return 3; // Pass
  if (accuracy >= 60) return 2; // Hard
  if (accuracy >= 40) return 1; // Very hard
  return 0; // Fail
}

/**
 * Get date plus N days
 */
function getDatePlusDays(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

/**
 * Get days until next review
 */
export function getDaysUntilReview(card: ReviewCard): number {
  const now = new Date();
  const next = new Date(card.nextReview);
  const diff = next.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

/**
 * Get human-readable review schedule
 */
export function getReviewScheduleText(card: ReviewCard): string {
  const days = getDaysUntilReview(card);

  if (days < 0) return 'Overdue!';
  if (days === 0) return 'Due today';
  if (days === 1) return 'Due tomorrow';
  if (days < 7) return `Due in ${days} days`;
  if (days < 30) return `Due in ${Math.round(days / 7)} weeks`;
  return `Due in ${Math.round(days / 30)} months`;
}
