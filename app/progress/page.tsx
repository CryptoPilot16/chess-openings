'use client';

import { useEffect, useState } from 'react';
import { getUserStats, getOpeningProgress, getReviewCard, getDueOpenings, type UserStats } from '@/lib/storage';
import { openings } from '@/data/openings';
import { getLevelFromXP, getLevelTitle } from '@/lib/gamification';
import { downloadExportFile, importFromFile } from '@/lib/export-import';
import { getReviewScheduleText } from '@/lib/spaced-repetition';
import Link from 'next/link';

export default function ProgressPage() {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [mounted, setMounted] = useState(false);
  const [importMessage, setImportMessage] = useState<string | null>(null);
  const [dueToday, setDueToday] = useState<string[]>([]);

  useEffect(() => {
    setMounted(true);
    const userStats = getUserStats();
    setStats(userStats);
    const due = getDueOpenings();
    setDueToday(due);
  }, []);

  const handleExport = () => {
    downloadExportFile();
    setImportMessage('Export complete! Check your downloads folder.');
    setTimeout(() => setImportMessage(null), 3000);
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const result = await importFromFile(file);
    setImportMessage(result.message);

    if (result.success) {
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } else {
      setTimeout(() => setImportMessage(null), 3000);
    }

    // Reset file input
    e.target.value = '';
  };

  if (!mounted || !stats) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center">Loading progress...</div>
      </div>
    );
  }

  const userLevel = getLevelFromXP(stats.totalXP);
  const accuracy = stats.totalMovesPlayed > 0 
    ? Math.round((stats.correctMovesTotal / stats.totalMovesPlayed) * 100)
    : 0;

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-2">Your Progress</h1>
        <p className="text-slate-600 dark:text-slate-400">Track your chess opening mastery</p>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {/* Level Card */}
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-slate-800 dark:to-slate-700 rounded-xl p-6 border border-purple-200 dark:border-purple-900">
          <div className="text-sm text-slate-600 dark:text-slate-400 mb-2">LEVEL</div>
          <div className="text-5xl font-bold text-purple-600 dark:text-purple-400 mb-2">
            {userLevel.level}
          </div>
          <div className="text-xs text-slate-600 dark:text-slate-400 mb-3">
            {getLevelTitle(userLevel.level)}
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all"
              style={{
                width: `${(userLevel.currentXP / userLevel.xpForNextLevel) * 100}%`,
              }}
            />
          </div>
          <div className="text-xs text-slate-600 dark:text-slate-400 mt-2">
            {userLevel.currentXP} / {userLevel.xpForNextLevel} XP
          </div>
        </div>

        {/* XP Card */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-slate-800 dark:to-slate-700 rounded-xl p-6 border border-green-200 dark:border-green-900">
          <div className="text-sm text-slate-600 dark:text-slate-400 mb-2">TOTAL XP</div>
          <div className="text-4xl font-bold text-green-600 dark:text-green-400 mb-4">
            {stats.totalXP.toLocaleString()}
          </div>
          <div className="text-xs text-slate-600 dark:text-slate-400">
            Earned from {stats.totalSessions} sessions
          </div>
        </div>

        {/* Accuracy Card */}
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-slate-800 dark:to-slate-700 rounded-xl p-6 border border-blue-200 dark:border-blue-900">
          <div className="text-sm text-slate-600 dark:text-slate-400 mb-2">ACCURACY</div>
          <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-4">
            {accuracy}%
          </div>
          <div className="text-xs text-slate-600 dark:text-slate-400">
            {stats.correctMovesTotal} / {stats.totalMovesPlayed} moves
          </div>
        </div>

        {/* Streak Card */}
        <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-slate-800 dark:to-slate-700 rounded-xl p-6 border border-orange-200 dark:border-orange-900">
          <div className="text-sm text-slate-600 dark:text-slate-400 mb-2">STREAK</div>
          <div className="text-4xl font-bold text-orange-600 dark:text-orange-400 mb-4">
            {stats.currentStreak}
          </div>
          <div className="text-xs text-slate-600 dark:text-slate-400">
            Days of practice
          </div>
        </div>
      </div>

      {/* Review Queue */}
      {dueToday.length > 0 && (
        <div className="mb-12 bg-blue-50 dark:bg-slate-800 rounded-lg p-6 border-2 border-blue-300 dark:border-blue-700">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            📅 Due Today ({dueToday.length})
          </h2>
          <div className="space-y-3">
            {dueToday.map(openingId => {
              const opening = openings.find(o => o.id === openingId);
              if (!opening) return null;
              return (
                <Link
                  key={openingId}
                  href="/"
                  className="block p-4 bg-white dark:bg-slate-700 rounded-lg hover:shadow-lg transition border-l-4 border-blue-500"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold text-lg">{opening.name}</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Time to review your progress</p>
                    </div>
                    <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm font-semibold">
                      Practice Now
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Opening Mastery */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Opening Mastery</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {openings.map(opening => {
            const progress = getOpeningProgress(opening.id);
            const reviewCard = getReviewCard(opening.id);
            const masteryPercent = progress?.totalMoves ? Math.round((progress.correctMoves / progress.totalMoves) * 100) : 0;
            
            let masteryColor = 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800';
            let barColor = 'bg-red-500';
            
            if (masteryPercent >= 70) {
              masteryColor = 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800';
              barColor = 'bg-green-500';
            } else if (masteryPercent >= 40) {
              masteryColor = 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800';
              barColor = 'bg-yellow-500';
            }

            return (
              <div
                key={opening.id}
                className={`rounded-lg p-4 border ${masteryColor}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold">{opening.name}</h3>
                  <span className="text-sm font-bold">{masteryPercent}%</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mb-2">
                  <div
                    className={`${barColor} h-2 rounded-full transition-all`}
                    style={{ width: `${masteryPercent}%` }}
                  />
                </div>
                <div className="text-xs opacity-75">
                  {progress?.completedCount || 0} sessions • {progress?.correctMoves || 0} correct
                </div>
                {reviewCard && (
                  <div className="text-xs mt-2 pt-2 border-t opacity-60">
                    {getReviewScheduleText(reviewCard)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Import/Export Section */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Backup & Restore</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Export */}
          <div className="bg-blue-50 dark:bg-slate-800 rounded-lg p-6 border border-blue-200 dark:border-blue-900">
            <h3 className="font-semibold text-lg mb-2">💾 Export Data</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              Download a backup of all your progress as JSON
            </p>
            <button
              onClick={handleExport}
              className="w-full px-4 py-2 bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-600 text-white rounded-lg font-semibold transition"
            >
              Download Backup
            </button>
          </div>

          {/* Import */}
          <div className="bg-green-50 dark:bg-slate-800 rounded-lg p-6 border border-green-200 dark:border-green-900">
            <h3 className="font-semibold text-lg mb-2">📂 Import Data</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              Restore progress from a backup file
            </p>
            <input
              type="file"
              accept=".json"
              onChange={handleImportFile}
              style={{ display: 'none' }}
              id="import-file"
            />
            <label htmlFor="import-file" className="block">
              <button
                onClick={() => document.getElementById('import-file')?.click()}
                className="w-full px-4 py-2 bg-green-600 dark:bg-green-700 hover:bg-green-700 dark:hover:bg-green-600 text-white rounded-lg font-semibold transition cursor-pointer"
              >
                Restore from File
              </button>
            </label>
          </div>
        </div>

        {importMessage && (
          <div className={`mt-4 p-4 rounded-lg font-semibold text-white ${
            importMessage.includes('successfully') ? 'bg-green-500' : 'bg-blue-500'
          }`}>
            {importMessage}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Link
          href="/"
          className="px-6 py-3 bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-600 text-white rounded-lg font-semibold transition"
        >
          Back to Training
        </Link>
        <button
          onClick={() => {
            if (confirm('Are you sure? This will delete all your progress.')) {
              localStorage.clear();
              window.location.reload();
            }
          }}
          className="px-6 py-3 bg-red-600 dark:bg-red-700 hover:bg-red-700 dark:hover:bg-red-600 text-white rounded-lg font-semibold transition"
        >
          Clear All Progress
        </button>
      </div>
    </div>
  );
}
