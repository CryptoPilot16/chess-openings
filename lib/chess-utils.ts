export type PieceType = 'p' | 'n' | 'b' | 'r' | 'q' | 'k' | 'P' | 'N' | 'B' | 'R' | 'Q' | 'K' | null;
export type BoardPosition = PieceType[][];

export interface Position {
  row: number;
  col: number;
}

export interface Move {
  from: Position;
  to: Position;
  piece: PieceType;
  captured?: PieceType;
  algebraic: string;
}

// Starting position
export const INITIAL_BOARD: BoardPosition = [
  ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
  ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
  ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R'],
];

// Convert file letter to column index (a=0, b=1, ..., h=7)
function fileToCol(file: string): number {
  return file.charCodeAt(0) - 'a'.charCodeAt(0);
}

// Convert rank number to row index (1=7, 2=6, ..., 8=0)
function rankToRow(rank: string): number {
  return 8 - parseInt(rank);
}

// Convert column index to file letter
function colToFile(col: number): string {
  return String.fromCharCode('a'.charCodeAt(0) + col);
}

// Convert row index to rank number
function rowToRank(row: number): number {
  return 8 - row;
}

/**
 * Parse algebraic notation and return the move
 * Supports: e4, Nf3, Bxc4, O-O, exd5, Qh4+, etc.
 */
