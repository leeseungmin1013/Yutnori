
import { BoardNode } from './types';

/**
 * 윷판의 좌표 및 경로 설계
 * 0-19: 외곽 (0은 시작점/끝점)
 * 20-22: 대각선 (5번 코너 -> 중앙)
 * 23-24: 대각선 (중앙 -> 15번 코너)
 * 25-26: 대각선 (10번 코너 -> 중앙)
 * 27-28: 대각선 (중앙 -> 0번 홈)
 */
export const BOARD_NODES: BoardNode[] = [
  // Outer Path (0 to 19) - 각 변 80을 5등분, 간격 16
  // 오른쪽 변 (위로 이동): y = 90 -> 10
  { id: 0, x: 90, y: 90, next: 1, type: 'home' }, // Start/End (오른쪽 아래)
  { id: 1, x: 90, y: 74, next: 2, type: 'normal' },
  { id: 2, x: 90, y: 58, next: 3, type: 'normal' },
  { id: 3, x: 90, y: 42, next: 4, type: 'normal' },
  { id: 4, x: 90, y: 26, next: 5, type: 'normal' },
  { id: 5, x: 90, y: 10, next: 6, branch: 20, type: 'corner' }, // 오른쪽 위 코너

  // 위쪽 변 (왼쪽으로 이동): x = 90 -> 10
  { id: 6, x: 74, y: 10, next: 7, type: 'normal' },
  { id: 7, x: 58, y: 10, next: 8, type: 'normal' },
  { id: 8, x: 42, y: 10, next: 9, type: 'normal' },
  { id: 9, x: 26, y: 10, next: 10, type: 'normal' },
  { id: 10, x: 10, y: 10, next: 11, branch: 25, type: 'corner' }, // 왼쪽 위 코너

  // 왼쪽 변 (아래로 이동): y = 10 -> 90
  { id: 11, x: 10, y: 26, next: 12, type: 'normal' },
  { id: 12, x: 10, y: 42, next: 13, type: 'normal' },
  { id: 13, x: 10, y: 58, next: 14, type: 'normal' },
  { id: 14, x: 10, y: 74, next: 15, type: 'normal' },
  { id: 15, x: 10, y: 90, next: 16, type: 'corner' }, // 왼쪽 아래 코너

  // 아래쪽 변 (오른쪽으로 이동): x = 10 -> 90
  { id: 16, x: 26, y: 90, next: 17, type: 'normal' },
  { id: 17, x: 42, y: 90, next: 18, type: 'normal' },
  { id: 18, x: 58, y: 90, next: 19, type: 'normal' },
  { id: 19, x: 74, y: 90, next: 0, type: 'normal' }, // 0번(홈)으로 연결

  // 대각선: 5번 코너(90,10) -> 중앙(50,50), 3등분
  { id: 20, x: 77, y: 23, next: 21, type: 'normal' },
  { id: 21, x: 63, y: 37, next: 22, type: 'normal' },

  // 중앙 노드 - 진입 방향에 따라 출구 결정
  { id: 22, x: 50, y: 50, next: 23, branch: 27, type: 'center' },

  // 대각선: 중앙(50,50) -> 15번 코너(10,90), 3등분
  { id: 23, x: 37, y: 63, next: 24, type: 'normal' },
  { id: 24, x: 23, y: 77, next: 15, type: 'normal' },

  // 대각선: 10번 코너(10,10) -> 중앙(50,50), 3등분
  { id: 25, x: 23, y: 23, next: 26, type: 'normal' },
  { id: 26, x: 37, y: 37, next: 22, type: 'normal' },

  // 대각선: 중앙(50,50) -> 0번 홈(90,90), 3등분
  { id: 27, x: 63, y: 63, next: 28, type: 'normal' },
  { id: 28, x: 77, y: 77, next: 0, type: 'normal' },
];

export const findNodeById = (id: number) => BOARD_NODES.find(n => n.id === id);

/**
 * 다음 노드 계산
 * @param currentId 현재 노드 ID
 * @param isFirstStep 이동의 첫 번째 스텝인지 (코너에서 대각선으로 분기할지 결정)
 * @param currentPath 현재 말의 경로 ('outer', 'diagonal-5', 'diagonal-10')
 */
