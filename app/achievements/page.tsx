'use client';

import { useEffect, useState } from 'react';
import { getAchievements } from '@/lib/storage';
import { ACHIEVEMENTS, type Achievement } from '@/lib/gamification';
import Link from 'next/link';

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const unlockedAchievements = getAchievements();
    setAchievements(unlockedAchievements);
  }, []);

  if (!mounted) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center">Loading achievements...</div>
      </div>
    );
  }

  const unlockedIds = new Set(achievements.map(a => a.id));
  const unlockedCount = achievements.length;

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-2">Achievements</h1>
        <p className="text-slate-600 dark:text-slate-400">
          {unlockedCount} / {ACHIEVEMENTS.length} achievements unlocked
        </p>
        <div className="mt-4 w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 h-3 rounded-full transition-all"
            style={{ width: `${(unlockedCount / ACHIEVEMENTS.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {ACHIEVEMENTS.map(achievement => {
          const isUnlocked = unlockedIds.has(achievement.id);
          const unlockedTime = achievements.find(a => a.id === achievement.id)?.unlockedAt;

          return (
            <div
              key={achievement.id}
              className={`rounded-xl p-6 border-2 transition transform hover:scale-105 ${
                isUnlocked
                  ? 'bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-slate-700 dark:to-slate-800 border-yellow-400 dark:border-yellow-600 shadow-lg'
                  : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600 opacity-60'
              }`}
            >
              <div className="text-4xl mb-3">{achievement.emoji}</div>
              <h3 className="text-lg font-bold mb-2">{achievement.name}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                {achievement.description}
              </p>
              
              {isUnlocked ? (
                <div className="text-xs text-green-600 dark:text-green-400 font-semibold">
                  ✓ Unlocked {unlockedTime && new Date(unlockedTime).toLocaleDateString()}
                </div>
              ) : (
                <div className="text-xs text-slate-500 dark:text-slate-500">
                  Locked
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Back Button */}
      <Link
        href="/"
        className="px-6 py-3 bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-600 text-white rounded-lg font-semibold transition inline-block"
      >
        Back to Training
      </Link>
    </div>
  );
}
