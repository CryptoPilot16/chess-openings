export interface Opening {
  id: string;
  name: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  mainLine: string[]; // Algebraic notation moves
  keyIdeas: string[];
  variations: {
    name: string;
    moves: string[];
  }[];
}

export const openings: Opening[] = [
  {
    id: 'italian-game',
    name: 'Italian Game',
    description: 'One of the oldest recorded openings, focusing on quick development and control of the center.',
    difficulty: 'beginner',
    mainLine: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Bc5', 'c3', 'd6', 'd4'],
    keyIdeas: [
      'Control the center with pawns',
      'Develop pieces quickly (knights before bishops)',
      'Castle kingside early for safety',
      'Attack the weak f7 square',
      'Build a strong pawn center with c3 and d4',
    ],
    variations: [
      {
        name: 'Giuoco Piano',
        moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Bc5', 'c3'],
      },
      {
        name: 'Two Knights Defense',
        moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Nf6'],
      },
    ],
  },
  {
    id: 'sicilian-defense',
    name: 'Sicilian Defense',
    description: 'The most popular and aggressive response to 1.e4, leading to asymmetrical positions.',
    difficulty: 'intermediate',
    mainLine: ['e4', 'c5', 'Nf3', 'd6', 'd4', 'cxd4', 'Nxd4', 'Nf6', 'Nc3'],
    keyIdeas: [
      'Fight for central control with c5 instead of e5',
      'Create asymmetrical pawn structures',
      'Counterattack on the queenside',
      'Maintain tension in the center',
      'Accept complex tactical positions',
    ],
    variations: [
      {
        name: 'Najdorf Variation',
        moves: ['e4', 'c5', 'Nf3', 'd6', 'd4', 'cxd4', 'Nxd4', 'Nf6', 'Nc3', 'a6'],
      },
      {
        name: 'Dragon Variation',
        moves: ['e4', 'c5', 'Nf3', 'd6', 'd4', 'cxd4', 'Nxd4', 'Nf6', 'Nc3', 'g6'],
      },
    ],
  },
  {
    id: 'french-defense',
    name: 'French Defense',
    description: 'A solid defense creating a strong pawn chain, though temporarily restricting the c8 bishop.',
    difficulty: 'intermediate',
    mainLine: ['e4', 'e6', 'd4', 'd5', 'Nc3', 'Nf6', 'Bg5'],
    keyIdeas: [
      'Create a solid pawn structure with e6 and d5',
      'Challenge white\'s center immediately',
      'Plan to break with ...c5 or ...f6',
      'Accept a temporarily passive c8 bishop',
      'Counterattack on the queenside',
    ],
    variations: [
      {
        name: 'Winawer Variation',
        moves: ['e4', 'e6', 'd4', 'd5', 'Nc3', 'Bb4'],
      },
      {
        name: 'Tarrasch Variation',
        moves: ['e4', 'e6', 'd4', 'd5', 'Nd2'],
      },
    ],
  },
  {
    id: 'queens-gambit',
    name: "Queen's Gambit",
    description: 'A classical opening where White offers a pawn to gain central control and faster development.',
    difficulty: 'intermediate',
    mainLine: ['d4', 'd5', 'c4', 'e6', 'Nc3', 'Nf6', 'Bg5'],
    keyIdeas: [
      'Offer the c4 pawn to challenge Black\'s center',
      'Control the center with pieces after ...dxc4',
      'Develop smoothly with Nc3, Nf3, and Bg5',
      'Put pressure on Black\'s position',
      'Maintain central control',
    ],
    variations: [
      {
        name: 'Queen\'s Gambit Declined',
        moves: ['d4', 'd5', 'c4', 'e6', 'Nc3', 'Nf6'],
      },
      {
        name: 'Queen\'s Gambit Accepted',
        moves: ['d4', 'd5', 'c4', 'dxc4'],
      },
    ],
  },
  {
    id: 'ruy-lopez',
    name: 'Ruy López',
    description: 'Also known as the Spanish Opening, this classical opening puts immediate pressure on e5.',
    difficulty: 'advanced',
    mainLine: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'a6', 'Ba4', 'Nf6', 'O-O'],
    keyIdeas: [
      'Put pressure on the e5 pawn immediately',
      'Develop pieces harmoniously',
      'Maintain flexibility with the light-squared bishop',
      'Castle kingside quickly',
      'Build a strong center',
    ],
    variations: [
      {
        name: 'Berlin Defense',
        moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'Nf6'],
      },
      {
        name: 'Marshall Attack',
        moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'a6', 'Ba4', 'Nf6', 'O-O', 'Be7', 'Re1', 'b5', 'Bb3', 'O-O', 'd4', 'd5'],
      },
    ],
  },
  {
    id: 'caro-kann-defense',
    name: 'Caro-Kann Defense',
    description: 'A solid and positional defense against 1.e4, gaining space on the queenside without blocking the c-pawn.',
    difficulty: 'beginner',
    mainLine: ['e4', 'c6', 'd4', 'd5', 'Nc3', 'Nf6', 'Bg5'],
    keyIdeas: [
      'Support the d5 pawn with c6',
      'Avoid blocking the c-pawn early',
      'Create a solid pawn structure',
      'Counterattack on the queenside',
      'Develop pieces naturally',
    ],
    variations: [
      {
        name: 'Main Line',
        moves: ['e4', 'c6', 'd4', 'd5', 'Nc3', 'Nf6', 'Bg5', 'Ne4'],
      },
      {
        name: 'Classical Variation',
        moves: ['e4', 'c6', 'd4', 'd5', 'Nc3', 'Nf6', 'Bg5', 'Be7'],
      },
    ],
  },
  {
    id: 'english-opening',
    name: 'English Opening',
    description: 'A flexible opening starting with 1.c4, controlling the center from the side rather than directly.',
    difficulty: 'intermediate',
    mainLine: ['c4', 'e5', 'Nc3', 'Nf6', 'Nf3', 'Nc6', 'g3'],
    keyIdeas: [
      'Control the center from the wings',
      'Maintain flexibility in opening plans',
      'Fianchetto the kingside bishop',
      'Build a setup without committing the d-pawn',
      'Create long-term positional advantages',
    ],
    variations: [
      {
        name: 'Indian Setup',
        moves: ['c4', 'Nf6', 'Nc3', 'g6', 'g3', 'Bg7', 'Bg2'],
      },
      {
        name: 'Symmetrical Defense',
        moves: ['c4', 'c5', 'Nc3', 'Nc6'],
      },
    ],
  },
  {
    id: 'scandinavian-defense',
    name: 'Scandinavian Defense',
    description: 'A tactical and aggressive response to 1.e4, putting immediate pressure on the center.',
    difficulty: 'intermediate',
    mainLine: ['e4', 'd5', 'exd5', 'Qxd5', 'Nc3', 'Qa5', 'Nf3', 'Nf6', 'Bc4'],
    keyIdeas: [
      'Challenge the center immediately',
      'Bring the queen out early for activity',
      'Attack the Nc3 knight',
      'Create tactical complications',
      'Compensate for space disadvantage',
    ],
    variations: [
      {
        name: 'Main Line',
        moves: ['e4', 'd5', 'exd5', 'Qxd5', 'Nc3', 'Qa5'],
      },
      {
        name: 'Portuguese Variation',
        moves: ['e4', 'd5', 'exd5', 'Qxd5', 'Nc3', 'Qd8'],
      },
    ],
  },
  {
    id: 'kings-indian-attack',
    name: "King's Indian Attack",
    description: 'A flexible and positional setup where White controls the center with Nf3, g3, and fianchettos the kingside bishop.',
    difficulty: 'intermediate',
    mainLine: ['Nf3', 'd5', 'd3', 'Nf6', 'c4', 'e6', 'g3', 'Be7', 'Bg2'],
    keyIdeas: [
      'Control the center with pieces, not pawns',
      'Maintain maximum flexibility',
      'Fianchetto the kingside bishop for long-term pressure',
      'Build a solid pawn structure',
      'Create strategic imbalances',
    ],
    variations: [
      {
        name: 'Immediate c4',
        moves: ['Nf3', 'd5', 'c4', 'Nf6', 'g3', 'e6', 'd3'],
      },
      {
        name: 'Flexible Setup',
        moves: ['Nf3', 'c5', 'g3', 'Nf6', 'Bg2', 'd6', 'd4'],
      },
    ],
  },
  {
    id: 'scotch-game',
    name: 'Scotch Game',
    description: 'An aggressive opening featuring 3.d4, challenging Black\'s center early and leading to open, tactical positions.',
    difficulty: 'intermediate',
    mainLine: ['e4', 'e5', 'Nf3', 'Nc6', 'd4', 'exd4', 'Nxd4', 'Nf6', 'Nc3', 'Bb4', 'Nxc6'],
    keyIdeas: [
      'Challenge the center early with d4',
      'Trade the knight for the bishop pair',
      'Maintain central control',
      'Develop pieces quickly',
      'Create tactical opportunities',
    ],
    variations: [
      {
        name: 'Scotch Four Knights',
        moves: ['e4', 'e5', 'Nf3', 'Nc6', 'd4', 'exd4', 'Nxd4', 'Nf6'],
      },
      {
        name: 'Scotch Gambit',
        moves: ['e4', 'e5', 'Nf3', 'Nc6', 'd4', 'exd4', 'Bc4'],
      },
    ],
  },
];
