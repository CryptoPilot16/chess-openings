'use client';

import { useState, useEffect } from 'react';
import { Opening } from '@/data/openings';
import {
  getAllOpeningProgress,
  getDueOpenings,
  getReviewCard,
  type OpeningProgress,
} from '@/lib/storage';
import { getReviewScheduleText } from '@/lib/spaced-repetition';
import { getDailyChallenge, getDailyChallengeOpening, completeDailyChallenge, type DailyChallenge } from '@/lib/daily-challenge';

interface OpeningSelectorProps {
  openings: Opening[];
  onSelect: (opening: Opening) => void;
}

export default function OpeningSelector({ openings, onSelect }: OpeningSelectorProps) {
  const [progress, setProgress] = useState<Record<string, OpeningProgress>>({});
  const [dueOpenings, setDueOpenings] = useState<string[]>([]);
  const [dailyChallenge, setDailyChallenge] = useState<DailyChallenge | null>(null);

  useEffect(() => {
    setProgress(getAllOpeningProgress());
    setDueOpenings(getDueOpenings());
    setDailyChallenge(getDailyChallenge());
  }, []);

  const handleDailyChallenge = () => {
    if (dailyChallenge) {
      const opening = getDailyChallengeOpening();
      if (opening) {
        onSelect(opening);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            ♟️ Chess Opening Trainer
          </h1>
          <p className="text-xl text-gray-600">
            Master essential chess openings through interactive practice
          </p>
        </div>

        {/* Daily Challenge Banner */}
        {dailyChallenge && !dailyChallenge.completed && (
          <div className="mb-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-xl p-8 text-white">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex-1">
                <h2 className="text-3xl font-bold mb-2">🎯 Today's Challenge</h2>
                <p className="text-lg mb-3 opacity-90">
                  Complete the {getDailyChallengeOpening()?.name} opening to earn +100 bonus XP!
                </p>
                <p className="text-sm opacity-75">
                  Attempts remaining: {dailyChallenge.attempts}
                </p>
              </div>
              <button
                onClick={handleDailyChallenge}
                className="px-8 py-4 bg-white text-purple-600 font-bold rounded-lg hover:bg-opacity-90 transition transform hover:scale-105 whitespace-nowrap"
              >
                Start Challenge
              </button>
            </div>
          </div>
        )}

        {dailyChallenge?.completed && (
          <div className="mb-12 bg-gradient-to-r from-green-400 to-emerald-400 rounded-xl shadow-xl p-8 text-white">
            <div className="flex items-center gap-4">
              <span className="text-5xl">✨</span>
              <div>
                <h2 className="text-2xl font-bold">Daily Challenge Complete!</h2>
                <p className="opacity-90">Come back tomorrow for a new challenge</p>
              </div>
            </div>
          </div>
        )}

        {/* Opening Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {openings.map((opening) => {
            const openingProgress = progress[opening.id];
            const hasProgress = openingProgress && openingProgress.completedCount > 0;
            const isDue = dueOpenings.includes(opening.id);
            const reviewCard = getReviewCard(opening.id);
            const masteryPercent = openingProgress?.totalMoves ? Math.round((openingProgress.correctMoves / openingProgress.totalMoves) * 100) : 0;

            return (
              <button
                key={opening.id}
                onClick={() => onSelect(opening)}
                className={`
                  group relative bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 
                  hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-lg 
                  transition-all duration-200 p-5 text-left overflow-hidden
                  ${isDue ? 'ring-2 ring-orange-400 ring-opacity-50' : ''}
                `}
              >
                {/* Background gradient on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent dark:from-blue-950 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 -z-10" />
                
                {/* Difficulty Badge & Stats Row */}
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`
                      px-2 py-1 rounded text-xs font-semibold uppercase tracking-wider
                      ${opening.difficulty === 'beginner' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-200' : ''}
                      ${opening.difficulty === 'intermediate' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-200' : ''}
                      ${opening.difficulty === 'advanced' ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200' : ''}
                    `}>
                      {opening.difficulty}
                    </span>
                    {hasProgress && masteryPercent >= 70 && (
                      <span className="text-lg">✨</span>
                    )}
                  </div>
                  <span className="text-3xl group-hover:scale-110 transition-transform">♔</span>
                </div>

              {/* Opening Name */}
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                {opening.name}
              </h3>

              {/* Description */}
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {opening.description}
              </p>

              {/* Moves Count */}
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <span className="font-semibold">{opening.mainLine.length}</span> moves
                </span>
                <span className="flex items-center gap-1">
                  <span className="font-semibold">{opening.variations.length}</span> variations
                </span>
              </div>

              {/* First Moves Preview */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500 mb-1">First moves:</p>
                <p className="font-mono text-sm text-gray-700">
                  {opening.mainLine.slice(0, 4).join(' ')}...
                </p>
              </div>

              {/* Progress Stats */}
              {hasProgress && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="flex gap-3 text-xs text-gray-600 mb-2">
                    {openingProgress.currentStreak > 0 && (
                      <span>🔥 {openingProgress.currentStreak}</span>
                    )}
                    <span>📊 {openingProgress.averageAccuracy}%</span>
                  </div>
                  
                  {/* Review Schedule */}
                  {reviewCard && (
                    <div className={`
                      text-xs font-semibold
                      ${isDue ? 'text-orange-600' : 'text-gray-500'}
                    `}>
                      📅 {getReviewScheduleText(reviewCard)}
                    </div>
                  )}
                </div>
              )}
            </button>
          )})}
        </div>

        {/* Info Footer */}
        <div className="mt-12 text-center text-gray-600">
          <p className="text-sm">
            Click on an opening to start practicing. You'll be guided through each move with instant feedback.
          </p>
        </div>
      </div>
    </div>
  );
}
