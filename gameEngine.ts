
import { GameState, Piece, TeamId, YutResult } from './types';
import { getYutDistance, isExtraTurnResult } from './yutLogic';
import { getNextNode } from './boardData';

/**
 * 말 이동 로직 (순수 함수)
 * pieces: 현재 게임의 모든 말
 * movingPieceId: 이동할 말 ID
 * yutResult: 던져서 나온 결과
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
  const newState = { ...gameState, logs: [...gameState.logs] };
  const currentTeam = newState.teams[newState.currentTeamIndex];
  
  // Find moving group (stacked pieces)
  const group = findAllInStack(currentTeam.pieces, movingPieceId);
  const primaryPiece = group[0];

  let caughtEnemy = false;
  let isFinished = false;

  // Starting Node Logic
  let currentNodeId = primaryPiece.nodeIndex;
  
  if (distance === -1) {
    // Back-do logic
    if (currentNodeId === null) {
      // Piece not on board stays at start
      newState.logs.push(`${currentTeam.name} 팀의 말이 시작점에서 백도하여 제자리에 머뭅니다.`);
    } else if (currentNodeId === 0) {
      // Actually piece at 0 should be finished. 
      // Traditional rule: if at start (0), back-do moves to 19.
      currentNodeId = 19;
    } else if (currentNodeId === 1) {
      // From 1 back to start
      currentNodeId = null;
    } else if (currentNodeId === 20) {
      currentNodeId = 5;
    } else if (currentNodeId === 25) {
      currentNodeId = 10;
    } else if (currentNodeId === 22) {
      // Center back-do depends on entry. For simplicity, go back to 21 or 26.
      // We'll track path but here we'll just go back to a reasonable node.
      currentNodeId = 21; 
    } else {
      currentNodeId = (currentNodeId - 1 + 20) % 20;
    }
  } else {
    // Forward move
    for (let i = 0; i < distance; i++) {
      const next = getNextNode(currentNodeId === null ? 0 : currentNodeId, i === 0);
      
      if (next === null || (currentNodeId === 19 && next === 0) || (currentNodeId === 28 && next === 0)) {
        // Reached home
        isFinished = true;
        currentNodeId = null;
        break;
      }
      currentNodeId = next;
    }
  }

  // Update piece positions
  group.forEach(p => {
    p.nodeIndex = isFinished ? null : currentNodeId;
    p.isFinished = isFinished;
  });

  if (isFinished) {
    currentTeam.finishedCount += group.length;
    newState.logs.push(`${currentTeam.name} 팀의 말이 결승점을 통과했습니다!`);
    if (currentTeam.finishedCount >= 4) {
      newState.isGameOver = true;
      newState.winnerTeamId = currentTeam.id;
      newState.logs.push(`축하합니다! ${currentTeam.name} 팀이 최종 승리했습니다!`);
    }
  } else if (currentNodeId !== null) {
    // Catching and Stacking
    // 1. Catching enemy?
    const otherTeams = newState.teams.filter(t => t.id !== currentTeam.id);
    for (const team of otherTeams) {
      const enemiesAtNode = team.pieces.filter(p => p.nodeIndex === currentNodeId && !p.isFinished);
      if (enemiesAtNode.length > 0) {
        // Caught!
        enemiesAtNode.forEach(p => {
          p.nodeIndex = null;
          p.stackedCount = 1;
          p.stackedPieceIds = [];
        });
        caughtEnemy = true;
        newState.logs.push(`${currentTeam.name} 팀이 ${team.name} 팀의 말을 잡았습니다! 한 번 더!`);
        break;
      }
    }

    // 2. Stacking with teammates?
    if (!caughtEnemy) {
      const teammatesAtNode = currentTeam.pieces.filter(p => 
        p.nodeIndex === currentNodeId && 
        !group.some(gp => gp.id === p.id) &&
        !p.isFinished
      );
      if (teammatesAtNode.length > 0) {
        // Merge stacks
        const targetPiece = teammatesAtNode[0];
        group.forEach(p => {
          // In this simple model, we'll just align their nodeIndex.
          // In a complex model, we'd nested ID references.
        });
        newState.logs.push(`${currentTeam.name} 팀의 말이 합쳐졌습니다! (업기)`);
      }
    }
  }

  return { updatedGameState: newState, caughtEnemy, isFinished };
};

const findAllInStack = (pieces: Piece[], pieceId: string): Piece[] => {
  const piece = pieces.find(p => p.id === pieceId);
  if (!piece || piece.nodeIndex === null) return piece ? [piece] : [];
  
  // All pieces of the same team on the same node are considered "stacked" in this simple engine
  return pieces.filter(p => p.nodeIndex === piece.nodeIndex && !p.isFinished);
};
