'use client';

import { useState } from 'react';
import type { BoardPosition, Position } from '@/lib/chess-utils';

type PieceType = 'p' | 'n' | 'b' | 'r' | 'q' | 'k' | 'P' | 'N' | 'B' | 'R' | 'Q' | 'K' | null;

const PIECE_SYMBOLS: Record<string, string> = {
  'p': '♟', 'n': '♞', 'b': '♝', 'r': '♜', 'q': '♛', 'k': '♚',
  'P': '♙', 'N': '♘', 'B': '♗', 'R': '♖', 'Q': '♕', 'K': '♔',
};

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const RANKS = ['8', '7', '6', '5', '4', '3', '2', '1'];

interface ChessBoardProps {
  board?: BoardPosition;
  selectedSquare?: [number, number] | null;
  onMove?: (from: Position, to: Position) => boolean;
}

export default function ChessBoard({ 
  board: externalBoard, 
  selectedSquare: externalSelected,
  onMove 
}: ChessBoardProps) {
  const [internalBoard, setInternalBoard] = useState<PieceType[][]>([
    ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
    ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
    ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R'],
  ]);
  const [internalSelected, setInternalSelected] = useState<[number, number] | null>(null);

  const board = externalBoard || internalBoard;
  const selectedSquare = externalSelected !== undefined ? externalSelected : internalSelected;

  const handleSquareClick = (row: number, col: number) => {
    if (selectedSquare) {
      const [fromRow, fromCol] = selectedSquare;
      const from: Position = { row: fromRow, col: fromCol };
      const to: Position = { row, col };

      if (onMove) {
        const isValid = onMove(from, to);
        if (isValid) {
          setInternalSelected(null);
        }
      } else {
        const newBoard = board.map(r => [...r]);
        newBoard[row][col] = newBoard[fromRow][fromCol];
        newBoard[fromRow][fromCol] = null;
        setInternalBoard(newBoard);
        setInternalSelected(null);
      }
    } else if (board[row][col]) {
      if (externalSelected === undefined) {
        setInternalSelected([row, col]);
      }
    }
  };

  const isLightSquare = (row: number, col: number) => (row + col) % 2 === 0;
  const isSelected = (row: number, col: number) =>
    selectedSquare && selectedSquare[0] === row && selectedSquare[1] === col;

  return (
    <div className="flex flex-col items-center gap-8 p-6">
      {/* Board */}
      <div className="flex gap-2">
        {/* Files (a-h) */}
        <div className="flex flex-col justify-between pt-8 pr-1 text-xs font-bold text-gray-700 h-80">
          {RANKS.map(rank => (
            <div key={rank} className="h-10 flex items-center">{rank}</div>
          ))}
        </div>

        {/* Board Grid */}
        <div>
          <div className="grid grid-cols-8 gap-0 border-4 border-gray-900 rounded-lg overflow-hidden shadow-2xl bg-gray-900">
            {board.map((row, rowIndex) =>
              row.map((piece, colIndex) => {
                const isLight = isLightSquare(rowIndex, colIndex);
                const selected = isSelected(rowIndex, colIndex);

                return (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    onClick={() => handleSquareClick(rowIndex, colIndex)}
                    className={`
                      w-16 h-16
                      flex items-center justify-center
                      text-4xl
                      transition-all duration-100
                      cursor-pointer
                      select-none
                      relative
                      ${isLight ? 'bg-blue-100 hover:bg-blue-200' : 'bg-blue-700 hover:bg-blue-800'}
                      ${selected ? 'ring-4 ring-yellow-400 ring-inset' : ''}
                      active:brightness-75
                    `}
                  >
                    {piece && (
                      <span
                        className={`
                          font-bold
                          ${piece === piece.toUpperCase() ? 'text-white drop-shadow-lg' : 'text-gray-900 drop-shadow-lg'}
                        `}
                      >
                        {PIECE_SYMBOLS[piece]}
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Files (a-h) */}
          <div className="flex gap-0 mt-1 text-xs font-bold text-gray-700 pl-0">
            {FILES.map(file => (
              <div key={file} className="w-16 text-center">{file}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="text-center text-sm text-gray-600">
        <p>Click pieces to move them</p>
      </div>
    </div>
  );
}
