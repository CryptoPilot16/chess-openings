'use client';

import { useState } from 'react';
import type { BoardPosition, Position } from '@/lib/chess-utils';

type PieceType = 'p' | 'n' | 'b' | 'r' | 'q' | 'k' | 'P' | 'N' | 'B' | 'R' | 'Q' | 'K' | null;

const PIECE_SYMBOLS: Record<string, string> = {
  'p': '♟', 'n': '♞', 'b': '♝', 'r': '♜', 'q': '♛', 'k': '♚',
  'P': '♙', 'N': '♘', 'B': '♗', 'R': '♖', 'Q': '♕', 'K': '♔',
};

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
      // Attempt to move piece
      const [fromRow, fromCol] = selectedSquare;
      const from: Position = { row: fromRow, col: fromCol };
      const to: Position = { row, col };

      if (onMove) {
        // Use external validation
        const isValid = onMove(from, to);
        if (isValid) {
          setInternalSelected(null);
        }
      } else {
        // Internal mode (no validation)
        const newBoard = board.map(r => [...r]);
        newBoard[row][col] = newBoard[fromRow][fromCol];
        newBoard[fromRow][fromCol] = null;
        setInternalBoard(newBoard);
        setInternalSelected(null);
      }
    } else if (board[row][col]) {
      // Select piece
      if (externalSelected === undefined) {
        setInternalSelected([row, col]);
      }
    }
  };

  const isLightSquare = (row: number, col: number) => (row + col) % 2 === 0;
  const isSelected = (row: number, col: number) =>
    selectedSquare && selectedSquare[0] === row && selectedSquare[1] === col;

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <div className="grid grid-cols-8 gap-0 border-4 border-gray-800 rounded-lg overflow-hidden shadow-2xl">
        {board.map((row, rowIndex) =>
          row.map((piece, colIndex) => {
            const isLight = isLightSquare(rowIndex, colIndex);
            const selected = isSelected(rowIndex, colIndex);

            return (
              <button
                key={`${rowIndex}-${colIndex}`}
                onClick={() => handleSquareClick(rowIndex, colIndex)}
                className={`
                  w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20
                  flex items-center justify-center
                  text-3xl sm:text-4xl md:text-5xl
                  transition-all duration-150
                  ${isLight ? 'bg-amber-100' : 'bg-amber-700'}
                  ${selected ? 'ring-4 ring-blue-500 ring-inset' : ''}
                  hover:brightness-110
                  active:brightness-90
                `}
              >
                {piece && (
                  <span
                    className={`
                      ${piece === piece.toUpperCase() ? 'text-white' : 'text-black'}
                      drop-shadow-md
                    `}
                  >
                    {PIECE_SYMBOLS[piece]}
                  </span>
                )}
              </button>
            );
          })
        )}
      </div>

      <div className="text-sm text-gray-600 text-center">
        {selectedSquare ? 'Click a square to move' : 'Click a piece to select'}
      </div>
    </div>
  );
}
