'use client';

import { useState, useEffect } from 'react';
import ChessBoard from './ChessBoard';
import { Opening } from '@/data/openings';
import {
  parseAlgebraicMove,
  applyMove,
  clickToAlgebraic,
  INITIAL_BOARD,
  type BoardPosition,
  type Move,
  type Position,
} from '@/lib/chess-utils';
import {
  getOpeningProgress,
  recordSession,
  getUserStats,
  type OpeningProgress,
} from '@/lib/storage';
import { getLevelFromXP, getLevelTitle, type Achievement } from '@/lib/gamification';
import { getDailyChallenge, completeDailyChallenge, getDailyChallengeOpening } from '@/lib/daily-challenge';
import { playSound, triggerHaptic } from '@/lib/sound';

interface TrainingModeProps {
  opening: Opening;
  onComplete?: () => void;
  onQuit?: () => void;
}

export default function TrainingMode({ opening, onComplete, onQuit }: TrainingModeProps) {
  const [board, setBoard] = useState<BoardPosition>(INITIAL_BOARD);
  const [moveIndex, setMoveIndex] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const [isWhiteTurn, setIsWhiteTurn] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [sessionStats, setSessionStats] = useState({
    movesPlayed: 0,
    correctMoves: 0,
  });
  const [openingProgress, setOpeningProgress] = useState<OpeningProgress | null>(null);
  const [xpEarned, setXpEarned] = useState(0);
  const [newAchievements, setNewAchievements] = useState<Achievement[]>([]);
  const [moveHistory, setMoveHistory] = useState<string[]>([]);

  const currentMove = opening.mainLine[moveIndex];
  const isComplete = moveIndex >= opening.mainLine.length;

  // Load opening progress on mount
  useEffect(() => {
    const progress = getOpeningProgress(opening.id);
    setOpeningProgress(progress);
  }, [opening.id]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // R to reset
      if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        resetTraining();
      }
      // Q to quit
      if (e.key === 'q' || e.key === 'Q') {
        e.preventDefault();
        onQuit?.();
      }
      // H for hint
      if (e.key === 'h' || e.key === 'H') {
        e.preventDefault();
        showHint();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [moveIndex, currentMove]);

  useEffect(() => {
    if (isComplete) {
      // Record the completed session
      const result = recordSession(
        opening.id,
        sessionStats.movesPlayed,
        sessionStats.correctMoves,
        true, // completed
        opening
      );

      let bonusXP = 0;

      // Check if this is the daily challenge
      const dailyChallenge = getDailyChallenge();
      const challengeOpening = getDailyChallengeOpening();
      if (challengeOpening?.id === opening.id && !dailyChallenge.completed) {
        bonusXP = dailyChallenge.xpBonus;
        completeDailyChallenge();
        
        // Update stats with bonus XP
        const currentStats = getUserStats();
        const userLevel = getLevelFromXP(currentStats.totalXP);
        setXpEarned(result.xpEarned + bonusXP);
      } else {
        setXpEarned(result.xpEarned);
      }

      setNewAchievements(result.newAchievements);
      setShowSuccess(true);

      setTimeout(() => {
        onComplete?.();
      }, 3000); // Longer delay to show rewards
    }
  }, [isComplete, onComplete, opening.id, opening, sessionStats]);

  const handleMove = (from: Position, to: Position) => {
    // Convert user's click to algebraic notation
    const userMoveAlgebraic = clickToAlgebraic(board, from, to);

    if (!userMoveAlgebraic) {
      setFeedback('incorrect');
      setTimeout(() => setFeedback(null), 1000);
      return false;
    }

    // Check if it matches the expected move
    const expectedMove = currentMove.replace(/[+#!?]/g, ''); // Remove annotations
    const userMove = userMoveAlgebraic.replace(/[+#!?]/g, '');

    if (userMove === expectedMove) {
      // Correct move!
      setFeedback('correct');
      setHint(null);

      // Play sound and haptic feedback
      playSound('correct');
      triggerHaptic('success');

      // Update session stats
      setSessionStats(prev => ({
        movesPlayed: prev.movesPlayed + 1,
        correctMoves: prev.correctMoves + 1,
      }));

      // Add to move history
      setMoveHistory(prev => [...prev, currentMove]);

      // Parse and apply the move
      const move = parseAlgebraicMove(currentMove, board, isWhiteTurn);
      if (move) {
        const newBoard = applyMove(board, move);
        setBoard(newBoard);
        setIsWhiteTurn(!isWhiteTurn);
        setMoveIndex(moveIndex + 1);

        setTimeout(() => setFeedback(null), 800);
      }

      return true;
    } else {
      // Incorrect move
      setFeedback('incorrect');

      // Play sound and haptic feedback
      playSound('incorrect');
      triggerHaptic('error');
      
      // Update session stats (played but not correct)
      setSessionStats(prev => ({
        ...prev,
        movesPlayed: prev.movesPlayed + 1,
      }));

      setTimeout(() => setFeedback(null), 1000);
      return false;
    }
  };

  const showHint = () => {
    if (currentMove) {
      setHint(`Try ${currentMove}`);
    }
  };

  const resetTraining = () => {
    // Record incomplete session if any moves were played
    if (sessionStats.movesPlayed > 0) {
      recordSession(
        opening.id,
        sessionStats.movesPlayed,
        sessionStats.correctMoves,
        false, // not completed
        opening
      );
    }

    setBoard(INITIAL_BOARD);
    setMoveIndex(0);
    setFeedback(null);
    setHint(null);
    setIsWhiteTurn(true);
    setShowSuccess(false);
    setSessionStats({ movesPlayed: 0, correctMoves: 0 });
    setXpEarned(0);
    setNewAchievements([]);
    setMoveHistory([]);
    
    // Reload progress
    const progress = getOpeningProgress(opening.id);
    setOpeningProgress(progress);
  };

  if (isComplete && showSuccess) {
    const userStats = getUserStats();
    const userLevel = getLevelFromXP(userStats.totalXP);
    const accuracy = Math.round((sessionStats.correctMoves / sessionStats.movesPlayed) * 100);

    return (
      <div className="flex flex-col items-center gap-6 p-8 min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
        <div className="text-center max-w-2xl">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-3xl font-bold text-green-600 mb-2">
            Opening Complete!
          </h2>
          <p className="text-gray-600 mb-6">
            You successfully completed the {opening.name}
          </p>

          {/* Session Stats */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-3xl font-bold text-blue-600">{accuracy}%</div>
                <div className="text-sm text-gray-600">Accuracy</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-600">+{xpEarned}</div>
                <div className="text-sm text-gray-600">XP Earned</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-600">Lvl {userLevel.level}</div>
                <div className="text-sm text-gray-600">{getLevelTitle(userLevel.level)}</div>
              </div>
            </div>

            {/* Level Progress Bar */}
            <div className="mt-4">
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>Level {userLevel.level}</span>
                <span>{userLevel.currentXP} / {userLevel.xpForNextLevel} XP</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${(userLevel.currentXP / userLevel.xpForNextLevel) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* New Achievements */}
          {newAchievements.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">🏆 New Achievements!</h3>
              <div className="space-y-3">
                {newAchievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className="flex items-center gap-4 p-3 bg-yellow-50 rounded-lg border-2 border-yellow-300"
                  >
                    <span className="text-4xl">{achievement.icon}</span>
                    <div className="text-left">
                      <div className="font-bold text-gray-800">{achievement.name}</div>
                      <div className="text-sm text-gray-600">{achievement.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-4">
          <button
            onClick={resetTraining}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Practice Again
          </button>
          <button
            onClick={onQuit}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
          >
            Choose Another Opening
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6 p-4">
      {/* Opening Info */}
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-800">{opening.name}</h2>
            <p className="text-gray-600 text-sm mt-1">{opening.description}</p>
            
            {/* Progress Stats */}
            {openingProgress && openingProgress.completedCount > 0 && (
              <div className="flex gap-4 mt-2 text-xs text-gray-500">
                <span>✓ Completed {openingProgress.completedCount}x</span>
                <span>🔥 Streak: {openingProgress.currentStreak}</span>
                <span>📊 Accuracy: {openingProgress.averageAccuracy}%</span>
              </div>
            )}
          </div>
          <span className={`
            px-3 py-1 rounded-full text-xs font-semibold uppercase flex-shrink-0
            ${opening.difficulty === 'beginner' ? 'bg-green-100 text-green-800' : ''}
            ${opening.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' : ''}
            ${opening.difficulty === 'advanced' ? 'bg-red-100 text-red-800' : ''}
          `}>
            {opening.difficulty}
          </span>
        </div>

        {/* Progress */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Progress</span>
            <span>{moveIndex} / {opening.mainLine.length} moves</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(moveIndex / opening.mainLine.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Current Move */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-semibold mb-1">
                {isWhiteTurn ? '⚪ White to move' : '⚫ Black to move'}
              </p>
              <p className="text-lg font-mono font-bold text-blue-900">
                {currentMove}
              </p>
            </div>
            <button
              onClick={showHint}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-sm"
            >
              💡 Hint
            </button>
          </div>

          {hint && (
            <div className="mt-3 pt-3 border-t border-blue-200">
              <p className="text-sm text-blue-700">
                <span className="font-semibold">Hint:</span> {hint}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Feedback */}
      {feedback && (
        <div className={`
          px-6 py-3 rounded-lg font-semibold text-white shadow-lg
          transform transition-all duration-300
          ${feedback === 'correct' ? 'bg-green-500 scale-105' : 'bg-red-500 animate-shake'}
        `}>
          {feedback === 'correct' ? '✓ Correct!' : '✗ Try again'}
        </div>
      )}

      {/* Chess Board */}
      <ChessBoard
        board={board}
        onMove={handleMove}
        selectedSquare={null}
      />

      {/* Move History */}
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-3">Move History</h3>
        <div className="font-mono bg-gray-50 p-4 rounded border border-gray-200 min-h-12">
          {moveHistory.length > 0 ? (
            <div className="space-y-2">
              {moveHistory.map((move, index) => {
                const moveNumber = Math.floor(index / 2) + 1;
                const isWhiteMove = index % 2 === 0;
                return (
                  <div key={index}>
                    {isWhiteMove && <span className="font-bold text-gray-700">{moveNumber}.</span>}
                    <span className="mx-2 text-gray-800">{move}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-gray-400 text-sm">Make your first move...</div>
          )}
        </div>
      </div>

      {/* Key Ideas */}
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-3">Key Ideas</h3>
        <ul className="space-y-2">
          {opening.keyIdeas.map((idea, i) => (
            <li key={i} className="flex items-start gap-2 text-gray-700">
              <span className="text-blue-600 mt-1">•</span>
              <span className="text-sm">{idea}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Actions */}
      <div className="flex gap-4 flex-wrap justify-center">
        <button
          onClick={resetTraining}
          className="px-6 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition"
          title="Press R"
        >
          Reset (R)
        </button>
        <button
          onClick={onQuit}
          className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
          title="Press Q"
        >
          Quit (Q)
        </button>
        <div className="text-xs text-gray-500 dark:text-gray-400 self-center px-4">
          💡 Shortcut: Press <kbd>H</kbd> for hint
        </div>
      </div>
    </div>
  );
}
