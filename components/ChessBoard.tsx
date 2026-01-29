'use client';

import { useState } from 'react';
import type { BoardPosition, Position } from '@/lib/chess-utils';

type PieceType = 'p' | 'n' | 'b' | 'r' | 'q' | 'k' | 'P' | 'N' | 'B' | 'R' | 'Q' | 'K' | null;

const PIECE_UNICODE: Record<string, string> = {
  'K': '♔', 'Q': '♕', 'R': '♖', 'B': '♗', 'N': '♘', 'P': '♙',
  'k': '♚', 'q': '♛', 'r': '♜', 'b': '♝', 'n': '♞', 'p': '♟',
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
    console.log(`Clicked square: ${row}, ${col}`, { selectedSquare });
    
    if (selectedSquare) {
      const [fromRow, fromCol] = selectedSquare;
      const from: Position = { row: fromRow, col: fromCol };
      const to: Position = { row, col };

      if (onMove) {
        const isValid = onMove(from, to);
        console.log(`Move attempt: ${fromRow},${fromCol} to ${row},${col} - Valid: ${isValid}`);
        if (isValid) {
          setInternalSelected(null);
        } else {
          // Try selecting this new piece if it exists
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
      setInternalSelected([row, col]);
    }
  };

  const isLightSquare = (row: number, col: number) => (row + col) % 2 === 1;
  const isSelected = (row: number, col: number) =>
    selectedSquare && selectedSquare[0] === row && selectedSquare[1] === col;

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Board Container */}
      <div className="bg-gradient-to-b from-gray-800 to-gray-900 p-4 rounded-xl shadow-2xl">
        {/* Board Grid */}
        <div className="inline-block border-4 border-gray-900 rounded-lg overflow-hidden shadow-xl">
          <table cellSpacing="0" cellPadding="0" className="border-collapse">
            <tbody>
              {board.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {/* Rank Labels (8-1) */}
                  <td className="w-8 h-16 bg-gray-900 text-white text-xs font-bold flex items-center justify-center">
                    {8 - rowIndex}
                  </td>
                  
                  {/* Squares */}
                  {row.map((piece, colIndex) => {
                    const isLight = isLightSquare(rowIndex, colIndex);
                    const selected = isSelected(rowIndex, colIndex);

                    return (
                      <td
                        key={`${rowIndex}-${colIndex}`}
                        className={`
                          w-16 h-16
                          text-4xl
                          font-bold
                          text-center
                          align-middle
                          cursor-pointer
                          select-none
                          transition-all duration-75
                          border-2 border-transparent
                          ${isLight ? 'bg-cyan-100 hover:bg-cyan-200' : 'bg-blue-600 hover:bg-blue-700'}
                          ${selected ? 'border-yellow-400 bg-yellow-300' : ''}
                          active:brightness-75
                        `}
                        onClick={() => handleSquareClick(rowIndex, colIndex)}
                        style={{ userSelect: 'none' }}
                      >
                        {piece ? PIECE_UNICODE[piece] : ''}
                      </td>
                    );
                  })}
                </tr>
              ))}
              
              {/* File Labels (a-h) */}
              <tr>
                <td className="bg-gray-900" />
                {['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].map(file => (
                  <td
                    key={file}
                    className="w-16 h-8 bg-gray-900 text-white text-xs font-bold text-center align-middle"
                  >
                    {file}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