export function parseAlgebraicMove(
  algebraic: string,
  board: BoardPosition,
  isWhiteTurn: boolean
): Move | null {
  const move = algebraic.trim();

  // Castling
  if (move === 'O-O' || move === 'O-O-O') {
    const row = isWhiteTurn ? 7 : 0;
    const king: PieceType = isWhiteTurn ? 'K' : 'k';
    
    if (move === 'O-O') {
      // Kingside castle
      return {
        from: { row, col: 4 },
        to: { row, col: 6 },
        piece: king,
        algebraic: move,
      };
    } else {
      // Queenside castle
      return {
        from: { row, col: 4 },
        to: { row, col: 2 },
        piece: king,
        algebraic: move,
      };
    }
  }

  // Remove check/checkmate symbols
  const cleanMove = move.replace(/[+#!?]/g, '');

  // Detect piece type
  let pieceChar = 'P'; // Default to pawn
  let moveStr = cleanMove;
  
  if (/^[NBRQK]/.test(cleanMove)) {
    pieceChar = cleanMove[0];
    moveStr = cleanMove.slice(1);
  }

  const piece: PieceType = isWhiteTurn ? pieceChar as PieceType : pieceChar.toLowerCase() as PieceType;

  // Detect capture
  const isCapture = moveStr.includes('x');
  if (isCapture) {
    moveStr = moveStr.replace('x', '');
  }

  // Extract destination square (last 2 characters)
  const destFile = moveStr[moveStr.length - 2];
  const destRank = moveStr[moveStr.length - 1];
  const toCol = fileToCol(destFile);
  const toRow = rankToRow(destRank);

  // For pawns, we might have source file (exd5)
  let fromCol: number | null = null;
  let fromRow: number | null = null;

  if (pieceChar === 'P' && moveStr.length === 3 && isCapture) {
    // Pawn capture: exd5
    fromCol = fileToCol(moveStr[0]);
  } else if (moveStr.length > 2) {
    // Disambiguating move (Nbd2, R1e1, etc.)
    const disambig = moveStr.slice(0, -2);
    if (/[a-h]/.test(disambig[0])) {
      fromCol = fileToCol(disambig[0]);
    }
    if (/[1-8]/.test(disambig[disambig.length - 1])) {
      fromRow = rankToRow(disambig[disambig.length - 1]);
    }
  }

  // Find the piece on the board that can make this move
  const from = findPieceForMove(board, piece, { row: toRow, col: toCol }, fromRow, fromCol);

  if (!from) {
    return null;
  }

  return {
    from,
    to: { row: toRow, col: toCol },
    piece,
    captured: board[toRow][toCol],
    algebraic: move,
  };
}

/**
 * Find which piece can legally move to the target square
 */
function findPieceForMove(
  board: BoardPosition,
  piece: PieceType,
  to: Position,
  fromRow: number | null,
  fromCol: number | null
): Position | null {
  if (!piece) return null;

  const isWhite = piece === piece.toUpperCase();
  const pieceType = piece.toLowerCase();

  // Search the board for matching pieces
  for (let row = 0; row < 8; row++) {
    if (fromRow !== null && row !== fromRow) continue;

    for (let col = 0; col < 8; col++) {
      if (fromCol !== null && col !== fromCol) continue;

      const currentPiece = board[row][col];
      if (currentPiece?.toLowerCase() === pieceType &&
          (currentPiece === currentPiece.toUpperCase()) === isWhite) {
        
        // Check if this piece can legally move to the target
        if (canPieceMove(board, { row, col }, to, pieceType)) {
          return { row, col };
        }
      }
    }
  }

  return null;
}

/**
 * Check if a piece can legally move from 'from' to 'to' (simplified rules)
 */
function canPieceMove(
  board: BoardPosition,
  from: Position,
  to: Position,
  pieceType: string
): boolean {
  const rowDiff = Math.abs(to.row - from.row);
  const colDiff = Math.abs(to.col - from.col);
  const piece = board[from.row][from.col];
  const isWhite = piece === piece?.toUpperCase();

  switch (pieceType) {
    case 'p': {
      // Pawn moves
      const direction = isWhite ? -1 : 1;
      const startRow = isWhite ? 6 : 1;

      // Forward move
      if (from.col === to.col && !board[to.row][to.col]) {
        if (to.row === from.row + direction) return true;
        if (from.row === startRow && to.row === from.row + 2 * direction) {
          // Two squares forward from start
          const inBetween = from.row + direction;
          return !board[inBetween][from.col];
        }
      }

      // Capture
      if (colDiff === 1 && to.row === from.row + direction && board[to.row][to.col]) {
        return true;
      }

      return false;
    }

    case 'n':
      // Knight: L-shape
      return (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2);

    case 'b':
      // Bishop: diagonal
      if (rowDiff !== colDiff) return false;
      return isPathClear(board, from, to);

    case 'r':
      // Rook: straight lines
      if (from.row !== to.row && from.col !== to.col) return false;
      return isPathClear(board, from, to);

    case 'q':
      // Queen: diagonal or straight
      if (from.row !== to.row && from.col !== to.col && rowDiff !== colDiff) return false;
      return isPathClear(board, from, to);

    case 'k':
      // King: one square in any direction
      return rowDiff <= 1 && colDiff <= 1;

    default:
      return false;
  }
}

/**
 * Check if path is clear between two squares (for sliding pieces)
 */
function isPathClear(board: BoardPosition, from: Position, to: Position): boolean {
  const rowDir = Math.sign(to.row - from.row);
  const colDir = Math.sign(to.col - from.col);

  let row = from.row + rowDir;
  let col = from.col + colDir;

  while (row !== to.row || col !== to.col) {
    if (board[row][col]) return false;
    row += rowDir;
    col += colDir;
  }

  return true;
}

/**
 * Apply a move to the board and return new board state
 */
export function applyMove(board: BoardPosition, move: Move): BoardPosition {
  const newBoard = board.map(row => [...row]);

  // Handle castling
  if (move.algebraic === 'O-O') {
    const row = move.from.row;
    const isWhite = move.piece === 'K';
    const rook: PieceType = isWhite ? 'R' : 'r';
    
    // Move king
    newBoard[row][6] = move.piece;
    newBoard[row][4] = null;
    
    // Move rook
    newBoard[row][5] = rook;
    newBoard[row][7] = null;
    
    return newBoard;
  } else if (move.algebraic === 'O-O-O') {
    const row = move.from.row;
    const isWhite = move.piece === 'K';
    const rook: PieceType = isWhite ? 'R' : 'r';
    
    // Move king
    newBoard[row][2] = move.piece;
    newBoard[row][4] = null;
    
    // Move rook
    newBoard[row][3] = rook;
    newBoard[row][0] = null;
    
    return newBoard;
  }

  // Regular move
  newBoard[move.to.row][move.to.col] = move.piece;
  newBoard[move.from.row][move.from.col] = null;

  return newBoard;
}

/**
 * Convert a user's click move to algebraic notation (simplified)
 */
export function clickToAlgebraic(
  board: BoardPosition,
  from: Position,
  to: Position
): string | null {
  const piece = board[from.row][from.col];
  if (!piece) return null;

  const pieceType = piece.toLowerCase();
  const destFile = colToFile(to.col);
  const destRank = rowToRank(to.row);

  // Castling detection
  if (pieceType === 'k' && Math.abs(to.col - from.col) === 2) {
    return to.col === 6 ? 'O-O' : 'O-O-O';
  }

  const captured = board[to.row][to.col];
  const captureSymbol = captured ? 'x' : '';

  // Pawn moves
  if (pieceType === 'p') {
    if (captured) {
      const fromFile = colToFile(from.col);
      return `${fromFile}${captureSymbol}${destFile}${destRank}`;
    }
    return `${destFile}${destRank}`;
  }

  // Piece moves
  const pieceLetter = piece.toUpperCase();
  return `${pieceLetter}${captureSymbol}${destFile}${destRank}`;
}
