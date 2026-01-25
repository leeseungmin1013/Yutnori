
import { BoardNode } from './types';

/**
 * 윷판의 좌표 및 경로 설계
 * 0-19: 외곽 (0은 시작점/끝점)
 * 20-24: 대각선 (오른쪽 위 -> 왼쪽 아래)
 * 25-28: 대각선 (왼쪽 위 -> 오른쪽 아래, 중앙 22 제외)
 */
export const BOARD_NODES: BoardNode[] = [
  // Outer Path (0 to 19)
  { id: 0, x: 90, y: 90, next: 1, type: 'home' }, // Start
  { id: 1, x: 90, y: 72, next: 2, type: 'normal' },
  { id: 2, x: 90, y: 54, next: 3, type: 'normal' },
  { id: 3, x: 90, y: 36, next: 4, type: 'normal' },
  { id: 4, x: 90, y: 18, next: 5, type: 'normal' },
  { id: 5, x: 90, y: 10, next: 6, branch: 20, type: 'corner' }, // Top-Right Corner (Shortcut)
  { id: 6, x: 72, y: 10, next: 7, type: 'normal' },
  { id: 7, x: 54, y: 10, next: 8, type: 'normal' },
  { id: 8, x: 36, y: 10, next: 9, type: 'normal' },
  { id: 9, x: 18, y: 10, next: 10, type: 'normal' },
  { id: 10, x: 10, y: 10, next: 11, branch: 25, type: 'corner' }, // Top-Left Corner (Shortcut)
  { id: 11, x: 10, y: 18, next: 12, type: 'normal' },
  { id: 12, x: 10, y: 36, next: 13, type: 'normal' },
  { id: 13, x: 10, y: 54, next: 14, type: 'normal' },
  { id: 14, x: 10, y: 72, next: 15, type: 'normal' },
  { id: 15, x: 10, y: 90, next: 16, type: 'corner' }, // Bottom-Left Corner
  { id: 16, x: 18, y: 90, next: 17, type: 'normal' },
  { id: 17, x: 36, y: 90, next: 18, type: 'normal' },
  { id: 18, x: 54, y: 90, next: 19, type: 'normal' },
  { id: 19, x: 72, y: 90, next: 0, type: 'normal' }, // Back to Home (Index 0 is exit)

  // Shortcut 1: Top-Right -> Bottom-Left (20 to 24)
  { id: 20, x: 75, y: 25, next: 21, type: 'normal' },
  { id: 21, x: 63, y: 37, next: 22, type: 'normal' },
  { id: 22, x: 50, y: 50, next: 23, branch: 28, type: 'center' }, // Central 'Bang'
  { id: 23, x: 37, y: 63, next: 24, type: 'normal' },
  { id: 24, x: 25, y: 75, next: 15, type: 'normal' },

  // Shortcut 2: Top-Left -> Bottom-Right (25 to 28)
  { id: 25, x: 25, y: 25, next: 26, type: 'normal' },
  { id: 26, x: 37, y: 37, next: 22, type: 'normal' },
  // Node 22 is shared
  { id: 27, x: 63, y: 63, next: 28, type: 'normal' }, // Actually after bang
  { id: 28, x: 75, y: 75, next: 0, type: 'normal' },
];

export const findNodeById = (id: number) => BOARD_NODES.find(n => n.id === id);

export const getNextNode = (currentId: number, isStartingMove: boolean): number | null => {
  const node = findNodeById(currentId);
  if (!node) return null;
  // If we just landed on a corner or center exactly, take the branch if it exists.
  // But wait, in Yutnori, the branch is ONLY taken at the BEGINNING of a move sequence if you are currently ON a branch point.
  return isStartingMove && node.branch !== undefined ? node.branch : node.next;
};
