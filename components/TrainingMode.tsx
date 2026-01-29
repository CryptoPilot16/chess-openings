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
  const [debugMessage, setDebugMessage] = useState<string>('');

  const currentMove = opening.mainLine[moveIndex];
  const isComplete = moveIndex >= opening.mainLine.length;

  useEffect(() => {
    const progress = getOpeningProgress(opening.id);
    setOpeningProgress(progress);
  }, [opening.id]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        resetTraining();
      }
      if (e.key === 'q' || e.key === 'Q') {
        e.preventDefault();
        onQuit?.();
      }
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
      const result = recordSession(
        opening.id,
        sessionStats.movesPlayed,
        sessionStats.correctMoves,
        true,
        opening
      );

      let bonusXP = 0;
      const dailyChallenge = getDailyChallenge();
      const challengeOpening = getDailyChallengeOpening();
      if (challengeOpening?.id === opening.id && !dailyChallenge.completed) {
        bonusXP = dailyChallenge.xpBonus;
        completeDailyChallenge();
        
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
      }, 3000);
    }
  }, [isComplete, onComplete, opening.id, opening, sessionStats]);

  const handleMove = (from: Position, to: Position) => {
    const userMoveAlgebraic = clickToAlgebraic(board, from, to);
    
    setDebugMessage(`Move: ${from.row},${from.col} → ${to.row},${to.col} = ${userMoveAlgebraic || 'INVALID'}`);

    if (!userMoveAlgebraic) {
      setFeedback('incorrect');
      setTimeout(() => setFeedback(null), 1000);
      return false;
    }

    const expectedMove = currentMove.replace(/[+#!?]/g, '');
    const userMove = userMoveAlgebraic.replace(/[+#!?]/g, '');

    setDebugMessage(`Comparing: "${userMove}" vs "${expectedMove}"`);

    if (userMove === expectedMove) {
      setFeedback('correct');
      setHint(null);

      playSound('correct');
      triggerHaptic('success');

      setSessionStats(prev => ({
        movesPlayed: prev.movesPlayed + 1,
        correctMoves: prev.correctMoves + 1,
      }));

      setMoveHistory(prev => [...prev, currentMove]);

      const move = parseAlgebraicMove(currentMove, board, isWhiteTurn);
      if (move) {
        const newBoard = applyMove(board, move);
        setBoard(newBoard);
        setIsWhiteTurn(!isWhiteTurn);
        setMoveIndex(moveIndex + 1);
        setDebugMessage(`✓ Correct! Move applied.`);

        setTimeout(() => setFeedback(null), 800);
      }

      return true;
    } else {
      setFeedback('incorrect');
      playSound('incorrect');
      triggerHaptic('error');
      
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
      setHint(currentMove);
    }
  };

  const resetTraining = () => {
    setBoard(INITIAL_BOARD);
    setMoveIndex(0);
    setFeedback(null);
    setHint(null);
    setIsWhiteTurn(true);
    setSessionStats({ movesPlayed: 0, correctMoves: 0 });
    setMoveHistory([]);
    setShowSuccess(false);
    setDebugMessage('Reset');
  };

  if (showSuccess) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl p-8 text-center max-w-md">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-3xl font-bold text-green-700 mb-4">Opening Complete!</h2>
          <p className="text-gray-600 mb-4">You've mastered the {opening.name}</p>
          <div className="text-2xl font-bold text-blue-600">+{xpEarned} XP</div>
          {newAchievements.length > 0 && (
            <div className="mt-4">
              <p className="text-sm text-gray-600">New Achievement!</p>
              <p className="font-bold">{newAchievements[0].name}</p>
            </div>
          )}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent mb-3">
            {opening.name}
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">{opening.description}</p>
        </div>

        {/* Main Container */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Left: Board */}
          <div className="md:col-span-2">
            <div className="card-lg p-6 flex justify-center">
              <ChessBoard board={board} onMove={handleMove} />
            </div>
          </div>

          {/* Right: Info Panel */}
          <div className="space-y-4">
            {/* Progress */}
            <div className="card p-6 text-center">
              <div className="text-slate-400 text-sm uppercase tracking-wide mb-2">Progress</div>
              <div className="text-4xl font-black bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                {moveIndex}/{opening.mainLine.length}
              </div>
              <div className="mt-3 w-full bg-slate-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all"
                  style={{ width: `${(moveIndex / opening.mainLine.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Current Move */}
            <div className="card p-6 text-center">
              <div className="text-slate-400 text-sm uppercase tracking-wide mb-3">Next Move</div>
              <div className="text-5xl font-black font-mono text-blue-400">
                {currentMove || '✓'}
              </div>
            </div>

            {/* Feedback */}
            {feedback && (
              <div className={`card p-4 text-center font-bold text-lg ${
                feedback === 'correct' ? 'bg-emerald-900/50 text-emerald-300' : 'bg-red-900/50 text-red-300'
              }`}>
                {feedback === 'correct' ? '✓ Correct!' : '✗ Try again'}
              </div>
            )}

            {/* Hint */}
            {hint && (
              <div className="card p-4 bg-amber-900/30 border-amber-600/50 text-center">
                <div className="text-amber-400 text-sm font-bold mb-1">💡 Hint</div>
                <div className="text-amber-200">{hint}</div>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-2">
              <button
                onClick={showHint}
                className="w-full btn btn-primary bg-amber-600 hover:bg-amber-700"
              >
                💡 Hint
              </button>
              <button
                onClick={resetTraining}
                className="w-full btn btn-secondary"
              >
                🔄 Reset
              </button>
              <button
                onClick={onQuit}
                className="w-full btn btn-secondary text-red-400 hover:text-red-300"
              >
                ← Back
              </button>
            </div>
          </div>
        </div>

        {/* Move History & Key Ideas */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Move History */}
          <div className="card p-6">
            <h3 className="text-sm font-bold uppercase tracking-wide text-slate-400 mb-3">Move History</h3>
            <div className="text-slate-300 font-mono">
              {moveHistory.length === 0 ? (
                <span className="text-slate-500">Make your first move...</span>
              ) : (
                moveHistory.join(' ')
              )}
            </div>
          </div>

          {/* Key Ideas */}
          <div className="card p-6">
            <h3 className="text-sm font-bold uppercase tracking-wide text-slate-400 mb-3">Key Ideas</h3>
            <ul className="text-slate-300 text-sm space-y-2">
              {opening.keyIdeas.map((idea, idx) => (
                <li key={idx} className="flex items-start">
                  <span className="text-blue-400 mr-2">▸</span>
                  <span>{idea}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
