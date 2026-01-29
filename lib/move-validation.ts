import type { BoardPosition, Position } from './chess-utils';

/**
 * Simple, direct move validation
 * Converts click coordinates to chess notation and validates
 */

export function positionToSquare(row: number, col: number): string {
  const file = String.fromCharCode('a'.charCodeAt(0) + col);
  const rank = (8 - row).toString();
  return file + rank;
}

export function squareToPosition(square: string): Position | null {
  if (square.length !== 2) return null;
  const col = square.charCodeAt(0) - 'a'.charCodeAt(0);
  const row = 8 - parseInt(square[1]);
  return { row, col };
}

export function isValidPawnMove(
  board: BoardPosition,
  fromRow: number,
  fromCol: number,
  toRow: number,
  toCol: number,
  isWhite: boolean
): boolean {
  const piece = board[fromRow][fromCol];
  if (!piece || (isWhite ? piece !== 'P' : piece !== 'p')) return false;

  const direction = isWhite ? -1 : 1;
  const startRow = isWhite ? 6 : 1;

  // Single square forward
  if (
    toCol === fromCol &&
    toRow === fromRow + direction &&
    !board[toRow][toCol]
  ) {
    return true;
  }

  // Double square from start
  if (
    toCol === fromCol &&
    fromRow === startRow &&
    toRow === fromRow + 2 * direction &&
    !board[fromRow + direction][toCol] &&
    !board[toRow][toCol]
  ) {
    return true;
  }

  // Capture diagonal
  if (
    Math.abs(toCol - fromCol) === 1 &&
    toRow === fromRow + direction &&
    board[toRow][toCol]
  ) {
    const targetPiece = board[toRow][toCol];
    const isTargetWhite = targetPiece === targetPiece.toUpperCase();
    // Capture only if opponent's piece
    if (isWhite !== isTargetWhite) {
      return true;
    }
  }

  return false;
}

export function isValidKnightMove(
  fromRow: number,
  fromCol: number,
  toRow: number,
  toCol: number
): boolean {
  const rowDiff = Math.abs(toRow - fromRow);
  const colDiff = Math.abs(toCol - fromCol);
  return (
    (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2)
  );
}

export function isValidBishopMove(
  board: BoardPosition,
  fromRow: number,
  fromCol: number,
  toRow: number,
  toCol: number
): boolean {
  if (Math.abs(toRow - fromRow) !== Math.abs(toCol - fromCol)) return false;

  const rowDir = toRow > fromRow ? 1 : -1;
  const colDir = toCol > fromCol ? 1 : -1;
  let r = fromRow + rowDir;
  let c = fromCol + colDir;

  while (r !== toRow || c !== toCol) {
    if (board[r][c]) return false;
    r += rowDir;
    c += colDir;
  }

  return true;
}

export function isValidRookMove(
  board: BoardPosition,
  fromRow: number,
  fromCol: number,
  toRow: number,
  toCol: number
): boolean {
  if (fromRow !== toRow && fromCol !== toCol) return false;

  if (fromRow === toRow) {
    const start = Math.min(fromCol, toCol) + 1;
    const end = Math.max(fromCol, toCol);
    for (let c = start; c < end; c++) {
      if (board[fromRow][c]) return false;
    }
    return true;
  }

  if (fromCol === toCol) {
    const start = Math.min(fromRow, toRow) + 1;
    const end = Math.max(fromRow, toRow);
    for (let r = start; r < end; r++) {
      if (board[r][fromCol]) return false;
    }
    return true;
  }

  return false;
}

export function clickToAlgebraic(
  board: BoardPosition,
  fromRow: number,
  fromCol: number,
  toRow: number,
  toCol: number
): string | null {
  const piece = board[fromRow][fromCol];
  if (!piece) return null;

  const toFile = String.fromCharCode('a'.charCodeAt(0) + toCol);
  const toRank = (8 - toRow).toString();
  const isWhite = piece === piece.toUpperCase();
  const captured = board[toRow][toCol];

  // Special: Castling
  if ((piece === 'K' || piece === 'k') && Math.abs(toCol - fromCol) === 2) {
    return toCol > fromCol ? 'O-O' : 'O-O-O';
  }

  const pieceLower = piece.toLowerCase();

  // Validate piece-specific moves
  let isValid = false;
  switch (pieceLower) {
    case 'p':
      isValid = isValidPawnMove(board, fromRow, fromCol, toRow, toCol, isWhite);
      break;
    case 'n':
      isValid = isValidKnightMove(fromRow, fromCol, toRow, toCol);
      break;
    case 'b':
      isValid = isValidBishopMove(board, fromRow, fromCol, toRow, toCol);
      break;
    case 'r':
      isValid = isValidRookMove(board, fromRow, fromCol, toRow, toCol);
      break;
    case 'q':
      isValid =
        isValidBishopMove(board, fromRow, fromCol, toRow, toCol) ||
        isValidRookMove(board, fromRow, fromCol, toRow, toCol);
      break;
    case 'k':
      isValid =
        Math.abs(toRow - fromRow) <= 1 && Math.abs(toCol - fromCol) <= 1;
      break;
  }

  if (!isValid) return null;

  // Pawn moves
  if (pieceLower === 'p') {
    if (captured) {
      const fromFile = String.fromCharCode('a'.charCodeAt(0) + fromCol);
      return `${fromFile}x${toFile}${toRank}`;
    }
    return `${toFile}${toRank}`;
  }

  const captureStr = captured ? 'x' : '';
  const pieceStr = piece.toUpperCase();
  return `${pieceStr}${captureStr}${toFile}${toRank}`;
}