export const getNextNode = (
  currentId: number,
  isFirstStep: boolean,
  currentPath: 'outer' | 'diagonal-5' | 'diagonal-10'
): { nextId: number | null; newPath: 'outer' | 'diagonal-5' | 'diagonal-10' } => {
  const node = findNodeById(currentId);
  if (!node) return { nextId: null, newPath: currentPath };

  // 코너(5, 10)에서 첫 스텝이면 대각선으로 분기
  if (isFirstStep && node.branch !== undefined) {
    // 코너 5에서 대각선 진입
    if (currentId === 5) {
      return { nextId: node.branch, newPath: 'diagonal-5' };
    }
    // 코너 10에서 대각선 진입
    if (currentId === 10) {
      return { nextId: node.branch, newPath: 'diagonal-10' };
    }
    // 중앙(22)에서 첫 스텝 - 무조건 지름길(27 → 28 → 홈)로 나감
    if (currentId === 22) {
      return { nextId: 27, newPath: 'diagonal-10' };
    }
  }

  // 중앙(22)을 지나칠 때 (첫 스텝이 아닌 경우) - 진입 경로에 따라 결정
  if (currentId === 22 && !isFirstStep) {
    if (currentPath === 'diagonal-10') {
      // 10번에서 들어왔으면 27로 나감 (지름길)
      return { nextId: 27, newPath: currentPath };
    } else {
      // 5번에서 들어왔으면 23으로 나감 (왼쪽 아래로 계속)
      return { nextId: 23, newPath: currentPath };
    }
  }

  // 15번 코너에 도착하면 외곽 경로로 전환
  if (currentId === 24 && node.next === 15) {
    return { nextId: 15, newPath: 'outer' };
  }

  // 일반적인 다음 노드
  return { nextId: node.next, newPath: currentPath };
};

/**
 * 백도(뒤로 1칸)시 이전 노드 계산
 */
export const getPrevNode = (
  currentId: number,
  currentPath: 'outer' | 'diagonal-5' | 'diagonal-10'
): { prevId: number | null; newPath: 'outer' | 'diagonal-5' | 'diagonal-10' } => {
  // 시작점에서 백도 - 19번으로
  if (currentId === 0) {
    return { prevId: 19, newPath: 'outer' };
  }

  // 외곽 경로에서 백도
  if (currentId >= 1 && currentId <= 19) {
    if (currentId === 1) {
      // 1번에서 백도하면 시작점 밖으로 (null)
      return { prevId: null, newPath: 'outer' };
    }
    return { prevId: currentId - 1, newPath: 'outer' };
  }

  // 대각선 5번 경로 (20, 21, 22, 23, 24)
  if (currentId === 20) {
    return { prevId: 5, newPath: 'outer' };
  }
  if (currentId === 21) {
    return { prevId: 20, newPath: 'diagonal-5' };
  }
  if (currentId === 22) {
    if (currentPath === 'diagonal-5') {
      return { prevId: 21, newPath: 'diagonal-5' };
    } else {
      return { prevId: 26, newPath: 'diagonal-10' };
    }
  }
  if (currentId === 23) {
    return { prevId: 22, newPath: 'diagonal-5' };
  }
  if (currentId === 24) {
    return { prevId: 23, newPath: 'diagonal-5' };
  }

  // 대각선 10번 경로 (25, 26, 27, 28)
  if (currentId === 25) {
    return { prevId: 10, newPath: 'outer' };
  }
  if (currentId === 26) {
    return { prevId: 25, newPath: 'diagonal-10' };
  }
  if (currentId === 27) {
    return { prevId: 22, newPath: 'diagonal-10' };
  }
  if (currentId === 28) {
    return { prevId: 27, newPath: 'diagonal-10' };
  }

  return { prevId: null, newPath: currentPath };
};

/**
 * 특정 노드가 완주 직전인지 확인 (다음이 0번 홈)
 */
export const isNodeBeforeFinish = (nodeId: number): boolean => {
  return nodeId === 19 || nodeId === 28;
};
