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
    console.log(`Clicked: row=${row}, col=${col}, selected=${JSON.stringify(selectedSquare)}`);
    
    if (selectedSquare) {
      const [fromRow, fromCol] = selectedSquare;
      const from: Position = { row: fromRow, col: fromCol };
      const to: Position = { row, col };

      console.log(`Attempting move from (${fromRow},${fromCol}) to (${row},${col})`);

      if (onMove) {
        const isValid = onMove(from, to);
        console.log(`Move valid: ${isValid}`);
        if (isValid) {
          setInternalSelected(null);
        } else {
          if (board[row][col]) {
            setInternalSelected([row, col]);
          } else {
            setInternalSelected(null);
          }
        }
      } else {
        const newBoard = board.map(r => [...r]);
        newBoard[row][col] = newBoard[fromRow][fromCol];
        newBoard[fromRow][fromCol] = null;
        setInternalBoard(newBoard);
        setInternalSelected(null);
      }
    } else if (board[row][col]) {
      console.log(`Selected piece at (${row},${col}): ${board[row][col]}`);
      setInternalSelected([row, col]);
    }
  };

  const isLightSquare = (row: number, col: number) => (row + col) % 2 === 0;
  const isSelected = (row: number, col: number) =>
    selectedSquare && selectedSquare[0] === row && selectedSquare[1] === col;

  return (
    <div className="flex justify-center p-4">
      <div className="border-4 border-gray-900 rounded-lg overflow-hidden shadow-2xl bg-gray-900">
        {board.map((row, rowIndex) => (
          <div key={rowIndex} className="flex">
            <div className="w-8 h-16 bg-gray-900 text-white text-xs font-bold flex items-center justify-center">
              {8 - rowIndex}
            </div>
            {row.map((piece, colIndex) => {
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
                    cursor-pointer
                    select-none
                    transition-colors duration-100
                    ${isLight ? 'bg-amber-100 hover:bg-amber-200' : 'bg-amber-700 hover:bg-amber-800'}
                    ${selected ? 'ring-4 ring-yellow-400 ring-inset' : ''}
                  `}
                  style={{ userSelect: 'none' }}
                >
                  {piece && <span className={piece === piece.toUpperCase() ? 'text-white drop-shadow-lg' : 'text-black drop-shadow-lg'}>
                    {PIECE_SYMBOLS[piece]}
                  </span>}
                </div>
              );
            })}
          </div>
        ))}
        <div className="flex">
          <div className="w-8" />
          {['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].map(file => (
            <div
              key={file}
              className="w-16 h-6 bg-gray-900 text-white text-xs font-bold flex items-center justify-center"
            >
              {file}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
