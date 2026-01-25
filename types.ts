
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
  // 경로 추적: 대각선 진입 시 어느 코너에서 들어왔는지 기록
  // 'outer' = 외곽 경로, 'diagonal-5' = 5번 코너에서 진입, 'diagonal-10' = 10번 코너에서 진입
  currentPath: 'outer' | 'diagonal-5' | 'diagonal-10';
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

// 멀티플레이어 관련 타입
export type GameMode = 'local' | 'host' | 'client';
export type RoomStatus = 'waiting' | 'playing' | 'finished';

export interface Player {
  id: string;
  name: string;
  teamIndex: number;
  connected: boolean;
  lastSeen: number;
}

export interface ThrowRequest {
  teamIndex: number;
  timestamp: number;
}

export interface ThrowResultMessage {
  result: YutResult;
  playerId: string;
  timestamp: number;
}

export interface TeamSetting {
  name: string;
  color: string;
}

export interface Room {
  code: string;
  hostId: string;
  status: RoomStatus;
  gameState: GameState | null;
  players: Record<string, Player>;
  throwRequest: ThrowRequest | null;
  throwResult: ThrowResultMessage | null;
  teamSettings: TeamSetting[];
  createdAt: number;
}
