'use client';

import { useState, useEffect } from 'react';
import { Chess } from 'chess.js';
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
    if (selectedSquare) {
      const [fromRow, fromCol] = selectedSquare;
      const from: Position = { row: fromRow, col: fromCol };
      const to: Position = { row, col };

      if (onMove) {
        const isValid = onMove(from, to);
        if (isValid) {
          setInternalSelected(null);
        } else {
          // Click a different piece
          if (board[row][col]) {
            setInternalSelected([row, col]);
          } else {
            setInternalSelected(null);
          }
        }
      } else {
        // Internal demo mode (no validation)
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
    <div className="w-full flex justify-center py-8">
      <div className="inline-block">
        {/* Board */}
        <div className="border-8 border-gray-800 rounded-lg overflow-hidden shadow-2xl" style={{
          width: 'fit-content'
        }}>
          <table cellSpacing="0" cellPadding="0" style={{ borderCollapse: 'collapse' }}>
            <tbody>
              {board.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {/* Rank */}
                  <td className="w-8 h-16 bg-gray-900 flex items-center justify-center text-white text-xs font-bold">
                    {8 - rowIndex}
                  </td>
                  
                  {row.map((piece, colIndex) => {
                    const isLight = isLightSquare(rowIndex, colIndex);
                    const selected = isSelected(rowIndex, colIndex);

                    return (
                      <td
                        key={`${rowIndex}-${colIndex}`}
                        onClick={() => handleSquareClick(rowIndex, colIndex)}
                        style={{
                          width: '64px',
                          height: '64px',
                          backgroundColor: selected 
                            ? '#fcd34d' 
                            : isLight 
                              ? '#f0d9b5' 
                              : '#baca44',
                          cursor: 'pointer',
                          fontSize: '48px',
                          textAlign: 'center',
                          lineHeight: '64px',
                          fontWeight: 'bold',
                          userSelect: 'none',
                          transition: 'all 0.1s',
                        }}
                        className="hover:opacity-80 active:opacity-60"
                      >
                        {piece ? PIECE_UNICODE[piece] : ''}
                      </td>
                    );
                  })}
                </tr>
              ))}
              
              {/* Files */}
              <tr>
                <td className="bg-gray-900" />
                {['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].map(file => (
                  <td
                    key={file}
                    className="w-16 h-8 bg-gray-900 text-white text-xs font-bold text-center flex items-center justify-center"
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
