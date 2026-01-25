
import React, { useState } from 'react';
import { GameState, YutResult, Piece } from '../types';
import { BOARD_NODES } from '../boardData';

interface BoardProps {
  gameState: GameState;
  onPieceMove: (pieceId: string, result: YutResult) => void;
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

const Board: React.FC<BoardProps> = ({ gameState, onPieceMove }) => {
  const currentTeam = gameState.teams[gameState.currentTeamIndex];
  const resultsAvailable = gameState.throwBuffer;

  // 선택된 말과 결과 선택 모달 상태
  const [selectedPieceId, setSelectedPieceId] = useState<string | null>(null);

  const handlePieceClick = (pieceId: string) => {
    if (resultsAvailable.length === 0) return;

    if (resultsAvailable.length === 1) {
      // 결과가 하나면 바로 이동
      onPieceMove(pieceId, resultsAvailable[0]);
    } else {
      // 여러 결과가 있으면 선택 모달 표시
      setSelectedPieceId(pieceId);
    }
  };

  const handleResultSelect = (result: YutResult) => {
    if (selectedPieceId) {
      onPieceMove(selectedPieceId, result);
      setSelectedPieceId(null);
    }
  };

  const closeModal = () => {
    setSelectedPieceId(null);
  };

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
            const isSelectable = isCurrentTeam && resultsAvailable.length > 0;

            return (
              <g
                key={`${team.id}-${nodeId}`}
                className="cursor-pointer"
                onClick={() => isSelectable && handlePieceClick(pieces[0].id)}
              >
                {/* 호버 효과용 바깥 원 */}
                {isSelectable && (
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
          const isSelectable = isCurrentTeam && resultsAvailable.length > 0;

          return (
            <div key={team.id} className="flex flex-col items-center gap-2">
              <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">{team.name} 대기</span>
              <div className="flex gap-2 bg-white/70 p-3 rounded-xl border border-stone-200 shadow-sm">
                {waitingPieces.length > 0 ? waitingPieces.map(p => (
                  <button
                    key={p.id}
                    disabled={!isSelectable}
                    onClick={() => handlePieceClick(p.id)}
                    className={`w-9 h-9 rounded-full border-2 border-white shadow-md transition-all flex items-center justify-center font-black text-white text-xs ${
                      isSelectable ? 'hover:scale-110 active:scale-95 hover:brightness-110 cursor-pointer' : 'opacity-40 cursor-not-allowed'
                    }`}
                    style={{ backgroundColor: team.color }}
                  >
                    {waitingPieces.length > 1 ? '' : ''}
                  </button>
                )) : (
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

      {/* Result Selection Modal */}
      {selectedPieceId && resultsAvailable.length > 1 && (
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
              {resultsAvailable.map((result, idx) => (
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
