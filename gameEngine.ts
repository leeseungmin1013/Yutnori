
import { GameState, Piece, YutResult } from './types';
import { getYutDistance } from './yutLogic';
import { getNextNode, getPrevNode, isNodeBeforeFinish } from './boardData';

/**
 * 말 이동 로직 (순수 함수)
 */
export const calculateMove = (
  gameState: GameState,
  movingPieceId: string,
  yutResult: YutResult
): {
  updatedGameState: GameState;
  caughtEnemy: boolean;
  isFinished: boolean;
} => {
  const distance = getYutDistance(yutResult);

  // Deep copy state
  const newState: GameState = JSON.parse(JSON.stringify(gameState));
  const currentTeam = newState.teams[newState.currentTeamIndex];

  // Find moving piece and its stack
  const movingPiece = currentTeam.pieces.find(p => p.id === movingPieceId);
  if (!movingPiece) {
    return { updatedGameState: newState, caughtEnemy: false, isFinished: false };
  }

  // Get all pieces in the same stack (same node)
  const group = findAllInStack(currentTeam.pieces, movingPieceId);

  let caughtEnemy = false;
  let isFinished = false;

  let currentNodeId = movingPiece.nodeIndex;
  let currentPath = movingPiece.currentPath;

  // 백도 처리
  if (distance === -1) {
    if (currentNodeId === null) {
      // 시작점 밖에서 백도 - 제자리
      newState.logs.push(`${currentTeam.name} 팀의 말이 아직 출발 전이라 백도해도 제자리입니다.`);
    } else {
      const { prevId, newPath } = getPrevNode(currentNodeId, currentPath);
      if (prevId === null) {
        // 1번에서 백도하면 시작점 밖으로
        currentNodeId = null;
        currentPath = 'outer';
        newState.logs.push(`${currentTeam.name} 팀의 말이 백도하여 시작점으로 돌아갔습니다.`);
      } else {
        currentNodeId = prevId;
        currentPath = newPath;
        newState.logs.push(`${currentTeam.name} 팀의 말이 백도했습니다.`);
      }
    }
  } else {
    // 전진 이동

    // 시작점 밖에서 출발하는 경우
    if (currentNodeId === null) {
      currentNodeId = 0; // 시작점(홈)에서 시작
      currentPath = 'outer';
    }
    // 0번(START)에 도착한 말이 '도'(1칸)를 던지면 골인
    else if (currentNodeId === 0 && distance === 1) {
      isFinished = true;
      currentNodeId = null;
      newState.logs.push(`${currentTeam.name} 팀이 '도'로 골인!`);
    }
    // 0번에 있는데 '도'가 아니면 계속 진행 (다시 한 바퀴)
    else if (currentNodeId === 0 && distance > 1) {
      for (let i = 0; i < distance; i++) {
        const isFirstStep = (i === 0);
        const { nextId, newPath } = getNextNode(currentNodeId!, isFirstStep, currentPath);
        if (nextId === null) break;
        currentNodeId = nextId;
        currentPath = newPath;
      }
      newState.logs.push(`${currentTeam.name} 팀의 말이 START를 지나 계속 이동합니다.`);
    }

    // 일반 이동
    if (!isFinished && movingPiece.nodeIndex !== 0) {
      for (let i = 0; i < distance; i++) {
        const isFirstStep = (i === 0);
        const { nextId, newPath } = getNextNode(currentNodeId!, isFirstStep, currentPath);

        // 19번이나 28번에서 0으로 가면 0번에 도착 (아직 골인 아님)
        if (nextId === 0 && isNodeBeforeFinish(currentNodeId!)) {
          currentNodeId = 0;
          currentPath = 'outer';
          newState.logs.push(`${currentTeam.name} 팀의 말이 START에 도착! 다음에 '도'가 나와야 골인합니다.`);
          break;
        }

        if (nextId === null) {
          break;
        }

        currentNodeId = nextId;
        currentPath = newPath;
      }
    }
  }

  // Update piece positions
  group.forEach(p => {
    p.nodeIndex = isFinished ? null : currentNodeId;
    p.isFinished = isFinished;
    p.currentPath = currentPath;
  });

  if (isFinished) {
    currentTeam.finishedCount += group.length;
    newState.logs.push(`${currentTeam.name} 팀의 말 ${group.length}개가 완주했습니다!`);

    if (currentTeam.finishedCount >= 4) {
      newState.isGameOver = true;
      newState.winnerTeamId = currentTeam.id;
      newState.logs.push(`축하합니다! ${currentTeam.name} 팀이 최종 승리했습니다!`);
    }
  } else if (currentNodeId !== null) {
    // 잡기 & 업기 체크
    const otherTeams = newState.teams.filter(t => t.id !== currentTeam.id);

    // 1. 상대 말 잡기
    for (const team of otherTeams) {
      const enemiesAtNode = team.pieces.filter(p => p.nodeIndex === currentNodeId && !p.isFinished);
      if (enemiesAtNode.length > 0) {
        // 잡았다!
        enemiesAtNode.forEach(p => {
          p.nodeIndex = null;
          p.isFinished = false;
          p.stackedCount = 1;
          p.stackedPieceIds = [];
          p.currentPath = 'outer';
        });
        caughtEnemy = true;
        newState.logs.push(`${currentTeam.name} 팀이 ${team.name} 팀의 말 ${enemiesAtNode.length}개를 잡았습니다! 한 번 더 던지세요!`);
        break;
      }
    }

    // 2. 같은 팀 말과 업기 (잡지 않았을 때만)
    if (!caughtEnemy) {
      const teammatesAtNode = currentTeam.pieces.filter(p =>
        p.nodeIndex === currentNodeId &&
        !group.some(gp => gp.id === p.id) &&
        !p.isFinished
      );
      if (teammatesAtNode.length > 0) {
        // 업기: 모든 말을 같은 위치에 두고 스택 카운트 업데이트
        const allAtNode = [...group, ...teammatesAtNode];
        const totalCount = allAtNode.length;
        const allIds = allAtNode.map(p => p.id);

        allAtNode.forEach(p => {
          p.stackedCount = totalCount;
          p.stackedPieceIds = allIds.filter(id => id !== p.id);
          p.currentPath = currentPath; // 경로 동기화
        });

        newState.logs.push(`${currentTeam.name} 팀의 말이 업혔습니다! (총 ${totalCount}개)`);
      }
    }
  }

  return { updatedGameState: newState, caughtEnemy, isFinished };
};

/**
 * 같은 노드에 있는 모든 말 찾기 (스택)
 */
const findAllInStack = (pieces: Piece[], pieceId: string): Piece[] => {
  const piece = pieces.find(p => p.id === pieceId);
  if (!piece) return [];

  // 시작점 밖(null)에 있는 말은 개별 처리
  if (piece.nodeIndex === null) return [piece];

  // 같은 노드에 있는 모든 말 반환
  return pieces.filter(p => p.nodeIndex === piece.nodeIndex && !p.isFinished);
};
