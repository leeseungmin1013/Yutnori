
import React from 'react';
// Added Piece to the imports to resolve the type error on line 94
import { GameState, YutResult, Piece } from '../types';
import { BOARD_NODES } from '../boardData';

interface BoardProps {
  gameState: GameState;
  onPieceMove: (pieceId: string, result: YutResult) => void;
}

const Board: React.FC<BoardProps> = ({ gameState, onPieceMove }) => {
  const currentTeam = gameState.teams[gameState.currentTeamIndex];
  const resultsAvailable = gameState.throwBuffer;

  const renderPiecesAtNode = (nodeId: number | null) => {
    const allPieces: { teamColor: string; teamId: string; pieceId: string; isCurrentTeam: boolean }[] = [];
    
    gameState.teams.forEach(team => {
      // Find pieces at this node. Only need to show one visual for a stack.
      // We'll group them by node.
      const piecesAtNode = team.pieces.filter(p => p.nodeIndex === nodeId && !p.isFinished);
      if (piecesAtNode.length > 0) {
        allPieces.push({
          teamColor: team.color,
          teamId: team.id,
          pieceId: piecesAtNode[0].id, // representative for interaction
          isCurrentTeam: team.id === currentTeam.id
        });
      }
    });

    return allPieces.map((p, i) => {
      const isSelectable = p.isCurrentTeam && resultsAvailable.length > 0;
      
      return (
        <div 
          key={p.pieceId}
          className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 z-20`}
          style={{ 
            left: nodeId === null ? `${10 + i * 5}%` : undefined, // Just a placeholder for starting pieces logic
            top: nodeId === null ? '105%' : undefined
          }}
        >
          {/* If piece is on board, Board component coordinates handles it.
              This logic is actually better inside the SVG rendering. */}
        </div>
      );
    });
  };

  const handleNodeClick = (pieceId: string) => {
    if (resultsAvailable.length === 1) {
      onPieceMove(pieceId, resultsAvailable[0]);
    } else if (resultsAvailable.length > 1) {
      // Logic for choosing which result to use if multiple
      // For now, use the first one as default
      onPieceMove(pieceId, resultsAvailable[0]);
    }
  };

  return (
    <div className="relative aspect-square w-full max-w-[600px] bg-stone-200 rounded-[2.5rem] p-4 shadow-inner border-8 border-stone-300">
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* Paths (Lines) */}
        <line x1="10" y1="10" x2="90" y2="10" stroke="#a8a29e" strokeWidth="0.5" strokeDasharray="2" />
        <line x1="90" y1="10" x2="90" y2="90" stroke="#a8a29e" strokeWidth="0.5" strokeDasharray="2" />
        <line x1="90" y1="90" x2="10" y2="90" stroke="#a8a29e" strokeWidth="0.5" strokeDasharray="2" />
        <line x1="10" y1="90" x2="10" y2="10" stroke="#a8a29e" strokeWidth="0.5" strokeDasharray="2" />
        <line x1="10" y1="10" x2="90" y2="90" stroke="#a8a29e" strokeWidth="0.5" strokeDasharray="2" />
        <line x1="90" y1="10" x2="10" y2="90" stroke="#a8a29e" strokeWidth="0.5" strokeDasharray="2" />

        {/* Nodes */}
        {BOARD_NODES.map(node => (
          <g key={node.id}>
            <circle 
              cx={node.x} 
              cy={node.y} 
              r={node.type === 'corner' || node.type === 'center' || node.type === 'home' ? 4 : 2.5} 
              fill="#fff" 
              stroke="#57534e" 
              strokeWidth="1.5"
              className="transition-colors hover:fill-stone-100"
            />
            {node.id === 0 && (
              <text x={node.x} y={node.y + 10} textAnchor="middle" className="text-[3px] font-bold fill-stone-500 uppercase tracking-widest">Start/End</text>
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
            const node = BOARD_NODES.find(n => n.id === parseInt(nodeId))!;
            const isCurrentTeam = team.id === currentTeam.id;
            const isSelectable = isCurrentTeam && resultsAvailable.length > 0;

            return (
              <g 
                key={`${team.id}-${nodeId}`} 
                className={`cursor-pointer transition-all ${isSelectable ? 'hover:scale-125' : ''}`}
                onClick={() => isSelectable && handleNodeClick(pieces[0].id)}
              >
                <circle 
                  cx={node.x} 
                  cy={node.y} 
                  r={4} 
                  fill={team.color} 
                  className={`shadow-lg filter drop-shadow-md ${isSelectable ? 'animate-pulse' : ''}`}
                />
                {pieces.length > 1 && (
                  <text 
                    x={node.x} 
                    y={node.y + 1} 
                    textAnchor="middle" 
                    fill="white" 
                    fontSize="4" 
                    fontWeight="black"
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
      <div className="absolute -bottom-16 left-0 right-0 flex justify-center gap-4">
        {gameState.teams.map((team, tIdx) => (
          <div key={team.id} className="flex flex-col items-center gap-1">
            <span className="text-[10px] font-bold text-stone-500 uppercase">{team.name} 대기</span>
            <div className="flex gap-1 bg-white/50 p-2 rounded-xl border border-stone-200">
              {team.pieces.filter(p => p.nodeIndex === null && !p.isFinished).map((p, pIdx) => {
                const isCurrentTeam = team.id === currentTeam.id;
                const isSelectable = isCurrentTeam && resultsAvailable.length > 0;
                
                return (
                  <button
                    key={p.id}
                    disabled={!isSelectable}
                    onClick={() => handleNodeClick(p.id)}
                    className={`w-8 h-8 rounded-full border-2 border-white shadow-md transition-all flex items-center justify-center font-black text-white ${
                      isSelectable ? 'hover:scale-110 active:scale-90 hover:brightness-110' : 'opacity-40'
                    }`}
                    style={{ backgroundColor: team.color }}
                  >
                    말
                  </button>
                );
              })}
              {team.pieces.filter(p => p.nodeIndex === null && !p.isFinished).length === 0 && (
                <div className="w-8 h-8 flex items-center justify-center text-xs text-stone-300 font-bold">X</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Board;
