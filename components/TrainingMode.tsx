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
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{opening.name}</h1>
          <p className="text-gray-600">{opening.description}</p>
        </div>

        {/* Move Info */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="text-center mb-4">
            <p className="text-sm text-gray-600">Progress</p>
            <p className="text-2xl font-bold text-blue-600">{moveIndex} / {opening.mainLine.length} moves</p>
          </div>
          <div className="text-center mb-4">
            <p className="text-sm text-gray-600">Next Move</p>
            <p className="text-lg font-mono font-bold text-gray-900">{currentMove || 'Complete!'}</p>
          </div>
          {hint && (
            <div className="bg-yellow-100 border border-yellow-400 rounded p-3 text-center text-yellow-800">
              Hint: {hint}
            </div>
          )}
          {feedback && (
            <div className={`mt-4 text-center font-bold text-lg ${
              feedback === 'correct' ? 'text-green-600' : 'text-red-600'
            }`}>
              {feedback === 'correct' ? '✓ Correct!' : '✗ Incorrect'}
            </div>
          )}
        </div>

        {/* Board */}
        <div className="flex justify-center mb-8">
          <ChessBoard
            board={board}
            onMove={handleMove}
          />
        </div>

        {/* Debug Message */}
        {debugMessage && (
          <div className="bg-blue-100 border border-blue-400 rounded p-3 text-center text-sm text-blue-800 mb-4">
            {debugMessage}
          </div>
        )}

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-lg p-6 text-center space-y-4">
          <div className="text-sm text-gray-600 space-y-1">
            <p>Press <kbd className="bg-gray-200 px-2 py-1 rounded">H</kbd> for hint</p>
            <p>Press <kbd className="bg-gray-200 px-2 py-1 rounded">R</kbd> to reset</p>
            <p>Press <kbd className="bg-gray-200 px-2 py-1 rounded">Q</kbd> to quit</p>
          </div>
          <button
            onClick={showHint}
            className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-6 rounded"
          >
            💡 Hint
          </button>
          <button
            onClick={resetTraining}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded ml-2"
          >
            🔄 Reset
          </button>
          <button
            onClick={onQuit}
            className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded ml-2"
          >
            ❌ Quit
          </button>
        </div>

        {/* Move History */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h3 className="font-bold text-gray-900 mb-3">Move History</h3>
          <div className="text-sm text-gray-600">
            {moveHistory.length === 0 ? 'Make your first move...' : moveHistory.join(' ')}
          </div>
        </div>

        {/* Key Ideas */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h3 className="font-bold text-gray-900 mb-3">Key Ideas</h3>
          <ul className="text-sm text-gray-600 space-y-2">
            {opening.keyIdeas.map((idea, idx) => (
              <li key={idx}>• {idea}</li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
}
