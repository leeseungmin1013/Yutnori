
import React, { useState } from 'react';
import { GameState, YutResult, Piece } from '../types';
import { BOARD_NODES } from '../boardData';
import { canPieceMove } from '../gameEngine';

interface BoardProps {
  gameState: GameState;
  onPieceMove: (pieceId: string, result: YutResult) => void;
  onSkipResult?: (result: YutResult) => void;
}

// 윷 결과를 한글로 표시
const getYutResultLabel = (result: YutResult): string => {
  switch (result) {
    case YutResult.DO: return '도';
    case YutResult.GAE: return '개';
    case YutResult.GEOL: return '걸';
    case YutResult.YUT: return '윷';
    case YutResult.MO: return '모';
    case YutResult.BACK_DO: return '빽도';
    default: return result;
  }
};

const Board: React.FC<BoardProps> = ({ gameState, onPieceMove, onSkipResult }) => {
  const currentTeam = gameState.teams[gameState.currentTeamIndex];
  const resultsAvailable = gameState.throwBuffer || [];

  // 선택된 말과 결과 선택 모달 상태
  const [selectedPieceId, setSelectedPieceId] = useState<string | null>(null);
  const [selectedPiece, setSelectedPiece] = useState<Piece | null>(null);

  // 특정 결과로 이동 가능한 말이 있는지 확인
  const hasMovablePieceForResult = (result: YutResult): boolean => {
    return currentTeam.pieces.some(p => !p.isFinished && canPieceMove(p, result));
  };

  // 특정 말이 특정 결과로 이동 가능한지 확인
  const canPieceMoveWithResult = (piece: Piece, result: YutResult): boolean => {
    return canPieceMove(piece, result);
  };

  // 말이 이동 가능한 결과 목록 필터링
  const getMovableResults = (piece: Piece): YutResult[] => {
    return resultsAvailable.filter(result => canPieceMoveWithResult(piece, result));
  };

  const handlePieceClick = (pieceId: string, piece: Piece) => {
    if (resultsAvailable.length === 0) return;

    const movableResults = getMovableResults(piece);
    if (movableResults.length === 0) return; // 이동 가능한 결과가 없음

    if (movableResults.length === 1) {
      // 이동 가능한 결과가 하나면 바로 이동
      onPieceMove(pieceId, movableResults[0]);
    } else {
      // 여러 결과가 있으면 선택 모달 표시
      setSelectedPieceId(pieceId);
      setSelectedPiece(piece);
    }
  };

  const handleResultSelect = (result: YutResult) => {
    if (selectedPieceId) {
      onPieceMove(selectedPieceId, result);
      setSelectedPieceId(null);
      setSelectedPiece(null);
    }
  };

  const closeModal = () => {
    setSelectedPieceId(null);
    setSelectedPiece(null);
  };

  // 스킵할 결과가 있는지 확인 (이동 가능한 말이 없는 결과)
  const unskippableResults = resultsAvailable.filter(r => hasMovablePieceForResult(r));
  const skippableResults = resultsAvailable.filter(r => !hasMovablePieceForResult(r));

  return (
    <div className="relative aspect-square w-full max-w-[600px] bg-stone-200 rounded-[2.5rem] p-4 shadow-inner border-8 border-stone-300">
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* Paths (Lines) */}
        {/* 외곽 */}
        <line x1="90" y1="90" x2="90" y2="10" stroke="#a8a29e" strokeWidth="0.8" />
        <line x1="90" y1="10" x2="10" y2="10" stroke="#a8a29e" strokeWidth="0.8" />
        <line x1="10" y1="10" x2="10" y2="90" stroke="#a8a29e" strokeWidth="0.8" />
        <line x1="10" y1="90" x2="90" y2="90" stroke="#a8a29e" strokeWidth="0.8" />
        {/* 대각선 */}
        <line x1="90" y1="10" x2="10" y2="90" stroke="#a8a29e" strokeWidth="0.8" />
        <line x1="10" y1="10" x2="90" y2="90" stroke="#a8a29e" strokeWidth="0.8" />

        {/* 지름길 화살표 표시 - 경로 옆에 작게 */}
        <g opacity="0.4">
          {/* 5번 코너 → 대각선 방향 (↙) */}
          <text x="84" y="18" fontSize="4" fill="#57534e" fontWeight="bold">↙</text>
          {/* 10번 코너 → 대각선 방향 (↘) */}
          <text x="15" y="16" fontSize="4" fill="#57534e" fontWeight="bold">↘</text>
          {/* 중앙 → 홈 방향 (↘) */}
          <text x="55" y="55" fontSize="4" fill="#57534e" fontWeight="bold">↘</text>
        </g>

        {/* Nodes */}
        {BOARD_NODES.map(node => (
          <g key={node.id}>
            <circle
              cx={node.x}
              cy={node.y}
              r={node.type === 'corner' || node.type === 'center' || node.type === 'home' ? 4.5 : 2.5}
              fill={node.type === 'home' ? '#fef3c7' : '#fff'}
              stroke={node.type === 'home' ? '#d97706' : '#57534e'}
              strokeWidth={node.type === 'home' ? 2 : 1.5}
              className="transition-colors"
            />
            {node.id === 0 && (
              <text x={node.x} y={node.y + 9} textAnchor="middle" className="text-[3px] font-bold fill-amber-700 uppercase tracking-widest">
                START
              </text>
            )}
            {node.type === 'center' && (
              <text x={node.x} y={node.y - 7} textAnchor="middle" className="text-[2.5px] font-bold fill-stone-400">
                CENTER
              </text>
            )}
          </g>
        ))}

        {/* Pieces on board */}
        {gameState.teams.flatMap(team => {
          const piecesOnBoard = team.pieces.filter(p => p.nodeIndex !== null && !p.isFinished);
          // Group by node to show stacked count
          const groupedByNode: Record<number, Piece[]> = {};
          piecesOnBoard.forEach(p => {
            if (p.nodeIndex !== null) {
              if (!groupedByNode[p.nodeIndex]) groupedByNode[p.nodeIndex] = [];
              groupedByNode[p.nodeIndex].push(p);
            }
          });

          return Object.entries(groupedByNode).map(([nodeId, pieces]) => {
            const node = BOARD_NODES.find(n => n.id === parseInt(nodeId));
            if (!node) return null;

            const isCurrentTeam = team.id === currentTeam.id;
            const movableResults = getMovableResults(pieces[0]);
            const canMove = isCurrentTeam && movableResults.length > 0;

            return (
              <g
                key={`${team.id}-${nodeId}`}
                className={canMove ? "cursor-pointer" : ""}
                onClick={() => canMove && handlePieceClick(pieces[0].id, pieces[0])}
              >
                {/* 호버 효과용 바깥 원 */}
                {canMove && (
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={7}
                    fill="transparent"
                    stroke={team.color}
                    strokeWidth={1}
                    strokeOpacity={0.4}
                    className="animate-ping"
                  />
                )}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={4.5}
                  fill={team.color}
                  stroke="#fff"
                  strokeWidth={1.5}
                  style={{ filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.3))' }}
                />
                {pieces.length > 1 && (
                  <text
                    x={node.x}
                    y={node.y + 1.5}
                    textAnchor="middle"
                    fill="white"
                    fontSize="5"
                    fontWeight="bold"
                    className="pointer-events-none"
                  >
                    {pieces.length}
                  </text>
                )}
              </g>
            );
          });
        })}
      </svg>

      {/* Starting Pieces (Off-board area) */}
      <div className="absolute -bottom-20 left-0 right-0 flex justify-center gap-6">
        {gameState.teams.map(team => {
          const waitingPieces = team.pieces.filter(p => p.nodeIndex === null && !p.isFinished);
          const isCurrentTeam = team.id === currentTeam.id;

          return (
            <div key={team.id} className="flex flex-col items-center gap-2">
              <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">{team.name} 대기</span>
              <div className="flex gap-2 bg-white/70 p-3 rounded-xl border border-stone-200 shadow-sm">
                {waitingPieces.length > 0 ? waitingPieces.map(p => {
                  const movableResults = getMovableResults(p);
                  const canMove = isCurrentTeam && movableResults.length > 0;
                  return (
                    <button
                      key={p.id}
                      disabled={!canMove}
                      onClick={() => handlePieceClick(p.id, p)}
                      className={`w-9 h-9 rounded-full border-2 border-white shadow-md transition-all flex items-center justify-center font-black text-white text-xs ${
                        canMove ? 'hover:scale-110 active:scale-95 hover:brightness-110 cursor-pointer' : 'opacity-40 cursor-not-allowed'
                      }`}
                      style={{ backgroundColor: team.color }}
                    />
                  );
                }) : (
                  <div className="w-9 h-9 flex items-center justify-center text-xs text-stone-300 font-bold">-</div>
                )}
              </div>
              <span className="text-[10px] text-stone-400">
                완주: {team.finishedCount}/4
              </span>
            </div>
          );
        })}
      </div>

      {/* Skip Button - 이동 가능한 말이 없는 결과가 있을 때 표시 */}
      {skippableResults.length > 0 && onSkipResult && (
        <div className="absolute -bottom-32 left-0 right-0 flex justify-center">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex flex-col items-center gap-2">
            <p className="text-xs text-amber-700">이동 가능한 말이 없습니다:</p>
            <div className="flex gap-2">
              {skippableResults.map((result, idx) => (
                <button
                  key={idx}
                  onClick={() => onSkipResult(result)}
                  className="px-3 py-1 bg-amber-500 text-white rounded-lg text-sm font-bold hover:bg-amber-600"
                >
                  {getYutResultLabel(result)} 스킵
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Result Selection Modal */}
      {selectedPieceId && selectedPiece && (
        <div
          className="absolute inset-0 bg-black/40 rounded-[2.5rem] flex items-center justify-center z-30"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-2xl p-6 shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-center mb-4 text-stone-700">어떤 결과를 사용할까요?</h3>
            <div className="flex gap-3 flex-wrap justify-center">
              {getMovableResults(selectedPiece).map((result, idx) => (
                <button
                  key={idx}
                  onClick={() => handleResultSelect(result)}
                  className="px-5 py-3 bg-stone-800 text-white rounded-xl font-bold hover:bg-stone-700 active:scale-95 transition-all shadow-lg"
                >
                  {getYutResultLabel(result)}
                </button>
              ))}
            </div>
            <button
              onClick={closeModal}
              className="mt-4 w-full text-sm text-stone-400 hover:text-stone-600"
            >
              취소
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Board;
