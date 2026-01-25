
export enum YutResult {
  DO = 'DO',
  GAE = 'GAE',
  GEOL = 'GEOL',
  YUT = 'YUT',
  MO = 'MO',
  BACK_DO = 'BACK_DO'
}

export type TeamId = string;

export interface Piece {
  id: string;
  teamId: TeamId;
  nodeIndex: number | null; // null means starting point (not on board)
  isFinished: boolean;
  stackedCount: number; // For 'Up-gi' (stacking) logic
  stackedPieceIds: string[];
}

export interface Team {
  id: TeamId;
  name: string;
  color: string;
  pieces: Piece[];
  finishedCount: number;
}

export interface GameState {
  id: string;
  teams: Team[];
  currentTeamIndex: number;
  throwBuffer: YutResult[]; // Results available for current turn
  turnBonus: number; // Extra turns gained from Yut/Mo/Catching
  isGameOver: boolean;
  winnerTeamId: string | null;
  lastUpdate: number;
  logs: string[];
}

export interface BoardNode {
  id: number;
  x: number;
  y: number;
  next: number | null; // Main path
  branch?: number | null; // Shortcut path (only if stopping exactly here)
  type: 'normal' | 'corner' | 'center' | 'home';
}
